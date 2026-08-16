'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useCompare } from '@/context/CompareContext';
import { formatINR } from '@/lib/utils';
import {
  ShieldCheck,
  Star,
  Fuel,
  Gauge,
  CheckCircle2,
  Layers,
  Truck,
  Zap,
  PhoneCall,
  Calendar,
  Clock,
  ArrowRight,
  ChevronLeft,
  AlertCircle,
  FileCheck2,
  User,
} from 'lucide-react';

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = params.id as string;

  const { addToCompare, isInCompare } = useCompare();
  const [vehicle, setVehicle] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Default dates
  const defaultPickup = new Date();
  defaultPickup.setDate(defaultPickup.getDate() + 1);
  const defaultReturn = new Date(defaultPickup);
  defaultReturn.setDate(defaultReturn.getDate() + 2);

  const [pickupDate, setPickupDate] = useState(defaultPickup.toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState(defaultReturn.toISOString().split('T')[0]);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/vehicles/${vehicleId}`);
        const data = await res.json();
        if (data.vehicle) {
          setVehicle(data.vehicle);
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.error('Failed to load vehicle:', err);
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) fetchVehicle();
  }, [vehicleId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Loading verified vehicle details...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Vehicle Not Found</h2>
        <p className="text-sm text-slate-500">This vehicle may no longer be available for rental.</p>
        <Link href="/vehicles" className="inline-block px-5 py-2.5 rounded-xl bg-brand-orange text-white text-xs font-bold">
          Browse All Vehicles
        </Link>
      </div>
    );
  }

  const inCompare = isInCompare(vehicle._id);
  const images = vehicle.images && vehicle.images.length > 0
    ? vehicle.images
    : ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80'];

  const vendor = vehicle.vendorId || {};
  const destination = vehicle.destinationId || {};

  const bookingUrl = `/book/${vehicle._id}?pickup=${pickupDate}T09:00:00&return=${returnDate}T20:00:00`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back link */}
      <Link href="/vehicles" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-orange">
        <ChevronLeft className="w-4 h-4" /> Back to Vehicles
      </Link>

      {/* Main Grid: Gallery & Details on Left, Booking Box on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Photos & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Photo Gallery */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 relative">
              <Image
                src={images[activeImageIndex] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80'}
                alt={vehicle.model}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                <span className="px-3 py-1 rounded-full bg-navy-950/80 backdrop-blur-md text-white text-xs font-bold uppercase">
                  {vehicle.category}
                </span>
                {vehicle.isVerified && (
                  <span className="px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Local Partner
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => addToCompare(vehicle)}
                className={`absolute top-4 right-4 z-10 px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1.5 shadow-md ${
                  inCompare
                    ? 'bg-brand-orange text-white ring-2 ring-white'
                    : 'bg-white/90 text-slate-800 hover:bg-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{inCompare ? 'In Comparison' : 'Add to Compare'}</span>
              </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx ? 'border-brand-orange ring-2 ring-brand-orange/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="thumbnail" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Specifications */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-navy-900">
                  {vehicle.brand} {vehicle.model}
                </h1>
                <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-xl text-amber-900 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{vehicle.rating || 4.8}</span>
                  <span className="text-slate-400 text-xs">({vehicle.totalReviews || 12} reviews)</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-1">{vehicle.variant} • {vehicle.year} Model</p>
            </div>

            {/* Spec Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Engine / Power</span>
                <div className="font-extrabold text-slate-900">{vehicle.specifications?.engineCc ? `${vehicle.specifications.engineCc} cc` : vehicle.fuelType}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Transmission</span>
                <div className="font-extrabold text-slate-900">{vehicle.transmission}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Daily KM Limit</span>
                <div className="font-extrabold text-slate-900">{vehicle.kmLimitPerDay ? `${vehicle.kmLimitPerDay} km/day` : 'Unlimited KM'}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Excess KM Rate</span>
                <div className="font-extrabold text-slate-900">₹{vehicle.excessKmCharge || 4}/km</div>
              </div>
            </div>

            {/* Verified Inclusions */}
            <div className="pt-3 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Rental Inclusions & Benefits</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1 Complimentary ISI-Certified Helmet</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>24/7 Roadside Mechanical Assistance SOS</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Doorstep Hotel / Hostel Delivery Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>360° Digital Handover Scratch Protection</span>
                </div>
              </div>
            </div>
          </div>

          {/* Local Partner Information */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-navy-900 text-base">
                  🏢
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{vendor.businessName || 'Verified Partner'}</h3>
                  <p className="text-xs text-slate-500">📍 {vendor.address || 'Tapovan Hub, Rishikesh'}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                Trade Licensed
              </span>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base font-heading">
                Verified Traveller Reviews ({reviews.length})
              </h3>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{vehicle.rating || 4.8} / 5.0</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No reviews yet. Be the first to rent and review this ride!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image
                          src={r.customerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                          alt={r.customerName}
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="font-bold text-slate-900">{r.customerName}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: r.overallRating || 5 }).map((_, si) => (
                          <Star key={si} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{r.reviewText}</p>
                    {r.vendorReply && (
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-600 mt-2">
                        <strong className="text-slate-900 block text-[11px]">Partner Reply:</strong>
                        <span>{r.vendorReply.text}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Booking Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl sticky top-24 space-y-5">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-2xl font-black font-heading text-navy-900">
                  {formatINR(vehicle.pricePerDay)}
                </span>
                <span className="text-xs text-slate-500 font-medium"> / day</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {formatINR(vehicle.securityDeposit)} Deposit
                </span>
              </div>
            </div>

            {/* Dates Selection */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-orange" /> Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-orange" /> Return Date
                </label>
                <input
                  type="date"
                  value={returnDate}
                  min={pickupDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 outline-none"
                />
              </div>
            </div>

            {/* Direct Booking CTA */}
            <Link
              href={bookingUrl}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-dark hover:to-brand-orange text-white font-extrabold text-sm shadow-lg shadow-brand-orange/25 flex items-center justify-center gap-2 transition-all"
            >
              <span>Instant Reserve</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="text-[11px] text-slate-400 text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Instant Availability Verification
              </div>
              <p>Refundable security deposit is returned on ride completion.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
