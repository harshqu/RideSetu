'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatINR } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import AddEditVehicleModal from '@/components/vendor/AddEditVehicleModal';
import VehiclePreviewModal from '@/components/vendor/VehiclePreviewModal';
import {
  Car,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  PauseCircle,
  PlayCircle,
  Trash2,
  Filter,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function PartnerFleetPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [errorMsg, setErrorMsg] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [previewVehicle, setPreviewVehicle] = useState<any>(null);

  const loadFleet = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch('/api/vendor/vehicles');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load fleet');
      }
      if (data.vehicles) setVehicles(data.vehicles);
    } catch (err: any) {
      console.error('Fleet loading error:', err);
      setErrorMsg(err.message || 'Failed to fetch partner fleet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFleet();
  }, []);

  const handleTogglePause = async (v: any) => {
    try {
      setErrorMsg('');
      const newStatus = v.status === 'PAUSED' ? 'APPROVED' : 'PAUSED';
      const isAvailable = newStatus === 'APPROVED';

      const res = await fetch(`/api/vendor/vehicles/${v._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, isAvailable }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update vehicle status');

      setActionSuccessMsg(`Vehicle ${v.brand} ${v.model} is now ${newStatus === 'APPROVED' ? 'Active' : 'Paused'}.`);
      setTimeout(() => setActionSuccessMsg(''), 3000);
      loadFleet();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to toggle vehicle status.');
    }
  };

  const handleDeleteVehicle = async (v: any) => {
    if (!confirm(`Are you sure you want to remove ${v.brand} ${v.model} (${v.registrationNumber}) from your fleet?`)) {
      return;
    }

    try {
      setErrorMsg('');
      const res = await fetch(`/api/vendor/vehicles/${v._id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete vehicle');

      setActionSuccessMsg('Vehicle removed from fleet successfully.');
      setTimeout(() => setActionSuccessMsg(''), 3000);
      loadFleet();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete vehicle.');
    }
  };

  // Filtered vehicles
  const filteredVehicles = vehicles.filter((v) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return v.status === 'APPROVED' && v.isAvailable;
    if (statusFilter === 'DRAFT') return v.status === 'DRAFT';
    if (statusFilter === 'UNDER_REVIEW') return v.status === 'UNDER_REVIEW';
    if (statusFilter === 'PAUSED') return v.status === 'PAUSED' || v.status === 'INACTIVE';
    if (statusFilter === 'REJECTED') return v.status === 'REJECTED';
    return true;
  });

  // KPI Counters
  const totalFleetCount = vehicles.length;
  const activeCount = vehicles.filter((v) => v.status === 'APPROVED' && v.isAvailable).length;
  const reviewCount = vehicles.filter((v) => v.status === 'UNDER_REVIEW').length;
  const draftCount = vehicles.filter((v) => v.status === 'DRAFT').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black font-heading text-slate-900 flex items-center gap-2">
            <Car className="w-6 h-6 text-amber-600" /> Fleet Management Workspace ({totalFleetCount})
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Manage your verified scooters, motorcycles, and cars on the RideSetu Uttarakhand marketplace.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={loadFleet}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 min-h-[44px]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => {
              setEditingVehicle(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-orange-500/20 min-h-[44px]"
          >
            <Plus className="w-4 h-4" /> + Add New Vehicle
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Inventory</span>
          <div className="text-2xl font-black text-slate-900 font-heading">{totalFleetCount} Vehicles</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 space-y-1 shadow-sm">
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">Active Marketplace</span>
          <div className="text-2xl font-black text-emerald-700 font-heading">{activeCount} Vehicles</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-1 shadow-sm">
          <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">Under Review</span>
          <div className="text-2xl font-black text-amber-700 font-heading">{reviewCount} Pending</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Unpublished Drafts</span>
          <div className="text-2xl font-black text-slate-700 font-heading">{draftCount} Drafts</div>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {actionSuccessMsg}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs">
        {[
          { id: 'ALL', label: `All Fleet (${vehicles.length})` },
          { id: 'ACTIVE', label: `Active (${activeCount})` },
          { id: 'UNDER_REVIEW', label: `Under Review (${reviewCount})` },
          { id: 'DRAFT', label: `Drafts (${draftCount})` },
          { id: 'PAUSED', label: 'Paused / Inactive' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              statusFilter === tab.id
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Table Content */}
      {loading ? (
        <DashboardSkeleton />
      ) : filteredVehicles.length === 0 ? (
        <EmptyState
          title="No vehicles found in fleet"
          description="Click '+ Add New Vehicle' above to list scooters, bikes, or cars for customer bookings."
          actionText="Add Vehicle"
          onAction={() => {
            setEditingVehicle(null);
            setIsAddModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-extrabold uppercase text-[10px] border-b border-slate-200">
                <th className="py-3 px-4 rounded-l-xl">Vehicle Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Reg. Number</th>
                <th className="py-3 px-4">Daily Rate</th>
                <th className="py-3 px-4">Security Deposit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredVehicles.map((v) => {
                const depositEnabled = v.securityDepositEnabled ?? true;
                const depositAmt = depositEnabled ? (v.securityDepositAmount ?? v.securityDeposit ?? 1000) : 0;

                return (
                  <tr key={v._id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="py-4 px-4 flex items-center gap-3">
                      <div className="w-14 h-10 rounded-xl bg-slate-100 relative overflow-hidden shrink-0 border border-slate-200">
                        <Image
                          src={v.images?.[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=100&q=80'}
                          alt={v.model}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm font-heading block">
                          {v.brand} {v.model}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {v.year} • {v.fuelType} • {v.transmission}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700">{v.category}</td>
                    <td className="py-4 px-4 font-mono font-bold text-amber-700">{v.registrationNumber || 'UK07-XX-0000'}</td>
                    <td className="py-4 px-4 font-black text-slate-900 font-heading text-sm">{formatINR(v.pricePerDay)}/day</td>
                    <td className="py-4 px-4">
                      {depositEnabled ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs">
                          {formatINR(depositAmt)}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200">
                          ₹0 (No Deposit)
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={v.status || 'APPROVED'} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewVehicle(v)}
                          title="Preview Customer Listing"
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs inline-flex items-center gap-1 min-h-[44px]"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                        <button
                          onClick={() => {
                            setEditingVehicle(v);
                            setIsAddModalOpen(true);
                          }}
                          title="Edit Vehicle Details"
                          className="p-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs inline-flex items-center gap-1 min-h-[44px] border border-amber-200"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        {v.status === 'APPROVED' && (
                          <button
                            onClick={() => handleTogglePause(v)}
                            title={v.isAvailable ? 'Pause Listing' : 'Resume Listing'}
                            className={`p-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 min-h-[44px] ${
                              v.isAvailable ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {v.isAvailable ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                            {v.isAvailable ? 'Pause' : 'Resume'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteVehicle(v)}
                          title="Remove Vehicle"
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-600 transition-all min-h-[44px]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      <AddEditVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingVehicle(null);
        }}
        vehicle={editingVehicle}
        onSuccess={() => {
          loadFleet();
        }}
      />

      {/* Vehicle Preview Modal */}
      <VehiclePreviewModal
        isOpen={Boolean(previewVehicle)}
        onClose={() => setPreviewVehicle(null)}
        vehicle={previewVehicle}
      />
    </div>
  );
}
