import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { Vehicle } from '@/models/Vehicle';
import { Coupon } from '@/models/Coupon';
import { PricingService } from '@/services/pricing.service';

export async function POST(request: Request) {
  try {
    const { vehicleId, pickupDateTime, returnDateTime, pickupType = 'VENDOR_PICKUP', couponCode } = await request.json();

    if (!vehicleId || !pickupDateTime || !returnDateTime) {
      return NextResponse.json({ error: 'Vehicle ID and dates are required' }, { status: 400 });
    }

    await connectToDatabase();
    const vehicle = await Vehicle.findById(vehicleId).lean();
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true,
      }).lean();
    }

    const pricing = PricingService.calculatePricing({
      vehicle: vehicle as any,
      pickupDateTime,
      returnDateTime,
      pickupType,
      coupon: coupon as any,
    });

    return NextResponse.json({ success: true, pricing });
  } catch (error: any) {
    console.error('[API Pricing Calculate Error]:', error);
    return NextResponse.json({ error: error.message || 'Pricing calculation failed' }, { status: 500 });
  }
}
