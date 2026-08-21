'use client';

import React, { useState, useEffect } from 'react';
import { PartnerLayout } from '@/components/layouts/PartnerLayout';
import { formatINR } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { TrendingUp, ShieldAlert, Wallet, DollarSign, Lock } from 'lucide-react';

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

  const grossRevenue = metrics?.grossRevenue || 42800;
  const platformCommission = Math.round(grossRevenue * 0.15); // 15%
  const gstTax = Math.round(platformCommission * 0.18); // 18% GST on fee
  const netPayout = metrics?.netPayout || (grossRevenue - platformCommission);

  return (
    <PartnerLayout>
      <div className="max-w-7xl mx-auto space-y-6 font-sans">
        <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black font-heading text-white">Earnings Ledger & Settlement Breakdown</h1>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Financial ledger tracking gross rental volume, platform commissions, GST taxes, and net payout accruals.
          </p>
        </div>

        {/* Escrow Deposit Isolation Banner */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-xs text-emerald-300">
          <Lock className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
          <div>
            <strong className="font-extrabold text-white">Security Deposit Isolation Policy:</strong>
            <p className="mt-0.5 leading-relaxed text-slate-300">
              Rider security deposits are held in isolated escrow for damage protection and are <strong>100% excluded</strong> from vendor gross revenue, platform commission, and earnings accounting. Security deposits are never counted as vendor income.
            </p>
          </div>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Gross Rental Revenue</span>
                <div className="text-2xl font-black text-white">{formatINR(grossRevenue)}</div>
                <div className="text-[11px] text-slate-400">Total base rental fees</div>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Platform Commission (15%)</span>
                <div className="text-2xl font-black text-rose-400">-{formatINR(platformCommission)}</div>
                <div className="text-[11px] text-slate-400">RideSetu marketplace fee</div>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">GST Tax (18%)</span>
                <div className="text-2xl font-black text-amber-400">{formatINR(gstTax)}</div>
                <div className="text-[11px] text-slate-400">Collected on platform fee</div>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Net Vendor Payout</span>
                <div className="text-2xl font-black text-emerald-400">{formatINR(netPayout)}</div>
                <div className="text-[11px] text-slate-400">Eligible for bank settlement</div>
              </div>
            </div>
          </>
        )}
      </div>
    </PartnerLayout>
  );
}
