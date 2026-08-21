import mongoose from 'mongoose';
import {
  DigitalHandoverReport,
  IDigitalHandoverReport,
  IScratchItem,
} from '@/models/DigitalHandoverReport';
import { Booking } from '@/models/Booking';
import { Vehicle } from '@/models/Vehicle';
import { DamageReport } from '@/models/DamageReport';
import { AuditLog } from '@/models/AuditLog';
import { NotificationService } from './notification.service';
import { BookingStateMachineService } from './booking-state-machine.service';
import connectToDatabase from '@/lib/mongodb';

export interface VendorHandoverDTO {
  bookingId: string;
  vendorUserId: string;
  vehicleId: string;
  odometerReading: number;
  fuelBatteryLevel: number;
  existingScratches: IScratchItem[];
  photos: {
    frontUrl: string;
    backUrl: string;
    leftUrl: string;
    rightUrl: string;
    meterUrl: string;
    dashboardUrl?: string;
  };
  helmetCount: number;
  accessoriesGiven: string[];
  vendorAgentName: string;
  remarks: string;
}

export interface CustomerConfirmHandoverDTO {
  bookingId: string;
  customerUserId: string;
  customerSignatureConfirmed: boolean;
  customerSignatureName: string;
}

export interface VendorReturnDTO {
  bookingId: string;
  vendorUserId: string;
  vehicleId: string;
  returnOdometerReading: number;
  returnFuelBatteryLevel: number;
  returnScratches: IScratchItem[];
  returnPhotos: {
    frontUrl: string;
    backUrl: string;
    leftUrl: string;
    rightUrl: string;
    meterUrl: string;
    dashboardUrl?: string;
  };
  vendorAgentName: string;
  damageDescription?: string;
  remarks: string;
}

export class HandoverService {
  /**
   * Step 1: Vendor performs Pre-Pickup Handover Inspection
   */
  public static async recordVendorHandover(dto: VendorHandoverDTO): Promise<IDigitalHandoverReport> {
    await connectToDatabase();

    const booking = await Booking.findById(dto.bookingId);
    if (!booking) {
      throw new Error('Booking not found.');
    }

    // RBAC: Verify vendor owns this booking
    const vendor = await mongoose.model('Vendor').findOne({ userId: dto.vendorUserId });
    if (!vendor || booking.vendorId.toString() !== vendor._id.toString()) {
      throw new Error('Forbidden: You do not own this booking.');
    }

    // State machine check
    if (!['CONFIRMED', 'PRE_PICKUP', 'READY_FOR_HANDOVER'].includes(booking.bookingStatus)) {
      throw new Error(`Booking status is "${booking.bookingStatus}". Handover inspection requires CONFIRMED, PRE_PICKUP, or READY_FOR_HANDOVER state.`);
    }

    if (dto.odometerReading < 0) {
      throw new Error('Odometer reading must be greater than or equal to 0.');
    }

    if (dto.fuelBatteryLevel < 0 || dto.fuelBatteryLevel > 100) {
      throw new Error('Fuel / Battery level must be between 0% and 100%.');
    }

    const report = await DigitalHandoverReport.create({
      bookingId: booking._id,
      vehicleId: new mongoose.Types.ObjectId(dto.vehicleId),
      handoverType: 'PICKUP',
      odometerReading: dto.odometerReading,
      fuelBatteryLevel: dto.fuelBatteryLevel,
      existingScratches: dto.existingScratches || [],
      photos: dto.photos,
      helmetCount: dto.helmetCount || 1,
      accessoriesGiven: dto.accessoriesGiven || [],
      customerSignatureConfirmed: false,
      vendorAgentName: dto.vendorAgentName || 'Vendor Representative',
      remarks: dto.remarks || '',
      timestamp: new Date(),
    });

    // Transition booking status to HANDED_OVER (awaiting customer acceptance)
    booking.bookingStatus = 'HANDED_OVER';
    booking.handoverPickupId = report._id;
    await booking.save();

    // Log Audit
    await AuditLog.create({
      action: 'BOOKING_HANDOVER_RECORDED',
      userId: dto.vendorUserId,
      userRole: 'VENDOR',
      resourceType: 'BOOKING',
      resourceId: booking._id.toString(),
      details: { bookingNumber: booking.bookingNumber },
    }).catch(() => {});

    // Notify Customer
    await NotificationService.createNotification({
      userId: booking.customerId.toString(),
      type: 'BOOKING_CONFIRMED',
      title: 'Handover Inspection Ready for Confirmation',
      message: `Your vendor has completed the handover inspection for vehicle ${booking.bookingNumber}. Please review and confirm to start your trip.`,
      relatedBookingId: booking._id.toString(),
    }).catch(() => {});

    return report;
  }

