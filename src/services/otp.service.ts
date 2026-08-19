import crypto from 'crypto';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { OTPVerification, OTPChannel } from '@/models/OTPVerification';
import { User } from '@/models/User';

const OTP_SALT = process.env.JWT_SECRET || 'ridesetu_otp_secure_salt_2026';
const MAX_ATTEMPTS = 3;
const OTP_VALIDITY_MINUTES = 10;
const RATE_LIMIT_WINDOW_MINUTES = 15;
const MAX_OTP_REQUESTS_PER_WINDOW = 3;

export function hashOTPCode(code: string, userId: string): string {
  return crypto
    .createHmac('sha256', OTP_SALT)
    .update(`${userId}:${code.trim()}`)
    .digest('hex');
}

export class OTPService {
  /**
   * Generates and stores a secure hashed OTP with rate limiting & old OTP invalidation
   */
  public static async generateOTP(
    userId: string,
    channel: OTPChannel,
    target: string
  ): Promise<{ success: boolean; message: string; devCode?: string }> {
    await connectToDatabase();

    const uObjectId = new mongoose.Types.ObjectId(userId);
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);

    // 1. Rate Limiting Check (Max 3 OTP requests per 15 min)
    const recentRequestsCount = await OTPVerification.countDocuments({
      userId: uObjectId,
      channel,
      createdAt: { $gte: windowStart },
    });

    if (recentRequestsCount >= MAX_OTP_REQUESTS_PER_WINDOW) {
      throw new Error(
        `Too many OTP requests. Please wait ${RATE_LIMIT_WINDOW_MINUTES} minutes before requesting a new code.`
      );
    }

    // 2. Invalidate previous active OTPs for this user & channel
    await OTPVerification.deleteMany({
      userId: uObjectId,
      channel,
      verifiedAt: { $exists: false },
    });

    // 3. Generate 6-Digit Numeric Code
    const randomInt = crypto.randomInt(100000, 999999);
    const rawCode = randomInt.toString();
    const codeHash = hashOTPCode(rawCode, userId);
    const expiresAt = new Date(Date.now() + OTP_VALIDITY_MINUTES * 60 * 1000);

    // 4. Save Hashed Record in OTPVerification Model
    await OTPVerification.create({
      userId: uObjectId,
      channel,
      target: target.trim().toLowerCase(),
      codeHash,
      expiresAt,
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
    });

    return {
      success: true,
      message: `Verification code sent to ${channel === 'EMAIL' ? 'email' : 'mobile'}. Code expires in ${OTP_VALIDITY_MINUTES} minutes.`,
      // Return devCode ONLY in development for testing convenience
      devCode: process.env.NODE_ENV !== 'production' ? rawCode : undefined,
    };
  }

  /**
   * Verifies submitted OTP code with attempt limiting and updates user verification state
   */
  public static async verifyOTP(
    userId: string,
    channel: OTPChannel,
    target: string,
    submittedCode: string
  ): Promise<{ success: boolean; message: string }> {
    if (!submittedCode || submittedCode.trim().length !== 6) {
      throw new Error('Please enter a valid 6-digit verification code.');
    }

    await connectToDatabase();
    const uObjectId = new mongoose.Types.ObjectId(userId);

    // Find active OTP record
    const otpRecord = await OTPVerification.findOne({
      userId: uObjectId,
      channel,
      target: target.trim().toLowerCase(),
      verifiedAt: { $exists: false },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new Error('No active verification code found. Please request a new code.');
    }

    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      await OTPVerification.deleteOne({ _id: otpRecord._id });
      throw new Error('Verification code has expired. Please request a new one.');
    }

    // Check attempt limits
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await OTPVerification.deleteOne({ _id: otpRecord._id });
      throw new Error('Maximum verification attempts exceeded. Please request a new code.');
    }

    // Increment attempts
    otpRecord.attempts += 1;

    const submittedHash = hashOTPCode(submittedCode, userId);
    if (submittedHash !== otpRecord.codeHash) {
      await otpRecord.save();
      const remaining = otpRecord.maxAttempts - otpRecord.attempts;
      throw new Error(
        `Incorrect verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Code invalidated.'}`
      );
    }

    // Code matched! Mark verified
    otpRecord.verifiedAt = new Date();
    await otpRecord.save();

    // Update User model flags
    const updatePayload: Record<string, boolean> = {};
    if (channel === 'EMAIL') updatePayload.emailVerified = true;
    if (channel === 'PHONE') updatePayload.phoneVerified = true;

    await User.findByIdAndUpdate(uObjectId, { $set: updatePayload });

    return {
      success: true,
      message: `${channel === 'EMAIL' ? 'Email' : 'Mobile number'} successfully verified!`,
    };
  }
}
