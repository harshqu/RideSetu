import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentProvider = 'RAZORPAY' | 'MOCK';
export type PaymentRecordStatus =
  | 'INITIATED'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  providerOrderId: string;
  providerPaymentId?: string;
  providerSignature?: string;
  status: PaymentRecordStatus;
  method?: 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    provider: { type: String, enum: ['RAZORPAY', 'MOCK'], default: 'MOCK' },
    providerOrderId: { type: String, required: true, index: true },
    providerPaymentId: { type: String, index: true },
    providerSignature: { type: String },
    status: {
      type: String,
      enum: ['INITIATED', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
      default: 'INITIATED',
      index: true,
    },
    method: { type: String, enum: ['UPI', 'CARD', 'NETBANKING', 'WALLET'], default: 'UPI' },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
