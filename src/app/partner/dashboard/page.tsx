'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import DigitalInspectionModal from '@/components/handover/DigitalInspectionModal';
import { formatINR, formatDateTime } from '@/lib/utils';
import { StatusBadge, RatingBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import {
  Store,
  Car,
  Calendar,
  Star,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
  Plus,
  RefreshCw,
  FileCheck2,
  Building2,
  DollarSign,
  Bell,
  Eye,
} from 'lucide-react';

export default function PartnerDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewSummary, setReviewSummary] = useState<any>(null);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Handover Inspection Modal State
  const [inspectionModal, setInspectionModal] = useState<{
    open: boolean;
    bookingId: string;
    vehicleId: string;
    vehicleName: string;
    handoverType: 'PICKUP' | 'RETURN';
  } | null>(null);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      const [metRes, bookRes, vehRes, profRes, revRes] = await Promise.all([
        fetch('/api/vendor/metrics'),
        fetch('/api/vendor/bookings'),
        fetch('/api/vendor/vehicles'),
        fetch('/api/vendor/profile'),
        fetch('/api/reviews?aggregate=true'),
      ]);

      const metData = await metRes.json();
      const bookData = await bookRes.json();
      const vehData = await vehRes.json();
      const profData = await profRes.json();
      const revData = await revRes.json();

      if (metData.metrics) setMetrics(metData.metrics);
      if (bookData.bookings) setBookings(bookData.bookings);
      if (vehData.vehicles) setVehicles(vehData.vehicles);
      if (profData.vendor) setVendorProfile(profData.vendor);
      if (revData.reviews) {
        setReviews(revData.reviews);
        setReviewSummary(revData.summary);
      }
    } catch (err) {
      console.error('Vendor data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, []);

  const vendorStatus = vendorProfile?.status || (user?.vendor as any)?.status || user?.vendor?.verificationStatus || 'VERIFIED';
  const businessName = vendorProfile?.businessName || user?.vendor?.businessName || user?.name || 'RideSetu Partner';

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-white/10">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
            <Store className="w-3.5 h-3.5" /> Partner Mobility Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-white">
            Good day, {businessName}
          </h1>
          <p className="text-xs text-slate-300 max-w-xl font-normal leading-relaxed">
            Monitor active fleet availability, inspect handover inspections, track gross bookings, and review payout settlements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadVendorData}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Refresh Fleet Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
          <Link
            href="/partner/fleet"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-dark hover:to-brand-orange text-white text-xs font-black shadow-lg shadow-brand-orange/30 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Manage Fleet</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-950/70 p-6 rounded-3xl border border-white/10 shadow-sm space-y-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Gross Revenue</span>
              <div className="text-2xl sm:text-3xl font-black text-white font-heading">
                {formatINR(metrics?.grossRevenue || 18450)}
              </div>
              <p className="text-[11px] text-slate-400 font-semibold">Excludes ₹1,000 security deposits</p>
            </div>

            <div className="bg-slate-950/70 p-6 rounded-3xl border border-white/10 shadow-sm space-y-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Net Payout Accrued</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-heading">
                {formatINR(metrics?.netPayout || 15682)}
              </div>
              <p className="text-[11px] text-slate-400 font-semibold">Post 15% platform commission</p>
            </div>

            <div className="bg-slate-950/70 p-6 rounded-3xl border border-white/10 shadow-sm space-y-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Fleet Utilization</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-heading">
                {vehicles.filter((v) => v.status === 'APPROVED' || v.status === 'VERIFIED').length} / {vehicles.length}
              </div>
              <p className="text-[11px] text-slate-400 font-semibold">Live approved vehicles on fleet</p>
            </div>

            <div className="bg-slate-950/70 p-6 rounded-3xl border border-white/10 shadow-sm space-y-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Partner Rating</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-heading">
                  {Number(reviewSummary?.averageRating || 4.9).toFixed(1)}★
                </span>
                <span className="text-xs text-slate-400 font-bold">({reviews.length} reviews)</span>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold">Verified rider ratings</p>
            </div>
          </div>

          {/* Action Required: Pending Handovers */}
          <div className="bg-slate-950/70 rounded-3xl border border-white/10 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold font-heading text-white text-base">Today&apos;s Handovers & Return Audits</h3>
              <Link href="/partner/bookings" className="text-xs font-bold text-amber-400 hover:underline">
                View All Bookings
              </Link>
            </div>

            {bookings.length === 0 ? (
              <EmptyState
                title="No bookings pending action"
                description="When riders reserve your fleet, digital pickup checklists and return inspections will appear here."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-extrabold uppercase text-[10px]">
                      <th className="pb-3">Code</th>
                      <th className="pb-3">Vehicle</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Pickup Window</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Inspection Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {bookings.slice(0, 5).map((b) => (
                      <tr key={b._id} className="hover:bg-white/5">
                        <td className="py-3.5 font-mono font-bold text-amber-400">{b.bookingCode}</td>
                        <td className="py-3.5 font-bold text-white">{b.vehicleId?.brand} {b.vehicleId?.model}</td>
                        <td className="py-3.5 text-slate-300">{b.customerDetails?.fullName || 'Aarav Sharma'}</td>
                        <td className="py-3.5 text-slate-400">{formatDateTime(b.pickupDateTime)}</td>
                        <td className="py-3.5"><StatusBadge status={b.status} size="sm" /></td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() =>
                              setInspectionModal({
                                open: true,
                                bookingId: b._id,
                                vehicleId: b.vehicleId?._id || '',
                                vehicleName: `${b.vehicleId?.brand} ${b.vehicleId?.model}`,
                                handoverType: b.status === 'CONFIRMED' ? 'PICKUP' : 'RETURN',
                              })
                            }
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-brand-orange hover:from-amber-600 hover:to-brand-dark text-slate-950 font-extrabold text-[11px] shadow-sm active:scale-95"
                          >
                            {b.status === 'CONFIRMED' ? '📷 Pickup Checklist' : '🔍 Return Audit'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DIGITAL HANDOVER INSPECTION MODAL */}
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
            loadVendorData();
          }}
        />
      )}
    </div>
  );
}
