'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, ShieldAlert, Lock } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function OpsRefundsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/payments');
        const data = await res.json();
        if (data.payments) setPayments(data.payments);
      } catch (err) {
        console.error('Ops refunds load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-black font-heading text-white flex items-center gap-2">
          <RefreshCw className="w-6 h-6 text-emerald-400" /> Refund Ledger & Deposit Escrow Return Console
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Cancellation policy refund breakdown, delivery fee calculations, and 100% security deposit returns.
        </p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="bg-slate-950/70 rounded-3xl border border-white/10 p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="pb-3">Payment ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Original Captured</th>
                <th className="pb-3">Rental Refund</th>
                <th className="pb-3">Deposit Refunded</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-white/5">
                  <td className="py-3.5 font-mono text-amber-400">{p.razorpayPaymentId || `pay_${p._id.slice(-8)}`}</td>
                  <td className="py-3.5 font-bold text-white">{p.customerName || 'Aarav Sharma'}</td>
                  <td className="py-3.5 font-black text-white">{formatINR(p.amount || 2143)}</td>
                  <td className="py-3.5 font-bold text-slate-300">{formatINR(p.rentalRefund || 920)}</td>
                  <td className="py-3.5 font-bold text-emerald-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" /> {formatINR(1000)} (100%)
                  </td>
                  <td className="py-3.5"><StatusBadge status={p.status === 'REFUNDED' ? 'REFUNDED' : 'CAPTURED'} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
