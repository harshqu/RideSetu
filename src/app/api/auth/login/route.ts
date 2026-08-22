import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models/User';
import { Vendor } from '@/models/Vendor';
import { comparePassword, signJwt, AUTH_COOKIE_NAME } from '@/lib/auth';
import { OTPService } from '@/services/otp.service';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = OTPService.normalizeIdentifier(email, 'EMAIL');
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Unverified Account Guard (Skip for ADMIN to preserve existing admin provisioning)
    if (user.role !== 'ADMIN' && !user.emailVerified && !user.phoneVerified) {
      return NextResponse.json(
        {
          success: false,
          code: 'UNVERIFIED_ACCOUNT',
          error: 'Please verify your account before signing in.',
          unverified: true,
          email: user.email,
          phone: user.phone,
        },
        { status: 403 }
      );
    }

    let vendorId: string | undefined = undefined;
    if (user.role === 'VENDOR') {
      const vendor = await Vendor.findOne({ userId: user._id });
      if (vendor) {
        vendorId = vendor._id.toString();
      }
    }

    const sessionPayload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      vendorId,
    };

    const token = signJwt(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      message: 'Login successful.',
    });

    // Set secure HTTP-only cookie
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('[API Auth Login Error]:', error);
    const isDbError =
      error.name?.includes('Mongo') ||
      error.name?.includes('Mongoose') ||
      error.message?.includes('connect') ||
      error.message?.includes('whitelist') ||
      error.message?.includes('SSL') ||
      error.message?.includes('TLS');

    return NextResponse.json(
      {
        success: false,
        code: isDbError ? 'DATABASE_UNAVAILABLE' : 'AUTH_ERROR',
        error: isDbError
          ? 'RideSetu is temporarily unable to connect to its services. Please try again shortly.'
          : 'Invalid login request. Please try again.',
      },
      { status: 500 }
    );
  }
}
