'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatINR } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { Car, Plus, RefreshCw, Eye } from 'lucide-react';

export default function PartnerFleetPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFleet = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/vendor/vehicles');
      const data = await res.json();
      if (data.vehicles) setVehicles(data.vehicles);
    } catch (err) {
      console.error('Fleet loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFleet();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black font-heading text-white flex items-center gap-2">
            <Car className="w-6 h-6 text-amber-400" /> Fleet Inventory Management ({vehicles.length})
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Manage active scooters, motorcycles, and cars listed on the RideSetu Uttarakhand marketplace.
          </p>
        </div>
        <button
          onClick={loadFleet}
          className="p-2.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all flex items-center gap-1.5"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Fleet
        </button>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : vehicles.length === 0 ? (
        <EmptyState
          title="No vehicles in inventory"
          description="List your verified two-wheelers or cars to receive instant customer rental requests."
        />
      ) : (
        <div className="bg-slate-950/70 rounded-3xl border border-white/10 p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Reg. Number</th>
                <th className="pb-3">Daily Rate</th>
                <th className="pb-3">Security Deposit</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {vehicles.map((v) => (
                <tr key={v._id} className="hover:bg-white/5">
                  <td className="py-3.5 flex items-center gap-3">
                    <div className="w-12 h-9 rounded-lg bg-slate-800 relative overflow-hidden shrink-0">
                      <Image
                        src={v.images?.[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=100&q=80'}
                        alt={v.model}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <span className="font-extrabold text-white font-heading">{v.brand} {v.model}</span>
                  </td>
                  <td className="py-3.5 font-semibold text-slate-300">{v.category}</td>
                  <td className="py-3.5 font-mono font-bold text-amber-400">{v.registrationNumber || 'UK07-XX-0000'}</td>
                  <td className="py-3.5 font-black text-white font-heading">{formatINR(v.pricePerDay)}/day</td>
                  <td className="py-3.5 font-bold text-emerald-400">{formatINR(v.securityDeposit)}</td>
                  <td className="py-3.5"><StatusBadge status={v.status || 'APPROVED'} size="sm" /></td>
                  <td className="py-3.5 text-right">
                    <Link href={`/vehicles/${v._id}`} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs inline-flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Preview Listing
                    </Link>
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
