import mongoose from 'mongoose';
import { Payout, IPayout } from '@/models/Payout';
import { IBooking } from '@/models/Booking';
import { Vendor, IVendor } from '@/models/Vendor';
import { Notification } from '@/models/Notification';
import connectToDatabase from '@/lib/mongodb';

export class PayoutService {
  /**
   * Pure calculation helper for vendor payout breakdown
   */
  public static calculateVendorPayout(
    booking: { basePrice: number; deliveryCharge: number },
    commissionRate = 15
  ): {
    eligibleGrossAmount: number;
    platformCommissionAmount: number;
    netPayoutAmount: number;
  } {
    const eligibleGrossAmount = (booking.basePrice || 0) + (booking.deliveryCharge || 0);
    const platformCommissionAmount = Math.round((eligibleGrossAmount * commissionRate) / 100);
    const netPayoutAmount = Math.max(0, eligibleGrossAmount - platformCommissionAmount);

    return {
      eligibleGrossAmount,
      platformCommissionAmount,
      netPayoutAmount,
    };
  }

  /**
   * Generates vendor payout record strictly when booking completes.
   * Excludes refundable security deposit from commission and revenue.
   */
  public static async createPayoutForCompletedBooking(booking: IBooking): Promise<IPayout | null> {
    await connectToDatabase();

    // Check if payout already exists (idempotency check)
    const existingPayout = await Payout.findOne({ bookingId: booking._id });
    if (existingPayout) {
      return existingPayout;
    }

    const vendor = await Vendor.findById(booking.vendorId).lean<IVendor>();
    if (!vendor) return null;

    const commissionRate = vendor.commissionRate ?? 15;
    // Gross eligible amount (Base Rental + Delivery fee)
    const grossAmount = booking.basePrice + booking.deliveryCharge;
    const platformCommission = Math.round((grossAmount * commissionRate) / 100);
    const taxes = Math.round(platformCommission * 0.18); // GST on platform service fee
    const netAmount = Math.max(0, grossAmount - platformCommission);

    const payout = await Payout.create({
      vendorId: booking.vendorId,
      bookingId: booking._id,
      grossAmount,
      platformCommission,
      commissionPercentage: commissionRate,
      taxes,
      netAmount,
      status: 'PENDING',
      bankAccountRef: vendor.bankAccountReference || 'Default Registered Bank Account',
      notes: `Payout generated for completed booking ${booking.bookingNumber}`,
    });

    // Notify vendor user
    await Notification.create({
      userId: vendor.userId,
      title: 'New Payout Pending',
      message: `Net payout of ₹${netAmount} is pending for completed booking ${booking.bookingNumber}.`,
      type: 'PAYOUT_PROCESSED',
      link: '/vendor/payouts',
    });

    return payout;
  }
}
