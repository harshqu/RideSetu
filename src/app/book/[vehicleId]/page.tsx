'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import PriceBreakdownCard from '@/components/booking/PriceBreakdownCard';
import PaymentModal from '@/components/booking/PaymentModal';
import BookingVoucherCard from '@/components/booking/BookingVoucherCard';
import DeliveryLocationSelector, { DeliveryLocationData } from '@/components/booking/DeliveryLocationSelector';
import { formatINR } from '@/lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  Truck,
  User,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  Lock,
  Zap,
  Edit3,
  RefreshCw,
} from 'lucide-react';

function BookingFlowContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const vehicleId = params.vehicleId as string;

  const initialPickup = searchParams.get('pickup') || '';
  const initialReturn = searchParams.get('return') || '';

  const [vehicle, setVehicle] = useState<any>(null);
  const [pricing, setPricing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [priceUpdating, setPriceUpdating] = useState(false);
  const [isDateAvailable, setIsDateAvailable] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form fields
  const defaultPickupDate = initialPickup ? initialPickup.split('T')[0] : new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const defaultPickupTime = initialPickup && initialPickup.includes('T') ? initialPickup.split('T')[1].substring(0, 5) : '09:00';
  const defaultReturnDate = initialReturn ? initialReturn.split('T')[0] : new Date(Date.now() + 172800000).toISOString().split('T')[0];
  const defaultReturnTime = initialReturn && initialReturn.includes('T') ? initialReturn.split('T')[1].substring(0, 5) : '20:00';

  const [pickupDate, setPickupDate] = useState(defaultPickupDate);
  const [pickupTime, setPickupTime] = useState(defaultPickupTime);
  const [returnDate, setReturnDate] = useState(defaultReturnDate);
  const [returnTime, setReturnTime] = useState(defaultReturnTime);
  const [pickupType, setPickupType] = useState<string>('VENDOR_PICKUP');
  const [pickupLocation, setPickupLocation] = useState('Vendor Shop Hub');
  const [hotelAddress, setHotelAddress] = useState('');
  const [deliveryLocationData, setDeliveryLocationData] = useState<DeliveryLocationData | null>(null);
  const [savedLocations, setSavedLocations] = useState<any[]>([]);

  const [fullName, setFullName] = useState(user?.name || 'Aarav Sharma');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [email, setEmail] = useState(user?.email || 'customer@ridesetu.demo');
  const [dlNumber, setDlNumber] = useState(user?.drivingLicenseNumber || 'UK0720210084920');
  const [emergencyName, setEmergencyName] = useState(user?.emergencyContact?.name || 'Rohan Sharma');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyContact?.phone || '+91 98765 43219');
  const [emergencyRelation, setEmergencyRelation] = useState(user?.emergencyContact?.relation || 'Brother');
  const [couponCode, setCouponCode] = useState('');
  const [kycStatusData, setKycStatusData] = useState<any>(null);

  const [isPaymentOpen, setPaymentOpen] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch Vehicle, Saved Locations, and KYC Status
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/vehicles/${vehicleId}`);
        const data = await res.json();
        if (data.vehicle) {
          setVehicle(data.vehicle);
        }
      } catch (err) {
        console.error('Failed to load vehicle:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSavedLocations = async () => {
      try {
        const res = await fetch('/api/customer/saved-locations');
        if (res.ok) {
          const data = await res.json();
          if (data.locations) setSavedLocations(data.locations);
        }
      } catch {
        // Silently continue if customer not logged in
      }
    };

    const fetchKycStatus = async () => {
      try {
        const res = await fetch('/api/customer/kyc/status');
        if (res.ok) {
          const data = await res.json();
          setKycStatusData(data);
          if (data.maskedLicenceNumber) {
            setDlNumber(data.maskedLicenceNumber);
          }
        }
      } catch {
        // Continue
      }
    };

    if (vehicleId) {
      fetchVehicle();
      fetchSavedLocations();
      fetchKycStatus();
    }
  }, [vehicleId]);

  // Recalculate Pricing via Server Endpoint whenever trip parameters change
  const calculateServerPrice = useCallback(async (coupon?: string) => {
    if (!vehicle) return;
    try {
      setPriceUpdating(true);
      setError(null);
      setAvailabilityError(null);
      // Invalidate stale payment orders when trip parameters change
      setOrderData(null);
      setPaymentOpen(false);

      const pDateTime = `${pickupDate}T${pickupTime}:00`;
      const rDateTime = `${returnDate}T${returnTime}:00`;

      const res = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: vehicle._id,
          pickupDateTime: pDateTime,
          returnDateTime: rDateTime,
          pickupType,
          couponCode: coupon !== undefined ? coupon : couponCode,
        }),
      });

      const data = await res.json();
      if (data.success && data.pricing) {
        setPricing(data.pricing);
        if (data.available === false) {
          setIsDateAvailable(false);
          setAvailabilityError(data.availabilityReason || 'Selected vehicle is not available for these dates.');
        } else {
          setIsDateAvailable(true);
          setAvailabilityError(null);
        }
      } else if (data.error) {
        setAvailabilityError(data.error);
        setIsDateAvailable(false);
      }
    } catch (err: any) {
      console.error('Price calculation error:', err);
      setAvailabilityError(err.message || 'Failed to update pricing.');
    } finally {
      setPriceUpdating(false);
    }
  }, [vehicle, pickupDate, pickupTime, returnDate, returnTime, pickupType, couponCode]);

  useEffect(() => {
    if (vehicle) {
      calculateServerPrice();
    }
  }, [vehicle, calculateServerPrice]);

  const handleApplyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          bookingValue: pricing?.basePrice || 500,
          category: vehicle?.category,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        return { success: false, error: data.error || 'Invalid coupon' };
      }

      setCouponCode(code);
      await calculateServerPrice(code);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Coupon validation failed' };
    }
  };

  const handleInitiatePayment = async () => {
    try {
      setError(null);
      setInitiatingPayment(true);
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: vehicle._id,
          pickupDateTime: `${pickupDate}T${pickupTime}:00`,
          returnDateTime: `${returnDate}T${returnTime}:00`,
          pickupType,
          couponCode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      setOrderData(data.order);
      setPaymentOpen(true);
    } catch (err: any) {
      setError(err.message || 'Unable to proceed to payment');
    } finally {
      setInitiatingPayment(false);
    }
  };

  const handlePaymentComplete = async (paymentDetails: {
    method: any;
    status: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  }) => {
    if (paymentDetails.status !== 'SUCCESS') {
      setError('Payment was not completed. Your booking has not been confirmed.');
      setPaymentOpen(false);
      return;
    }

    try {
      setError(null);
      const pickupLoc = deliveryLocationData?.formattedAddress || (pickupType === 'HOTEL_DELIVERY' ? hotelAddress : pickupLocation);

      const bookingPayload = {
        vehicleId: vehicle._id,
        pickupDateTime: `${pickupDate}T${pickupTime}:00`,
        returnDateTime: `${returnDate}T${returnTime}:00`,
        pickupType,
        pickupLocation: pickupLoc,
        dropoffLocation: pickupLoc,
        deliveryLocation: deliveryLocationData || undefined,
        customerDetails: {
          fullName,
          phone,
          email,
          drivingLicenseNumber: dlNumber,
        },
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relation: emergencyRelation,
        },
        couponCode,
        paymentMethod: paymentDetails.method,
      };

      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: paymentDetails.razorpayOrderId || orderData?.orderId,
          razorpayPaymentId: paymentDetails.razorpayPaymentId,
          razorpaySignature: paymentDetails.razorpaySignature,
          bookingData: bookingPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Payment verification failed');
      }

      setConfirmedBooking(data.booking);
      setPaymentOpen(false);
    } catch (err: any) {
      setError(err.message || 'Payment verification and confirmation failed');
      setPaymentOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-16 text-center text-slate-500">
        <div className="inline-block w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-sm font-semibold">Preparing secure booking checkout...</p>
      </div>
    );
  }

  if (confirmedBooking) {
    return <BookingVoucherCard booking={confirmedBooking} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-orange"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {/* Progress Steps Header */}
      <div className="max-w-3xl mx-auto">
        {/* Desktop Stepper */}
        <div className="hidden sm:flex items-center justify-between relative">
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full"></div>
          {[
            { s: 1, label: 'Trip & Delivery' },
            { s: 2, label: 'Traveller & KYC' },
            { s: 3, label: 'Review & Pay' },
          ].map((item) => (
            <div key={item.s} className="relative z-10 flex flex-col items-center bg-slate-50 px-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-xs transition-all duration-300 ${
                  step > item.s
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : step === item.s
                    ? 'bg-gradient-to-r from-brand-orange to-amber-500 text-white ring-4 ring-brand-orange/20 shadow-md shadow-brand-orange/30 scale-105'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {step > item.s ? <CheckCircle2 className="w-5 h-5" /> : item.s}
              </div>
              <span
                className={`text-xs font-black mt-2 font-heading tracking-tight ${
                  step === item.s
                    ? 'text-navy-950 font-bold'
                    : step > item.s
                    ? 'text-emerald-700 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Mobile Compact Progress Bar */}
        <div className="sm:hidden bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-brand-orange uppercase tracking-wider text-[10px] font-black">
              Step {step} of 3
            </span>
            <span className="text-navy-950 font-heading">
              {step === 1 ? 'Trip & Delivery' : step === 2 ? 'Traveller & KYC' : 'Review & Pay'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-orange to-amber-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {(error || availabilityError) && (
        <div className="max-w-4xl mx-auto p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start gap-2 animate-fade-in-up">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error || availabilityError}</span>
        </div>
      )}

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Step Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: Dates & Delivery Mode */}
          {step === 1 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-light text-brand-dark">
                  Step 1 of 3
                </span>
                <h2 className="text-xl font-bold font-heading text-navy-900 mt-1">
                  Rental Dates & Fulfillment Mode
                </h2>
                <p className="text-xs text-slate-500">
                  Select your exact pickup time and choose shop pickup or hotel doorstep delivery.
                </p>
              </div>

              {/* Vehicle Mini Card */}
              <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="relative w-20 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  <Image
                    src={vehicle?.images?.[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=200&q=80'}
                    alt={vehicle?.model || 'Vehicle'}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{vehicle?.brand} {vehicle?.model}</h4>
                  <p className="text-xs text-slate-500">{vehicle?.variant}</p>
                  <span className="text-xs font-bold text-brand-orange">{formatINR(vehicle?.pricePerDay)}/day</span>
                </div>
              </div>

              {/* Date & Time Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-orange" /> Pickup Date & Time
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={pickupDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-3/5 p-2 bg-white border border-slate-300 rounded-xl font-bold outline-none focus:ring-2 focus:ring-brand-orange"
                    />
                    <select
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-2/5 p-2 bg-white border border-slate-300 rounded-xl font-bold outline-none focus:ring-2 focus:ring-brand-orange"
                    >
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="18:00">06:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-orange" /> Return Date & Time
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={returnDate}
                      min={pickupDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-3/5 p-2 bg-white border border-slate-300 rounded-xl font-bold outline-none focus:ring-2 focus:ring-brand-orange"
                    />
                    <select
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="w-2/5 p-2 bg-white border border-slate-300 rounded-xl font-bold outline-none focus:ring-2 focus:ring-brand-orange"
                    >
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="18:00">06:00 PM</option>
                      <option value="20:00">08:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Delivery / Location Selection */}
              <DeliveryLocationSelector
                destinationCity={vehicle?.destinationId?.city || 'Rishikesh'}
                initialType={pickupType}
                baseDeliveryFee={120}
                vendorDeliveryRadiusKm={15}
                savedLocations={savedLocations}
                onLocationConfirmed={(loc) => {
                  setDeliveryLocationData(loc);
                  if (loc.locationType === 'VENDOR_PICKUP') {
                    setPickupType('VENDOR_PICKUP');
                    setPickupLocation(loc.formattedAddress || 'Vendor Shop Hub');
                  } else if (loc.locationType === 'HOTEL' || loc.locationType === 'HOSTEL') {
                    setPickupType('HOTEL_DELIVERY');
                    setHotelAddress(loc.formattedAddress || loc.address);
                  } else {
                    setPickupType('DOORSTEP');
                    setHotelAddress(loc.formattedAddress || loc.address);
                  }
                }}
              />

              <button
                type="button"
                disabled={priceUpdating || !isDateAvailable}
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-2xl bg-brand-orange hover:bg-brand-dark text-white font-bold text-sm shadow-md shadow-brand-orange/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {priceUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating availability & price...</span>
                  </>
                ) : !isDateAvailable ? (
                  <span>Vehicle unavailable for selected dates</span>
                ) : (
                  <>
                    <span>Continue to Traveller & KYC</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: Traveller Info & Digital KYC */}
          {step === 2 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-light text-brand-dark">
                  Step 2 of 3
                </span>
                <h2 className="text-xl font-bold font-heading text-navy-900 mt-1">
                  Traveller Details & Digital KYC
                </h2>
                <p className="text-xs text-slate-500">
                  Compliant with Uttarakhand Motor Vehicle Rental scheme. Original DL verified digitally at handover.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name (As on DL)</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold outline-none"
                  />
                </div>
              </div>

              {/* Driving Licence & KYC Check */}
              {kycStatusData?.isEligibleForBooking ? (
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Driving Licence Verification
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] uppercase">
                      Verified by RideSetu
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Driving Licence Number</label>
                    <input
                      type="text"
                      required
                      value={dlNumber}
                      readOnly
                      className="w-full p-2.5 bg-slate-50 border border-emerald-300 rounded-xl font-mono font-bold uppercase outline-none text-slate-700"
                    />
                  </div>

                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    ✓ Digital KYC pre-cleared. Please carry your physical DL at pickup for 10-second authentication.
                  </p>
                </div>
              ) : kycStatusData?.isDlExpired ? (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-2 text-xs">
                  <div className="font-bold text-red-950 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    Driving Licence Expired
                  </div>
                  <p className="text-red-800">
                    Your registered driving licence has expired. Please update your licence before booking.
                  </p>
                  <a
                    href="/dashboard"
                    className="inline-block px-3 py-1.5 bg-red-600 text-white rounded-xl font-bold text-xs shadow-sm"
                  >
                    Update Licence in Dashboard
                  </a>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 text-xs">
                  <div className="font-bold text-amber-950 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    KYC Verification Required Before Booking
                  </div>
                  <p className="text-amber-800">
                    Please submit your Driving Licence for administrative review in your customer portal before reserving vehicles.
                  </p>
                  <a
                    href="/dashboard"
                    className="inline-block px-3 py-1.5 bg-navy-900 text-white rounded-xl font-bold text-xs shadow-sm"
                  >
                    Complete KYC in Dashboard
                  </a>
                </div>
              )}

              {/* Emergency Contact */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-brand-orange" />
                  Emergency Contact (Required for Mountain Routes)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Contact Name</label>
                    <input
                      type="text"
                      required
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Relation</label>
                    <input
                      type="text"
                      required
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-2xl border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-700"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={kycStatusData && !kycStatusData.isEligibleForBooking}
                  className="flex-1 py-3 rounded-2xl bg-brand-orange hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-950/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  <span>Proceed to Review</span> <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Payment Confirmation */}
          {step === 3 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-light text-brand-dark">
                    Step 3 of 3
                  </span>
                  <h2 className="text-xl font-bold font-heading text-navy-900 mt-1">
                    Review & Secure Payment
                  </h2>
                  <p className="text-xs text-slate-500">
                    Confirm your reservation and lock the vehicle with verified local partner.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Modify Dates
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Trip Details Card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900 font-heading text-sm">{vehicle?.brand} {vehicle?.model}</span>
                    <span className="text-[11px] font-bold text-slate-500 px-2 py-0.5 bg-white rounded-md border border-slate-200">
                      {pricing?.durationDays || 1} billable day{pricing?.durationDays > 1 ? 's' : ''} ({pricing?.durationHours || 24}h)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                    <div>📍 <strong>Pickup:</strong> {pickupDate} ({pickupTime})</div>
                    <div>🏁 <strong>Return:</strong> {returnDate} ({returnTime})</div>
                    <div>🏬 <strong>Partner:</strong> {vehicle?.vendorId?.businessName || 'Verified Partner'}</div>
                    <div>🛵 <strong>Delivery:</strong> {pickupType}</div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div className="text-[11px] text-emerald-950 leading-relaxed">
                    <strong>100% Refundable Deposit Guarantee:</strong> Your deposit of {formatINR(pricing?.securityDeposit || 1000)} is held securely and released instantly upon digital return inspection.
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-2xl border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-700"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={initiatingPayment || priceUpdating || !isDateAvailable}
                  onClick={handleInitiatePayment}
                  className="flex-2 py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {initiatingPayment ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Securing Hold...</span>
                    </>
                  ) : priceUpdating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating Price...</span>
                    </>
                  ) : !isDateAvailable ? (
                    <span>Dates Unavailable</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Proceed to Pay {formatINR(pricing?.totalPayable || 1500)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Price Breakdown */}
        <div className="lg:col-span-1">
          <PriceBreakdownCard
            pricing={pricing}
            loading={priceUpdating}
            onApplyCoupon={handleApplyCoupon}
          />
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setPaymentOpen(false)}
        amount={pricing?.totalPayable || 1500}
        orderId={orderData?.orderId}
        keyId={orderData?.keyId}
        vehicleName={`${vehicle?.brand} ${vehicle?.model}`}
        customerDetails={{
          name: fullName,
          email,
          phone,
        }}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-slate-500 font-semibold">Loading checkout...</div>}>
      <BookingFlowContent />
    </Suspense>
  );
}
