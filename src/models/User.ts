import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN';
export type KYCStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  kycStatus: KYCStatus;
  drivingLicenseStatus: KYCStatus;
  drivingLicenseNumber?: string;
  drivingLicenseExpiry?: Date;
  idDocumentType?: 'AADHAAR' | 'PASSPORT' | 'VOTER_ID';
  idDocumentNumber?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['CUSTOMER', 'VENDOR', 'ADMIN'],
      default: 'CUSTOMER',
      index: true,
    },
    avatar: { type: String, default: '' },
    kycStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
    },
    drivingLicenseStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
    },
    drivingLicenseNumber: { type: String, default: '' },
    drivingLicenseExpiry: { type: Date },
    idDocumentType: { type: String, enum: ['AADHAAR', 'PASSPORT', 'VOTER_ID'] },
    idDocumentNumber: { type: String, default: '' },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relation: { type: String, default: '' },
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
