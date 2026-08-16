import mongoose, { Schema, Document, Model } from 'mongoose';

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

export interface IDispute extends Document {
  _id: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  status: DisputeStatus;
  claimedAmount: number;
  deductedAmount: number;
  evidence: {
    beforePhotos: string[];
    afterPhotos: string[];
    handoverReports: mongoose.Types.ObjectId[];
  };
  vendorRemarks: string;
  customerRebuttal?: string;
  adminNotes?: string;
  resolution?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'],
      default: 'OPEN',
      index: true,
    },
    claimedAmount: { type: Number, required: true },
    deductedAmount: { type: Number, default: 0 },
    evidence: {
      beforePhotos: [{ type: String }],
      afterPhotos: [{ type: String }],
      handoverReports: [{ type: Schema.Types.ObjectId, ref: 'DigitalHandoverReport' }],
    },
    vendorRemarks: { type: String, required: true },
    customerRebuttal: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
    resolution: { type: String, default: '' },
    resolvedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Dispute: Model<IDispute> =
  mongoose.models.Dispute || mongoose.model<IDispute>('Dispute', DisputeSchema);

export default Dispute;