  /**
   * Step 2: Customer reviews & accepts Handover Inspection to activate trip
   */
  public static async confirmCustomerHandover(dto: CustomerConfirmHandoverDTO): Promise<any> {
    await connectToDatabase();

    const booking = await Booking.findById(dto.bookingId);
    if (!booking) {
      throw new Error('Booking not found.');
    }

    // RBAC: Verify customer owns this booking
    if (booking.customerId.toString() !== dto.customerUserId) {
      throw new Error('Forbidden: You are not authorized to confirm this booking.');
    }

    if (booking.bookingStatus !== 'HANDED_OVER') {
      throw new Error(`Booking status is "${booking.bookingStatus}". Handover confirmation requires HANDED_OVER state.`);
    }

    if (!dto.customerSignatureConfirmed) {
      throw new Error('You must accept the recorded vehicle condition to start your ride.');
    }

    // Update handover report confirmation signature
    if (booking.handoverPickupId) {
      await DigitalHandoverReport.findByIdAndUpdate(booking.handoverPickupId, {
        customerSignatureConfirmed: true,
        customerSignatureName: dto.customerSignatureName || 'Customer',
      });
    }

    // Transition booking to ACTIVE and hold deposit
    booking.bookingStatus = 'ACTIVE';
    booking.depositStatus = 'HELD';
    await booking.save();

    // Update vehicle odometer
    const pickupReport = await DigitalHandoverReport.findById(booking.handoverPickupId);
    if (pickupReport) {
      await Vehicle.findByIdAndUpdate(booking.vehicleId, {
        odometer: pickupReport.odometerReading,
      });
    }

    // Log Audit
    await AuditLog.create({
      action: 'BOOKING_ACTIVATED',
      userId: dto.customerUserId,
      userRole: 'CUSTOMER',
      resourceType: 'BOOKING',
      resourceId: booking._id.toString(),
      details: { bookingNumber: booking.bookingNumber },
    }).catch(() => {});

    return booking;
  }

  /**
   * Step 3: Vendor performs Return Inspection
   */
  public static async recordVendorReturn(dto: VendorReturnDTO): Promise<{ report: IDigitalHandoverReport; isDisputed: boolean }> {
    await connectToDatabase();

    const booking = await Booking.findById(dto.bookingId);
    if (!booking) {
      throw new Error('Booking not found.');
    }

    // RBAC: Verify vendor owns this booking
    const vendor = await mongoose.model('Vendor').findOne({ userId: dto.vendorUserId });
    if (!vendor || booking.vendorId.toString() !== vendor._id.toString()) {
      throw new Error('Forbidden: You do not own this booking.');
    }

    if (!['ACTIVE', 'RETURN_PENDING', 'RETURN_INSPECTION'].includes(booking.bookingStatus)) {
      throw new Error(`Booking status is "${booking.bookingStatus}". Return inspection requires ACTIVE or RETURN_PENDING state.`);
    }

    // Fetch pickup report to validate odometer delta
    const pickupReport = await DigitalHandoverReport.findOne({ bookingId: booking._id, handoverType: 'PICKUP' });
    if (pickupReport && dto.returnOdometerReading < pickupReport.odometerReading) {
      throw new Error(`Return odometer (${dto.returnOdometerReading} km) cannot be lower than handover odometer (${pickupReport.odometerReading} km).`);
    }

    // Detect new scratches / damage
    const pickupScratchIds = new Set((pickupReport?.existingScratches || []).map((s) => s.id));
    const newScratches = (dto.returnScratches || []).filter((s) => !pickupScratchIds.has(s.id));
    const isDisputed = newScratches.length > 0 || Boolean(dto.damageDescription && dto.damageDescription.trim().length > 0);

    const returnReport = await DigitalHandoverReport.create({
      bookingId: booking._id,
      vehicleId: new mongoose.Types.ObjectId(dto.vehicleId),
      handoverType: 'RETURN',
      odometerReading: dto.returnOdometerReading,
      fuelBatteryLevel: dto.returnFuelBatteryLevel,
      existingScratches: dto.returnScratches || [],
      photos: dto.returnPhotos,
      helmetCount: 1,
      accessoriesGiven: [],
      customerSignatureConfirmed: true,
      vendorAgentName: dto.vendorAgentName || 'Vendor Representative',
      remarks: dto.remarks || '',
      timestamp: new Date(),
    });

    booking.handoverReturnId = returnReport._id;

    if (isDisputed) {
      booking.bookingStatus = 'DISPUTED';
      await booking.save();

      await DamageReport.create({
        bookingId: booking._id,
        vehicleId: booking.vehicleId,
        reportedBy: 'VENDOR',
        reporterUserId: dto.vendorUserId,
        description: dto.damageDescription || `New damage detected during return inspection: ${newScratches.map(s => s.description).join(', ')}`,
        images: Object.values(dto.returnPhotos).filter(Boolean),
        status: 'PENDING_REVIEW',
      }).catch(() => {});

      await AuditLog.create({
        action: 'BOOKING_DISPUTED_DAMAGE',
        performedBy: dto.vendorUserId,
        role: 'VENDOR',
        details: `Return inspection flagged new damage for booking ${booking.bookingNumber}`,
      }).catch(() => {});
    } else {
      booking.bookingStatus = 'COMPLETED';
      booking.depositStatus = 'REFUNDED';
      await booking.save();

      await AuditLog.create({
        action: 'BOOKING_COMPLETED',
        performedBy: dto.vendorUserId,
        role: 'VENDOR',
        details: `Return inspection completed with zero damage for booking ${booking.bookingNumber}. Deposit refunded.`,
      }).catch(() => {});
    }

    // Update vehicle odometer
    await Vehicle.findByIdAndUpdate(booking.vehicleId, {
      odometer: dto.returnOdometerReading,
    });

    return { report: returnReport, isDisputed };
  }

