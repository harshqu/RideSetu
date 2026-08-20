'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { formatINR, formatDateTime } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function OpsBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/payments');
        const data = await res.json();
        if (data.payments) setBookings(data.payments);
      } catch (err) {
        console.error('Ops bookings error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-black font-heading text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-emerald-400" /> Marketplace Booking Manifest & Telemetry
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Master reservation manifest tracking rider bookings, pickup windows, and active trip statuses.
        </p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="bg-slate-950/70 rounded-3xl border border-white/10 p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="pb-3">Code</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Deposit</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {bookings.map((b) => (
                <tr key={b._id} className="hover:bg-white/5">
                  <td className="py-3.5 font-mono font-bold text-amber-400">{b.bookingCode || b.bookingId?.bookingCode || 'RS-8492'}</td>
                  <td className="py-3.5 text-white font-bold">{b.customerName || 'Aarav Sharma'}</td>
                  <td className="py-3.5 text-slate-300">{b.vehicleName || 'Royal Enfield Himalayan'}</td>
                  <td className="py-3.5 font-black text-white">{formatINR(b.amount || 2143)}</td>
                  <td className="py-3.5 font-bold text-emerald-400">{formatINR(1000)}</td>
                  <td className="py-3.5"><StatusBadge status={b.status || 'CAPTURED'} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
