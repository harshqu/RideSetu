import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { Dispute } from '@/models/Dispute';
import { Booking } from '@/models/Booking';
import { getSessionFromRequest, assertRole } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();
    const query: Record<string, unknown> = {};

    if (session.role === 'CUSTOMER') {
      query.customerId = new mongoose.Types.ObjectId(session.userId);
    } else if (session.role === 'VENDOR' && session.vendorId) {
      query.vendorId = new mongoose.Types.ObjectId(session.vendorId);
    }

    const disputes = await Dispute.find(query)
      .populate('bookingId', 'bookingNumber pickupDateTime returnDateTime securityDeposit')
      .populate('vendorId', 'businessName ownerName phone')
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ disputes });
  } catch (error: any) {
    console.error('[API Disputes GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch disputes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, claimedAmount, vendorRemarks, beforePhotos = [], afterPhotos = [] } = body;

    if (!bookingId || !claimedAmount || !vendorRemarks) {
      return NextResponse.json({ error: 'Booking ID, claim amount, and vendor remarks required.' }, { status: 400 });
    }

    await connectToDatabase();
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    const dispute = await Dispute.create({
      bookingId: booking._id,
      vendorId: booking.vendorId,
      customerId: booking.customerId,
      status: 'OPEN',
      claimedAmount: Number(claimedAmount),
      evidence: {
        beforePhotos,
        afterPhotos,
        handoverReports: [booking.handoverPickupId, booking.handoverReturnId].filter(Boolean),
      },
      vendorRemarks,
    });

    booking.bookingStatus = 'DISPUTED';
    booking.depositStatus = 'HELD';
    await booking.save();

    return NextResponse.json({ success: true, dispute, message: 'Dispute case opened for admin review.' });
  } catch (error: any) {
    console.error('[API Disputes POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to file dispute' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    const authCheck = assertRole(session, ['ADMIN']);
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { disputeId, status, deductedAmount, adminNotes, resolution } = await request.json();
    if (!disputeId || !status) {
      return NextResponse.json({ error: 'Dispute ID and status required' }, { status: 400 });
    }

    await connectToDatabase();
    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    dispute.status = status;
    dispute.deductedAmount = Number(deductedAmount || 0);
    dispute.adminNotes = adminNotes || '';
    dispute.resolution = resolution || '';
    dispute.resolvedAt = new Date();
    await dispute.save();

    // Update booking deposit status
    const booking = await Booking.findById(dispute.bookingId);
    if (booking) {
      booking.bookingStatus = 'COMPLETED';
      booking.depositStatus = dispute.deductedAmount > 0 ? 'PARTIALLY_DEDUCTED' : 'REFUNDED';
      await booking.save();
    }

    return NextResponse.json({ success: true, dispute, message: 'Dispute resolved successfully.' });
  } catch (error: any) {
    console.error('[API Disputes PATCH Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to resolve dispute' }, { status: 500 });
  }
}
