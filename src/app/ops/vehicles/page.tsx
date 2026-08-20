'use client';

import React, { useState, useEffect } from 'react';
import { Car, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function OpsVehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/vehicles');
      const data = await res.json();
      if (data.vehicles) setVehicles(data.vehicles);
    } catch (err) {
      console.error('Ops vehicles error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-black font-heading text-white flex items-center gap-2">
          <Car className="w-6 h-6 text-emerald-400" /> Marketplace Fleet Verification & Control
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Master registry of all listed two-wheelers and cars across Uttarakhand destinations.
        </p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="bg-slate-950/70 rounded-3xl border border-white/10 p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Reg. Number</th>
                <th className="pb-3">Daily Price</th>
                <th className="pb-3">Security Deposit</th>
                <th className="pb-3">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {vehicles.map((v) => (
                <tr key={v._id} className="hover:bg-white/5">
                  <td className="py-3.5 font-bold text-white font-heading">{v.brand} {v.model}</td>
                  <td className="py-3.5 text-slate-300">{v.category}</td>
                  <td className="py-3.5 font-mono text-amber-400">{v.registrationNumber || 'UK07-XX-0000'}</td>
                  <td className="py-3.5 font-black text-white">{formatINR(v.pricePerDay)}/day</td>
                  <td className="py-3.5 font-bold text-emerald-400">{formatINR(v.securityDeposit)}</td>
                  <td className="py-3.5"><StatusBadge status={v.status || 'APPROVED'} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
