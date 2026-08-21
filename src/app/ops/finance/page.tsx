'use client';

import React from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { formatINR } from '@/lib/utils';
import { CreditCard, Lock, ShieldCheck, DollarSign, Wallet } from 'lucide-react';

export default function AdminFinancePage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 font-sans">
        <div className="bg-slate-950 p-6 rounded-3xl border border-white/10 space-y-2">
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black font-heading text-white">Financial Ledger & Escrow Isolation</h1>
          </div>
          <p className="text-xs text-slate-400">
            Enterprise financial accounting tracking GMV, platform take-rate, GST tax liabilities, and security deposit escrow.
          </p>
        </div>

        {/* Security Deposit Escrow Policy Banner */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-xs text-emerald-300">
          <Lock className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
          <div>
            <strong className="font-extrabold text-white">Mandatory Escrow Isolation Rule:</strong>
            <p className="mt-0.5 leading-relaxed text-slate-300">
              Rider security deposits (₹500 - ₹5,000) are held in isolated bank escrow and are <strong>100% EXCLUDED</strong> from platform gross revenue, platform take-rate, and vendor income. Deposits are strictly returned or settled for verified damage repair.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase">Gross Rental Revenue</span>
            <div className="text-2xl font-black text-white">{formatINR(845200)}</div>
            <div className="text-[11px] text-slate-400">Base customer payments</div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase">Platform Take-Rate (15%)</span>
            <div className="text-2xl font-black text-emerald-400">{formatINR(126780)}</div>
            <div className="text-[11px] text-slate-400">RideSetu gross fee</div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase">GST Tax Collected (18%)</span>
            <div className="text-2xl font-black text-amber-400">{formatINR(22820)}</div>
            <div className="text-[11px] text-slate-400">Remitted to tax authority</div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase">Security Deposit Escrow</span>
            <div className="text-2xl font-black text-sky-400">{formatINR(142000)}</div>
            <div className="text-[11px] text-slate-400 font-bold">100% Isolated in Escrow</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
