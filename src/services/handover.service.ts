import mongoose from 'mongoose';
import {
  DigitalHandoverReport,
  IDigitalHandoverReport,
  IScratchItem,
} from '@/models/DigitalHandoverReport';
import { Booking } from '@/models/Booking';
import { Vehicle } from '@/models/Vehicle';
import { DamageReport } from '@/models/DamageReport';
import connectToDatabase from '@/lib/mongodb';

export interface HandoverDTO {
  bookingId: string;
  vehicleId: string;
  handoverType: 'PICKUP' | 'RETURN';
  odometerReading: number;
  fuelBatteryLevel: number;
  existingScratches: IScratchItem[];
  photos: {
    frontUrl: string;
    backUrl: string;
    leftUrl: string;
    rightUrl: string;
    meterUrl: string;
  };
  helmetCount: number;
  accessoriesGiven: string[];
  customerSignatureConfirmed: boolean;
  customerSignatureName?: string;
  vendorAgentName: string;
  remarks: string;
}

export class HandoverService {
  public static async recordHandover(dto: HandoverDTO): Promise<IDigitalHandoverReport> {
    await connectToDatabase();

    const report = await DigitalHandoverReport.create({
      bookingId: new mongoose.Types.ObjectId(dto.bookingId),
      vehicleId: new mongoose.Types.ObjectId(dto.vehicleId),
      handoverType: dto.handoverType,
      odometerReading: dto.odometerReading,
      fuelBatteryLevel: dto.fuelBatteryLevel,
      existingScratches: dto.existingScratches,
      photos: dto.photos,
      helmetCount: dto.helmetCount,
      accessoriesGiven: dto.accessoriesGiven,
      customerSignatureConfirmed: dto.customerSignatureConfirmed,
      customerSignatureName: dto.customerSignatureName,
      vendorAgentName: dto.vendorAgentName,
      remarks: dto.remarks,
      timestamp: new Date(),
    });

    // Update booking status and references
    if (dto.handoverType === 'PICKUP') {
      await Booking.findByIdAndUpdate(dto.bookingId, {
        bookingStatus: 'ACTIVE',
        depositStatus: 'HELD',
        handoverPickupId: report._id,
      });
      // Update vehicle odometer
      await Vehicle.findByIdAndUpdate(dto.vehicleId, {
        odometer: dto.odometerReading,
      });
    } else if (dto.handoverType === 'RETURN') {
      await Booking.findByIdAndUpdate(dto.bookingId, {
        handoverReturnId: report._id,
      });
      await Vehicle.findByIdAndUpdate(dto.vehicleId, {
        odometer: dto.odometerReading,
      });
    }

    return report;
  }

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

      const pickupScratchIds = new Set(pickupReport.existingScratches.map((s) => s.id));
      newScratches = returnReport.existingScratches.filter((s) => !pickupScratchIds.has(s.id));
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
    const pickupScratchIds = new Set(pickupReport.existingScratches.map((s) => s.id));
    const newScratches = returnReport.existingScratches.filter((s) => !pickupScratchIds.has(s.id));
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
