'use client';

import React from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { formatINR } from '@/lib/utils';
import { Activity, TrendingUp, Users, Car, MapPin, DollarSign } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 font-sans">
        <div className="bg-slate-950 p-6 rounded-3xl border border-white/10 space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black font-heading text-white">Marketplace BI & Telemetry Analytics</h1>
          </div>
          <p className="text-xs text-slate-400">
            Enterprise analytics on GMV trends, rental duration metrics, customer lifetime value, and hub performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-2">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase">Gross Marketplace Volume</div>
            <div className="text-2xl font-black text-white">{formatINR(845200)}</div>
            <div className="text-[11px] text-emerald-400 font-bold">+28.4% vs last month</div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-2">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase">Average Rental Duration</div>
            <div className="text-2xl font-black text-amber-400">2.8 Days</div>
            <div className="text-[11px] text-slate-400">Weekend peak: 3.4 days</div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-2">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase">Top Destination Hub</div>
            <div className="text-2xl font-black text-emerald-400">Rishikesh</div>
            <div className="text-[11px] text-slate-400">42% of total marketplace bookings</div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-2">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase">Cancellation Rate</div>
            <div className="text-2xl font-black text-sky-400">1.8%</div>
            <div className="text-[11px] text-slate-400">Well below 5.0% threshold</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
