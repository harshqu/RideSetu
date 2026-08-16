'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCompare, CompareVehicleItem } from '@/context/CompareContext';
import { formatINR } from '@/lib/utils';
import {
  ShieldCheck,
  Star,
  Fuel,
  Gauge,
  CheckCircle2,
  Layers,
  Truck,
  HelpCircle,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface VehicleCardProps {
  vehicle: any;
  pickupDateTime?: string;
  returnDateTime?: string;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  pickupDateTime,
  returnDateTime,
}) => {
  const { addToCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(vehicle._id);

  const bookingUrl = `/book/${vehicle._id}${
    pickupDateTime && returnDateTime
      ? `?pickup=${encodeURIComponent(pickupDateTime)}&return=${encodeURIComponent(returnDateTime)}`
      : ''
  }`;

  const detailUrl = `/vehicles/${vehicle._id}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-hover hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Image & Badges */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        <Image
          src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80'}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Category & Verified Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="px-2 py-0.5 rounded-md bg-navy-950/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
            {vehicle.category}
          </span>
          {vehicle.isVerified && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3 h-3" /> Verified Partner
            </span>
          )}
        </div>

        {/* Compare Checkbox Pin */}
        <button
          type="button"
          onClick={() => addToCompare(vehicle)}
          className={`absolute top-3 right-3 z-10 px-2.5 py-1 rounded-xl text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1 shadow-sm ${
            inCompare
              ? 'bg-brand-orange text-white ring-2 ring-white'
              : 'bg-white/90 text-slate-700 hover:bg-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{inCompare ? 'Added' : 'Compare'}</span>
        </button>

        {/* Location tag at bottom of image */}
        {vehicle.destinationId && (
          <div className="absolute bottom-2 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white text-[10px] font-medium">
            📍 {typeof vehicle.destinationId === 'object' ? vehicle.destinationId.name : 'Uttarakhand'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Vendor Name & Rating */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="text-xs font-semibold text-slate-500 truncate flex items-center gap-1">
              <span>{vehicle.vendorId?.businessName || 'Local Rental Partner'}</span>
              {vehicle.vendorId?.isTopRated && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  TOP RATED
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md text-amber-800 font-bold text-xs shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{vehicle.rating || 4.8}</span>
              <span className="text-slate-400 text-[10px]">({vehicle.totalReviews || 12})</span>
            </div>
          </div>

          {/* Vehicle Name */}
          <Link href={detailUrl} className="block group-hover:text-brand-orange transition-colors">
            <h3 className="font-bold text-slate-900 text-base leading-snug">
              {vehicle.brand} {vehicle.model}
            </h3>
            {vehicle.variant && (
              <p className="text-xs text-slate-500 line-clamp-1">{vehicle.variant}</p>
            )}
          </Link>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{vehicle.fuelType} • {vehicle.transmission}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{vehicle.kmLimitPerDay ? `${vehicle.kmLimitPerDay} km/day` : 'Unlimited KM'}</span>
            </div>
          </div>

          {/* Trust Inclusions */}
          <div className="flex flex-wrap gap-1.5 mt-3 text-[11px] font-medium text-slate-600">
            {vehicle.helmetIncluded && (
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 1 Helmet Free
              </span>
            )}
            {vehicle.deliveryAvailable && (
              <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                <Truck className="w-3 h-3 text-blue-600" /> Doorstep Delivery
              </span>
            )}
            {vehicle.roadsideAssistance && (
              <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                <Zap className="w-3 h-3 text-purple-600" /> 24/7 Roadside SOS
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading">
                {formatINR(vehicle.pricePerDay)}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ day</span>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-0.5">
              <span>{formatINR(vehicle.securityDeposit)} Refundable Deposit</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={detailUrl}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Details
            </Link>
            <Link
              href={bookingUrl}
              className="px-3.5 py-2 rounded-xl bg-brand-orange hover:bg-brand-dark text-white font-bold text-xs transition-all shadow-md shadow-brand-orange/20 flex items-center gap-1"
            >
              <span>Book</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
