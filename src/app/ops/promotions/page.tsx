'use client';

import React from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Star, Tag, Gift, Percent } from 'lucide-react';

export default function AdminPromotionsPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6 font-sans">
        <div className="bg-slate-950 p-6 rounded-3xl border border-white/10 space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-black font-heading text-white">Promotions & Dynamic Coupon Engine</h1>
          </div>
          <p className="text-xs text-slate-400">
            Manage seasonal discount coupons, first-ride promo codes, and Uttarakhand travel partner referrals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black text-amber-400">RIDEHIMALAYA</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Active</span>
            </div>
            <div className="text-xl font-black text-white">15% OFF Base Fare</div>
            <div className="text-xs text-slate-400">Min. rental 2 days • Max discount ₹500</div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black text-amber-400">WELCOME200</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Active</span>
            </div>
            <div className="text-xl font-black text-white">Flat ₹200 OFF</div>
            <div className="text-xs text-slate-400">Valid for new riders on scooter bookings</div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black text-amber-400">CHARDAAM2026</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold">Upcoming</span>
            </div>
            <div className="text-xl font-black text-white">10% OFF Expedition</div>
            <div className="text-xs text-slate-400">Valid for Himalayan 450 long-haul rentals</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
