import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';
import { PricingService } from '@/services/pricing.service';
import { Vehicle } from '@/models/Vehicle';
import { Coupon } from '@/models/Coupon';
import { AvailabilityService } from '@/services/availability.service';
import connectToDatabase from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login to initiate checkout.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { vehicleId, pickupDateTime, returnDateTime, pickupType, couponCode } = body;

    if (!vehicleId || !pickupDateTime || !returnDateTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking parameters.' },
        { status: 400 }
      );
    }

    const vehicle = await Vehicle.findById(vehicleId).lean();
    if (!vehicle || !vehicle.isAvailable || !vehicle.isVerified) {
      return NextResponse.json(
        { success: false, error: 'Selected vehicle is currently unavailable.' },
        { status: 400 }
      );
    }

    // Availability pre-check
    const avail = await AvailabilityService.isVehicleAvailable({
      vehicleId,
      pickupDateTime,
      returnDateTime,
    });

    if (!avail.available) {
      return NextResponse.json(
        { success: false, error: avail.reason || 'Vehicle is not available for selected dates.' },
        { status: 409 }
      );
    }

    // Server-side Pricing Recalculation
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isActive: true }).lean();
    }

    const pricing = PricingService.calculatePricing({
      vehicle: vehicle as any,
      pickupDateTime,
      returnDateTime,
      pickupType: pickupType || 'VENDOR_PICKUP',
      coupon: coupon as any,
    });

    // Create Razorpay Order
    const order = await PaymentService.createOrder({
      amount: pricing.totalPayable,
      currency: 'INR',
      notes: {
        vehicleId,
        customerId: user.userId,
        pickupDateTime: new Date(pickupDateTime).toISOString(),
        returnDateTime: new Date(returnDateTime).toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: order.keyId,
        pricing,
        isSandbox: order.isSandbox,
      },
    });
  } catch (error: any) {
    console.error('[Create Order Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment order.' },
      { status: 500 }
    );
  }
}
