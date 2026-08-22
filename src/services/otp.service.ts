import crypto from 'crypto';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { OTPChallenge, IOTPChallenge, OTPMethod, OTPPurpose } from '@/models/OTPChallenge';

const OTP_PEPPER = process.env.OTP_PEPPER || 'ridesetu_otp_secure_pepper_2026';

export type OTPErrorCode =
  | 'OK'
  | 'OTP_EXPIRED'
  | 'OTP_INVALID'
  | 'OTP_ATTEMPTS_EXCEEDED'
  | 'OTP_ALREADY_CONSUMED'
  | 'OTP_RESEND_COOLDOWN'
  | 'OTP_RATE_LIMITED'
  | 'OTP_NOT_FOUND';

export class OTPService {
  /**
   * Generates a cryptographically secure 6-digit OTP string
   */
  public static generateOTP(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Generates a unique signup challenge reference ID
   */
  public static generateChallengeId(): string {
    return `ch_${crypto.randomBytes(12).toString('hex')}`;
  }

  /**
   * Hashes plain 6-digit OTP using SHA-256 with application pepper
   */
  public static hashOTP(otp: string): string {
    return crypto
      .createHash('sha256')
      .update(`${otp.trim()}:${OTP_PEPPER}`)
      .digest('hex');
  }

  /**
   * Normalizes identifier consistently across the application:
   * - Email: lowercase & trimmed
   * - Mobile: Canonical Indian mobile format (+91XXXXXXXXXX)
   */
  public static normalizeIdentifier(identifier: string, method: OTPMethod): string {
    const clean = identifier.trim();
    if (method === 'EMAIL') {
      return clean.toLowerCase();
    } else {
      const digitsOnly = clean.replace(/\D/g, '');
      if (digitsOnly.length === 10) {
        return `+91${digitsOnly}`;
      } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
        return `+${digitsOnly}`;
      }
      return clean.startsWith('+') ? clean : `+${digitsOnly}`;
    }
  }

  /**
   * Validates format of Indian mobile number
   */
  public static isValidIndianMobile(phone: string): boolean {
    const normalized = this.normalizeIdentifier(phone, 'SMS');
    return /^\+91[6-9]\d{9}$/.test(normalized);
  }

  /**
   * Checks if resend cooldown (60 seconds) is active
   */
  public static canResend(resendLastSentAt: Date): { allowed: boolean; waitSeconds: number } {
    const now = Date.now();
    const lastSent = new Date(resendLastSentAt).getTime();
    const elapsedSeconds = Math.floor((now - lastSent) / 1000);
    const cooldownSeconds = 60;

    if (elapsedSeconds < cooldownSeconds) {
      return { allowed: false, waitSeconds: cooldownSeconds - elapsedSeconds };
    }
    return { allowed: true, waitSeconds: 0 };
  }

  /**
   * Creates a new cryptographic OTP signup challenge
   */
  public static async createChallenge(params: {
    identifier: string;
    method: OTPMethod;
    purpose?: OTPPurpose;
  }): Promise<{
    success: boolean;
    challengeId?: string;
    rawOtp?: string;
    expiresIn: number;
    resendAvailableIn: number;
    code?: OTPErrorCode;
    error?: string;
  }> {
    await connectToDatabase();

    const method = params.method;
    const purpose = params.purpose || 'SIGNUP';
    const normalizedIdentifier = this.normalizeIdentifier(params.identifier, method);

    if (method === 'SMS' && !this.isValidIndianMobile(params.identifier)) {
      return {
        success: false,
        expiresIn: 0,
        resendAvailableIn: 0,
        code: 'OTP_INVALID',
        error: 'Please enter a valid 10-digit Indian mobile number.',
      };
    }

    if (method === 'EMAIL' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentifier)) {
      return {
        success: false,
        expiresIn: 0,
        resendAvailableIn: 0,
        code: 'OTP_INVALID',
        error: 'Please enter a valid email address.',
      };
    }

