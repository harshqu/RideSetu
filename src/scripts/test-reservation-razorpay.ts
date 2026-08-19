import mongoose from 'mongoose';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { AvailabilityService } from '../services/availability.service';
import { PaymentService } from '../services/payment.service';
import { PricingService } from '../services/pricing.service';
import { BookingService } from '../services/booking.service';
import { ReservationLock } from '../models/ReservationLock';
import { Payment } from '../models/Payment';
import { Booking } from '../models/Booking';
import { Vehicle } from '../models/Vehicle';
import { User } from '../models/User';
import { Vendor } from '../models/Vendor';
import connectToDatabase from '../lib/mongodb';

async function runReservationRazorpayTests() {
  console.log('======================================================================');
  console.log('  RideSetu — Reservation Hold & Razorpay End-to-End Test Suite');
  console.log('======================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}${detail ? ` — ${detail}` : ''}`);
    }
  }

  await connectToDatabase();

  const testVehicleId = new mongoose.Types.ObjectId();
  const customerAId = new mongoose.Types.ObjectId();
  const customerBId = new mongoose.Types.ObjectId();
  const pickup = new Date('2026-08-20T09:00:00Z');
  const returnDate = new Date('2026-08-21T20:00:00Z');

  // Clean up any test locks for this vehicle
  await ReservationLock.deleteMany({ vehicleId: testVehicleId });

  // 1. Initial hold creation for Customer A
  console.log('--- 1. Testing Reservation Hold Creation & Ownership ---');
  const lockA = await AvailabilityService.acquireDistributedReservation({
    vehicleId: testVehicleId,
    userId: customerAId,
    pickupDateTime: pickup,
    returnDateTime: returnDate,
    durationMinutes: 15,
  });

  assert(lockA.acquired === true, 'Customer A successfully acquires initial reservation hold');
  assert(lockA.reservation?.userId?.toString() === customerAId.toString(), 'Reservation hold stores Customer A userId');
  assert(lockA.reservation?.status === 'HOLD', 'Initial reservation status is HOLD');

  // 2. Existing current-user reservation reused
  console.log('\n--- 2. Testing Current-User Hold Reusability ---');
  const lockAReuse = await AvailabilityService.acquireDistributedReservation({
    vehicleId: testVehicleId,
    userId: customerAId,
    pickupDateTime: pickup,
    returnDateTime: returnDate,
    durationMinutes: 15,
  });

  assert(lockAReuse.acquired === true, 'Customer A continuing checkout reuses existing reservation');
  assert(lockAReuse.isReused === true, 'Hold is flagged as reused without creating duplicate lock');
  assert(lockAReuse.reservation?._id.toString() === lockA.reservation?._id.toString(), 'Same reservation lock document ID preserved');

  // 3. Other-user reservation blocks checkout
  console.log('\n--- 3. Testing Other-User Collision Block ---');
  const lockB = await AvailabilityService.acquireDistributedReservation({
    vehicleId: testVehicleId,
    userId: customerBId,
    pickupDateTime: pickup,
    returnDateTime: returnDate,
    durationMinutes: 15,
  });

  assert(lockB.acquired === false, 'Customer B attempting same dates is BLOCKED');
  assert(
    lockB.reason === 'This vehicle is temporarily reserved for another customer for the selected dates.',
    'Customer B receives clear temporary reservation notice'
  );

  // 4. Expired reservation automatically released
  console.log('\n--- 4. Testing Expired Reservation Cleanup ---');
  // Manually expire Customer A's lock
  await ReservationLock.findByIdAndUpdate(lockA.reservation?._id, {
    expiresAt: new Date(Date.now() - 60000), // 1 min in past
  });

  const lockBAfterExpiry = await AvailabilityService.acquireDistributedReservation({
    vehicleId: testVehicleId,
    userId: customerBId,
    pickupDateTime: pickup,
    returnDateTime: returnDate,
    durationMinutes: 15,
  });

  assert(lockBAfterExpiry.acquired === true, 'Expired hold is released; Customer B acquires fresh lock');

  // 5. Failed payment releases reservation
  console.log('\n--- 5. Testing Payment Failure Hold Release ---');
  if (lockBAfterExpiry.reservation) {
    await AvailabilityService.releaseReservation(lockBAfterExpiry.reservation._id);
    const releasedLock = await ReservationLock.findById(lockBAfterExpiry.reservation._id).lean();
    assert(releasedLock?.status === 'RELEASED', 'Failed/cancelled payment marks reservation as RELEASED');

    // Customer A can now acquire hold again
    const lockAAgain = await AvailabilityService.acquireDistributedReservation({
      vehicleId: testVehicleId,
      userId: customerAId,
      pickupDateTime: pickup,
      returnDateTime: returnDate,
      durationMinutes: 15,
    });
    assert(lockAAgain.acquired === true, 'Vehicle becomes immediately available for checkout after lock release');
  }

  // 6. Server-Side Pricing Verification (₹2,143 Exact Amount)
  console.log('\n--- 6. Testing Exact ₹2,143 Calculation & Razorpay Amount ---');
  const mockVeh = {
    pricePerDay: 460,
    securityDeposit: 1000,
    category: 'SCOOTER' as const,
  };

  const calculatedPrice = PricingService.calculatePricing({
    vehicle: mockVeh,
    pickupDateTime: pickup,
    returnDateTime: returnDate, // 2 days @ 460 = 920
    pickupType: 'VENDOR_PICKUP',
  });

  assert(calculatedPrice.basePrice === 920, 'Base Rental correctly computed as ₹920 (2 days @ ₹460)');
  assert(calculatedPrice.platformFee === 49, 'Platform fee fixed at ₹49');
  assert(calculatedPrice.taxes === 174, '18% GST on (₹920 + ₹49) equals ₹174');
  assert(calculatedPrice.securityDeposit === 1000, 'Security deposit is ₹1,000');
  assert(calculatedPrice.totalPayable === 2143, 'Total Payable is exactly ₹2,143');

  const razorpayAmountPaise = Math.round(calculatedPrice.totalPayable * 100);
  assert(razorpayAmountPaise === 214300, 'Razorpay order amount in paise is exactly 214,300');

  // 7. HMAC-SHA256 Signature Verification
  console.log('\n--- 7. Testing Razorpay HMAC-SHA256 Cryptographic Signature ---');
  const secretKey = 'test_secret_key_12345';
  const sampleOrderId = 'order_test_999888';
  const samplePaymentId = 'pay_test_777666';

  const validSignature = crypto
    .createHmac('sha256', secretKey)
    .update(`${sampleOrderId}|${samplePaymentId}`)
    .digest('hex');

  const isValid = PaymentService.verifySignature({
    orderId: sampleOrderId,
    paymentId: samplePaymentId,
    signature: validSignature,
    customSecret: secretKey,
  });

  assert(isValid === true, 'Cryptographically authentic HMAC-SHA256 signature is ACCEPTED');

  const isTampered = PaymentService.verifySignature({
    orderId: sampleOrderId,
    paymentId: samplePaymentId,
    signature: 'tampered_fake_signature_hex',
    customSecret: secretKey,
  });

  assert(isTampered === false, 'Tampered or forged signature is strictly REJECTED');

  // 8. Successful payment confirms reservation
  console.log('\n--- 8. Testing Successful Confirmation Lock State ---');
  const mockBookingId = new mongoose.Types.ObjectId();
  const testHold = await AvailabilityService.acquireDistributedReservation({
    vehicleId: testVehicleId,
    userId: customerAId,
    pickupDateTime: pickup,
    returnDateTime: returnDate,
  });

  if (testHold.reservation) {
    await AvailabilityService.confirmReservation(testHold.reservation._id, mockBookingId);
    const confirmedLock = await ReservationLock.findById(testHold.reservation._id).lean();
    assert(confirmedLock?.status === 'CONFIRMED', 'Reservation status transitions to CONFIRMED on payment capture');
    assert(confirmedLock?.bookingId?.toString() === mockBookingId.toString(), 'Confirmed reservation links bookingId');
  }

  // 9. Webhook Signature Verification
  console.log('\n--- 9. Testing Razorpay Webhook Raw HMAC Verification ---');
  const webhookSecret = 'test_webhook_secret_abc';
  const webhookBody = JSON.stringify({
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_live_test_001',
          order_id: 'order_live_test_001',
          amount: 214300,
          currency: 'INR',
          status: 'captured',
        },
      },
    },
  });

  const validWebhookSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(webhookBody)
    .digest('hex');

  const isWebhookValid = PaymentService.verifyWebhookSignature(webhookBody, validWebhookSig, webhookSecret);
  assert(isWebhookValid === true, 'Raw-body webhook HMAC signature verified successfully');

  const isWebhookTampered = PaymentService.verifyWebhookSignature(webhookBody, 'invalid_sig', webhookSecret);
  assert(isWebhookTampered === false, 'Invalid webhook signature safely rejected');

  // Cleanup test data
  await ReservationLock.deleteMany({ vehicleId: testVehicleId });

  console.log('\n======================================================================');
  console.log(`  Reservation & Razorpay Suite: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('======================================================================\n');
}

runReservationRazorpayTests();
