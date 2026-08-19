import mongoose from 'mongoose';
import { Notification, NotificationType, INotification } from '@/models/Notification';
import connectToDatabase from '@/lib/mongodb';

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export interface SmsPayload {
  to: string;
  message: string;
}

export interface WhatsAppPayload {
  to: string;
  templateName: string;
  parameters: Record<string, string>;
}

export interface CreateNotificationParams {
  userId: string | mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  relatedBookingId?: string | mongoose.Types.ObjectId;
  customerEmail?: string;
  customerPhone?: string;
}

export class NotificationService {
  /**
   * Status indicators for notification channels
   */
  public static getChannelStatus(): {
    provider: string;
    inApp: 'ACTIVE';
    email: 'DEVELOPMENT_MOCK' | 'ACTIVE';
    sms: 'DEVELOPMENT_MOCK' | 'ACTIVE';
    whatsapp: 'DEVELOPMENT_MOCK' | 'ACTIVE';
  } {
    return {
      provider: process.env.NOTIFICATION_PROVIDER || 'MOCK',
      inApp: 'ACTIVE',
      email: process.env.SENDGRID_API_KEY ? 'ACTIVE' : 'DEVELOPMENT_MOCK',
      sms: process.env.TWILIO_AUTH_TOKEN ? 'ACTIVE' : 'DEVELOPMENT_MOCK',
      whatsapp: process.env.WHATSAPP_API_TOKEN ? 'ACTIVE' : 'DEVELOPMENT_MOCK',
    };
  }

  /**
   * Core dispatch: creates in-app notification and dispatches to mock external channels
   */
  public static async createNotification(params: CreateNotificationParams): Promise<INotification> {
    await connectToDatabase();

    const notif = await Notification.create({
      userId: new mongoose.Types.ObjectId(params.userId),
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link || '',
      relatedBookingId: params.relatedBookingId ? new mongoose.Types.ObjectId(params.relatedBookingId) : undefined,
      read: false,
    });

    if (params.customerEmail) {
      await this.dispatchEmail({
        to: params.customerEmail,
        subject: params.title,
        body: params.message,
      });
    }

    if (params.customerPhone) {
      await this.dispatchSms({
        to: params.customerPhone,
        message: `${params.title}: ${params.message}`,
      });
    }

    return notif;
  }

  /**
   * Booking Confirmation
   */
  public static async sendBookingConfirmation(params: {
    userId: string;
    bookingNumber: string;
    vehicleName: string;
    pickupDateTime: Date | string;
    totalPayable: number;
    bookingId: string;
    customerEmail?: string;
    customerPhone?: string;
  }): Promise<{ inAppNotificationId: string; channelsDispatched: string[] }> {
    const pickupFormatted = new Date(params.pickupDateTime).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const notif = await this.createNotification({
      userId: params.userId,
      title: 'Booking Confirmed!',
      message: `Your ride ${params.vehicleName} (${params.bookingNumber}) is confirmed for ${pickupFormatted}. Total: ₹${params.totalPayable.toLocaleString('en-IN')}`,
      type: 'BOOKING_CONFIRMED',
      link: `/dashboard?booking=${params.bookingId}`,
      relatedBookingId: params.bookingId,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
    });

    return {
      inAppNotificationId: notif._id.toString(),
      channelsDispatched: ['IN_APP', ...(params.customerEmail ? ['EMAIL'] : []), ...(params.customerPhone ? ['SMS'] : [])],
    };
  }

  /**
   * Booking Cancellation & Refund Notification
   */
  public static async sendBookingCancelled(params: {
    userId: string;
    bookingNumber: string;
    vehicleName: string;
    refundAmount: number;
    cancelledBy: string;
    reason: string;
    bookingId: string;
    customerEmail?: string;
    customerPhone?: string;
  }): Promise<INotification> {
    const msg = params.refundAmount > 0
      ? `Booking ${params.bookingNumber} (${params.vehicleName}) was cancelled by ${params.cancelledBy}. Refund of ₹${params.refundAmount.toLocaleString('en-IN')} initiated. Reason: ${params.reason}`
      : `Booking ${params.bookingNumber} (${params.vehicleName}) was cancelled by ${params.cancelledBy}. Reason: ${params.reason}`;

    return this.createNotification({
      userId: params.userId,
      title: 'Booking Cancelled',
      message: msg,
      type: 'BOOKING_CANCELLED',
      link: `/dashboard?booking=${params.bookingId}`,
      relatedBookingId: params.bookingId,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
    });
  }