  /**
   * Helper: Get Handover Comparison Breakdown
   */
  public static async getHandoverComparison(bookingId: string): Promise<{
    pickupReport: IDigitalHandoverReport | null;
    returnReport: IDigitalHandoverReport | null;
    kmTravelled: number;
    fuelDiff: number;
    newScratches: IScratchItem[];
    depositRecommendation: 'FULL_REFUND' | 'INSPECT_DAMAGE';
  }> {
    await connectToDatabase();
    const bId = new mongoose.Types.ObjectId(bookingId);

    const [pickupReport, returnReport] = await Promise.all([
      DigitalHandoverReport.findOne({ bookingId: bId, handoverType: 'PICKUP' }).lean<IDigitalHandoverReport>(),
      DigitalHandoverReport.findOne({ bookingId: bId, handoverType: 'RETURN' }).lean<IDigitalHandoverReport>(),
    ]);

    let kmTravelled = 0;
    let fuelDiff = 0;
    let newScratches: IScratchItem[] = [];

    if (pickupReport && returnReport) {
      kmTravelled = Math.max(0, returnReport.odometerReading - pickupReport.odometerReading);
      fuelDiff = returnReport.fuelBatteryLevel - pickupReport.fuelBatteryLevel;

      const pickupScratchIds = new Set((pickupReport.existingScratches || []).map((s) => s.id));
      newScratches = (returnReport.existingScratches || []).filter((s) => !pickupScratchIds.has(s.id));
    }

    const depositRecommendation = newScratches.length > 0 ? 'INSPECT_DAMAGE' : 'FULL_REFUND';

    return {
      pickupReport,
      returnReport,
      kmTravelled,
      fuelDiff,
      newScratches,
      depositRecommendation,
    };
  }

  public static generateInspectionDiff(
    pickupReport: { odometerReading: number; fuelBatteryLevel: number; existingScratches: IScratchItem[] },
    returnReport: { odometerReading: number; fuelBatteryLevel: number; existingScratches: IScratchItem[] }
  ): {
    distanceRiddenKm: number;
    fuelBatteryDifference: number;
    newScratchesCount: number;
    newScratches: IScratchItem[];
    depositRecommendation: 'FULL_REFUND' | 'INSPECT_DAMAGE';
  } {
    const distanceRiddenKm = Math.max(0, returnReport.odometerReading - pickupReport.odometerReading);
    const fuelBatteryDifference = returnReport.fuelBatteryLevel - pickupReport.fuelBatteryLevel;
    const pickupScratchIds = new Set((pickupReport.existingScratches || []).map((s) => s.id));
    const newScratches = (returnReport.existingScratches || []).filter((s) => !pickupScratchIds.has(s.id));
    const depositRecommendation = newScratches.length > 0 ? 'INSPECT_DAMAGE' : 'FULL_REFUND';

    return {
      distanceRiddenKm,
      fuelBatteryDifference,
      newScratchesCount: newScratches.length,
      newScratches,
      depositRecommendation,
    };
  }
}
