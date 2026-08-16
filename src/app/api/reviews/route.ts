import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { Review } from '@/models/Review';
import { Booking } from '@/models/Booking';
import { Vehicle } from '@/models/Vehicle';
import { Vendor } from '@/models/Vendor';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const vendorId = searchParams.get('vendorId');

    await connectToDatabase();
    const query: Record<string, unknown> = {};
    if (vehicleId) query.vehicleId = new mongoose.Types.ObjectId(vehicleId);
    if (vendorId) query.vendorId = new mongoose.Types.ObjectId(vendorId);

    const reviews = await Review.find(query).sort({ createdAt: -1 }).limit(30).lean();
    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error('[API Reviews GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      bookingId,
      overallRating,
      vehicleConditionRating,
      vendorBehaviorRating,
      pickupExperienceRating,
      pricingTransparencyRating,
      reviewText,
    } = body;

    if (!bookingId || !overallRating || !reviewText) {
      return NextResponse.json({ error: 'Booking ID, rating, and review text are required.' }, { status: 400 });
    }

    await connectToDatabase();
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    if (booking.customerId.toString() !== session.userId) {
      return NextResponse.json({ error: 'You can only review your own bookings.' }, { status: 403 });
    }

    if (booking.bookingStatus !== 'COMPLETED') {
      return NextResponse.json({ error: 'Reviews can only be submitted for completed rentals.' }, { status: 400 });
    }

    const existingReview = await Review.findOne({ bookingId: booking._id });
    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this booking.' }, { status: 409 });
    }

    const review = await Review.create({
      bookingId: booking._id,
      customerId: booking.customerId,
      customerName: session.name,
      customerAvatar: session.role === 'CUSTOMER' ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' : '',
      vehicleId: booking.vehicleId,
      vendorId: booking.vendorId,
      overallRating: Number(overallRating),
      vehicleConditionRating: Number(vehicleConditionRating || overallRating),
      vendorBehaviorRating: Number(vendorBehaviorRating || overallRating),
      pickupExperienceRating: Number(pickupExperienceRating || overallRating),
      pricingTransparencyRating: Number(pricingTransparencyRating || overallRating),
      reviewText: reviewText.trim(),
      isVerifiedRental: true,
    });

    // Re-calculate Vehicle & Vendor ratings
    const vehicleReviews = await Review.find({ vehicleId: booking.vehicleId }).select('overallRating');
    const avgVehicleRating =
      vehicleReviews.reduce((acc, r) => acc + r.overallRating, 0) / vehicleReviews.length;

    await Vehicle.findByIdAndUpdate(booking.vehicleId, {
      rating: parseFloat(avgVehicleRating.toFixed(1)),
      totalReviews: vehicleReviews.length,
    });

    const vendorReviews = await Review.find({ vendorId: booking.vendorId }).select('overallRating');
    const avgVendorRating =
      vendorReviews.reduce((acc, r) => acc + r.overallRating, 0) / vendorReviews.length;

    await Vendor.findByIdAndUpdate(booking.vendorId, {
      rating: parseFloat(avgVendorRating.toFixed(1)),
      totalReviews: vendorReviews.length,
    });

    return NextResponse.json({ success: true, review, message: 'Review submitted successfully!' });
  } catch (error: any) {
    console.error('[API Reviews POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit review' }, { status: 500 });
  }
}
