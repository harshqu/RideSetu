'use client';

import React from 'react';
import { HelpCircle, Phone, Mail, ShieldCheck, FileText } from 'lucide-react';

export default function PartnerHelpPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-black font-heading text-white">Partner Help & Fleet Support</h1>
        </div>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Dedicated assistance for verified Uttarakhand mobility hosts and fleet operators.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 bg-slate-950/70 border border-white/10 rounded-3xl space-y-3 text-xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-white text-base font-heading">Partner Support Hotline</h3>
          <p className="text-slate-300">Direct phone line for active handover support, roadside assistance, and vehicle disputes.</p>
          <div className="font-mono font-bold text-amber-400 text-sm pt-2">+91 1800 123 7433 (8 AM – 10 PM)</div>
        </div>

        <div className="p-6 bg-slate-950/70 border border-white/10 rounded-3xl space-y-3 text-xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-white text-base font-heading">Partner Operations Email</h3>
          <p className="text-slate-300">Email support for payout inquiries, trade document verification, and fleet onboarding.</p>
          <div className="font-mono font-bold text-emerald-400 text-sm pt-2">partners@ridesetu.in</div>
        </div>
      </div>
    </div>
  );
}
