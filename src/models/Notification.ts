import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType =
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'PICKUP_REMINDER'
  | 'RETURN_REMINDER'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'VENDOR_APPROVED'
  | 'VEHICLE_APPROVED'
  | 'PAYOUT_PROCESSED'
  | 'REVIEW_REMINDER'
  | 'DISPUTE_UPDATE'
  | 'EMERGENCY_ALERT';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
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
        'BOOKING_CONFIRMED',
        'BOOKING_CANCELLED',
        'PAYMENT_SUCCESS',
        'PAYMENT_FAILED',
        'PICKUP_REMINDER',
        'RETURN_REMINDER',
        'KYC_APPROVED',
        'KYC_REJECTED',
        'VENDOR_APPROVED',
        'VEHICLE_APPROVED',
        'PAYOUT_PROCESSED',
        'REVIEW_REMINDER',
        'DISPUTE_UPDATE',
        'EMERGENCY_ALERT',
      ],
      required: true,
    },
    read: { type: Boolean, default: false, index: true },
    link: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
