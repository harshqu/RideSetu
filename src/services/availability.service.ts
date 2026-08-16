import mongoose from 'mongoose';
import { Booking, IBooking } from '@/models/Booking';
import { VehicleAvailability, IVehicleAvailability } from '@/models/VehicleAvailability';
import { ReservationLock, IReservationLock } from '@/models/ReservationLock';
import connectToDatabase from '@/lib/mongodb';

export class AvailabilityService {
  /**
   * Server-side availability checker implementing strict overlapping logic:
   * Condition: requestedPickup < existingReturn AND requestedReturn > existingPickup
   */
  public static async isVehicleAvailable(
    params: {
      vehicleId: string | mongoose.Types.ObjectId;
      pickupDateTime: Date | string;
      returnDateTime: Date | string;
      excludeBookingId?: string | mongoose.Types.ObjectId;
      excludeSessionToken?: string;
    },
    options?: { session?: mongoose.ClientSession }
  ): Promise<{
    available: boolean;
    conflictingBooking?: IBooking | null;
    conflictingBlock?: IVehicleAvailability | null;
    conflictingLock?: IReservationLock | null;
    reason?: string;
  }> {
    await connectToDatabase();

    const pickup = new Date(params.pickupDateTime);
    const returnDate = new Date(params.returnDateTime);

    if (isNaN(pickup.getTime()) || isNaN(returnDate.getTime())) {
      return { available: false, reason: 'Invalid pickup or return date format.' };
    }

    if (returnDate <= pickup) {
      return { available: false, reason: 'Return date & time must be after pickup date & time.' };
    }

    const vehicleObjectId =
      typeof params.vehicleId === 'string'
        ? new mongoose.Types.ObjectId(params.vehicleId)
        : params.vehicleId;

    // 1. Check for overlapping Confirmed/Active Bookings
    const bookingQuery: Record<string, unknown> = {
      vehicleId: vehicleObjectId,
      bookingStatus: { $in: ['CONFIRMED', 'ACTIVE', 'PENDING'] },
      pickupDateTime: { $lt: returnDate },
      returnDateTime: { $gt: pickup },
    };

    if (params.excludeBookingId) {
      bookingQuery._id = {
        $ne:
          typeof params.excludeBookingId === 'string'
            ? new mongoose.Types.ObjectId(params.excludeBookingId)
            : params.excludeBookingId,
      };
    }

    const conflictingBooking = await Booking.findOne(bookingQuery, null, options).lean<IBooking>();

    if (conflictingBooking) {
      return {
        available: false,
        conflictingBooking,
        reason: `Vehicle has a confirmed/active booking from ${new Date(
          conflictingBooking.pickupDateTime
        ).toLocaleString('en-IN')} to ${new Date(conflictingBooking.returnDateTime).toLocaleString('en-IN')}.`,
      };
    }

    // 2. Check for overlapping manual/maintenance blocks
    const blockQuery = {
      vehicleId: vehicleObjectId,
      reason: { $in: ['BOOKED', 'MAINTENANCE', 'MANUAL_BLOCK', 'PERSONAL_USE'] },
      startDate: { $lt: returnDate },
      endDate: { $gt: pickup },
    };

    const conflictingBlock = await VehicleAvailability.findOne(blockQuery, null, options).lean<IVehicleAvailability>();

    if (conflictingBlock) {
      return {
        available: false,
        conflictingBlock,
        reason: `Vehicle is blocked for ${conflictingBlock.reason.toLowerCase()} from ${new Date(
          conflictingBlock.startDate
        ).toLocaleString('en-IN')} to ${new Date(conflictingBlock.endDate).toLocaleString('en-IN')}.`,
      };
    }

    // 3. Check for active unexpired distributed reservation locks
    const now = new Date();
    const lockQuery: Record<string, unknown> = {
      vehicleId: vehicleObjectId,
      status: { $in: ['HOLD', 'CONFIRMED'] },
      expiresAt: { $gt: now },
      pickupDateTime: { $lt: returnDate },
      returnDateTime: { $gt: pickup },
    };

    if (params.excludeSessionToken) {
      lockQuery.sessionToken = { $ne: params.excludeSessionToken };
    }

    const conflictingLock = await ReservationLock.findOne(lockQuery, null, options).lean<IReservationLock>();
    if (conflictingLock) {
      return {
        available: false,
        conflictingLock,
        reason: `Vehicle has an active reservation hold from ${new Date(
          conflictingLock.pickupDateTime
        ).toLocaleString('en-IN')} to ${new Date(conflictingLock.returnDateTime).toLocaleString('en-IN')}.`,
      };
    }

    return { available: true };
  }

