import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models/User';
import { OTPService } from '@/services/otp.service';
import { AuditLog } from '@/models/AuditLog';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { channel, code } = body; // 'EMAIL' | 'PHONE', '123456'

    if (channel !== 'EMAIL' && channel !== 'PHONE') {
      return NextResponse.json({ error: 'Invalid verification channel. Must be EMAIL or PHONE.' }, { status: 400 });
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Verification code is required.' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const target = channel === 'EMAIL' ? user.email : user.phone;
    const result = await OTPService.verifyOTP(session.userId, channel, target, code);

    // Audit log
    await AuditLog.create({
      action: `${channel}_VERIFIED`,
      userId: user._id,
      userRole: session.role,
      resourceType: 'USER_PROFILE',
      resourceId: session.userId,
      details: { channel, targetMasked: channel === 'EMAIL' ? user.email.slice(0, 3) + '***' : '***' + user.phone.slice(-4) },
    });

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error('[API Verify OTP Error]:', error);
    return NextResponse.json({ error: error.message || 'OTP verification failed' }, { status: 400 });
  }
}
