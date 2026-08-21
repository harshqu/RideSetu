'use client';

import React, { useState, useEffect } from 'react';
import { PartnerLayout } from '@/components/layouts/PartnerLayout';
import { formatINR } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import {
  TrendingUp,
  Car,
  Star,
  Award,
  AlertTriangle,
  Zap,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function PartnerFleetInsightsPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/vendor/vehicles');
      const data = await res.json();
      if (data.vehicles) setVehicles(data.vehicles);
    } catch (err) {
      console.error('Fleet insights load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const sortedByPrice = [...vehicles].sort((a, b) => (b.pricePerDay || 0) - (a.pricePerDay || 0));

  return (
    <PartnerLayout>
      <div className="max-w-7xl mx-auto space-y-8 font-sans">
        {/* Header */}
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Mobility Telemetry & Demand Insights
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-white mt-1">
              Fleet Insights & Revenue Intelligence
            </h1>
            <p className="text-xs text-slate-300 max-w-xl font-normal leading-relaxed">
              Identify top-revenue vehicles, low-utilization models, maintenance needs, and pricing optimization.
            </p>
          </div>

          <button
            onClick={loadData}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs flex items-center gap-2 border border-white/10"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Insights
          </button>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Top Revenue Leaders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" /> Revenue Leader
                  </h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                    Highest Yield
                  </span>
                </div>
                {sortedByPrice[0] ? (
                  <div className="space-y-2">
                    <div className="text-lg font-black text-white">
                      {sortedByPrice[0].brand} {sortedByPrice[0].model}
                    </div>
                    <div className="text-2xl font-black text-amber-400">{formatINR(sortedByPrice[0].pricePerDay * 28)} / mo</div>
                    <div className="text-xs text-slate-400">Rate: {formatINR(sortedByPrice[0].pricePerDay)} / day</div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">No vehicles</div>
                )}
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" /> Most Booked Model
                  </h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    High Demand
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-lg font-black text-white">Royal Enfield Himalayan 450</div>
                  <div className="text-2xl font-black text-emerald-400">24 Bookings / mo</div>
                  <div className="text-xs text-slate-400">Utilization: 89%</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-sky-400" /> Low Utilization Alert
                  </h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400">
                    Action Required
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-lg font-black text-white">Ather 450X EV</div>
                  <div className="text-2xl font-black text-sky-400">42% Utilization</div>
                  <div className="text-xs text-slate-400">Recommendation: Reduce price by 10% on weekdays</div>
                </div>
              </div>
            </div>

            {/* Demand Recommendations */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Intelligent Demand Recommendations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-1">
                  <div className="font-extrabold text-amber-400">Himalayan Expedition Peak Season</div>
                  <p className="text-slate-300">
                    Weekend demand in Rishikesh & Mussoorie is projected to surge by +35%. Consider enabling delivery options.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-1">
                  <div className="font-extrabold text-emerald-400">No-Deposit Promotion Advantage</div>
                  <p className="text-slate-300">
                    Vehicles configured with ₹0 Security Deposit experience 2.4x higher click-through conversions from riders.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PartnerLayout>
  );
}
