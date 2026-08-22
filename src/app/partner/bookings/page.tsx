'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DigitalInspectionModal from '@/components/handover/DigitalInspectionModal';
import { formatINR, formatDateTime } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  RefreshCw,
  Search,
  Filter,
  User,
  Car,
} from 'lucide-react';

export default function PartnerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'KANBAN' | 'TABLE'>('KANBAN');
  const [searchQuery, setSearchQuery] = useState('');

  const [inspectionModal, setInspectionModal] = useState<{
    open: boolean;
    bookingId: string;
    vehicleId: string;
    vehicleName: string;
    handoverType: 'PICKUP' | 'RETURN';
  } | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/vendor/bookings');
      const data = await res.json();
      if (data.bookings) setBookings(data.bookings);
    } catch (err) {
      console.error('Bookings load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = bookings.filter(
    (b) =>
      b.bookingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.vehicleId?.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.vehicleId?.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { title: 'Upcoming Pickups', status: 'CONFIRMED', color: 'border-sky-500' },
    { title: 'Handover Required', status: 'HANDOVER_PENDING', color: 'border-amber-500' },
    { title: 'Active Rides', status: 'ACTIVE', color: 'border-emerald-500' },
    { title: 'Returns Due', status: 'RETURN_DUE', color: 'border-purple-500' },
    { title: 'Completed', status: 'COMPLETED', color: 'border-slate-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-black font-heading text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-amber-600" /> Bookings & Digital Handovers
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Manage operational handover queues, mutual photographic check-ins, and return inspections.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center text-xs font-extrabold">
              <button
                onClick={() => setActiveTab('KANBAN')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'KANBAN' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kanban View
              </button>
              <button
                onClick={() => setActiveTab('TABLE')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'TABLE' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Table View
              </button>
            </div>

            <button
              onClick={loadBookings}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Booking ID, vehicle model, or customer name..."
            className="w-full bg-white border border-slate-300 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-brand-orange shadow-sm"
          />
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : activeTab === 'KANBAN' ? (
          /* Kanban Board */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
            {columns.map((col) => {
              const colBookings = filteredBookings.filter(
                (b) => b.bookingStatus === col.status || (col.status === 'CONFIRMED' && !['ACTIVE', 'COMPLETED', 'CANCELLED'].includes(b.bookingStatus))
              );

              return (
                <div key={col.status} className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 min-w-[260px] shadow-sm">
                  <div className={`border-l-4 ${col.color} pl-2 flex items-center justify-between`}>
                    <h3 className="text-xs font-black text-slate-900">{col.title}</h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {colBookings.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {colBookings.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-[11px] font-medium border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        No bookings
                      </div>
                    ) : (
                      colBookings.map((b) => (
                        <div key={b._id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2 text-xs">
                          <div className="flex justify-between items-start">
                            <span className="font-mono text-[10px] text-amber-700 font-bold">#{b.bookingId?.substring(0, 8)}</span>
                            <StatusBadge status={b.bookingStatus} />
                          </div>

                          <div>
                            <div className="font-extrabold text-slate-900">
                              {b.vehicleId?.brand} {b.vehicleId?.model}
                            </div>
                            <div className="text-slate-500 text-[10px] flex items-center gap-1 font-medium">
                              <User className="w-3 h-3 text-slate-400" /> {b.customerId?.name || 'Rider Customer'}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                            <span className="font-black text-emerald-700 text-xs">{formatINR(b.vendorPayout?.netVendorPayout || b.totalAmount)}</span>
                            <button
                              onClick={() =>
                                setInspectionModal({
                                  open: true,
                                  bookingId: b._id,
                                  vehicleId: b.vehicleId?._id || b.vehicleId,
                                  vehicleName: `${b.vehicleId?.brand || ''} ${b.vehicleId?.model || ''}`,
                                  handoverType: b.bookingStatus === 'CONFIRMED' ? 'PICKUP' : 'RETURN',
                                })
                              }
                              className="px-2.5 py-1.5 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-black text-[10px] transition-colors shadow-sm"
                            >
                              Inspect
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-900 uppercase text-[10px] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-4">Booking Reference</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Net Payout</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-amber-700">#{b.bookingId?.substring(0, 8)}</td>
                    <td className="p-4 font-extrabold text-slate-900">{b.vehicleId?.brand} {b.vehicleId?.model}</td>
                    <td className="p-4 text-slate-700 font-medium">{b.customerId?.name || 'Rider Customer'}</td>
                    <td className="p-4 text-[11px] text-slate-500 font-medium">{formatDateTime(b.pickupDateTime)}</td>
                    <td className="p-4"><StatusBadge status={b.bookingStatus} /></td>
                    <td className="p-4 text-right font-black text-emerald-700">{formatINR(b.vendorPayout?.netVendorPayout || b.totalAmount)}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() =>
                          setInspectionModal({
                            open: true,
                            bookingId: b._id,
                            vehicleId: b.vehicleId?._id || b.vehicleId,
                            vehicleName: `${b.vehicleId?.brand || ''} ${b.vehicleId?.model || ''}`,
                            handoverType: b.bookingStatus === 'CONFIRMED' ? 'PICKUP' : 'RETURN',
                          })
                        }
                        className="px-3 py-1.5 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-black text-[11px] min-h-[36px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Handover Inspection Modal */}
        {inspectionModal && (
          <DigitalInspectionModal
            isOpen={inspectionModal.open}
            onClose={() => setInspectionModal(null)}
            bookingId={inspectionModal.bookingId}
            vehicleId={inspectionModal.vehicleId}
            vehicleName={inspectionModal.vehicleName}
            handoverType={inspectionModal.handoverType}
            onInspectionComplete={() => {
              setInspectionModal(null);
              loadBookings();
            }}
          />
        )}
      </div>
  );
}
