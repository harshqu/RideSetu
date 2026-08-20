'use client';

import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function OpsKycPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadKyc = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/kyc');
      const data = await res.json();
      if (data.queue) setQueue(data.queue);
    } catch (err) {
      console.error('KYC load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKyc();
  }, []);

  const handleKycAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch(`/api/admin/kyc/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: action === 'REJECT' ? 'Document unreadable' : undefined }),
      });
      if (res.ok) loadKyc();
    } catch (err) {
      alert('KYC verification action failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-black font-heading text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-emerald-400" /> Customer KYC & Driving Licence Review Queue
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Authorized verification queue for customer Driving Licences, identity documents, and motor category eligibility.
        </p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="bg-slate-950/70 rounded-3xl border border-white/10 p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="pb-3">Rider Name</th>
                <th className="pb-3">DL Number</th>
                <th className="pb-3">DL Expiry</th>
                <th className="pb-3">Vehicle Class</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Verification Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {queue.map((item) => (
                <tr key={item._id} className="hover:bg-white/5">
                  <td className="py-3.5 font-bold text-white font-heading">{item.customerName || item.name}</td>
                  <td className="py-3.5 font-mono text-emerald-400">{item.dlNumber || 'UK0720240012345'}</td>
                  <td className="py-3.5 text-slate-300">2030-12-31</td>
                  <td className="py-3.5 text-slate-400">MCWG / LMV</td>
                  <td className="py-3.5"><StatusBadge status={item.kycStatus || 'UNDER_REVIEW'} size="sm" /></td>
                  <td className="py-3.5 text-right space-x-2">
                    {item.kycStatus !== 'VERIFIED' && (
                      <>
                        <button
                          onClick={() => handleKycAction(item._id, 'APPROVE')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[11px]"
                        >
                          Approve DL
                        </button>
                        <button
                          onClick={() => handleKycAction(item._id, 'REJECT')}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-[11px]"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
