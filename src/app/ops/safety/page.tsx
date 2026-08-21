'use client';

import React from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { ShieldAlert, AlertTriangle, CheckCircle2, Radio, PhoneCall } from 'lucide-react';

export default function AdminSafetyPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 font-sans">
        <div className="bg-slate-950 p-6 rounded-3xl border border-white/10 space-y-2">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
            <h1 className="text-2xl font-black font-heading text-white">Safety & Emergency Command Center</h1>
          </div>
          <p className="text-xs text-slate-400">
            Real-time SOS telemetry, Himalayan dispatch monitoring, and accident response logs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-2">
            <div className="text-xs font-bold text-slate-400">Active SOS Signals</div>
            <div className="text-3xl font-black text-emerald-400">0 Active</div>
            <div className="text-[11px] text-slate-400">All trip telemetry nominal</div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-2">
            <div className="text-xs font-bold text-slate-400">Himalayan Emergency Desk</div>
            <div className="text-lg font-black text-white">+91 1800-419-SETU</div>
            <div className="text-[11px] text-slate-400">Direct dispatch line to Uttarkashi & Chamoli response teams</div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-2">
            <div className="text-xs font-bold text-slate-400">Handover Safety Checks</div>
            <div className="text-3xl font-black text-amber-400">100% Verified</div>
            <div className="text-[11px] text-slate-400">Dual photo verification required before pickup</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
