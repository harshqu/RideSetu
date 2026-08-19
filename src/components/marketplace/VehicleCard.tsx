'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-brand-orange/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Top Media & Badges */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        <Image
          src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80'}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Scrim for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full bg-navy-950/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider border border-white/10">
            {vehicle.category}
          </span>
          {vehicle.isVerified && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-black flex items-center gap-1 shadow-sm border border-emerald-400/30">
              <ShieldCheck className="w-3 h-3" /> Verified Partner
            </span>
          )}
        </div>

        {/* Compare Toggle */}
        <button
          type="button"
          onClick={() => addToCompare(vehicle)}
          className={`absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1 shadow-sm focus-ring ${
            inCompare
              ? 'bg-brand-orange text-white ring-2 ring-white shadow-brand-orange/30'
              : 'bg-white/90 text-slate-800 hover:bg-white hover:text-brand-orange'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{inCompare ? 'Added' : 'Compare'}</span>
        </button>

        {/* Destination Tag */}
        {vehicle.destinationId && (
          <div className="absolute bottom-2.5 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold border border-white/10">
            📍 {typeof vehicle.destinationId === 'object' ? vehicle.destinationId.name : 'Uttarakhand'}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Vendor Name & Rating */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="text-xs font-bold text-slate-500 truncate flex items-center gap-1.5">
              <span>{vehicle.vendorId?.businessName || 'Local Rental Partner'}</span>
              {vehicle.vendorId?.isTopRated && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  ★ TOP RATED
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-xl text-amber-950 font-black text-xs shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{Number(vehicle.rating || 4.8).toFixed(1)}</span>
              <span className="text-slate-400 font-medium text-[10px]">({vehicle.totalReviews || 12})</span>
            </div>
          </div>

          {/* Vehicle Name */}
          <Link href={detailUrl} className="block group-hover:text-brand-orange transition-colors focus-ring rounded-lg">
            <h3 className="font-extrabold text-slate-900 text-base leading-snug font-heading">
              {vehicle.brand} {vehicle.model}
            </h3>
            {vehicle.variant && (
              <p className="text-xs text-slate-500 line-clamp-1 font-medium">{vehicle.variant}</p>
            )}
          </Link>

          {/* Quick Specifications Pills */}
          <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] text-slate-700 bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold truncate">{vehicle.fuelType} • {vehicle.transmission}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold truncate">{vehicle.kmLimitPerDay ? `${vehicle.kmLimitPerDay} km/day` : 'Unlimited KM'}</span>
            </div>
          </div>

          {/* Inclusions */}
          <div className="flex flex-wrap gap-1.5 mt-3 text-[10px] font-extrabold">
            {vehicle.helmetIncluded && (
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 1 Helmet Free
              </span>
            )}
            {vehicle.deliveryAvailable && (
              <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/70">
                <Truck className="w-3 h-3 text-blue-600" /> Doorstep Delivery
              </span>
            )}
            {vehicle.roadsideAssistance && (
              <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/70">
                <Zap className="w-3 h-3 text-purple-600" /> 24/7 SOS
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-navy-950 font-heading">
                {formatINR(vehicle.pricePerDay)}
              </span>
              <span className="text-xs text-slate-500 font-bold">/ day</span>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold">
              + {formatINR(vehicle.securityDeposit)} Refundable Deposit
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={detailUrl}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-extrabold transition-all focus-ring"
            >
              Specs
            </Link>
            <Link
              href={bookingUrl}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-dark hover:to-brand-orange text-white font-extrabold text-xs transition-all shadow-md shadow-brand-orange/25 flex items-center gap-1 active:scale-95 focus-ring"
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
