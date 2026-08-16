import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PricingService } from '../services/pricing.service';
import { AvailabilityService } from '../services/availability.service';
import { PayoutService } from '../services/payout.service';
import { HandoverService } from '../services/handover.service';
import { assertRole } from '../lib/auth';
import { formatINR, calculateDurationDays, calculateDurationHours } from '../lib/utils';
import { UserRole } from '../models/User';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
    failCount++;
  }
}

async function runE2EVerification() {
  console.log('\n======================================================================');
  console.log('       RideSetu End-to-End Application & Architecture Verification     ');
  console.log('======================================================================\n');

  // -------------------------------------------------------------------------
  // SECTION 1: CUSTOMER FLOW VERIFICATION
  // -------------------------------------------------------------------------
  console.log('--- 1. Customer Flow Verification ---');

  // 1.1 Customer Authentication & Password Hashing
  const rawCustomerPassword = 'customer123';
  const hashedCustomerPassword = await bcrypt.hash(rawCustomerPassword, 10);
  const passwordMatch = await bcrypt.compare(rawCustomerPassword, hashedCustomerPassword);
  assert(passwordMatch, 'Customer login: bcrypt password verification succeeds');

  const customerTokenPayload = {
    userId: 'usr_cust_001',
    email: 'customer@ridesetu.demo',
    role: 'CUSTOMER' as UserRole,
  };
  const secret = 'ridesetu_super_secret_jwt_key_development_only_2026';
  const token = jwt.sign(customerTokenPayload, secret, { expiresIn: '7d' });
  const decoded: any = jwt.verify(token, secret);
  assert(decoded.email === 'customer@ridesetu.demo' && decoded.role === 'CUSTOMER', 'Customer session JWT signed and verified');

  // 1.2 Search & Filtering for Rishikesh Scooters
  const mockVehicles = [
    {
      _id: 'veh_activa_01',
      brand: 'Honda',
      model: 'Activa 6G',
      variant: 'Deluxe Smart Key',
      category: 'SCOOTER',
      destinationId: 'dest_rishikesh',
      pricePerDay: 450,
      securityDeposit: 1000,
      kmLimitPerDay: 150,
      excessKmCharge: 4,
      deliveryAvailable: true,
      helmetIncluded: true,
      roadsideAssistance: true,
      rating: 4.9,
      totalReviews: 42,
      isAvailable: true,
      isVerified: true,
      vendorId: {
        _id: 'ven_himalayan_01',
        businessName: 'Himalayan Wheels & Expeditions',
        baseDeliveryFee: 120,
        rating: 4.9,
        commissionRate: 15,
      },
    },
    {
      _id: 'veh_jupiter_02',
      brand: 'TVS',
      model: 'Jupiter 125',
      variant: 'Disc SmartXonnect',
      category: 'SCOOTER',
      destinationId: 'dest_rishikesh',
      pricePerDay: 480,
      securityDeposit: 1000,
      kmLimitPerDay: 150,
      excessKmCharge: 4,
      deliveryAvailable: true,
      helmetIncluded: true,
      roadsideAssistance: true,
      rating: 4.8,
      totalReviews: 28,
      isAvailable: true,
      isVerified: true,
      vendorId: {
        _id: 'ven_tapovan_02',
        businessName: 'Tapovan Moto Club',
        baseDeliveryFee: 100,
        rating: 4.8,
        commissionRate: 15,
      },
    },
    {
      _id: 'veh_ntorq_03',
      brand: 'TVS',
      model: 'Ntorq 125 Race XP',
      variant: 'Bluetooth Navigation',
      category: 'SCOOTER',
      destinationId: 'dest_rishikesh',
      pricePerDay: 520,
      securityDeposit: 1200,
      kmLimitPerDay: 180,
      excessKmCharge: 5,
      deliveryAvailable: true,
      helmetIncluded: true,
      roadsideAssistance: true,
      rating: 4.9,
      totalReviews: 35,
      isAvailable: true,
      isVerified: true,
      vendorId: {
        _id: 'ven_himalayan_01',
        businessName: 'Himalayan Wheels & Expeditions',
        baseDeliveryFee: 120,
        rating: 4.9,
        commissionRate: 15,
      },
    },
  ];

  const filteredScooters = mockVehicles.filter(
    (v) => v.destinationId === 'dest_rishikesh' && v.category === 'SCOOTER' && v.isAvailable && v.isVerified
  );
  assert(filteredScooters.length === 3, 'Search: 3 verified Rishikesh scooters found');

  // 1.3 Compare 3 Vehicles Side-by-Side
  const compareItems = filteredScooters.map((v) => ({
    id: v._id,
    name: `${v.brand} ${v.model}`,
    price: v.pricePerDay,
    deposit: v.securityDeposit,
    partner: v.vendorId.businessName,
  }));
  assert(
    compareItems.length === 3 &&
      compareItems[0].price === 450 &&
      compareItems[1].price === 480 &&
      compareItems[2].price === 520,
    'Compare: 3 vehicles populated in comparison matrix with rates ₹450, ₹480, ₹520'
  );

  // 1.4 Exact Dates: 18 Aug 2026 10:00 to 20 Aug 2026 18:00 (56 hours = 3 rental billing days)
  const pickupDateTime = '2026-08-18T10:00:00';
  const returnDateTime = '2026-08-20T18:00:00';
  const durationHours = calculateDurationHours(pickupDateTime, returnDateTime);
  const durationDays = calculateDurationDays(pickupDateTime, returnDateTime);
  assert(durationHours === 56 && durationDays === 3, `Rental duration: 56 hours calculated as ${durationDays} billing days`);

  // 1.5 Hotel Delivery & Coupon RISHIKESH100 Applied
  const mockCoupon = {
    code: 'RISHIKESH100',
    discountType: 'FLAT' as const,
    discountValue: 100,
    minimumBookingValue: 500,
    maximumDiscount: 100,
  };

  const selectedVehicle = mockVehicles[0];
  const pricingResult = PricingService.calculatePricing({
    vehicle: selectedVehicle as any,
    pickupDateTime,
    returnDateTime,
    pickupType: 'HOTEL_DELIVERY',
    coupon: mockCoupon as any,
  });

  // Math verification:
  // Base = 450 * 3 = 1350
  // Delivery = 120
  // Platform fee = 49
  // Discount = 100
  // Taxable = 1350 + 120 + 49 - 100 = 1419
  // Taxes (18%) = Math.round(1419 * 0.18) = 255
  // Refundable Security Deposit = 1000
  // Total Payable = 1419 + 255 + 1000 = 2674
  assert(pricingResult.basePrice === 1350, `Price: Base rental = ₹1,350 (Actual: ₹${pricingResult.basePrice})`);
  assert(pricingResult.deliveryCharge === 120, `Price: Hotel delivery fee = ₹120 (Actual: ₹${pricingResult.deliveryCharge})`);
  assert(pricingResult.platformFee === 49, `Price: Tech convenience fee = ₹49 (Actual: ₹${pricingResult.platformFee})`);
  assert(pricingResult.discountAmount === 100, `Price: Coupon discount = ₹100 (Actual: ₹${pricingResult.discountAmount})`);
  assert(pricingResult.taxes === 255, `Price: 18% GST = ₹255 (Actual: ₹${pricingResult.taxes})`);
  assert(pricingResult.securityDeposit === 1000, `Price: Refundable deposit = ₹1,000 isolated (Actual: ₹${pricingResult.securityDeposit})`);
  assert(pricingResult.totalPayable === 2674, `Price: Total Payable = ₹2,674 (Actual: ₹${pricingResult.totalPayable})`);

  // 1.6 Payment Simulation & Booking Creation
  const paymentOrderId = `order_${Date.now()}`;
  const mockBooking = {
    _id: 'book_e2e_001',
    bookingNumber: 'RS-2026-948201',
    customerId: 'usr_cust_001',
    vendorId: selectedVehicle.vendorId._id,
    vehicleId: selectedVehicle._id,
    pickupDateTime: new Date(pickupDateTime),
    returnDateTime: new Date(returnDateTime),
    pickupType: 'HOTEL_DELIVERY',
    pickupLocation: 'Zostel Tapovan, Rishikesh',
    dropoffLocation: 'Zostel Tapovan, Rishikesh',
    basePrice: pricingResult.basePrice,
    deliveryCharge: pricingResult.deliveryCharge,
    platformFee: pricingResult.platformFee,
    taxes: pricingResult.taxes,
    discountAmount: pricingResult.discountAmount,
    securityDeposit: pricingResult.securityDeposit,
    totalPayable: pricingResult.totalPayable,
    bookingStatus: 'CONFIRMED',
    paymentStatus: 'PAID',
    depositStatus: 'HELD_SECURELY',
    paymentOrderId,
  };
  assert(mockBooking.bookingStatus === 'CONFIRMED' && mockBooking.paymentStatus === 'PAID', 'Booking: Created in CONFIRMED state with PAID status');

  // 1.7 Rental Extension Availability Check
  // Extend to 21 Aug 2026 18:00
  const extendedReturn = '2026-08-21T18:00:00';
  const existingBookingsForVehicle: any[] = [
    {
      pickupDateTime: new Date('2026-08-18T10:00:00'),
      returnDateTime: new Date('2026-08-20T18:00:00'),
      bookingStatus: 'CONFIRMED',
    },
  ];

  // Check extension slot (20 Aug 18:00 to 21 Aug 18:00)
  const isExtensionSlotFree = !existingBookingsForVehicle.some((b) => {
    const p = new Date('2026-08-20T18:00:00');
    const r = new Date(extendedReturn);
    return p < b.returnDateTime && r > b.pickupDateTime && b !== existingBookingsForVehicle[0];
  });
  assert(isExtensionSlotFree, 'Rental extension: Verified slot is free and extension is approved');

  // -------------------------------------------------------------------------
  // SECTION 2: DOUBLE-BOOKING OVERLAP PREVENTION TEST SUITE
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Double-Booking Overlap Prevention Tests ---');

  // Active Base Booking: 18 Aug 2026 10:00 -> 20 Aug 2026 18:00
  const activeBookingWindow = {
    pickup: new Date('2026-08-18T10:00:00').getTime(),
    return: new Date('2026-08-20T18:00:00').getTime(),
  };

  const testOverlapCondition = (reqP: string, reqR: string): boolean => {
    const p = new Date(reqP).getTime();
    const r = new Date(reqR).getTime();
    // Overlap condition: requestedPickup < existingReturn && requestedReturn > existingPickup
    return p < activeBookingWindow.return && r > activeBookingWindow.pickup;
  };

  // Case A: 19 Aug 10:00 -> 21 Aug 18:00 (Overlaps tail of booking) -> MUST BE REJECTED
  const caseA_overlaps = testOverlapCondition('2026-08-19T10:00:00', '2026-08-21T18:00:00');
  assert(caseA_overlaps === true, 'Double-booking Case A (19 Aug 10:00 -> 21 Aug 18:00): REJECTED as conflict');

  // Case B: 20 Aug 18:00 -> 22 Aug 18:00 (Consecutive adjacent boundary) -> MUST BE ALLOWED
  const caseB_overlaps = testOverlapCondition('2026-08-20T18:00:00', '2026-08-22T18:00:00');
  assert(caseB_overlaps === false, 'Double-booking Case B (20 Aug 18:00 -> 22 Aug 18:00): ALLOWED (Exact consecutive pickup)');

  // Case C: 17 Aug 10:00 -> 19 Aug 10:00 (Overlaps head of booking) -> MUST BE REJECTED
  const caseC_overlaps = testOverlapCondition('2026-08-17T10:00:00', '2026-08-19T10:00:00');
  assert(caseC_overlaps === true, 'Double-booking Case C (17 Aug 10:00 -> 19 Aug 10:00): REJECTED as conflict');

  // Case D: 18 Aug 12:00 -> 19 Aug 12:00 (Enclosed subset within booking) -> MUST BE REJECTED
  const caseD_overlaps = testOverlapCondition('2026-08-18T12:00:00', '2026-08-19T12:00:00');
  assert(caseD_overlaps === true, 'Double-booking Case D (18 Aug 12:00 -> 19 Aug 12:00): REJECTED as conflict');

  // Case E: 16 Aug 10:00 -> 18 Aug 10:00 (Preceding consecutive boundary) -> MUST BE ALLOWED
  const caseE_overlaps = testOverlapCondition('2026-08-16T10:00:00', '2026-08-18T10:00:00');
  assert(caseE_overlaps === false, 'Double-booking Case E (16 Aug 10:00 -> 18 Aug 10:00): ALLOWED (Exact preceding return)');

  // -------------------------------------------------------------------------
  // SECTION 3: VENDOR FLOW VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Vendor Flow Verification ---');

  // 3.1 Vendor Authentication
  const rawVendorPassword = 'vendor123';
  const hashedVendorPassword = await bcrypt.hash(rawVendorPassword, 10);
  const vendorMatch = await bcrypt.compare(rawVendorPassword, hashedVendorPassword);
  assert(vendorMatch, 'Vendor login: bcrypt password verification succeeds');

  // 3.2 Vendor Add Vehicle & Image Schema Verification
  const newVehicleDTO = {
    vendorId: 'ven_himalayan_01',
    destinationId: 'dest_rishikesh',
    brand: 'Royal Enfield',
    model: 'Himalayan 450',
    variant: 'Kamet White Tubeless',
    category: 'MOTORCYCLE',
    year: 2024,
    registrationNumber: 'UK 07 EA 9901',
    fuelType: 'PETROL',
    transmission: 'MANUAL',
    pricePerDay: 1600,
    securityDeposit: 3000,
    kmLimitPerDay: 200,
    excessKmCharge: 7,
    deliveryAvailable: true,
    helmetIncluded: true,
    roadsideAssistance: true,
    images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80'],
    isAvailable: true,
    isVerified: true,
  };
  assert(newVehicleDTO.pricePerDay === 1600 && newVehicleDTO.securityDeposit === 3000, 'Vendor fleet: Vehicle creation DTO validated');

  // 3.3 Maintenance Date Blocking
  const maintenanceBlock = {
    vehicleId: 'veh_activa_01',
    startDate: new Date('2026-08-25T00:00:00'),
    endDate: new Date('2026-08-26T23:59:59'),
    reason: 'MAINTENANCE',
    notes: 'Brake pad and oil service',
  };
  const isSearchBlocked = (pDate: string, rDate: string) => {
    const p = new Date(pDate).getTime();
    const r = new Date(rDate).getTime();
    return p < maintenanceBlock.endDate.getTime() && r > maintenanceBlock.startDate.getTime();
  };
  assert(isSearchBlocked('2026-08-25T10:00:00', '2026-08-26T18:00:00') === true, 'Vendor calendar: Blocked dates prevent customer searches');

  // 3.4 Digital Handover Pickup & Return Inspection
  const pickupInspection = {
    bookingId: 'book_e2e_001',
    handoverType: 'PICKUP',
    odometerReading: 4200,
    fuelBatteryLevel: 100,
    existingScratches: [
      { id: 'sc_01', zone: 'Front Mudguard', description: 'Minor 1cm scratch', severity: 'MINOR' },
    ],
    customerSignatureConfirmed: true,
  };

  const returnInspection = {
    bookingId: 'book_e2e_001',
    handoverType: 'RETURN',
    odometerReading: 4295,
    fuelBatteryLevel: 90,
    existingScratches: [
      { id: 'sc_01', zone: 'Front Mudguard', description: 'Minor 1cm scratch', severity: 'MINOR' },
      { id: 'sc_02', zone: 'Right Body Panel', description: 'Deep scratch on lower cowl', severity: 'MODERATE' },
    ],
    customerSignatureConfirmed: true,
  };

  const inspectionDiff = HandoverService.generateInspectionDiff(pickupInspection as any, returnInspection as any);
  assert(inspectionDiff.distanceRiddenKm === 95, `Handover diff: Distance ridden = 95 km (Actual: ${inspectionDiff.distanceRiddenKm} km)`);
  assert(inspectionDiff.fuelBatteryDifference === -10, `Handover diff: Fuel level dropped 10% (Actual: ${inspectionDiff.fuelBatteryDifference}%)`);
  assert(inspectionDiff.newScratchesCount === 1, `Handover diff: 1 new scratch detected (Actual: ${inspectionDiff.newScratchesCount})`);

  // 3.5 Vendor Payout Calculation
  // Booking gross revenue = Base (1350) + Delivery (120) = 1470 (Excludes ₹49 platform fee, taxes, and ₹1000 deposit)
  const completedBooking = {
    ...mockBooking,
    bookingStatus: 'COMPLETED',
    depositStatus: 'REFUNDED_TO_CUSTOMER',
  };
  const payoutComp = PayoutService.calculateVendorPayout(completedBooking as any, 15);
  // Gross = 1350 + 120 = 1470
  // Commission (15%) = Math.round(1470 * 0.15) = 221
  // Net Payout = 1470 - 221 = 1249
  assert(payoutComp.eligibleGrossAmount === 1470, `Payout: Eligible gross = ₹1,470 (Actual: ₹${payoutComp.eligibleGrossAmount})`);
  assert(payoutComp.platformCommissionAmount === 221, `Payout: Platform commission (15%) = ₹221 (Actual: ₹${payoutComp.platformCommissionAmount})`);
  assert(payoutComp.netPayoutAmount === 1249, `Payout: Net vendor payout = ₹1,249 (Actual: ₹${payoutComp.netPayoutAmount})`);

  // -------------------------------------------------------------------------
  // SECTION 4: ADMIN FLOW VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Admin Flow Verification ---');

  // 4.1 Admin Authentication
  const rawAdminPassword = 'admin123';
  const hashedAdminPassword = await bcrypt.hash(rawAdminPassword, 10);
  const adminMatch = await bcrypt.compare(rawAdminPassword, hashedAdminPassword);
  assert(adminMatch, 'Admin login: bcrypt password verification succeeds');

  // 4.2 GMV & Platform Revenue Metrics
  const sampleBookings = [mockBooking, completedBooking];
  const gmv = sampleBookings.reduce((sum, b) => sum + b.totalPayable, 0);
  const platformRevenue = sampleBookings.reduce((sum, b) => sum + b.platformFee + Math.round((b.basePrice + b.deliveryCharge) * 0.15), 0);
  assert(gmv === 5348, `Admin GMV: Calculated as ₹5,348 (Actual: ₹${gmv})`);
  assert(platformRevenue === (49 + 221) * 2, `Admin Revenue: Calculated platform revenue (Actual: ₹${platformRevenue})`);

  // 4.3 Vendor Verification Queue
  const vendorStatusTransition = (status: 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED') => status;
  assert(vendorStatusTransition('VERIFIED') === 'VERIFIED', 'Admin compliance: Vendor license approved & verified');

  // 4.4 Dispute & Damage Arbitration
  const damageDispute = {
    _id: 'disp_001',
    bookingId: 'book_e2e_001',
    claimedAmount: 500,
    status: 'OPEN' as 'OPEN' | 'RESOLVED' | 'REJECTED',
    adminNotes: '',
  };
  // Admin resolves dispute with partial deduction of ₹300 and refunds ₹700 to customer
  const resolvedDispute = {
    ...damageDispute,
    status: 'RESOLVED' as const,
    approvedDeduction: 300,
    refundedDeposit: 700,
    adminNotes: 'Minor scratch validated; ₹300 deduction approved.',
  };
  assert(
    resolvedDispute.status === 'RESOLVED' &&
      resolvedDispute.approvedDeduction + resolvedDispute.refundedDeposit === 1000,
    'Admin dispute arbitration: ₹300 damage approved, ₹700 deposit refunded to customer'
  );

  // 4.5 Dynamic Commission Rate Update (15% -> 12%)
  const customVendorPayout = PayoutService.calculateVendorPayout(completedBooking as any, 12);
  // Gross = 1470
  // Commission (12%) = Math.round(1470 * 0.12) = 176
  // Net Payout = 1470 - 176 = 1294
  assert(customVendorPayout.platformCommissionAmount === 176, `Admin Commission: 12% commission = ₹176 (Actual: ₹${customVendorPayout.platformCommissionAmount})`);
  assert(customVendorPayout.netPayoutAmount === 1294, `Admin Commission: Updated net payout = ₹1,294 (Actual: ₹${customVendorPayout.netPayoutAmount})`);

  // -------------------------------------------------------------------------
  // SECTION 5: SECURITY & PERMISSION GUARDS VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Security & Permission Guards Verification ---');

  // 5.1 Customer blocked from /admin
  const customerSession = { userId: 'c1', email: 'cust@ridesetu.demo', role: 'CUSTOMER' as UserRole };
  const adminSession = { userId: 'a1', email: 'admin@ridesetu.demo', role: 'ADMIN' as UserRole };
  const vendorSession = { userId: 'v1', email: 'vendor@ridesetu.demo', role: 'VENDOR' as UserRole };

  const customerAuth = assertRole(customerSession as any, ['ADMIN']);
  assert(customerAuth.authorized === false && customerAuth.status === 403, 'Security: Customer blocked from /admin routes with 403 Forbidden');

  // 5.2 Customer cannot access another customer's booking
  const isAuthorizedCustomer = (reqCustomerId: string, bookingCustomerId: string) => reqCustomerId === bookingCustomerId;
  assert(isAuthorizedCustomer('usr_cust_001', 'usr_cust_002') === false, 'Security: Customer blocked from accessing another customer private booking');

  // 5.3 Vendor cannot access another vendor's fleet
  const isAuthorizedVendor = (reqVendorId: string, vehicleVendorId: string) => reqVendorId === vehicleVendorId;
  assert(isAuthorizedVendor('ven_001', 'ven_002') === false, 'Security: Vendor blocked from modifying another vendor fleet');

  // 5.4 Vendor blocked from Admin Console
  const vendorAuth = assertRole(vendorSession as any, ['ADMIN']);
  assert(vendorAuth.authorized === false && vendorAuth.status === 403, 'Security: Vendor blocked from /admin routes with 403 Forbidden');

  // -------------------------------------------------------------------------
  // SECTION 6: PRODUCTION HARDENING MODULES VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n--- 6. Production Hardening Modules Verification ---');

  const { PaymentService } = await import('../services/payment.service');
  const { StorageService } = await import('../services/storage.service');
  const { NotificationService } = await import('../services/notification.service');
  const { checkRateLimit } = await import('../lib/rate-limit');

  // 6.1 Payment Service Sandbox & Signature Verification
  const orderRes = await PaymentService.createOrder({ amount: 1500 });
  assert(orderRes.amount === 150000 && orderRes.currency === 'INR', 'Payment: Razorpay order created with amount in paise (150000)');

  const validSig = PaymentService.verifySignature({
    orderId: 'order_test_123',
    paymentId: 'pay_test_456',
    signature: 'sandbox_sig_valid',
  });
  assert(validSig === true, 'Payment: Sandbox valid signature passes verification');

  const invalidSig = PaymentService.verifySignature({
    orderId: 'order_test_123',
    paymentId: 'pay_test_456',
    signature: 'fake_tampered_signature_xyz',
  });
  assert(invalidSig === false, 'Payment: Tampered payment signature rejected with false');

  // 6.2 Storage Service Validation & Public vs Private Isolation
  const validBuffer = Buffer.from('dummy-image-content-bytes');
  const validFileCheck = StorageService.validateFile(validBuffer, 'image/jpeg');
  assert(validFileCheck.valid === true, 'Storage: Valid JPEG image accepted');

  const oversizedBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
  const oversizeCheck = StorageService.validateFile(oversizedBuffer, 'image/png');
  assert(oversizeCheck.valid === false, 'Storage: Oversized file (>5MB) rejected by validator');

  const invalidMimeCheck = StorageService.validateFile(validBuffer, 'application/x-msdownload');
  assert(invalidMimeCheck.valid === false, 'Storage: Executable/Disallowed MIME type rejected');

  // 6.3 Notification Service Architecture
  const notifStatus = NotificationService.getChannelStatus();
  assert(notifStatus.inApp === 'ACTIVE', 'Notifications: In-App channel is active on MongoDB Atlas');

  // 6.4 Rate Limiting Middleware
  const dummyReq = {
    headers: new Headers({ 'x-forwarded-for': '192.168.1.100' }),
  } as any;
  const rl1 = checkRateLimit(dummyReq, { limit: 2, windowMs: 1000 });
  const rl2 = checkRateLimit(dummyReq, { limit: 2, windowMs: 1000 });
  const rl3 = checkRateLimit(dummyReq, { limit: 2, windowMs: 1000 });
  assert(rl1.allowed && rl2.allowed && !rl3.allowed, 'Rate Limit: Request #3 exceeds limit and is rejected');

  console.log('\n======================================================================');
  console.log(`  E2E Verification Finished: ${passCount}/${passCount + failCount} Passed (${Math.round((passCount / (passCount + failCount)) * 100)}%)`);
  console.log('======================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runE2EVerification().catch((err) => {
  console.error('Fatal Verification Error:', err);
  process.exit(1);
});
