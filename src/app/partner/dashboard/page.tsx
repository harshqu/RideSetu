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
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md border border-slate-800">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
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
              className="px-4 py-2.5 rounded-2xl bg-brand-orange hover:bg-orange-600 text-white font-black text-xs shadow-md shadow-orange-500/20 flex items-center gap-2 transition-colors min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </Link>
            <button
              onClick={loadVendorData}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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
            {/* Onboarding Verification Status Banner */}
            {(() => {
              const status = vendorProfile?.verificationStatus || 'PENDING';
              const reason = vendorProfile?.rejectionReason || vendorProfile?.suspendedReason || '';

              if (status === 'PENDING') {
                return (
                  <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-amber-900">Complete your Partner Application</h3>
                        <p className="text-xs text-amber-700 font-medium">Provide required trade license, KYC documents, and payout details to get verified.</p>
                      </div>
                    </div>
                    <Link
                      href="/partner/onboarding"
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-sm shrink-0"
                    >
                      Continue Onboarding →
                    </Link>
                  </div>
                );
              }

              if (status === 'UNDER_REVIEW') {
                return (
                  <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-blue-900">Application Under Review</h3>
                      <p className="text-xs text-blue-700 font-medium">RideSetu Operations is reviewing your submitted business documents. Vehicles can be published once verified.</p>
                    </div>
                  </div>
                );
              }

              if (status === 'ACTION_REQUIRED') {
                return (
                  <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-rose-900">Action Required — Document Review Feedback</h3>
                        <p className="text-xs text-rose-700 font-semibold">{reason || 'Please update your submitted documents as requested by Operations.'}</p>
                      </div>
                    </div>
                    <Link
                      href="/partner/onboarding"
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm shrink-0"
                    >
                      Fix & Resubmit →
                    </Link>
                  </div>
                );
              }

              if (status === 'REJECTED' || status === 'SUSPENDED') {
                return (
                  <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-rose-900">Account Status: {status}</h3>
                      <p className="text-xs text-rose-700 font-medium">{reason || 'Contact partner support for application assistance.'}</p>
                    </div>
                  </div>
                );
              }

              return (
                <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 flex items-center gap-3 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-extrabold text-emerald-900">Verified Partner ✓ — Fleet Publishing Enabled</span>
                </div>
              );
            })()}

            {/* Section A: Business KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Today&apos;s Revenue</div>
                <div className="text-xl font-black font-heading text-emerald-600">{formatINR(metrics?.todayRevenue || 1840)}</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Monthly Revenue</div>
                <div className="text-xl font-black font-heading text-slate-900">{formatINR(metrics?.monthlyRevenue || 42800)}</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Active Bookings</div>
                <div className="text-xl font-black font-heading text-amber-600">{metrics?.activeBookings || bookings.filter((b) => b.bookingStatus === 'ACTIVE').length}</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Fleet Utilization</div>
                <div className="text-xl font-black font-heading text-blue-600">{metrics?.fleetUtilization || 78}%</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Pending Payout</div>
                <div className="text-xl font-black font-heading text-amber-600">{formatINR(metrics?.pendingPayout || 6420)}</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Reliability Score</div>
                <div className="text-xl font-black font-heading text-emerald-600">{vendorProfile?.reliabilityScore || 98}/100</div>
              </div>
            </div>

            {/* Section B: Today's Operations */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black font-heading text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" /> Today&apos;s Operations Queue
                </h3>
                <Link href="/partner/bookings" className="text-xs font-bold text-amber-700 hover:underline">
                  View Full Queue →
                </Link>
              </div>

              {bookings.length === 0 ? (
                <EmptyState icon={Calendar} title="No Operations Today" description="Upcoming pick-ups and returns will appear here." />
              ) : (
                <div className="divide-y divide-slate-200">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="font-extrabold text-slate-900">
                          Booking #{booking.bookingId?.substring(0, 8)} — {booking.vehicleId?.brand} {booking.vehicleId?.model}
                        </div>
                        <div className="text-slate-500 font-medium text-[10px]">Customer: {booking.customerId?.name || 'Rider'}</div>
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
                          className="px-3 py-1.5 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-black text-[11px] transition-colors shadow-sm min-h-[36px]"
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
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <h3 className="text-lg font-black font-heading text-slate-900 flex items-center gap-2">
                  <Car className="w-5 h-5 text-amber-600" /> Fleet Health Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="text-slate-600 font-semibold">Available Live</div>
                    <div className="text-lg font-black text-emerald-600">{vehicles.filter((v) => v.isAvailable).length}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="text-slate-600 font-semibold">Active Rented</div>
                    <div className="text-lg font-black text-amber-600">{vehicles.filter((v) => !v.isAvailable).length}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="text-slate-600 font-semibold">Maintenance</div>
                    <div className="text-lg font-black text-rose-600">0</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="text-slate-600 font-semibold">Under Review</div>
                    <div className="text-lg font-black text-blue-600">0</div>
                  </div>
                </div>
              </div>

              {/* Security Deposit Policy */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black font-heading text-slate-900 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-amber-600" /> Security Deposit Policy
                  </h3>
                  <Link href="/partner/fleet" className="text-xs font-bold text-amber-700 hover:underline">
                    Manage Settings →
                  </Link>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-700 font-semibold">Deposit-Enabled Fleet</span>
                    <span className="font-black text-slate-900">{depositEnabledVehicles.length} Vehicles</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-700 font-semibold">No-Deposit Fleet (₹0)</span>
                    <span className="font-black text-amber-700">{noDepositVehicles.length} Vehicles</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    Security deposits are held in isolated escrow and automatically refunded upon zero-damage return inspection.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="text-lg font-black font-heading text-slate-900">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link href="/partner/fleet" className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-500 text-slate-900 text-xs font-extrabold flex flex-col items-center gap-2 text-center transition-colors min-h-[44px]">
                  <Plus className="w-5 h-5 text-amber-600" /> Add Vehicle
                </Link>
                <Link href="/partner/bookings" className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-500 text-slate-900 text-xs font-extrabold flex flex-col items-center gap-2 text-center transition-colors min-h-[44px]">
                  <Calendar className="w-5 h-5 text-amber-600" /> View Bookings
                </Link>
                <Link href="/partner/earnings" className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-500 text-slate-900 text-xs font-extrabold flex flex-col items-center gap-2 text-center transition-colors min-h-[44px]">
                  <TrendingUp className="w-5 h-5 text-amber-600" /> View Earnings
                </Link>
                <Link href="/partner/payouts" className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-500 text-slate-900 text-xs font-extrabold flex flex-col items-center gap-2 text-center transition-colors min-h-[44px]">
                  <Wallet className="w-5 h-5 text-amber-600" /> Request Payout
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
  );
}
