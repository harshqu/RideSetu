import mongoose, { Schema, Document, Model } from 'mongoose';

export type VendorVerificationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED';

export interface IVendor extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  destinationId: mongoose.Types.ObjectId;
  businessType: 'INDIVIDUAL' | 'PROPRIETORSHIP' | 'PARTNERSHIP' | 'PVT_LTD';
  gstNumber?: string;
  rentalLicenseNumber: string;
  verificationStatus: VendorVerificationStatus;
  rating: number;
  totalReviews: number;
  commissionRate: number; // e.g., 15 for 15%
  deliveryRadiusKm: number;
  baseDeliveryFee: number;
  bankAccountReference?: string; // Stored securely / tokenized
  documents: {
    tradeLicenseUrl?: string;
    gstCertificateUrl?: string;
    identityProofUrl?: string;
    rentalPermitUrl?: string;
  };
  isActive: boolean;
  isTopRated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema = new Schema<IVendor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    businessName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    destinationId: { type: Schema.Types.ObjectId, ref: 'Destination', required: true, index: true },
    businessType: {
      type: String,
      enum: ['INDIVIDUAL', 'PROPRIETORSHIP', 'PARTNERSHIP', 'PVT_LTD'],
      default: 'PROPRIETORSHIP',
    },
    gstNumber: { type: String, default: '' },
    rentalLicenseNumber: { type: String, required: true, trim: true },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
      index: true,
    },
    rating: { type: Number, default: 4.8, min: 1, max: 5 },
    totalReviews: { type: Number, default: 0 },
    commissionRate: { type: Number, default: 15, min: 0, max: 50 },
    deliveryRadiusKm: { type: Number, default: 15 },
    baseDeliveryFee: { type: Number, default: 100 },
    bankAccountReference: { type: String, default: '' },
    documents: {
      tradeLicenseUrl: { type: String, default: '' },
      gstCertificateUrl: { type: String, default: '' },
      identityProofUrl: { type: String, default: '' },
      rentalPermitUrl: { type: String, default: '' },
    },
    isActive: { type: Boolean, default: true },
    isTopRated: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

VendorSchema.index({ destinationId: 1, verificationStatus: 1, rating: -1 });

export const Vendor: Model<IVendor> =
  mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema);

export default Vendor;
