import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { Vehicle } from '@/models/Vehicle';
import { Booking } from '@/models/Booking';
import { Payout } from '@/models/Payout';
import { Review } from '@/models/Review';
import { getSessionFromRequest, assertRole } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    const authCheck = assertRole(session, ['VENDOR', 'ADMIN']);
    if (!authCheck.authorized || !session?.vendorId) {
      return NextResponse.json({ error: 'Vendor profile not found or unauthorized' }, { status: 403 });
    }

    await connectToDatabase();
    const vId = new mongoose.Types.ObjectId(session.vendorId);

    const [
      totalVehicles,
      availableVehicles,
      activeBookings,
      totalBookings,
      payouts,
      reviews,
      allVendorBookings,
    ] = await Promise.all([
      Vehicle.countDocuments({ vendorId: vId }),
      Vehicle.countDocuments({ vendorId: vId, isAvailable: true }),
      Booking.countDocuments({ vendorId: vId, bookingStatus: 'ACTIVE' }),
      Booking.countDocuments({ vendorId: vId }),
      Payout.find({ vendorId: vId, status: 'PENDING' }).select('netAmount').lean(),
      Review.find({ vendorId: vId }).select('overallRating').lean(),
      Booking.find({ vendorId: vId, paymentStatus: 'PAID' }).select('basePrice deliveryCharge').lean(),
    ]);

    const grossRevenue = allVendorBookings.reduce((sum, b) => sum + (b.basePrice || 0) + (b.deliveryCharge || 0), 0);
    const pendingPayoutsAmount = payouts.reduce((sum, p) => sum + (p.netAmount || 0), 0);
    const avgRating = reviews.length > 0
      ? parseFloat((reviews.reduce((acc, r) => acc + r.overallRating, 0) / reviews.length).toFixed(1))
      : 4.8;
    const utilizationRate = totalVehicles > 0 ? Math.round((activeBookings / totalVehicles) * 100) : 0;

    return NextResponse.json({
      metrics: {
        totalVehicles,
        availableVehicles,
        activeBookings,
        totalBookings,
        grossRevenue,
        pendingPayoutsAmount,
        avgRating,
        totalReviews: reviews.length,
        utilizationRate,
      },
    });
  } catch (error: any) {
    console.error('[API Vendor Metrics Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch vendor metrics' }, { status: 500 });
  }
}
