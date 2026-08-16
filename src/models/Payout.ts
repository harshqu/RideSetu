import mongoose, { Schema, Document, Model } from 'mongoose';

export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';

export interface IPayout extends Document {
  _id: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  grossAmount: number;
  platformCommission: number;
  commissionPercentage: number;
  taxes: number;
  netAmount: number;
  status: PayoutStatus;
  providerReference?: string;
  bankAccountRef?: string;
  notes?: string;
  createdAt: Date;
  paidAt?: Date;
}

const PayoutSchema = new Schema<IPayout>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    grossAmount: { type: Number, required: true },
    platformCommission: { type: Number, required: true },
    commissionPercentage: { type: Number, required: true, default: 15 },
    taxes: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'PAID', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    providerReference: { type: String, default: '' },
    bankAccountRef: { type: String, default: '' },
    notes: { type: String, default: '' },
    paidAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Payout: Model<IPayout> =
  mongoose.models.Payout || mongoose.model<IPayout>('Payout', PayoutSchema);

export default Payout;
