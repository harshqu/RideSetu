'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function OpsCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/kyc');
        const data = await res.json();
        if (data.queue) setCustomers(data.queue);
      } catch (err) {
        console.error('Ops customers load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-heading text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" /> Customer Account & Identity Registry
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Authorized administrative management for rider accounts, KYC statuses, and licence verifications.
          </p>
        </div>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="bg-slate-950/70 rounded-3xl border border-white/10 p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="pb-3">Customer Name</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">DL Number</th>
                <th className="pb-3">KYC Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {customers.map((c) => (
                <tr key={c._id} className="hover:bg-white/5">
                  <td className="py-3.5 font-bold text-white font-heading">{c.name || c.customerName}</td>
                  <td className="py-3.5 font-mono text-slate-300">{c.phone || '+91 98765 43210'}</td>
                  <td className="py-3.5 text-slate-400">{c.email || 'rider@example.com'}</td>
                  <td className="py-3.5 font-mono font-bold text-emerald-400">{c.dlNumber || 'UK0720240012345'}</td>
                  <td className="py-3.5"><StatusBadge status={c.kycStatus || 'VERIFIED'} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
