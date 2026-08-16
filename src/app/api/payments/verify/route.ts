import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';
import { BookingService } from '@/services/booking.service';
import { Payment } from '@/models/Payment';
import { Booking } from '@/models/Booking';
import connectToDatabase from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      bookingData,
    } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !bookingData) {
      return NextResponse.json(
        { success: false, error: 'Missing payment verification credentials.' },
        { status: 400 }
      );
    }

    // 1. Check for Idempotency (prevent duplicate confirmation on retries)
    const existingPayment = await Payment.findOne({
      providerOrderId: razorpayOrderId,
      status: 'SUCCESS',
    }).lean();

    if (existingPayment) {
      const existingBooking = await Booking.findById(existingPayment.bookingId).lean();
      return NextResponse.json({
        success: true,
        isDuplicate: true,
        booking: existingBooking,
        message: 'Payment already processed and booking confirmed.',
      });
    }

    // 2. Server-side HMAC SHA-256 signature verification
    const isValid = PaymentService.verifySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature. Verification failed.' },
        { status: 400 }
      );
    }

    // 3. Complete Booking Creation with distributed concurrency safety
    const result = await BookingService.createBooking({
      ...bookingData,
      customerId: user.userId,
      razorpayOrderId,
      razorpayPaymentId,
      paymentProvider: 'RAZORPAY_SANDBOX',
    });

    return NextResponse.json({
      success: true,
      booking: result.booking,
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
    });
  } catch (error: any) {
    console.error('[Payment Verify Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed.' },
      { status: 409 }
    );
  }
}