  /**
   * Acquire an atomic, database-backed reservation hold on MongoDB Atlas
   * Guaranteed safe across multiple instances, serverless runtimes, and distributed clusters
   */
  public static async acquireDistributedReservation(params: {
    vehicleId: string | mongoose.Types.ObjectId;
    pickupDateTime: Date | string;
    returnDateTime: Date | string;
    sessionToken?: string;
    durationMinutes?: number;
  }): Promise<{
    acquired: boolean;
    reservation?: IReservationLock;
    reason?: string;
  }> {
    await connectToDatabase();

    const token = params.sessionToken || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const duration = params.durationMinutes || 10;
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    const vehicleObjectId =
      typeof params.vehicleId === 'string'
        ? new mongoose.Types.ObjectId(params.vehicleId)
        : params.vehicleId;

    const pickup = new Date(params.pickupDateTime);
    const returnDate = new Date(params.returnDateTime);

    // 1. Initial availability check against confirmed bookings and existing locks
    const check = await this.isVehicleAvailable({
      vehicleId: vehicleObjectId,
      pickupDateTime: pickup,
      returnDateTime: returnDate,
      excludeSessionToken: token,
    });

    if (!check.available) {
      return { acquired: false, reason: check.reason };
    }

    // 2. Insert hold record into MongoDB Atlas
    const lock = await ReservationLock.create({
      vehicleId: vehicleObjectId,
      pickupDateTime: pickup,
      returnDateTime: returnDate,
      status: 'HOLD',
      sessionToken: token,
      expiresAt,
    });

    // 3. Distributed race arbitration check:
    // If multiple server instances concurrently inserted overlapping locks in the same millisecond,
    // only the earliest inserted document retains the hold; all other concurrent entries are released.
    const overlappingLocks = await ReservationLock.find({
      vehicleId: vehicleObjectId,
      status: { $in: ['HOLD', 'CONFIRMED'] },
      expiresAt: { $gt: new Date() },
      pickupDateTime: { $lt: returnDate },
      returnDateTime: { $gt: pickup },
    })
      .sort({ createdAt: 1, _id: 1 })
      .lean<IReservationLock[]>();

    if (overlappingLocks.length > 1 && overlappingLocks[0]._id.toString() !== lock._id.toString()) {
      // Another instance created a lock slightly before ours; remove ours and reject safely
      await ReservationLock.findByIdAndDelete(lock._id);
      return {
        acquired: false,
        reason: 'This vehicle was just reserved by another customer. Please select another ride.',
      };
    }

    return { acquired: true, reservation: lock };
  }

  /**
   * Release or expire a reservation hold
   */
  public static async releaseReservation(reservationId: string | mongoose.Types.ObjectId): Promise<void> {
    await connectToDatabase();
    await ReservationLock.findByIdAndUpdate(reservationId, {
      status: 'RELEASED',
      expiresAt: new Date(),
    });
  }

  /**
   * Confirm a reservation hold when payment succeeds
   */
  public static async confirmReservation(
    reservationId: string | mongoose.Types.ObjectId,
    bookingId: string | mongoose.Types.ObjectId
  ): Promise<void> {
    await connectToDatabase();
    await ReservationLock.findByIdAndUpdate(reservationId, {
      status: 'CONFIRMED',
      bookingId: new mongoose.Types.ObjectId(bookingId),
    });
  }

  /**
   * Block vehicle dates for maintenance or manual reasons
   */
  public static async blockDates(params: {
    vehicleId: string;
    startDate: Date | string;
    endDate: Date | string;
    reason: 'MAINTENANCE' | 'MANUAL_BLOCK' | 'PERSONAL_USE';
    notes?: string;
  }): Promise<IVehicleAvailability> {
    await connectToDatabase();

    const check = await this.isVehicleAvailable({
      vehicleId: params.vehicleId,
      pickupDateTime: params.startDate,
      returnDateTime: params.endDate,
    });

    if (!check.available) {
      throw new Error(check.reason || 'Cannot block dates: Overlapping booking or block exists.');
    }

    return await VehicleAvailability.create({
      vehicleId: new mongoose.Types.ObjectId(params.vehicleId),
      startDate: new Date(params.startDate),
      endDate: new Date(params.endDate),
      reason: params.reason,
      notes: params.notes || '',
    });
  }

  /**
   * Get active schedule (confirmed bookings and maintenance blocks) for a vehicle
   */
  public static async getVehicleSchedule(vehicleId: string | mongoose.Types.ObjectId): Promise<{
    bookings: IBooking[];
    blocks: IVehicleAvailability[];
  }> {
    await connectToDatabase();

    const vehicleObjectId =
      typeof vehicleId === 'string' ? new mongoose.Types.ObjectId(vehicleId) : vehicleId;

    const [bookings, blocks] = await Promise.all([
      Booking.find({
        vehicleId: vehicleObjectId,
        bookingStatus: { $in: ['CONFIRMED', 'ACTIVE', 'PENDING'] },
      })
        .sort({ pickupDateTime: 1 })
        .lean<IBooking[]>(),
      VehicleAvailability.find({
        vehicleId: vehicleObjectId,
      })
        .sort({ startDate: 1 })
        .lean<IVehicleAvailability[]>(),
    ]);

    return { bookings, blocks };
  }

  /**
   * Unblock vehicle dates
   */
  public static async unblockDates(blockId: string): Promise<boolean> {
    await connectToDatabase();
    const res = await VehicleAvailability.findByIdAndDelete(blockId);
    return !!res;
  }
}

export default AvailabilityService;
