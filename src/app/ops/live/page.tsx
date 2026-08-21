'use client';

import React from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Activity, Radio, MapPin, CheckCircle2 } from 'lucide-react';

export default function AdminLiveOpsPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 font-sans">
        <div className="bg-slate-950 p-6 rounded-3xl border border-white/10 space-y-2">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h1 className="text-2xl font-black font-heading text-white">Live Operations & Active Telemetry</h1>
          </div>
          <p className="text-xs text-slate-400">
            Real-time Uttarakhand trip monitoring, active handovers, and hub readiness telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-2">
            <div className="text-xs font-bold text-slate-400">Active Himalayan Trips</div>
            <div className="text-3xl font-black text-emerald-400">18 Active</div>
            <div className="text-[11px] text-slate-400">Rishikesh, Mussoorie & Nainital circuits</div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-2">
            <div className="text-xs font-bold text-slate-400">Handovers Scheduled Today</div>
            <div className="text-3xl font-black text-amber-400">12 Pending</div>
            <div className="text-[11px] text-slate-400">Photographic check-in active</div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-2">
            <div className="text-xs font-bold text-slate-400">Hub Telemetry Status</div>
            <div className="text-lg font-black text-white">● ALL 6 HUBS ONLINE</div>
            <div className="text-[11px] text-emerald-400 font-bold">100% Operational Readiness</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
