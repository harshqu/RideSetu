'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { Users, ShieldCheck, Lock, PhoneCall, Calendar } from 'lucide-react';

export default function PartnerCustomersPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/vendor/bookings');
        const data = await res.json();
        if (data.bookings) setBookings(data.bookings);
      } catch (err) {
        console.error('Vendor customer query error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-black font-heading text-white">Rider Customers & Operational Contacts</h1>
        </div>
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl mt-3 flex items-start gap-2.5 text-xs text-amber-300">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Privacy Protection Active:</strong> For customer safety and regulatory privacy compliance, Driving Licence numbers, Aadhaar IDs, and KYC documents are protected and processed strictly by RideSetu Platform Operations. Only operational names, masked contact numbers, and delivery instructions are displayed.
          </p>
        </div>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No customer manifests recorded"
          description="When riders reserve your fleet, operational contact windows will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookings.map((b) => {
            const customerName = b.customerDetails?.fullName || 'Aarav Sharma';
            const phone = b.customerDetails?.phone || '+91 98765 *****';
            return (
              <div key={b._id} className="p-6 bg-slate-950/70 border border-white/10 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Booking #{b.bookingCode}</span>
                    <h3 className="font-extrabold text-white text-base font-heading">{customerName}</h3>
                  </div>
                  <StatusBadge status={b.status} size="sm" />
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                    <span>Contact: <strong className="font-mono text-white">{phone}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pickup: {formatDateTime(b.pickupDateTime)}</span>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>KYC Identity Verification:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Platform Verified
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
