import mongoose, { Schema, Document, Model } from 'mongoose';

export type PickupType =
  | 'VENDOR_PICKUP'
  | 'HOTEL_DELIVERY'
  | 'HOSTEL_DELIVERY'
  | 'STATION_DELIVERY'
  | 'AIRPORT_DELIVERY'
  | 'ONE_WAY_DROP';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export type DepositStatus =
  | 'PENDING'
  | 'HELD'
  | 'REFUNDED'
  | 'PARTIALLY_DEDUCTED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  bookingNumber: string;
  customerId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  destinationId: mongoose.Types.ObjectId;
  pickupDateTime: Date;
  returnDateTime: Date;
  pickupType: PickupType;
  pickupLocation: string;
  dropoffLocation: string;
  rentalDurationDays: number;
  rentalDurationHours: number;
  // Transparent financial fields
  basePrice: number;
  deliveryCharge: number;
  platformFee: number;
  taxes: number; // GST 18% on platform + delivery + rental base
  securityDeposit: number; // Strictly refundable, NOT platform revenue
  discountAmount: number;
  totalPayable: number;
  // Statuses
  depositStatus: DepositStatus;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  kycVerified: boolean;
  customerDetails: {
    fullName: string;
    phone: string;
    email: string;
    drivingLicenseNumber: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  couponCode?: string;
  handoverPickupId?: mongoose.Types.ObjectId;
  handoverReturnId?: mongoose.Types.ObjectId;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
    destinationId: { type: Schema.Types.ObjectId, ref: 'Destination', required: true },
    pickupDateTime: { type: Date, required: true, index: true },
    returnDateTime: { type: Date, required: true, index: true },
    pickupType: {
      type: String,
      enum: [
        'VENDOR_PICKUP',
        'HOTEL_DELIVERY',
        'HOSTEL_DELIVERY',
        'STATION_DELIVERY',
        'AIRPORT_DELIVERY',
        'ONE_WAY_DROP',
      ],
      default: 'VENDOR_PICKUP',
    },
    pickupLocation: { type: String, required: true },
    dropoffLocation: { type: String, required: true },
    rentalDurationDays: { type: Number, required: true, default: 1 },
    rentalDurationHours: { type: Number, required: true, default: 24 },
    basePrice: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    platformFee: { type: Number, default: 49 },
    taxes: { type: Number, default: 0 },
    securityDeposit: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    totalPayable: { type: Number, required: true },
    depositStatus: {
      type: String,
      enum: ['PENDING', 'HELD', 'REFUNDED', 'PARTIALLY_DEDUCTED'],
      default: 'PENDING',
      index: true,
    },
    bookingStatus: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED'],
      default: 'PENDING',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    kycVerified: { type: Boolean, default: false },
    customerDetails: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      drivingLicenseNumber: { type: String, required: true },
    },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relation: { type: String, default: '' },
    },
    couponCode: { type: String, default: '' },
    handoverPickupId: { type: Schema.Types.ObjectId, ref: 'DigitalHandoverReport' },
    handoverReturnId: { type: Schema.Types.ObjectId, ref: 'DigitalHandoverReport' },
    cancellationReason: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Compound index for high performance availability lookups and double booking checks
BookingSchema.index({
  vehicleId: 1,
  pickupDateTime: 1,
  returnDateTime: 1,
  bookingStatus: 1,
});

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
