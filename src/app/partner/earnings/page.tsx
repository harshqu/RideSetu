'use client';

import React, { useState, useEffect } from 'react';
import { formatINR } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { TrendingUp, ShieldAlert, Wallet, DollarSign } from 'lucide-react';

export default function PartnerEarningsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/vendor/metrics');
        const data = await res.json();
        if (data.metrics) setMetrics(data.metrics);
      } catch (err) {
        console.error('Vendor metrics error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const grossRevenue = metrics?.grossRevenue || 18450;
  const platformCommission = Math.round(grossRevenue * 0.15); // 15%
  const netPayout = metrics?.netPayout || grossRevenue - platformCommission;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          <h1 className="text-2xl font-black font-heading text-white">Earnings Ledger & Settlement Breakdown</h1>
        </div>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Financial ledger tracking gross rental volume, platform commissions, and net payout accruals.
        </p>
      </div>

      {/* Escrow Deposit Isolation Banner */}
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-xs text-emerald-300">
        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <strong className="font-extrabold text-white">Security Deposit Protection Policy:</strong>
          <p className="mt-0.5 leading-relaxed">
            The <strong>₹1,000 Refundable Security Deposit</strong> paid by riders is strictly held in escrow for damage protection and is 100% excluded from vendor gross revenue, platform commission, and net earnings calculations.
          </p>
        </div>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950/70 p-6 rounded-3xl border border-white/10 space-y-2">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Gross Rental Revenue</span>
            <div className="text-3xl font-black text-white font-heading">{formatINR(grossRevenue)}</div>
            <p className="text-[11px] text-slate-400 font-semibold">Total rental fees paid by riders</p>
          </div>

          <div className="bg-slate-950/70 p-6 rounded-3xl border border-white/10 space-y-2">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Platform Commission (15%)</span>
            <div className="text-3xl font-black text-amber-400 font-heading">-{formatINR(platformCommission)}</div>
            <p className="text-[11px] text-slate-400 font-semibold">RideSetu marketplace facilitation fee</p>
          </div>

          <div className="bg-slate-950/70 p-6 rounded-3xl border border-white/10 space-y-2">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Net Vendor Payout Accrued</span>
            <div className="text-3xl font-black text-emerald-400 font-heading">{formatINR(netPayout)}</div>
            <p className="text-[11px] text-slate-400 font-semibold">Eligible for bank settlement transfer</p>
          </div>
        </div>
      )}
    </div>
  );
}
