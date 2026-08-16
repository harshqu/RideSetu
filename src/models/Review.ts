import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  customerAvatar?: string;
  vehicleId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  overallRating: number; // 1 to 5
  vehicleConditionRating: number;
  vendorBehaviorRating: number;
  pickupExperienceRating: number;
  pricingTransparencyRating: number;
  reviewText: string;
  vendorReply?: {
    text: string;
    repliedAt: Date;
  };
  isVerifiedRental: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerName: { type: String, required: true },
    customerAvatar: { type: String, default: '' },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    overallRating: { type: Number, required: true, min: 1, max: 5 },
    vehicleConditionRating: { type: Number, required: true, min: 1, max: 5 },
    vendorBehaviorRating: { type: Number, required: true, min: 1, max: 5 },
    pickupExperienceRating: { type: Number, required: true, min: 1, max: 5 },
    pricingTransparencyRating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true },
    vendorReply: {
      text: { type: String },
      repliedAt: { type: Date },
    },
    isVerifiedRental: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ vehicleId: 1, overallRating: -1 });
ReviewSchema.index({ vendorId: 1, overallRating: -1 });

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
