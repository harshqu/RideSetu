import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models/User';
import { OTPService } from '@/services/otp.service';
import { EmailService } from '@/services/email.service';
import { SMSService } from '@/services/sms.service';
import { AuditLog } from '@/models/AuditLog';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, method, purpose = 'SIGNUP' } = body;

    if (!identifier || !method || !['EMAIL', 'SMS'].includes(method)) {
      return NextResponse.json(
        { error: 'Valid identifier and method (EMAIL or SMS) are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedIdentifier = OTPService.normalizeIdentifier(identifier, method);

    // Duplicate Check: Check if an existing account already uses this identifier
    const query = method === 'EMAIL' ? { email: normalizedIdentifier } : { phone: normalizedIdentifier };
    const existingUser = await User.findOne(query).lean();

    if (existingUser && (existingUser.emailVerified || existingUser.phoneVerified)) {
      return NextResponse.json(
        { error: `An account with this ${method === 'EMAIL' ? 'email' : 'mobile number'} is already registered. Please sign in.` },
        { status: 409 }
      );
    }

    // Create OTP Challenge
    const challenge = await OTPService.createChallenge({
      identifier,
      method,
      purpose,
    });

    if (!challenge.success || !challenge.challengeId) {
      const status = challenge.code === 'OTP_RESEND_COOLDOWN' || challenge.code === 'OTP_RATE_LIMITED' ? 429 : 400;
      return NextResponse.json(
        { error: challenge.error || 'Failed to generate verification code.' },
        { status }
      );
    }

    // Send OTP via Email or SMS
    let deliverySuccess = false;
    let deliveryError: string | undefined = undefined;
    let isDevFallback = false;

    if (method === 'EMAIL') {
      const emailResult = await EmailService.sendVerificationEmail({
        toEmail: normalizedIdentifier,
        otp: challenge.rawOtp!,
      });
      deliverySuccess = emailResult.success;
      deliveryError = emailResult.error;
      isDevFallback = Boolean(emailResult.isDevFallback);
    } else {
      const smsResult = await SMSService.sendVerificationSMS({
        toPhone: normalizedIdentifier,
        otp: challenge.rawOtp!,
      });
      deliverySuccess = smsResult.success;
      deliveryError = smsResult.error;
      isDevFallback = Boolean(smsResult.isDevFallback);
    }

    if (!deliverySuccess) {
      return NextResponse.json(
        { error: deliveryError || 'We couldn\'t send the verification code. Please try again shortly.' },
        { status: 500 }
      );
    }

    // Audit Log (NO PLAINTEXT OTP LOGGED)
    await AuditLog.create({
      action: 'OTP_SENT',
      userId: 'system',
      userRole: 'SYSTEM',
      resourceType: 'AUTH',
      details: {
        identifier: normalizedIdentifier,
        method,
        purpose,
        challengeId: challenge.challengeId,
      },
    }).catch(() => {});

    const responsePayload: Record<string, any> = {
      success: true,
      challengeId: challenge.challengeId,
      expiresIn: challenge.expiresIn,
      resendAvailableIn: challenge.resendAvailableIn,
      message: `Verification code sent to your ${method === 'EMAIL' ? 'email address' : 'mobile number'}.`,
    };

    // Attach devOtp ONLY in development mode for convenience
    if (process.env.NODE_ENV !== 'production' && isDevFallback) {
      responsePayload.devOtp = challenge.rawOtp;
    }

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error('[API Send OTP Error]:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while sending verification code.' },
      { status: 500 }
    );
  }
}
