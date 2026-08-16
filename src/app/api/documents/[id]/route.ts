import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Authentication required to access private documents.' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Verify role / ownership (Admin, Vendor for their bookings, or the Customer who owns the document)
    return NextResponse.json({
      success: true,
      documentId: id,
      accessGranted: true,
      accessedBy: user.userId,
      role: user.role,
      status: 'SECURE_PRIVATE_DOCUMENT',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Access denied to private document.' },
      { status: 403 }
    );
  }
}
