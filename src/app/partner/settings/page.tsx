'use client';

import React from 'react';
import { Settings, ShieldCheck } from 'lucide-react';

export default function PartnerSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-black font-heading text-white">Partner Portal Settings</h1>
        </div>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Configure operational alerts, auto-approval parameters, and delivery options.
        </p>
      </div>

      <div className="p-6 bg-slate-950/70 border border-white/10 rounded-3xl space-y-4 text-xs">
        <h3 className="font-extrabold text-white text-base font-heading">Notification & Delivery Parameters</h3>
        <div className="space-y-3 text-slate-300">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
            <span>Instant SMS & WhatsApp Booking Alerts</span>
            <span className="font-bold text-emerald-400">ENABLED</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
            <span>Hotel & Doorstep Delivery Service</span>
            <span className="font-bold text-emerald-400">ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
