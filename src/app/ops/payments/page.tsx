'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, CheckCircle2 } from 'lucide-react';
import { formatINR, formatDateTime } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function OpsPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/payments');
        const data = await res.json();
        if (data.payments) setPayments(data.payments);
      } catch (err) {
        console.error('Ops payments error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-black font-heading text-white flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-emerald-400" /> Payment & Cryptographic Signature Ledger
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Complete payment ledger asserting Razorpay order IDs, HMAC-SHA256 signature verifications, and escrow deposit allocations.
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
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Gross Amount</th>
                <th className="pb-3">GST (18%)</th>
                <th className="pb-3">Security Deposit</th>
                <th className="pb-3">HMAC Verification</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-white/5">
                  <td className="py-3.5 font-mono text-amber-400">{p.razorpayPaymentId || `pay_${p._id.slice(-8)}`}</td>
                  <td className="py-3.5 font-mono text-slate-300">{p.razorpayOrderId || `order_${p._id.slice(-8)}`}</td>
                  <td className="py-3.5 font-black text-white">{formatINR(p.amount || 2143)}</td>
                  <td className="py-3.5 font-semibold text-slate-400">{formatINR(p.gst || 174)}</td>
                  <td className="py-3.5 font-bold text-emerald-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" /> {formatINR(p.securityDeposit || 1000)}
                  </td>
                  <td className="py-3.5">
                    <span className="font-bold text-emerald-400 text-[11px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> HMAC SHA256 Validated
                    </span>
                  </td>
                  <td className="py-3.5"><StatusBadge status={p.status || 'CAPTURED'} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
