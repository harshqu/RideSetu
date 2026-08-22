import mongoose from 'mongoose';
import { Notification, NotificationType, INotification, RecipientRole, NotificationPriority } from '@/models/Notification';
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

export interface CreateNotificationParams {
  userId: string | mongoose.Types.ObjectId;
  recipientRole?: RecipientRole;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  link?: string;
  relatedBookingId?: string | mongoose.Types.ObjectId;
  idempotencyKey?: string;
  customerEmail?: string;
  customerPhone?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  public static getChannelStatus(): {
    provider: string;
    inApp: 'ACTIVE';
    email: 'DEVELOPMENT_MOCK' | 'ACTIVE';
    sms: 'DEVELOPMENT_MOCK' | 'ACTIVE';
  } {
    return {
      provider: process.env.NOTIFICATION_PROVIDER || 'MOCK',
      inApp: 'ACTIVE',
      email: process.env.SENDGRID_API_KEY || process.env.SMTP_HOST ? 'ACTIVE' : 'DEVELOPMENT_MOCK',
      sms: process.env.TWILIO_AUTH_TOKEN ? 'ACTIVE' : 'DEVELOPMENT_MOCK',
    };
  }

  /**
   * Core dispatch method with Idempotency Guard & Failure Isolation
   */
  public static async createNotification(params: CreateNotificationParams): Promise<INotification | null> {
    try {
      await connectToDatabase();

      // Database & Service Level Idempotency Check
      if (params.idempotencyKey) {
        const existing = await Notification.findOne({ idempotencyKey: params.idempotencyKey });
        if (existing) {
          return existing;
        }
      }

      let notif: INotification | null = null;
      try {
        notif = await Notification.create({
          userId: new mongoose.Types.ObjectId(params.userId),
          recipientRole: params.recipientRole || 'CUSTOMER',
          title: params.title,
          message: params.message,
          type: params.type,
          priority: params.priority || 'NORMAL',
          link: params.link || '',
          relatedBookingId: params.relatedBookingId ? new mongoose.Types.ObjectId(params.relatedBookingId) : undefined,
          idempotencyKey: params.idempotencyKey,
          metadata: params.metadata || {},
          read: false,
        });
      } catch (dbErr: any) {
        if (dbErr.code === 11000 && params.idempotencyKey) {
          // Race condition duplicate key caught gracefully
          return await Notification.findOne({ idempotencyKey: params.idempotencyKey });
        }
        console.error('[NotificationService] In-App creation warning:', dbErr.message);
      }

      // Safe Failure Isolation for External Channels (Email / SMS)
      if (params.customerEmail) {
        try {
          await this.dispatchEmail({
            to: params.customerEmail,
            subject: params.title,
            body: params.message,
          });
        } catch (emailErr: any) {
          console.warn('[NotificationService] External email dispatch skipped safely:', emailErr.message);
        }
      }

      if (params.customerPhone) {
        try {
          await this.dispatchSms({
            to: params.customerPhone,
            message: `${params.title}: ${params.message}`,
          });
        } catch (smsErr: any) {
          console.warn('[NotificationService] External SMS dispatch skipped safely:', smsErr.message);
        }
      }

      return notif;
    } catch (err: any) {
      console.error('[NotificationService] System level error:', err.message);
      return null; // Return null so calling business process is never interrupted
    }
  }

  /**
   * Bulk Notification Creation
   */
  public static async createBulkNotifications(notifications: CreateNotificationParams[]): Promise<number> {
    let count = 0;
    for (const params of notifications) {
      const res = await this.createNotification(params);
      if (res) count++;
    }
    return count;
  }

  // --- Helper Methods for Event Triggers with Idempotency Keys ---

  public static async notifyBookingConfirmed(params: {
    userId: string;
    bookingId: string;
    bookingNumber: string;
    vehicleName: string;
    customerEmail?: string;
  }) {
    return this.createNotification({
      userId: params.userId,
      recipientRole: 'CUSTOMER',
      title: 'Booking Confirmed ✓',
      message: `Your booking #${params.bookingNumber} for ${params.vehicleName} is confirmed.`,
      type: 'BOOKING_CONFIRMED',
      priority: 'HIGH',
      link: `/dashboard/trips/${params.bookingId}`,
      relatedBookingId: params.bookingId,
      idempotencyKey: `BOOKING_CONFIRMED:${params.bookingId}`,
      customerEmail: params.customerEmail,
    });
  }

  public static async sendBookingConfirmation(params: any) {
    return this.notifyBookingConfirmed({
      userId: params.userId,
      bookingId: params.bookingId,
      bookingNumber: params.bookingNumber,
      vehicleName: params.vehicleName,
      customerEmail: params.customerEmail,
    });
  }

  public static async notifyBookingCancelled(params: {
    userId: string;
    bookingId: string;
    bookingNumber: string;
    reason?: string;
    customerEmail?: string;
  }) {
    return this.createNotification({
      userId: params.userId,
      recipientRole: 'CUSTOMER',
      title: 'Booking Cancelled',
      message: `Booking #${params.bookingNumber} was cancelled. ${params.reason || ''}`,
      type: 'BOOKING_CANCELLED',
      priority: 'HIGH',
      link: `/dashboard/trips/${params.bookingId}`,
      relatedBookingId: params.bookingId,
      idempotencyKey: `BOOKING_CANCELLED:${params.bookingId}`,
      customerEmail: params.customerEmail,
    });
  }

