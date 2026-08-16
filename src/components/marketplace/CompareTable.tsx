'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCompare, CompareVehicleItem } from '@/context/CompareContext';
import { formatINR } from '@/lib/utils';
import {
  ShieldCheck,
  Star,
  Check,
  X,
  Trash2,
  ArrowRight,
  Truck,
  Zap,
  HardHat,
  HelpCircle,
} from 'lucide-react';

export const CompareTable: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (compareList.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-xl mx-auto my-8 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-brand-light text-brand-orange flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-heading text-slate-900 mb-2">
          No Vehicles in Comparison
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Browse our verified fleet across Uttarakhand and click the &quot;Compare&quot; checkbox on any 2 to 4 vehicles to see side-by-side specs, vendor ratings, deposits, and transparent price differences.
        </p>
        <Link
          href="/vehicles"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-dark text-white font-bold text-sm shadow-md shadow-brand-orange/20"
        >
          <span>Explore Verified Fleet</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-navy-900">
            Multi-Vendor Vehicle Comparison
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Compare transparent rates, refundable deposits, vendor credentials, and inclusions before booking.
          </p>
        </div>
        <button
          onClick={clearCompare}
          className="text-xs font-semibold text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[700px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="p-4 sm:p-5 w-1/5 text-xs font-bold uppercase tracking-wider text-slate-400">
                Attributes
              </th>
              {compareList.map((v) => (
                <th key={v._id} className="p-4 sm:p-5 w-1/4 align-top relative">
                  <button
                    onClick={() => removeFromCompare(v._id)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="space-y-2">
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200">
                      <Image
                        src={v.images?.[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80'}
                        alt={`${v.brand} ${v.model}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {v.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1">
                        {v.brand} {v.model}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{v.variant}</p>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {/* Vendor & Rating */}
            <tr>
              <td className="p-4 font-semibold text-slate-600 bg-slate-50/40">Local Rental Partner</td>
              {compareList.map((v) => (
                <td key={v._id} className="p-4">
                  <div className="font-bold text-slate-900">{v.vendorId?.businessName || 'Verified Partner'}</div>
                  <div className="flex items-center gap-1 mt-1 text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-amber-900">{v.rating || 4.8}</span>
                    <span className="text-slate-400">({v.totalReviews || 12} reviews)</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Price Per Day */}
            <tr>
              <td className="p-4 font-semibold text-slate-600 bg-slate-50/40">Daily Rental Rate</td>
              {compareList.map((v) => (
                <td key={v._id} className="p-4 font-heading font-extrabold text-base text-navy-900">
                  {formatINR(v.pricePerDay)} <span className="text-xs font-normal text-slate-500">/ day</span>
                </td>
              ))}
            </tr>

            {/* Security Deposit (Refundable) */}
            <tr>
              <td className="p-4 font-semibold text-slate-600 bg-slate-50/40">
                Refundable Deposit
                <span className="block text-[10px] text-emerald-600 font-medium">100% Refunded on Return</span>
              </td>
              {compareList.map((v) => (
                <td key={v._id} className="p-4">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {formatINR(v.securityDeposit)}
                  </span>
                </td>
              ))}
            </tr>

            {/* KM Limit & Excess Charge */}
            <tr>
              <td className="p-4 font-semibold text-slate-600 bg-slate-50/40">Kilometer Policy</td>
              {compareList.map((v) => (
                <td key={v._id} className="p-4 text-slate-700">
                  <div className="font-bold">{v.kmLimitPerDay ? `${v.kmLimitPerDay} km / day` : 'Unlimited KM'}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Excess: ₹{v.excessKmCharge || 4}/km</div>
                </td>
              ))}
            </tr>

            {/* Fuel & Transmission */}
            <tr>
              <td className="p-4 font-semibold text-slate-600 bg-slate-50/40">Fuel & Transmission</td>
              {compareList.map((v) => (
                <td key={v._id} className="p-4 text-slate-700 font-medium">
                  {v.fuelType} • {v.transmission}
                </td>
              ))}
            </tr>

            {/* Helmet Inclusions */}
            <tr>
              <td className="p-4 font-semibold text-slate-600 bg-slate-50/40">Complimentary Helmet</td>
              {compareList.map((v) => (
                <td key={v._id} className="p-4">
                  {v.helmetIncluded ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <Check className="w-4 h-4 text-emerald-600" /> 1 ISI Helmet Free
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <X className="w-4 h-4" /> Optional Addon
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Doorstep Delivery */}
            <tr>
              <td className="p-4 font-semibold text-slate-600 bg-slate-50/40">Doorstep Delivery</td>
              {compareList.map((v) => (
                <td key={v._id} className="p-4">
                  {v.deliveryAvailable ? (
                    <span className="inline-flex items-center gap-1 text-blue-700 font-semibold">
                      <Truck className="w-4 h-4 text-blue-600" /> Hotel / Station (₹{v.vendorId?.baseDeliveryFee || 100})
                    </span>
                  ) : (
                    <span className="text-slate-400">Shop Pickup Only</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Roadside Assistance */}
            <tr>
              <td className="p-4 font-semibold text-slate-600 bg-slate-50/40">24/7 Roadside Assistance</td>
              {compareList.map((v) => (
                <td key={v._id} className="p-4">
                  {v.roadsideAssistance ? (
                    <span className="inline-flex items-center gap-1 text-purple-700 font-semibold">
                      <Zap className="w-4 h-4 text-purple-600" /> Guaranteed Support
                    </span>
                  ) : (
                    <span className="text-slate-400">Standard Support</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Digital Inspection Trust */}
            <tr>
              <td className="p-4 font-semibold text-slate-600 bg-slate-50/40">Digital Handover</td>
              {compareList.map((v) => (
                <td key={v._id} className="p-4 text-emerald-700 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 inline mr-1" />
                  Pre-Ride 360° Photo Inspection
                </td>
              ))}
            </tr>

            {/* Action CTA Row */}
            <tr className="bg-slate-50/70">
              <td className="p-4 font-bold text-slate-900">Direct Reservation</td>
              {compareList.map((v) => (
                <td key={v._id} className="p-4">
                  <Link
                    href={`/book/${v._id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-brand-orange hover:bg-brand-dark text-white font-bold text-xs transition-all shadow-md shadow-brand-orange/20 flex items-center justify-center gap-1.5"
                  >
                    <span>Book This Ride</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompareTable;
