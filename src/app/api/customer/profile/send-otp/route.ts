import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models/User';
import { OTPService } from '@/services/otp.service';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { channel } = body; // 'EMAIL' | 'PHONE'

    if (channel !== 'EMAIL' && channel !== 'PHONE') {
      return NextResponse.json({ error: 'Invalid verification channel. Must be EMAIL or PHONE.' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const target = channel === 'EMAIL' ? user.email : user.phone;
    if (!target) {
      return NextResponse.json({ error: `No ${channel.toLowerCase()} address on file to verify.` }, { status: 400 });
    }

    const result = await OTPService.generateOTP(session.userId, channel, target);

    return NextResponse.json({
      success: true,
      message: result.message,
      devCode: result.devCode, // available only in development testing
    });
  } catch (error: any) {
    console.error('[API Send OTP Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to send verification code' }, { status: 400 });
  }
}
