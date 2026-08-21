'use client';

import React from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Filter, Users, Eye, CheckCircle2 } from 'lucide-react';

export default function AdminFunnelPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 font-sans">
        <div className="bg-slate-950 p-6 rounded-3xl border border-white/10 space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-black font-heading text-white">Marketplace Conversion Funnel</h1>
          </div>
          <p className="text-xs text-slate-400">
            End-to-end conversion tracking from homepage search to deposit authorization and booking confirmation.
          </p>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-white">1. Marketplace Impressions & Search</span>
              <span className="font-black text-amber-400">12,450 Visits (100%)</span>
            </div>
            <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-amber-500 rounded-full w-full"></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-white">2. Vehicle Listing Views & Gallery Inspect</span>
              <span className="font-black text-sky-400">4,820 Views (38.7%)</span>
            </div>
            <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-sky-500 rounded-full w-[38.7%]"></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-white">3. Checkout & Deposit Escrow Confirmation</span>
              <span className="font-black text-emerald-400">1,240 Bookings (10.0%)</span>
            </div>
            <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-emerald-500 rounded-full w-[10%]"></div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
