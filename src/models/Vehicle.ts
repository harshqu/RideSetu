import mongoose, { Schema, Document, Model } from 'mongoose';

export type VehicleCategory = 'SCOOTER' | 'MOTORCYCLE' | 'CAR' | 'EV';
export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'CNG';
export type TransmissionType = 'AUTOMATIC' | 'MANUAL';

export interface IVehicle {
  _id: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  destinationId: mongoose.Types.ObjectId;
  brand: string;
  model: string;
  variant: string;
  category: VehicleCategory;
  year: number;
  color: string;
  registrationNumber: string;
  odometer: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  pricePerDay: number;
  pricePerHour: number;
  weekendPrice?: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  seasonalPricing?: {
    peakSeasonPricePerDay?: number;
    offSeasonPricePerDay?: number;
  };
  securityDeposit: number;
  kmLimitPerDay: number; // e.g. 150 or 0 for unlimited
  excessKmCharge: number; // ₹/km
  isAvailable: boolean;
  isVerified: boolean;
  deliveryAvailable: boolean;
  oneWayAvailable: boolean;
  helmetIncluded: boolean;
  roadsideAssistance: boolean;
  images: string[];
  specifications: {
    engineCc?: number;
    batteryCapacityKwh?: number;
    rangeKm?: number;
    topSpeedKmph?: number;
    seatingCapacity: number;
    fuelTankCapacityL?: number;
    luggageSpace?: string;
  };
  insuranceExpiry?: Date;
  fitnessCertExpiry?: Date;
  permitExpiry?: Date;
  rating: number;
  totalBookings: number;
  totalReviews: number;
  badges: string[];
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    destinationId: { type: Schema.Types.ObjectId, ref: 'Destination', required: true, index: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    variant: { type: String, default: '' },
    category: {
      type: String,
      enum: ['SCOOTER', 'MOTORCYCLE', 'CAR', 'EV'],
      required: true,
      index: true,
    },
    year: { type: Number, required: true },
    color: { type: String, default: 'Black' },
    registrationNumber: { type: String, required: true, trim: true },
    odometer: { type: Number, default: 5000 },
    fuelType: {
      type: String,
      enum: ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG'],
      default: 'PETROL',
    },
    transmission: {
      type: String,
      enum: ['AUTOMATIC', 'MANUAL'],
      default: 'MANUAL',
    },
    pricePerDay: { type: Number, required: true, min: 0, index: true },
    pricePerHour: { type: Number, default: 50 },
    weekendPrice: { type: Number },
    weeklyPrice: { type: Number },
    monthlyPrice: { type: Number },
    seasonalPricing: {
      peakSeasonPricePerDay: { type: Number },
      offSeasonPricePerDay: { type: Number },
    },
    securityDeposit: { type: Number, required: true, default: 1000 },
    kmLimitPerDay: { type: Number, default: 150 }, // 0 = unlimited
    excessKmCharge: { type: Number, default: 4 }, // ₹ per km
    isAvailable: { type: Boolean, default: true, index: true },
    isVerified: { type: Boolean, default: true, index: true },
    deliveryAvailable: { type: Boolean, default: true },
    oneWayAvailable: { type: Boolean, default: false },
    helmetIncluded: { type: Boolean, default: true },
    roadsideAssistance: { type: Boolean, default: true },
    images: [{ type: String }],
    specifications: {
      engineCc: { type: Number },
      batteryCapacityKwh: { type: Number },
      rangeKm: { type: Number },
      topSpeedKmph: { type: Number },
      seatingCapacity: { type: Number, default: 2 },
      fuelTankCapacityL: { type: Number },
      luggageSpace: { type: String, default: 'Standard' },
    },
    insuranceExpiry: { type: Date },
    fitnessCertExpiry: { type: Date },
    permitExpiry: { type: Date },
    rating: { type: Number, default: 4.8, min: 1, max: 5 },
    totalBookings: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    badges: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for rapid marketplace queries
VehicleSchema.index({ destinationId: 1, category: 1, isAvailable: 1, isVerified: 1 });
VehicleSchema.index({ pricePerDay: 1, rating: -1 });

export const Vehicle: Model<IVehicle> =
  mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);

export default Vehicle;
