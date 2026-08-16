import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models/User';
import { Vendor } from '@/models/Vendor';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ user: null, authenticated: false });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId).select('-passwordHash').lean();
    if (!user) {
      return NextResponse.json({ user: null, authenticated: false });
    }

    let vendor = null;
    if (user.role === 'VENDOR') {
      vendor = await Vendor.findOne({ userId: user._id }).lean();
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        ...user,
        vendor,
      },
    });
  } catch (error: any) {
    console.error('[API Auth Me Error]:', error);
    return NextResponse.json({ user: null, authenticated: false });
  }
}
