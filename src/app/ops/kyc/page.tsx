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
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black font-heading text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-emerald-600" /> Customer KYC & Driving License Review Queue
        </h1>
        <p className="text-xs text-slate-600 font-medium mt-1">
          Authorized verification queue for customer Driving Licences, identity documents, and motor category eligibility.
        </p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-extrabold uppercase text-[10px] border-b border-slate-200">
                <th className="py-3 px-4 rounded-l-xl">Rider Name</th>
                <th className="py-3 px-4">DL Number</th>
                <th className="py-3 px-4">DL Expiry</th>
                <th className="py-3 px-4">Vehicle Class</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Verification Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {queue.map((item) => (
                <tr key={item._id} className="hover:bg-amber-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 font-heading">{item.customerName || item.name}</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold">{item.dlNumber || 'UK0720240012345'}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">2030-12-31</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">MCWG / LMV</td>
                  <td className="py-3.5 px-4"><StatusBadge status={item.kycStatus || 'UNDER_REVIEW'} size="sm" /></td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {item.kycStatus !== 'VERIFIED' && (
                      <>
                        <button
                          onClick={() => handleKycAction(item._id, 'APPROVE')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] shadow-sm min-h-[36px]"
                        >
                          Approve DL
                        </button>
                        <button
                          onClick={() => handleKycAction(item._id, 'REJECT')}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 font-bold text-[11px] min-h-[36px]"
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
