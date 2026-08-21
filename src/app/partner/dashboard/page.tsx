'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { PartnerLayout } from '@/components/layouts/PartnerLayout';
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
  Wallet,
  ShieldCheck,
  Wrench,
  Users,
  Lock,
} from 'lucide-react';

export default function PartnerDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      if (revData.reviews) setReviews(revData.reviews);
    } catch (err) {
      console.error('Vendor data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, []);

  const businessName = vendorProfile?.businessName || user?.vendor?.businessName || user?.name || 'Himalayan Wheels & Expeditions';

  const depositEnabledVehicles = vehicles.filter((v) => v.securityDepositEnabled !== false);
  const noDepositVehicles = vehicles.filter((v) => v.securityDepositEnabled === false);

  return (
    <PartnerLayout>
      <div className="max-w-7xl mx-auto space-y-8 font-sans">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-navy-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-white/10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
              <Store className="w-3.5 h-3.5" /> B2B Mobility Business Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-white">
              Good morning, {businessName}
            </h1>
            <p className="text-xs text-slate-300 max-w-xl font-normal leading-relaxed">
              Manage your fleet, bookings, earnings and customer operations from one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/partner/fleet"
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </Link>
            <button
              onClick={loadVendorData}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
              title="Refresh Analytics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Section A: Business KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 space-y-1">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Today&apos;s Revenue</div>
                <div className="text-xl font-black font-heading text-emerald-400">{formatINR(metrics?.todayRevenue || 1840)}</div>
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 space-y-1">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Monthly Revenue</div>
                <div className="text-xl font-black font-heading text-white">{formatINR(metrics?.monthlyRevenue || 42800)}</div>
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 space-y-1">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Active Bookings</div>
                <div className="text-xl font-black font-heading text-amber-400">{metrics?.activeBookings || bookings.filter((b) => b.bookingStatus === 'ACTIVE').length}</div>
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 space-y-1">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Fleet Utilization</div>
                <div className="text-xl font-black font-heading text-sky-400">{metrics?.fleetUtilization || 78}%</div>
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 space-y-1">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Pending Payout</div>
                <div className="text-xl font-black font-heading text-amber-300">{formatINR(metrics?.pendingPayout || 6420)}</div>
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 space-y-1">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Reliability Score</div>
                <div className="text-xl font-black font-heading text-emerald-400">{vendorProfile?.reliabilityScore || 98}/100</div>
              </div>
            </div>

            {/* Section B: Today's Operations */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black font-heading text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" /> Today&apos;s Operations Queue
                </h3>
                <Link href="/partner/bookings" className="text-xs font-bold text-amber-400 hover:underline">
                  View Full Queue →
                </Link>
              </div>

              {bookings.length === 0 ? (
                <EmptyState icon={Calendar} title="No Operations Today" description="Upcoming pick-ups and returns will appear here." />
              ) : (
                <div className="divide-y divide-white/10">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="font-extrabold text-white">
                          Booking #{booking.bookingId?.substring(0, 8)} — {booking.vehicleId?.brand} {booking.vehicleId?.model}
                        </div>
                        <div className="text-slate-400 text-[10px]">Customer: {booking.customerId?.name || 'Rider'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={booking.bookingStatus} />
                        <button
                          onClick={() =>
                            setInspectionModal({
                              open: true,
                              bookingId: booking._id,
                              vehicleId: booking.vehicleId?._id || booking.vehicleId,
                              vehicleName: `${booking.vehicleId?.brand || ''} ${booking.vehicleId?.model || ''}`,
                              handoverType: booking.bookingStatus === 'CONFIRMED' ? 'PICKUP' : 'RETURN',
                            })
                          }
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] transition-colors"
                        >
                          {booking.bookingStatus === 'CONFIRMED' ? 'Start Handover' : 'Inspect Return'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section C & G: Fleet Health & Security Deposit Policy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fleet Health */}
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
                <h3 className="text-lg font-black font-heading text-white flex items-center gap-2">
                  <Car className="w-5 h-5 text-amber-400" /> Fleet Health Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-white/5">
                    <div className="text-slate-400 font-semibold">Available Live</div>
                    <div className="text-lg font-black text-emerald-400">{vehicles.filter((v) => v.isAvailable).length}</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-white/5">
                    <div className="text-slate-400 font-semibold">Active Rented</div>
                    <div className="text-lg font-black text-amber-400">{vehicles.filter((v) => !v.isAvailable).length}</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-white/5">
                    <div className="text-slate-400 font-semibold">Maintenance</div>
                    <div className="text-lg font-black text-rose-400">0</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-white/5">
                    <div className="text-slate-400 font-semibold">Under Review</div>
                    <div className="text-lg font-black text-sky-400">0</div>
                  </div>
                </div>
              </div>

              {/* Security Deposit Policy */}
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black font-heading text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-amber-400" /> Security Deposit Policy
                  </h3>
                  <Link href="/partner/fleet" className="text-xs font-bold text-amber-400 hover:underline">
                    Manage Settings →
                  </Link>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 flex justify-between items-center">
                    <span className="text-slate-300 font-semibold">Deposit-Enabled Fleet</span>
                    <span className="font-black text-white">{depositEnabledVehicles.length} Vehicles</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 flex justify-between items-center">
                    <span className="text-slate-300 font-semibold">No-Deposit Fleet (₹0)</span>
                    <span className="font-black text-amber-400">{noDepositVehicles.length} Vehicles</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Security deposits are held in isolated escrow and automatically refunded upon zero-damage return inspection.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="text-lg font-black font-heading text-white">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link href="/partner/fleet" className="p-4 rounded-2xl bg-slate-950 border border-white/10 hover:border-amber-500 text-white text-xs font-extrabold flex flex-col items-center gap-2 text-center transition-colors">
                  <Plus className="w-5 h-5 text-amber-400" /> Add Vehicle
                </Link>
                <Link href="/partner/bookings" className="p-4 rounded-2xl bg-slate-950 border border-white/10 hover:border-amber-500 text-white text-xs font-extrabold flex flex-col items-center gap-2 text-center transition-colors">
                  <Calendar className="w-5 h-5 text-amber-400" /> View Bookings
                </Link>
                <Link href="/partner/earnings" className="p-4 rounded-2xl bg-slate-950 border border-white/10 hover:border-amber-500 text-white text-xs font-extrabold flex flex-col items-center gap-2 text-center transition-colors">
                  <TrendingUp className="w-5 h-5 text-amber-400" /> View Earnings
                </Link>
                <Link href="/partner/payouts" className="p-4 rounded-2xl bg-slate-950 border border-white/10 hover:border-amber-500 text-white text-xs font-extrabold flex flex-col items-center gap-2 text-center transition-colors">
                  <Wallet className="w-5 h-5 text-amber-400" /> Request Payout
                </Link>
              </div>
            </div>
          </>
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
              loadVendorData();
            }}
          />
        )}
      </div>
    </PartnerLayout>
  );
}
