'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatINR, formatDateTime } from '@/lib/utils';
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
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-orange text-xs font-bold tracking-wide uppercase">
            <ShieldAlert className="w-3.5 h-3.5" /> Administrative Master Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            RideSetu Operations & Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Review moderation, partner verification, fleet compliance, cancellation audits, and settlements.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
        {[
          { key: 'METRICS', label: 'Platform Economics' },
          { key: 'REVIEWS', label: `Review Moderation (${adminReviews.length})` },
          { key: 'VENDORS', label: `Vendor Partners (${adminVendors.length})` },
          { key: 'VEHICLES', label: `Fleet Catalog (${adminVehicles.length})` },
          { key: 'KYC', label: `Customer KYC (${kycCases.length})` },
          { key: 'PAYMENTS', label: `Payment Ledger (${paymentLedger.length})` },
          { key: 'DISPUTES', label: `Disputes (${disputes.length})` },
          { key: 'PAYOUTS', label: `Settlement Queue (${payouts.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-navy-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: REVIEW MODERATION */}
      {activeTab === 'REVIEWS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-heading">Marketplace Reviews Moderation</h3>
              <p className="text-xs text-slate-500">Audit authenticity, hide toxic comments, and enforce community standards with mandatory AuditLogs.</p>
            </div>
            <div className="flex items-center gap-2">
              {['ALL', 'PUBLISHED', 'FLAGGED', 'HIDDEN'].map((st) => (
                <button
                  key={st}
                  onClick={() => setReviewStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    reviewStatusFilter === st ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            {adminReviews.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed rounded-2xl text-slate-400 text-xs">
                No reviews found for status: {reviewStatusFilter}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b text-slate-400 uppercase text-[10px]">
                      <th className="pb-3 px-3">Rider</th>
                      <th className="pb-3 px-3">Vehicle</th>
                      <th className="pb-3 px-3">Rating</th>
                      <th className="pb-3 px-3">Comment</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminReviews.map((r) => (
                      <tr key={r._id}>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {r.customerName}
                          {r.isVerifiedRental && (
                            <span className="block text-[9px] text-emerald-700 font-extrabold">✓ Verified</span>
                          )}
                        </td>
                        <td className="py-3 px-3">{r.vehicleId?.brand} {r.vehicleId?.model}</td>
                        <td className="py-3 px-3 font-bold text-amber-500">{r.overallRating}★</td>
                        <td className="py-3 px-3 max-w-xs text-slate-700 truncate">{r.reviewText}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                              r.status === 'PUBLISHED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'FLAGGED'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {r.status || 'PUBLISHED'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1">
                          {r.status !== 'HIDDEN' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReviewForMod(r);
                                setReviewModAction('HIDE');
                              }}
                              className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold text-[11px]"
                            >
                              Hide
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReviewForMod(r);
                                setReviewModAction('RESTORE');
                              }}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-[11px]"
                            >
                              Restore
                            </button>
                          )}

                          {r.status !== 'FLAGGED' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReviewForMod(r);
                                setReviewModAction('FLAG');
                              }}
                              className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg font-bold text-[11px]"
                            >
                              Flag
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
        </div>
      )}

      {/* TAB: METRICS */}
      {activeTab === 'METRICS' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Marketplace Gross Volume</div>
            <div className="text-2xl font-black text-navy-900">{formatINR(metrics?.grossMarketplaceVolume || 184500)}</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-emerald-600">Net Platform Commission</div>
            <div className="text-2xl font-black text-emerald-600">{formatINR(metrics?.platformNetRevenue || 27675)}</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-brand-orange">Active Fleet Vehicles</div>
            <div className="text-2xl font-black text-navy-900">{metrics?.totalVehicles || adminVehicles.length || 48}</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border shadow-sm space-y-1">
            <div className="text-[10px] uppercase font-bold text-blue-600">Registered Operators</div>
            <div className="text-2xl font-black text-navy-900">{metrics?.totalVendors || adminVendors.length || 12}</div>
          </div>
        </div>
      )}

      {/* REVIEW MODERATION ACTION MODAL */}
      {selectedReviewForMod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-brand-orange" /> Moderate Review ({reviewModAction})
              </h3>
              <button type="button" onClick={() => setSelectedReviewForMod(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border text-xs space-y-1">
              <div className="font-bold text-slate-900">{selectedReviewForMod.customerName} ({selectedReviewForMod.overallRating}★)</div>
              <p className="text-slate-600 italic">&ldquo;{selectedReviewForMod.reviewText}&rdquo;</p>
            </div>

            <form onSubmit={handleModerateReview} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Administrative Reason (Audit Log) *</label>
                <textarea
                  required
                  rows={3}
                  value={reviewModReason}
                  onChange={(e) => setReviewModReason(e.target.value)}
                  placeholder="State the compliance or policy justification..."
                  className="w-full p-2.5 border rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setSelectedReviewForMod(null)} className="px-4 py-2 border rounded-xl font-bold text-slate-600">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewModLoading}
                  className="px-5 py-2 bg-navy-900 text-white rounded-xl font-bold shadow-md disabled:opacity-50"
                >
                  {reviewModLoading ? 'Applying...' : `Confirm ${reviewModAction}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
