import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { User } from '@/models/User';
import { KYCVerification } from '@/models/KYCVerification';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const dbUser = await User.findById(user.userId || (user as any).id).lean();
    if (!dbUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Fetch existing KYC document records
    const kycRecords = await KYCVerification.find({ userId: user.userId || (user as any).id }).lean();
    const dlRecord = kycRecords.find((r) => r.documentType === 'DRIVING_LICENCE');
    const aadhaarRecord = kycRecords.find((r) => r.documentType === 'AADHAAR');

    // Sensitive Data Masking Helper
    const maskString = (val?: string, visibleChars = 4) => {
      if (!val || val.length <= visibleChars) return val || '';
      return 'X'.repeat(val.length - visibleChars) + val.slice(-visibleChars);
    };

    return NextResponse.json({
      success: true,
      profile: {
        id: dbUser._id.toString(),
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        avatar: dbUser.avatar || dbUser.googleProfileImage || '',
        role: dbUser.role,
        kycStatus: dbUser.kycStatus,
        drivingLicenseStatus: dbUser.drivingLicenseStatus,
        drivingLicenseNumberMasked: maskString(dbUser.drivingLicenseNumber || dlRecord?.maskedLicenceNumber, 4),
        documents: {
          drivingLicense: dlRecord
            ? {
                id: dlRecord._id.toString(),
                status: dlRecord.status,
                documentType: dlRecord.documentType,
                maskedNumber: dlRecord.maskedLicenceNumber || maskString(dbUser.drivingLicenseNumber, 4),
                rejectionReason: dlRecord.rejectionReason || '',
                submittedAt: dlRecord.submittedAt,
              }
            : null,
          aadhaar: aadhaarRecord
            ? {
                id: aadhaarRecord._id.toString(),
                status: aadhaarRecord.status,
                documentType: aadhaarRecord.documentType,
                maskedNumber: aadhaarRecord.maskedLicenceNumber || 'XXXX-XXXX-1234',
                rejectionReason: aadhaarRecord.rejectionReason || '',
                submittedAt: aadhaarRecord.submittedAt,
              }
            : null,
        },
        profileComplete: dbUser.kycStatus === 'VERIFIED' || dbUser.drivingLicenseStatus === 'VERIFIED',
      },
    });
  } catch (error: any) {
    console.error('Error fetching customer profile:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, avatar, email } = body;

    await connectToDatabase();

    const dbUser = await User.findById(user.userId || (user as any).id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (name) dbUser.name = name.trim();
    if (avatar) dbUser.avatar = avatar;
    if (email) dbUser.email = email.trim().toLowerCase();

    await dbUser.save();

    return NextResponse.json({
      success: true,
      profile: {
        id: dbUser._id.toString(),
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        avatar: dbUser.avatar,
      },
      message: 'Profile updated successfully.',
    });
  } catch (error: any) {
    console.error('Error updating customer profile:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
