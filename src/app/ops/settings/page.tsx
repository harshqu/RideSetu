'use client';

import React from 'react';
import { Settings } from 'lucide-react';

export default function OpsSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-black font-heading text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" /> Platform Operations Settings
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Configure security rate-limiting thresholds, platform commission rates, and audit policies.
        </p>
      </div>

      <div className="p-6 bg-slate-950/70 border border-white/10 rounded-3xl space-y-4 text-xs">
        <h3 className="font-extrabold text-white text-base font-heading">Marketplace Financial Rules</h3>
        <div className="space-y-3 text-slate-300">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
            <span>Platform Commission Rate</span>
            <span className="font-bold text-emerald-400">15.0%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
            <span>Customer Platform Fee</span>
            <span className="font-bold text-emerald-400">₹49 / booking</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
            <span>GST Tax Rate</span>
            <span className="font-bold text-emerald-400">18.0%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10">
            <span>Refundable Security Deposit Escrow Isolation</span>
            <span className="font-bold text-emerald-400">100% PROTECTED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