  public static async sendBookingCancelled(params: any) {
    return this.notifyBookingCancelled({
      userId: params.userId,
      bookingId: params.bookingId,
      bookingNumber: params.bookingNumber,
      reason: params.reason,
      customerEmail: params.customerEmail,
    });
  }

  public static async notifyPaymentSuccess(params: {
    userId: string;
    bookingId: string;
    amount: number;
    customerEmail?: string;
  }) {
    return this.createNotification({
      userId: params.userId,
      recipientRole: 'CUSTOMER',
      title: 'Payment Successful',
      message: `Payment of ₹${params.amount} received successfully.`,
      type: 'PAYMENT_SUCCESS',
      priority: 'NORMAL',
      link: `/dashboard/trips/${params.bookingId}`,
      relatedBookingId: params.bookingId,
      idempotencyKey: `PAYMENT_SUCCESS:${params.bookingId}`,
      customerEmail: params.customerEmail,
    });
  }

  public static async notifyVendorApplicationSubmitted(params: {
    vendorUserId: string;
    vendorId: string;
    businessName: string;
  }) {
    return this.createNotification({
      userId: params.vendorUserId,
      recipientRole: 'VENDOR',
      title: 'Application Submitted',
      message: `Your partner application for ${params.businessName} has been submitted for review.`,
      type: 'VENDOR_SUBMITTED',
      priority: 'NORMAL',
      link: '/partner/dashboard',
      idempotencyKey: `VENDOR_SUBMITTED:${params.vendorId}`,
    });
  }

  public static async notifyVendorApproved(params: {
    vendorUserId: string;
    vendorId: string;
    businessName: string;
    email?: string;
  }) {
    return this.createNotification({
      userId: params.vendorUserId,
      recipientRole: 'VENDOR',
      title: 'Partner Application Approved ✓',
      message: `Congratulations! Your vendor profile for ${params.businessName} is VERIFIED. You can now publish vehicles.`,
      type: 'VENDOR_APPROVED',
      priority: 'HIGH',
      link: '/partner/dashboard',
      idempotencyKey: `VENDOR_APPROVED:${params.vendorId}`,
      customerEmail: params.email,
    });
  }

  public static async notifyVendorActionRequired(params: {
    vendorUserId: string;
    vendorId: string;
    reason: string;
    email?: string;
  }) {
    return this.createNotification({
      userId: params.vendorUserId,
      recipientRole: 'VENDOR',
      title: 'Action Required on Application',
      message: `RideSetu Operations requested changes: ${params.reason}`,
      type: 'VENDOR_ACTION_REQUIRED',
      priority: 'HIGH',
      link: '/partner/onboarding',
      idempotencyKey: `VENDOR_ACTION_REQUIRED:${params.vendorId}:${Date.now()}`,
      customerEmail: params.email,
    });
  }

  public static async notifySafetyIncident(params: {
    adminUserId: string;
    incidentId: string;
    details: string;
  }) {
    return this.createNotification({
      userId: params.adminUserId,
      recipientRole: 'ADMIN',
      title: '🚨 Emergency SOS Safety Alert',
      message: `SOS Incident reported: ${params.details}`,
      type: 'EMERGENCY_ALERT',
      priority: 'URGENT',
      link: '/ops/safety',
      idempotencyKey: `SOS:${params.incidentId}`,
    });
  }

  public static async sendVendorResponseAlert(params: {
    customerUserId: string;
    bookingNumber: string;
    vendorName: string;
    bookingId: string;
  }) {
    return this.createNotification({
      userId: params.customerUserId,
      recipientRole: 'CUSTOMER',
      title: 'Vendor Replied to Your Review',
      message: `${params.vendorName} replied to your review for booking #${params.bookingNumber}.`,
      type: 'VENDOR_RESPONSE',
      priority: 'NORMAL',
      link: `/dashboard/trips/${params.bookingId}`,
      relatedBookingId: params.bookingId,
      idempotencyKey: `VENDOR_REPLY:${params.bookingId}`,
    });
  }

  public static async sendReviewRequest(params: {
    userId: string;
    bookingNumber: string;
    vehicleName: string;
    bookingId: string;
  }) {
    return this.createNotification({
      userId: params.userId,
      recipientRole: 'CUSTOMER',
      title: 'How was your ride?',
      message: `Share your review for ${params.vehicleName} (Booking #${params.bookingNumber}).`,
      type: 'REVIEW_REQUEST',
      priority: 'NORMAL',
      link: `/dashboard/trips/${params.bookingId}`,
      relatedBookingId: params.bookingId,
      idempotencyKey: `REVIEW_REQ:${params.bookingId}`,
    });
  }

  public static async sendNewReviewAlertToVendor(params: {
    vendorUserId: string;
    vehicleName: string;
    rating: number;
    customerName: string;
    bookingId: string;
  }) {
    return this.createNotification({
      userId: params.vendorUserId,
      recipientRole: 'VENDOR',
      title: 'New Customer Review Received',
      message: `${params.customerName} left a ${params.rating}★ review for ${params.vehicleName}.`,
      type: 'NEW_REVIEW',
      priority: 'NORMAL',
      link: `/partner/reviews`,
      relatedBookingId: params.bookingId,
      idempotencyKey: `NEW_REVIEW:${params.bookingId}`,
    });
  }

  // --- Dispatch Utilities ---

  private static async dispatchEmail(payload: EmailPayload) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Notification Email] To: ${payload.to} | Subject: ${payload.subject}`);
    }
  }

  private static async dispatchSms(payload: SmsPayload) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Notification SMS] To: ${payload.to} | Message: ${payload.message}`);
    }
  }
}
