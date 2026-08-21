'use client';

import React, { useState } from 'react';
import { PartnerLayout } from '@/components/layouts/PartnerLayout';
import { ShieldAlert, PhoneCall, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export default function PartnerSafetyPage() {
  return (
    <PartnerLayout>
      <div className="max-w-7xl mx-auto space-y-8 font-sans">
        {/* Header */}
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 text-white space-y-2 shadow-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" /> Partner Safety & SOS Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-white">
            Roadside Assistance & Incident Management
          </h1>
          <p className="text-xs text-slate-300 max-w-xl font-normal leading-relaxed">
            Monitor real-time SOS alerts, active mechanical dispatches, and roadside assistance cases for your fleet.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-2">
            <div className="text-xs font-bold text-slate-400">Active SOS Incidents</div>
            <div className="text-3xl font-black text-emerald-400">0</div>
            <div className="text-[11px] text-slate-400">All fleet riders active & safe</div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-2">
            <div className="text-xs font-bold text-slate-400">Mechanical Dispatches</div>
            <div className="text-3xl font-black text-amber-400">0</div>
            <div className="text-[11px] text-slate-400">24/7 Himalayan dispatch active</div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-2">
            <div className="text-xs font-bold text-slate-400">Partner SOS Hotline</div>
            <div className="text-lg font-black text-white">+91 1800-419-SETU</div>
            <div className="text-[11px] text-slate-400">24/7 Priority Emergency Control</div>
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4 text-xs text-slate-300">
          <h3 className="text-base font-black text-white">Emergency Protocol for Partners</h3>
          <ul className="space-y-2 list-disc list-inside text-slate-400">
            <li>In case of a breakdown in mountain areas, riders can press the SOS button to alert our local roadside unit.</li>
            <li>Mutual photographic check-ins verify pre-existing vehicle condition to protect both rider and host.</li>
            <li>Support agents remain on call 24/7 for accident assistance or emergency towing.</li>
          </ul>
        </div>
      </div>
    </PartnerLayout>
  );
}
