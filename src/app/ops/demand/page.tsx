'use client';

import React from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Activity, Flame, MapPin } from 'lucide-react';

export default function AdminDemandPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 font-sans">
        <div className="bg-slate-950 p-6 rounded-3xl border border-white/10 space-y-2">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-black font-heading text-white">Demand Intelligence & Dynamic Pricing</h1>
          </div>
          <p className="text-xs text-slate-400">
            Regional surge modeling across Rishikesh, Mussoorie, Dehradun, Haridwar, Nainital, and Haldwani.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white flex items-center gap-1">📍 Rishikesh</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">High Surge (1.2x)</span>
            </div>
            <div className="text-2xl font-black text-amber-400">92% Fleet Utilization</div>
            <div className="text-xs text-slate-400">Peak demand for RE Himalayan & Activa</div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white flex items-center gap-1">📍 Mussoorie</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">Moderate Surge (1.1x)</span>
            </div>
            <div className="text-2xl font-black text-emerald-400">84% Fleet Utilization</div>
            <div className="text-xs text-slate-400">High demand for Self-Drive SUVs</div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white flex items-center gap-1">📍 Nainital</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold">Standard</span>
            </div>
            <div className="text-2xl font-black text-sky-400">76% Fleet Utilization</div>
            <div className="text-xs text-slate-400">Balanced scooter & motorcycle demand</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
