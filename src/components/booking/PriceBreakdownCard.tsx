'use client';

import React, { useState } from 'react';
import { formatINR } from '@/lib/utils';
import { ShieldCheck, Tag, Info, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface PriceBreakdownCardProps {
  pricing: {
    durationDays: number;
    durationHours: number;
    pricePerDay: number;
    basePrice: number;
    deliveryCharge: number;
    platformFee: number;
    taxes: number;
    securityDeposit: number;
    discountAmount: number;
    totalPayable: number;
    appliedCoupon?: {
      code: string;
      discountAmount: number;
    };
  } | null;
  onApplyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  loading?: boolean;
}

export const PriceBreakdownCard: React.FC<PriceBreakdownCardProps> = ({
  pricing,
  onApplyCoupon,
  loading = false,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  if (!pricing) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-3">
        <div className="h-5 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-100 rounded w-full"></div>
        <div className="h-4 bg-slate-100 rounded w-4/5"></div>
      </div>
    );
  }

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError(null);
    setApplying(true);
    const res = await onApplyCoupon(couponCode.trim());
    if (!res.success) {
      setCouponError(res.error || 'Invalid coupon code');
    } else {
      setCouponCode('');
    }
    setApplying(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5 sticky top-20">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-extrabold font-heading text-slate-900 text-lg">
          Transparent Price Breakdown
        </h3>
        <p className="text-xs text-slate-500">
          Zero hidden fees. Refundable deposit is returned immediately on trip completion.
        </p>
      </div>

      {/* Itemized cost list */}
      <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
        <div className="flex items-center justify-between">
          <span>
            Base Rental ({pricing.durationDays} day{pricing.durationDays > 1 ? 's' : ''} @ {formatINR(pricing.pricePerDay)}/day)
          </span>
          <span className="font-semibold text-slate-900">{formatINR(pricing.basePrice)}</span>
        </div>

        {pricing.deliveryCharge > 0 && (
          <div className="flex items-center justify-between text-blue-800">
            <span>Doorstep Delivery & Relocation Fee</span>
            <span className="font-semibold">{formatINR(pricing.deliveryCharge)}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-600">
            Platform Convenience Fee
            <span title="Includes 24/7 Roadside SOS & Digital Handover">
              <Info className="w-3 h-3 text-slate-400" />
            </span>
          </span>
          <span className="font-semibold text-slate-900">{formatINR(pricing.platformFee)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-600">GST (18% Transport & Platform Tax)</span>
          <span className="font-semibold text-slate-900">{formatINR(pricing.taxes)}</span>
        </div>

        {pricing.discountAmount > 0 && (
          <div className="flex items-center justify-between text-emerald-600 font-semibold bg-emerald-50 p-2 rounded-xl border border-emerald-100">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              Coupon Applied ({pricing.appliedCoupon?.code || 'DISCOUNT'})
            </span>
            <span>-{formatINR(pricing.discountAmount)}</span>
          </div>
        )}

        {/* Highlighted Refundable Security Deposit */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
          <div>
            <div className="font-bold text-amber-950 text-xs">Refundable Security Deposit</div>
            <div className="text-[10px] text-amber-800">100% Refunded on Return Inspection</div>
          </div>
          <span className="font-extrabold text-amber-950 text-sm">
            {formatINR(pricing.securityDeposit)}
          </span>
        </div>
      </div>

      {/* Coupon Application Box */}
      <div className="pt-2 border-t border-slate-100">
        <form onSubmit={handleApply} className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Promo code (e.g. FIRST50)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="w-full pl-9 pr-3 py-2 text-xs uppercase font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange outline-none bg-slate-50"
            />
          </div>
          <button
            type="submit"
            disabled={applying || !couponCode.trim()}
            className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-xl disabled:opacity-50 transition-colors shrink-0"
          >
            {applying ? '...' : 'Apply'}
          </button>
        </form>
        {couponError && (
          <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {couponError}
          </p>
        )}
      </div>

      {/* Total Payable Today */}
      <div className="pt-3 border-t-2 border-slate-900 flex items-baseline justify-between">
        <div>
          <div className="font-extrabold text-slate-900 text-base">Total Payable Now</div>
          <div className="text-[10px] text-slate-500 font-medium">Includes rental + ₹{pricing.securityDeposit} refundable deposit</div>
        </div>
        <div className="text-2xl font-black font-heading text-navy-900">
          {formatINR(pricing.totalPayable)}
        </div>
      </div>
    </div>
  );
};

export default PriceBreakdownCard;
