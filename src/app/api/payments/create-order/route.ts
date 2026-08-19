import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';
import { PricingService } from '@/services/pricing.service';
import { Vehicle } from '@/models/Vehicle';
import { User } from '@/models/User';
import { Coupon } from '@/models/Coupon';
import { Payment } from '@/models/Payment';
import { Booking } from '@/models/Booking';
import { KYCVerification } from '@/models/KYCVerification';
import { AvailabilityService } from '@/services/availability.service';
import connectToDatabase from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
    const {
      vehicleId,
      pickupDateTime,
      returnDateTime,
      pickupType,
      couponCode,
      idempotencyKey,
    } = body;

    if (!vehicleId || !pickupDateTime || !returnDateTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking parameters.' },
        { status: 400 }
      );
    }

    // 1. Mandatory KYC & Driving Licence Validation
    const dbUser = await User.findById(user.userId).lean();
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'User account not found.' },
        { status: 404 }
      );
    }

    if (dbUser.kycStatus !== 'VERIFIED') {
      return NextResponse.json(
        {
          success: false,
          error: 'KYC Verification Required: You must complete identity verification before initiating payment.',
          kycStatus: dbUser.kycStatus,
        },
        { status: 403 }
      );
    }

    const kycRecord = await KYCVerification.findOne({ userId: user.userId }).lean();
    if (kycRecord && kycRecord.expiryDate && new Date(kycRecord.expiryDate) <= new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Expired Driving Licence: Your driving licence has expired. Please update KYC before initiating payment.',
        },
        { status: 403 }
      );
    }

    // 2. Vehicle Verification
    const vehicle = await Vehicle.findById(vehicleId).lean();
    if (!vehicle || !vehicle.isAvailable || !vehicle.isVerified) {
      return NextResponse.json(
        { success: false, error: 'Selected vehicle is currently unavailable.' },
        { status: 400 }
      );
    }

    // 3. Availability Pre-check (Excluding current user's existing active reservation hold)
    const avail = await AvailabilityService.isVehicleAvailable({
      vehicleId,
      pickupDateTime,
      returnDateTime,
      excludeUserId: user.userId,
    });

    if (!avail.available) {
      return NextResponse.json(
        { success: false, error: avail.reason || 'Vehicle is not available for selected dates.' },
        { status: 409 }
      );
    }

    // 4. Idempotency Check: Return existing active payment order or already confirmed booking
    const activeKey = idempotencyKey || `idem_${user.userId}_${vehicleId}_${new Date(pickupDateTime).getTime()}_${new Date(returnDateTime).getTime()}`;
    const existingPayment = await Payment.findOne({
      idempotencyKey: activeKey,
      status: { $in: ['CREATED', 'PENDING', 'CAPTURED', 'SUCCESS'] },
    }).lean();

    if (existingPayment) {
      if (existingPayment.status === 'CAPTURED' || (existingPayment.status as string) === 'SUCCESS') {
        const existingBooking = existingPayment.bookingId
          ? await Booking.findById(existingPayment.bookingId).lean()
          : null;
        return NextResponse.json({
          success: true,
          isAlreadyCaptured: true,
          booking: existingBooking,
          order: {
            orderId: existingPayment.providerOrderId,
            amount: Math.round(existingPayment.amount * 100),
            currency: existingPayment.currency,
            keyId: PaymentService.getKeyId(),
            pricing: existingPayment.breakdown,
            isSandbox: true,
          },
        });
      }

      return NextResponse.json({
        success: true,
        order: {
          orderId: existingPayment.providerOrderId,
          amount: Math.round(existingPayment.amount * 100),
          currency: existingPayment.currency,
          keyId: PaymentService.getKeyId(),
          pricing: existingPayment.breakdown,
          isSandbox: true,
          isIdempotentReuse: true,
        },
      });
    }

    // 5. Server-Side Pricing Recalculation (NEVER TRUST FRONTEND AMOUNT)
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

    // 6. Acquire or Reuse Distributed Reservation Lock for Current User
    let reservationLockId: string | undefined;
    const lockResult = await AvailabilityService.acquireDistributedReservation({
      vehicleId,
      userId: user.userId,
      pickupDateTime,
      returnDateTime,
      durationMinutes: 15,
    });

    if (lockResult.acquired && lockResult.reservation) {
      reservationLockId = lockResult.reservation._id.toString();
    } else {
      return NextResponse.json(
        { success: false, error: lockResult.reason || 'This vehicle is temporarily reserved for another customer for the selected dates.' },
        { status: 409 }
      );
    }

    // 7. Create Razorpay Test/Sandbox Order
    const order = await PaymentService.createOrder({
      amount: pricing.totalPayable,
      currency: 'INR',
      receipt: `rcpt_${user.userId.slice(-6)}_${Date.now()}`,
      notes: {
        vehicleId,
        customerId: user.userId,
        pickupDateTime: new Date(pickupDateTime).toISOString(),
        returnDateTime: new Date(returnDateTime).toISOString(),
        pickupType: pickupType || 'VENDOR_PICKUP',
      },
      idempotencyKey: activeKey,
    });

    // 8. Persist Internal Payment Record with status 'CREATED'
    await Payment.create({
      customerId: user.userId,
      vendorId: vehicle.vendorId,
      vehicleId: vehicle._id,
      amount: pricing.totalPayable,
      currency: 'INR',
      provider: process.env.PAYMENT_PROVIDER === 'RAZORPAY' ? 'RAZORPAY' : 'MOCK',
      providerOrderId: order.id,
      status: 'CREATED',
      signatureVerified: false,
      idempotencyKey: activeKey,
      reservationLockId,
      breakdown: {
        basePrice: pricing.basePrice,
        deliveryCharge: pricing.deliveryCharge,
        platformFee: pricing.platformFee,
        gstTax: pricing.taxes,
        couponDiscount: pricing.discountAmount,
        securityDeposit: pricing.securityDeposit,
        totalPayable: pricing.totalPayable,
      },
      metadata: {
        pickupDateTime,
        returnDateTime,
        pickupType,
        couponCode: couponCode || null,
      },
    });

    // 9. Return safe checkout payload
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
