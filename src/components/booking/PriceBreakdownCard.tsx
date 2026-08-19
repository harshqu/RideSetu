'use client';

import React, { useState } from 'react';
import { formatINR } from '@/lib/utils';
import { ShieldCheck, Tag, Info, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

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
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm animate-pulse space-y-4">
        <div className="h-5 bg-slate-200 rounded-md w-1/2" />
        <div className="h-4 bg-slate-100 rounded-md w-full" />
        <div className="h-4 bg-slate-100 rounded-md w-4/5" />
        <div className="h-10 bg-slate-100 rounded-xl" />
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
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-7 space-y-5 sticky top-20">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-black font-heading text-navy-950 text-lg">
          Itemized Price Breakdown
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Zero hidden fees. Refundable deposit is returned immediately on trip completion.
        </p>
      </div>

      {/* Itemized cost list */}
      <div className="space-y-2.5 text-xs text-slate-700">
        <div className="flex items-center justify-between">
          <span className="font-medium">
            Base Rental ({pricing.durationDays} day{pricing.durationDays > 1 ? 's' : ''} @ {formatINR(pricing.pricePerDay)}/day)
          </span>
          <span className="font-extrabold text-slate-900">{formatINR(pricing.basePrice)}</span>
        </div>

        {pricing.deliveryCharge > 0 && (
          <div className="flex items-center justify-between text-blue-700 font-medium">
            <span>Doorstep Delivery & Relocation</span>
            <span className="font-extrabold">{formatINR(pricing.deliveryCharge)}</span>
          </div>
        )}

        <div className="flex items-center justify-between font-medium">
          <span className="flex items-center gap-1 text-slate-600">
            Platform Convenience & SOS
            <span title="Includes 24/7 Roadside SOS & Digital Handover">
              <Info className="w-3 h-3 text-slate-400" />
            </span>
          </span>
          <span className="font-extrabold text-slate-900">{formatINR(pricing.platformFee)}</span>
        </div>

        <div className="flex items-center justify-between font-medium">
          <span className="text-slate-600">GST (18% Govt. Tax)</span>
          <span className="font-extrabold text-slate-900">{formatINR(pricing.taxes)}</span>
        </div>

        {/* Security Deposit Isolation Banner */}
        <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 space-y-1">
          <div className="flex items-center justify-between text-xs font-black text-emerald-950">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Refundable Security Deposit
            </span>
            <span className="font-heading text-sm">{formatINR(pricing.securityDeposit)}</span>
          </div>
          <p className="text-[10px] text-emerald-800 leading-tight">
            Held in isolated escrow. Released automatically upon digital return inspection.
          </p>
        </div>

        {/* Coupon Discount */}
        {pricing.discountAmount > 0 && (
          <div className="flex items-center justify-between text-brand-orange font-bold pt-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Coupon ({pricing.appliedCoupon?.code || 'DISCOUNT'})
            </span>
            <span>- {formatINR(pricing.discountAmount)}</span>
          </div>
        )}
      </div>

      {/* Coupon Application Box */}
      <form onSubmit={handleApply} className="space-y-1.5 pt-2 border-t border-slate-100">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Promo code (e.g. SETU200)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>
          <button
            type="submit"
            disabled={applying || !couponCode.trim()}
            className="px-4 py-2 bg-navy-950 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-sm transition-all disabled:opacity-50"
          >
            {applying ? 'Applying...' : 'Apply'}
          </button>
        </div>
        {couponError && (
          <p className="text-[10px] text-rose-600 font-semibold">{couponError}</p>
        )}
      </form>

      {/* Total Payable */}
      <div className="pt-3 border-t-2 border-dashed border-slate-200 flex items-baseline justify-between">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Payable</span>
          <p className="text-[10px] text-slate-500 font-semibold">(Includes Rent + Taxes + Deposit)</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black font-heading text-navy-950">
            {formatINR(pricing.totalPayable)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PriceBreakdownCard;