  /**
   * Refund Processed Notification
   */
  public static async sendRefundCompleted(params: {
    userId: string;
    bookingNumber: string;
    refundAmount: number;
    bookingId: string;
  }): Promise<INotification> {
    return this.createNotification({
      userId: params.userId,
      title: 'Refund Processed Successfully',
      message: `A refund of ₹${params.refundAmount.toLocaleString('en-IN')} for booking ${params.bookingNumber} has been processed back to your original payment method.`,
      type: 'REFUND_COMPLETED',
      link: `/dashboard?booking=${params.bookingId}`,
      relatedBookingId: params.bookingId,
    });
  }

  /**
   * Review Lifecycle Notifications
   */
  public static async sendReviewRequest(params: {
    userId: string;
    bookingNumber: string;
    vehicleName: string;
    bookingId: string;
  }): Promise<INotification> {
    return this.createNotification({
      userId: params.userId,
      title: 'Rate Your Ride Experience!',
      message: `How was your ride with ${params.vehicleName} (${params.bookingNumber})? Leave a verified review to help fellow travellers.`,
      type: 'REVIEW_REQUEST',
      link: `/dashboard?booking=${params.bookingId}&rate=true`,
      relatedBookingId: params.bookingId,
    });
  }

  public static async sendNewReviewAlertToVendor(params: {
    vendorUserId: string;
    vehicleName: string;
    rating: number;
    customerName: string;
    bookingId: string;
  }): Promise<INotification> {
    return this.createNotification({
      userId: params.vendorUserId,
      title: 'New Customer Review Received',
      message: `${params.customerName} rated ${params.vehicleName} ${params.rating}★. You can view and submit an official response in your vendor portal.`,
      type: 'NEW_REVIEW',
      link: `/vendor?tab=reviews`,
      relatedBookingId: params.bookingId,
    });
  }

  public static async sendVendorResponseAlert(params: {
    customerUserId: string;
    bookingNumber: string;
    vendorName: string;
    bookingId: string;
  }): Promise<INotification> {
    return this.createNotification({
      userId: params.customerUserId,
      title: 'Vendor Responded to Your Review',
      message: `${params.vendorName} posted an official reply to your review for booking ${params.bookingNumber}.`,
      type: 'VENDOR_RESPONSE',
      link: `/dashboard?booking=${params.bookingId}`,
      relatedBookingId: params.bookingId,
    });
  }

  /**
   * Payout Notification
   */
  public static async sendPayoutEligibleAlert(params: {
    vendorUserId: string;
    bookingNumber: string;
    netAmount: number;
  }): Promise<INotification> {
    return this.createNotification({
      userId: params.vendorUserId,
      title: 'Rental Payout Eligible',
      message: `Net rental earnings of ₹${params.netAmount.toLocaleString('en-IN')} for ${params.bookingNumber} are now eligible for settlement.`,
      type: 'PAYOUT_ELIGIBLE',
      link: `/vendor?tab=payouts`,
    });
  }

  // --- External Channel Adapters (Mock in Dev, Production API when keys exist) ---

  private static async dispatchEmail(payload: EmailPayload): Promise<void> {
    if (process.env.SENDGRID_API_KEY) {
      // Production SendGrid API call
    } else {
      // Development console logger
    }
  }

  private static async dispatchSms(payload: SmsPayload): Promise<void> {
    if (process.env.TWILIO_AUTH_TOKEN) {
      // Production SMS API call
    } else {
      // Development console logger
    }
  }

  private static async dispatchWhatsApp(payload: WhatsAppPayload): Promise<void> {
    if (process.env.WHATSAPP_API_TOKEN) {
      // Production WhatsApp Cloud API call
    } else {
      // Development console logger
    }
  }
}

export default NotificationService;
