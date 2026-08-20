'use client';

import React, { useState, useEffect } from 'react';
import { AlertOctagon, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function OpsDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDisputes() {
      try {
        setLoading(true);
        const res = await fetch('/api/disputes');
        const data = await res.json();
        if (data.disputes) setDisputes(data.disputes);
      } catch (err) {
        console.error('Ops disputes load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDisputes();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-black font-heading text-white flex items-center gap-2">
          <AlertOctagon className="w-6 h-6 text-rose-400" /> Customer-Vendor Dispute Resolution Console
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Arbitration suite for vehicle damage claims, security deposit holds, and late return fee disputes.
        </p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : disputes.length === 0 ? (
        <div className="p-8 bg-slate-950/70 rounded-3xl border border-white/10 text-center space-y-2">
          <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="font-extrabold text-white text-base">No open marketplace disputes</h3>
          <p className="text-xs text-slate-400">All trip handovers and security deposit releases are operating cleanly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d._id} className="p-5 bg-slate-950/70 border border-white/10 rounded-3xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Dispute Case #{d._id.slice(-6)}</span>
                <StatusBadge status={d.status} size="sm" />
              </div>
              <p className="text-slate-300">Issue: {d.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
