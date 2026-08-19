'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatINR, formatDateTime } from '@/lib/utils';
import { StatusBadge, RatingBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import {
  ShieldAlert,
  Users,
  Car,
  CreditCard,
  AlertOctagon,
  Percent,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  Building2,
  FileText,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Star,
  MessageSquare,
  Lock,
  X,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [payoutSummary, setPayoutSummary] = useState<any>(null);
  const [kycCases, setKycCases] = useState<any[]>([]);
  const [kycSummary, setKycSummary] = useState<any>(null);
  const [paymentLedger, setPaymentLedger] = useState<any[]>([]);
  const [adminVendors, setAdminVendors] = useState<any[]>([]);
  const [adminVehicles, setAdminVehicles] = useState<any[]>([]);
  const [adminReviews, setAdminReviews] = useState<any[]>([]);
  const [reviewStatusFilter, setReviewStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'METRICS' | 'VENDORS' | 'VEHICLES' | 'REVIEWS' | 'KYC' | 'PAYMENTS' | 'DISPUTES' | 'PAYOUTS' | 'COMMISSIONS'
  >('METRICS');
  const [actionLoading, setActionLoading] = useState(false);

  // Review Moderation Modal State
  const [selectedReviewForMod, setSelectedReviewForMod] = useState<any | null>(null);
  const [reviewModAction, setReviewModAction] = useState<'HIDE' | 'RESTORE' | 'FLAG'>('HIDE');
  const [reviewModReason, setReviewModReason] = useState('');
  const [reviewModLoading, setReviewModLoading] = useState(false);

  // KYC Inspection Modal State
  const [inspectKycCase, setInspectKycCase] = useState<any | null>(null);
  const [kycActionModalOpen, setKycActionModalOpen] = useState(false);
  const [kycActionType, setKycActionType] = useState<'APPROVE' | 'REJECT' | 'REQUEST_INFO'>('APPROVE');
  const [kycActionReason, setKycActionReason] = useState('');

  // Vendor Review Modal State
  const [selectedVendorForReview, setSelectedVendorForReview] = useState<any | null>(null);
  const [vendorActionModalOpen, setVendorActionModalOpen] = useState(false);
  const [vendorActionType, setVendorActionType] = useState<'APPROVE' | 'REJECT' | 'REQUEST_INFO' | 'SUSPEND'>('APPROVE');
  const [vendorActionReason, setVendorActionReason] = useState('');

  // Vehicle Review Modal State
  const [selectedVehicleForReview, setSelectedVehicleForReview] = useState<any | null>(null);
  const [vehicleActionModalOpen, setVehicleActionModalOpen] = useState(false);
  const [vehicleActionType, setVehicleActionType] = useState<'APPROVE' | 'REJECT' | 'SUSPEND' | 'MAINTENANCE'>('APPROVE');
  const [vehicleActionReason, setVehicleActionReason] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [metRes, dispRes, payRes, kycRes, ledgerRes, vendRes, vehRes, revRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/disputes'),
        fetch('/api/admin/payouts'),
        fetch('/api/admin/kyc'),
        fetch('/api/admin/payments'),
        fetch('/api/admin/vendors'),
        fetch('/api/admin/vehicles'),
        fetch(`/api/admin/reviews?status=${reviewStatusFilter}`),
      ]);

      const metData = await metRes.json();
      const dispData = await dispRes.json();
      const payData = await payRes.json();
      const kycData = await kycRes.json();
      const ledgerData = await ledgerRes.json();
      const vendData = await vendRes.json();
      const vehData = await vehRes.json();
      const revData = await revRes.json();

      if (metData.metrics) setMetrics(metData.metrics);
      if (dispData.disputes) setDisputes(dispData.disputes);
      if (payData.payouts) {
        setPayouts(payData.payouts);
        setPayoutSummary(payData.summary);
      }
      if (kycData.kycCases) {
        setKycCases(kycData.kycCases);
        setKycSummary(kycData.summary);
      }
      if (ledgerData.ledger) {
        setPaymentLedger(ledgerData.ledger);
      }
      if (vendData.vendors) {
        setAdminVendors(vendData.vendors);
      }
      if (vehData.vehicles) {
        setAdminVehicles(vehData.vehicles);
      }
      if (revData.reviews) {
        setAdminReviews(revData.reviews);
      }
    } catch (err) {
      console.error('Admin data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [reviewStatusFilter]);

  const handleModerateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewForMod) return;

    try {
      setReviewModLoading(true);
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: selectedReviewForMod._id,
          action: reviewModAction,
          reason: reviewModReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedReviewForMod(null);
        setReviewModReason('');
        loadAdminData();
      } else {
        alert(data.error || 'Failed to moderate review');
      }
    } catch (err) {
      console.error('Moderate review error:', err);
    } finally {
      setReviewModLoading(false);
    }
  };

  const handleModerateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForReview) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/vendors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: selectedVendorForReview._id,
          action: vendorActionType,
          reason: vendorActionReason,
        }),
      });
      if (res.ok) {
        setVendorActionModalOpen(false);
        setSelectedVendorForReview(null);
        setVendorActionReason('');
        loadAdminData();
      }
    } catch (err) {
      console.error('Vendor review error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleModerateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleForReview) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/vehicles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: selectedVehicleForReview._id,
          action: vehicleActionType,
          reason: vehicleActionReason,
        }),
      });
      if (res.ok) {
        setVehicleActionModalOpen(false);
        setSelectedVehicleForReview(null);
        setVehicleActionReason('');
        loadAdminData();
      }
    } catch (err) {
      console.error('Vehicle review error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-white/10">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Administrative Command Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-white">
            RideSetu Operations & Governance
          </h1>
          <p className="text-xs text-slate-300 max-w-xl font-normal leading-relaxed">
            Review moderation, KYC audit queues, partner trade verification, fleet fitness governance, and escrow settlements.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
          title="Refresh Console"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Operations</span>
        </button>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar">
        {[
          { key: 'METRICS', label: 'Platform Economics', icon: Percent },
          { key: 'REVIEWS', label: `Reviews (${adminReviews.length})`, icon: Star },
          { key: 'VENDORS', label: `Vendors (${adminVendors.length})`, icon: Building2 },
          { key: 'VEHICLES', label: `Fleet Catalog (${adminVehicles.length})`, icon: Car },
          { key: 'KYC', label: `KYC Queue (${kycCases.length})`, icon: FileText },
          { key: 'PAYMENTS', label: `Ledger (${paymentLedger.length})`, icon: CreditCard },
          { key: 'DISPUTES', label: `Disputes (${disputes.length})`, icon: AlertTriangle },
          { key: 'PAYOUTS', label: `Settlements (${payouts.length})`, icon: RotateCcw },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-navy-950 text-white shadow-md shadow-navy-950/20'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* TAB: METRICS */}
          {activeTab === 'METRICS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase">Gross Marketplace GMV</span>
                  <div className="text-2xl sm:text-3xl font-black text-navy-950 font-heading">
                    {formatINR(metrics?.grossMarketplaceVolume || 124500)}
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold">Total rental bookings processed</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase">Platform Net Commission</span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-heading">
                    {formatINR(metrics?.platformNetRevenue || 18675)}
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold">15% average commission cut</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase">Active Marketplace Fleet</span>
                  <div className="text-2xl sm:text-3xl font-black text-navy-950 font-heading">
                    {adminVehicles.length} Vehicles
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold">Across 6 Uttarakhand hubs</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase">KYC Review Queue</span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-500 font-heading">
                    {kycCases.filter((k) => k.status === 'PENDING' || k.status === 'UNDER_REVIEW').length} Pending
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold">Customer licences awaiting signoff</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: REVIEWS MODERATION */}
          {activeTab === 'REVIEWS' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black font-heading text-navy-950 text-xl">Review Moderation Console</h3>
                  <p className="text-xs text-slate-500 font-medium">Moderate customer ratings, hide abusive content, and inspect host responses.</p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-500">Filter:</span>
                  <select
                    value={reviewStatusFilter}
                    onChange={(e) => setReviewStatusFilter(e.target.value)}
                    className="p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold outline-none"
                  >
                    <option value="ALL">All Reviews</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="FLAGGED">Flagged</option>
                    <option value="HIDDEN">Hidden</option>
                  </select>
                </div>
              </div>

              {adminReviews.length === 0 ? (
                <EmptyState
                  title="No reviews match filter"
                  description="All customer reviews are in good standing."
                />
              ) : (
                <div className="space-y-4">
                  {adminReviews.map((r) => (
                    <div key={r._id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{r.customerName}</span>
                          <span className="text-slate-500">→ {r.vehicleId?.brand} {r.vehicleId?.model}</span>
                          <StatusBadge status={r.status || 'PUBLISHED'} size="sm" />
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: r.overallRating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>

                      <p className="text-slate-700 font-normal leading-relaxed">{r.reviewText}</p>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
                        <button
                          onClick={() => {
                            setSelectedReviewForMod(r);
                            setReviewModAction(r.status === 'HIDDEN' ? 'RESTORE' : 'HIDE');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-navy-950 hover:bg-slate-900 text-white font-extrabold text-[11px]"
                        >
                          {r.status === 'HIDDEN' ? 'Restore Review' : 'Moderate / Hide'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: VENDORS */}
          {activeTab === 'VENDORS' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-black font-heading text-navy-950 text-xl">Registered Rental Partners ({adminVendors.length})</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
                      <th className="pb-3">Business</th>
                      <th className="pb-3">Owner</th>
                      <th className="pb-3">Hub</th>
                      <th className="pb-3">GST / Permit</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminVendors.map((v) => (
                      <tr key={v._id} className="hover:bg-slate-50">
                        <td className="py-3 font-extrabold text-slate-900 font-heading">{v.businessName}</td>
                        <td className="py-3 text-slate-600">{v.ownerName} ({v.phone})</td>
                        <td className="py-3 text-slate-600">{v.city || 'Rishikesh'}</td>
                        <td className="py-3 font-mono text-slate-500">{v.gstNumber || 'GST-UNREGISTERED'}</td>
                        <td className="py-3"><StatusBadge status={v.verificationStatus || 'APPROVED'} size="sm" /></td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedVendorForReview(v);
                              setVendorActionModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-extrabold text-[11px]"
                          >
                            Review Partner
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: KYC QUEUE */}
          {activeTab === 'KYC' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-black font-heading text-navy-950 text-xl">Customer KYC Verification Queue ({kycCases.length})</h3>

              {kycCases.length === 0 ? (
                <EmptyState
                  title="KYC Queue Empty"
                  description="All customer driving licences have been audited and verified."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
                        <th className="pb-3">Holder Name</th>
                        <th className="pb-3">Licence Number</th>
                        <th className="pb-3">Vehicle Classes</th>
                        <th className="pb-3">Valid Till</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {kycCases.map((k) => (
                        <tr key={k._id} className="hover:bg-slate-50">
                          <td className="py-3 font-extrabold text-slate-900">{k.holderName || k.userId?.name}</td>
                          <td className="py-3 font-mono font-bold text-slate-700">{k.drivingLicenceNumber}</td>
                          <td className="py-3 text-slate-600">{k.vehicleClasses?.join(', ') || 'MCWG'}</td>
                          <td className="py-3 text-slate-500">{k.expiryDate ? k.expiryDate.split('T')[0] : '2035-12-31'}</td>
                          <td className="py-3"><StatusBadge status={k.status || 'APPROVED'} size="sm" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: PAYMENTS LEDGER */}
          {activeTab === 'PAYMENTS' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-black font-heading text-navy-950 text-xl">Administrative Payment & Escrow Ledger</h3>

              {paymentLedger.length === 0 ? (
                <EmptyState title="No transactions recorded" description="Payment transactions will appear here." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
                        <th className="pb-3">Payment ID</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Method</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paymentLedger.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50">
                          <td className="py-3 font-mono font-bold text-slate-900">{p.razorpayPaymentId || p._id}</td>
                          <td className="py-3 text-slate-500">{formatDateTime(p.createdAt)}</td>
                          <td className="py-3 font-semibold text-slate-700">{p.method}</td>
                          <td className="py-3 font-black text-navy-950 font-heading">{formatINR(p.amount)}</td>
                          <td className="py-3"><StatusBadge status={p.status} size="sm" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* REVIEW MODERATION MODAL */}
      {selectedReviewForMod && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black font-heading text-slate-900 text-lg">Moderate Customer Review</h3>
              <button onClick={() => setSelectedReviewForMod(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl italic">&ldquo;{selectedReviewForMod.reviewText}&rdquo;</p>

            <form onSubmit={handleModerateReview} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Action</label>
                <select
                  value={reviewModAction}
                  onChange={(e) => setReviewModAction(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold outline-none"
                >
                  <option value="HIDE">Hide Review</option>
                  <option value="RESTORE">Restore Review</option>
                  <option value="FLAG">Flag for Investigation</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Administrative Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inappropriate language / False claim"
                  value={reviewModReason}
                  onChange={(e) => setReviewModReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={reviewModLoading}
                className="w-full py-3 bg-navy-950 text-white font-extrabold rounded-xl shadow-md"
              >
                {reviewModLoading ? 'Saving...' : 'Apply Moderation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
