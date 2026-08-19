import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType =
  | 'ACCOUNT_VERIFIED'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'VENDOR_APPROVED'
  | 'VEHICLE_APPROVED'
  | 'BOOKING_CREATED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'REFUND_INITIATED'
  | 'REFUND_COMPLETED'
  | 'RIDE_STARTING_SOON'
  | 'RIDE_ACTIVE'
  | 'RIDE_COMPLETED'
  | 'REVIEW_REQUEST'
  | 'NEW_REVIEW'
  | 'VENDOR_RESPONSE'
  | 'PAYOUT_ELIGIBLE'
  | 'PAYOUT_COMPLETED'
  | 'DISPUTE_UPDATE'
  | 'PICKUP_REMINDER'
  | 'RETURN_REMINDER'
  | 'EMERGENCY_ALERT';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  relatedBookingId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'ACCOUNT_VERIFIED',
        'KYC_APPROVED',
        'KYC_REJECTED',
        'VENDOR_APPROVED',
        'VEHICLE_APPROVED',
        'BOOKING_CREATED',
        'PAYMENT_SUCCESS',
        'PAYMENT_FAILED',
        'BOOKING_CONFIRMED',
        'BOOKING_CANCELLED',
        'REFUND_INITIATED',
        'REFUND_COMPLETED',
        'RIDE_STARTING_SOON',
        'RIDE_ACTIVE',
        'RIDE_COMPLETED',
        'REVIEW_REQUEST',
        'NEW_REVIEW',
        'VENDOR_RESPONSE',
        'PAYOUT_ELIGIBLE',
        'PAYOUT_COMPLETED',
        'DISPUTE_UPDATE',
        'PICKUP_REMINDER',
        'RETURN_REMINDER',
        'EMERGENCY_ALERT',
      ],
      required: true,
      index: true,
    },
    read: { type: Boolean, default: false, index: true },
    link: { type: String, default: '' },
    relatedBookingId: { type: Schema.Types.ObjectId, ref: 'Booking', index: true },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
