'use client';

import React, { useState, useEffect } from 'react';
import { Store, CheckCircle2, XCircle } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function OpsVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/vendors');
      const data = await res.json();
      if (data.vendors) setVendors(data.vendors);
    } catch (err) {
      console.error('Ops vendors error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleApproveVendor = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE' }),
      });
      if (res.ok) loadVendors();
    } catch (err) {
      alert('Failed to approve vendor');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-black font-heading text-white flex items-center gap-2">
          <Store className="w-6 h-6 text-emerald-400" /> Partner Vendor Governance & Onboarding
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Review, approve, or reject mobility partner business applications and trade licenses.
        </p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="bg-slate-950/70 rounded-3xl border border-white/10 p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="pb-3">Business Name</th>
                <th className="pb-3">Owner</th>
                <th className="pb-3">City Hub</th>
                <th className="pb-3">GST Number</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {vendors.map((v) => (
                <tr key={v._id} className="hover:bg-white/5">
                  <td className="py-3.5 font-bold text-white font-heading">{v.businessName}</td>
                  <td className="py-3.5 text-slate-300">{v.ownerName} ({v.phone})</td>
                  <td className="py-3.5 text-slate-400">{v.city || 'Rishikesh'}</td>
                  <td className="py-3.5 font-mono text-amber-400">{v.gstNumber || '05XXXXX0000X1Z5'}</td>
                  <td className="py-3.5"><StatusBadge status={v.status} size="sm" /></td>
                  <td className="py-3.5 text-right">
                    {v.status !== 'VERIFIED' && (
                      <button
                        onClick={() => handleApproveVendor(v._id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[11px] shadow-sm"
                      >
                        Approve Partner
                      </button>
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
