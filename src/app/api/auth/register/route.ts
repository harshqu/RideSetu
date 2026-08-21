import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models/User';
import { Vendor } from '@/models/Vendor';
import { hashPassword, signJwt, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role = 'CUSTOMER', businessName, city, destinationId, rentalLicenseNumber } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Name, email, phone, and password are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      role: role === 'VENDOR' ? 'VENDOR' : 'CUSTOMER',
      kycStatus: 'PENDING',
      drivingLicenseStatus: 'PENDING',
    });

    let vendorId: string | undefined = undefined;
    if (role === 'VENDOR' && businessName && rentalLicenseNumber && destinationId) {
      const newVendor = await Vendor.create({
        userId: newUser._id,
        businessName: businessName.trim(),
        ownerName: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        address: body.address || 'Local Office',
        city: city || 'Rishikesh',
        destinationId,
        rentalLicenseNumber: rentalLicenseNumber.trim(),
        verificationStatus: 'UNDER_REVIEW',
        commissionRate: 15,
      });
      vendorId = newVendor._id.toString();
    }

    const sessionPayload = {
      userId: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      vendorId,
    };

    const token = signJwt(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      message: 'Registration successful.',
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('[API Register Error]:', error);
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
        code: isDbError ? 'DATABASE_UNAVAILABLE' : 'REGISTER_ERROR',
        error: isDbError
          ? 'RideSetu is temporarily unable to connect to its services. Please try again shortly.'
          : 'Registration failed. Please check your details and try again.',
      },
      { status: 500 }
    );
  }
}