    // Check existing active challenge for resend cooldown
    const existing = await OTPChallenge.findOne({
      identifier: normalizedIdentifier,
      method,
      purpose,
      isConsumed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (existing) {
      const cooldown = this.canResend(existing.resendLastSentAt);
      if (!cooldown.allowed) {
        return {
          success: false,
          challengeId: existing.signupChallengeId,
          expiresIn: Math.max(0, Math.floor((new Date(existing.expiresAt).getTime() - Date.now()) / 1000)),
          resendAvailableIn: cooldown.waitSeconds,
          code: 'OTP_RESEND_COOLDOWN',
          error: `Please wait ${cooldown.waitSeconds} seconds before requesting another verification code.`,
        };
      }
    }

    const rawOtp = this.generateOTP();
    const otpHash = this.hashOTP(rawOtp);
    const signupChallengeId = this.generateChallengeId();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const challenge = await OTPChallenge.create({
      signupChallengeId,
      identifier: normalizedIdentifier,
      method,
      purpose,
      otpHash,
      expiresAt,
      attempts: 0,
      resendLastSentAt: new Date(),
      resendCount: existing ? existing.resendCount + 1 : 1,
      isConsumed: false,
      verificationStatus: 'PENDING',
    });

    return {
      success: true,
      challengeId: challenge.signupChallengeId,
      rawOtp,
      expiresIn: 300,
      resendAvailableIn: 60,
    };
  }

  /**
   * Verifies an OTP against a signup challenge
   */
  public static async verifyChallenge(params: {
    challengeId: string;
    identifier: string;
    otp: string;
    method: OTPMethod;
    purpose?: OTPPurpose;
  }): Promise<{
    success: boolean;
    verified: boolean;
    code: OTPErrorCode;
    error?: string;
  }> {
    await connectToDatabase();

    const normalizedIdentifier = this.normalizeIdentifier(params.identifier, params.method);
    const purpose = params.purpose || 'SIGNUP';

    const challenge = await OTPChallenge.findOne({
      signupChallengeId: params.challengeId,
      identifier: normalizedIdentifier,
      method: params.method,
      purpose,
    });

    if (!challenge) {
      return {
        success: false,
        verified: false,
        code: 'OTP_NOT_FOUND',
        error: 'Verification session not found. Please request a new code.',
      };
    }

    if (challenge.isConsumed) {
      return {
        success: false,
        verified: false,
        code: 'OTP_ALREADY_CONSUMED',
        error: 'This verification code has already been used.',
      };
    }

    if (new Date() > new Date(challenge.expiresAt)) {
      challenge.verificationStatus = 'EXPIRED';
      await challenge.save();
      return {
        success: false,
        verified: false,
        code: 'OTP_EXPIRED',
        error: 'This verification code has expired. Please request a new code.',
      };
    }

    if (challenge.attempts >= 5) {
      return {
        success: false,
        verified: false,
        code: 'OTP_ATTEMPTS_EXCEEDED',
        error: 'Too many incorrect attempts. Please request a new verification code.',
      };
    }

    // Increment attempts count
    challenge.attempts += 1;

    const inputHash = this.hashOTP(params.otp);
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(inputHash, 'utf-8'),
      Buffer.from(challenge.otpHash, 'utf-8')
    );

    if (!isMatch) {
      await challenge.save();
      const remaining = 5 - challenge.attempts;
      return {
        success: false,
        verified: false,
        code: 'OTP_INVALID',
        error: remaining > 0 ? `Incorrect verification code. ${remaining} attempt(s) remaining.` : 'Incorrect verification code. Maximum attempts reached.',
      };
    }

    // Mark verified
    challenge.verificationStatus = 'VERIFIED';
    await challenge.save();

    return {
      success: true,
      verified: true,
      code: 'OK',
    };
  }

  /**
   * Atomically consumes a verified signup challenge during account registration
   */
  public static async consumeChallenge(params: {
    challengeId: string;
    identifier: string;
    method: OTPMethod;
  }): Promise<{ success: boolean; error?: string }> {
    await connectToDatabase();

    const normalizedIdentifier = this.normalizeIdentifier(params.identifier, params.method);

    const challenge = await OTPChallenge.findOne({
      signupChallengeId: params.challengeId,
      identifier: normalizedIdentifier,
      method: params.method,
    });

    if (!challenge) {
      return { success: false, error: 'Signup verification record not found.' };
    }

    if (challenge.verificationStatus !== 'VERIFIED') {
      return { success: false, error: 'Your email/mobile must be verified before completing registration.' };
    }

    if (challenge.isConsumed) {
      return { success: false, error: 'This verification code has already been used for registration.' };
    }

    if (new Date() > new Date(challenge.expiresAt)) {
      return { success: false, error: 'Verification session has expired. Please verify your code again.' };
    }

    challenge.isConsumed = true;
    challenge.verificationStatus = 'CONSUMED';
    await challenge.save();

    return { success: true };
  }
}

/**
 * Helper export for legacy/E2E backward compatibility
 */
export function hashOTPCode(otp: string, salt: string = ''): string {
  return OTPService.hashOTP(`${otp}:${salt}`);
}

