'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/lib/utils';
import {
  Shield,
  TrendingUp,
  DollarSign,
  Users,
  Store,
  Car,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck2,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';

export default function AdminControlPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [payoutSummary, setPayoutSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'METRICS' | 'DISPUTES' | 'PAYOUTS' | 'COMMISSIONS'>('METRICS');
  const [actionLoading, setActionLoading] = useState(false);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [metRes, dispRes, payRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/disputes'),
        fetch('/api/admin/payouts'),
      ]);

      const metData = await metRes.json();
      const dispData = await dispRes.json();
      const payData = await payRes.json();

      if (metData.metrics) setMetrics(metData.metrics);
      if (dispData.disputes) setDisputes(dispData.disputes);
      if (payData.payouts) {
        setPayouts(payData.payouts);
        setPayoutSummary(payData.summary);
      }
    } catch (err) {
      console.error('Admin data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayoutStatus = async (payoutId: string, status: string, reason?: string) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/payouts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId, status, reason }),
      });
      if (res.ok) {
        await loadAdminData();
      }
    } catch (err) {
      console.error('Update payout status error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecutePayout = async (payoutId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId }),
      });
      const data = await res.json();
      alert(data.message || 'Payout transfer initiated.');
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Payout transfer failed.');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleResolveDispute = async (disputeId: string, status: 'RESOLVED' | 'REJECTED', deductedAmount = 0) => {
    try {
      const res = await fetch('/api/disputes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId,
          status,
          deductedAmount,
          adminNotes: `Arbitrated by Admin. ${status === 'RESOLVED' ? `Deduction of ₹${deductedAmount} approved.` : 'Claim rejected; deposit fully refunded.'}`,
        }),
      });

      if (res.ok) {
        alert('Dispute decision recorded and booking updated.');
        loadAdminData();
      }
    } catch (err) {
      console.error('Dispute resolution failed:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-navy-950 text-white p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-heading">RideSetu Master Control Console</h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase border border-emerald-500/30">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Marketplace Economics, Compliance Approvals & Damage Arbitration
            </p>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Metrics
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Gross Marketplace Value (GMV)</span>
          <div className="text-2xl font-black font-heading text-navy-900">
            {formatINR(metrics?.gmv || 48920)}
          </div>
          <div className="text-[11px] text-slate-500">{metrics?.totalBookings || 18} Total Reservations</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Platform Net Revenue</span>
          <div className="text-2xl font-black font-heading text-emerald-600">
            {formatINR(metrics?.platformRevenue || 7338)}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">Take Rate: {metrics?.takeRatePercentage || 15.0}%</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verified Vendors</span>
          <div className="text-2xl font-black font-heading text-navy-900">
            {metrics?.totalVendors || 10}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold">{metrics?.pendingVendors || 0} Pending Verification</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Rentals on Road</span>
          <div className="text-2xl font-black font-heading text-blue-600">
            {metrics?.activeBookings || 2}
          </div>
          <div className="text-[11px] text-slate-500">Across Uttarakhand Hubs</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab('METRICS')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'METRICS'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Marketplace Health & Economics
        </button>
        <button
          onClick={() => setActiveTab('PAYOUTS')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'PAYOUTS'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Vendor Payouts & Settlements ({payouts.length})
        </button>
        <button
          onClick={() => setActiveTab('DISPUTES')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'DISPUTES'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Dispute & Damage Arbitration ({disputes.length})
        </button>
      </div>

      {/* TAB: Vendor Payouts & Settlements */}
      {activeTab === 'PAYOUTS' && (
        <div className="space-y-6">
          {/* Payout Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Settled / Paid</span>
              <div className="text-xl font-black text-emerald-600">
                {formatINR(payoutSummary?.totalPaid || 0)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Eligible for Transfer</span>
              <div className="text-xl font-black text-blue-600">
                {formatINR(payoutSummary?.totalEligible || 0)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Compliance On Hold</span>
              <div className="text-xl font-black text-amber-600">
                {formatINR(payoutSummary?.totalOnHold || 0)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Platform Commissions</span>
              <div className="text-xl font-black text-navy-900">
                {formatINR(payoutSummary?.totalCommissions || 0)}
              </div>
            </div>
          </div>

          {/* Payouts Audit Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base font-heading">Vendor Payout Ledger & Audit Logs</h3>
                <p className="text-xs text-slate-500">Every hold, release, and transfer creates an immutable AuditLog record.</p>
              </div>
            </div>

            {payouts.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No vendor payouts generated yet. Payouts are generated upon ride completion.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Vendor Partner</th>
                      <th className="p-4">Booking Ref</th>
                      <th className="p-4">Gross Eligible</th>
                      <th className="p-4">Commission</th>
                      <th className="p-4">Net Payout</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payouts.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{p.vendorId?.businessName || 'Partner'}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{p.bankAccountRef || 'Bank Account'}</div>
                        </td>
                        <td className="p-4 font-mono font-medium text-slate-700">
                          {p.bookingId?.bookingNumber || 'BKG-REF'}
                        </td>
                        <td className="p-4 font-semibold text-slate-800">{formatINR(p.grossAmount)}</td>
                        <td className="p-4 text-slate-500">
                          {formatINR(p.platformCommission)} ({p.commissionPercentage}%)
                        </td>
                        <td className="p-4 font-black text-emerald-700 font-heading text-sm">
                          {formatINR(p.netAmount)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              p.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'ELIGIBLE'
                                ? 'bg-blue-100 text-blue-800'
                                : p.status === 'ON_HOLD'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.status}
                          </span>
                          {p.holdReason && (
                            <div className="text-[10px] text-amber-700 mt-0.5 max-w-xs truncate">{p.holdReason}</div>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {p.status === 'ELIGIBLE' && (
                              <>
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() => handleExecutePayout(p._id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
                                >
                                  Execute Transfer
                                </button>
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() => {
                                    const r = prompt('Reason for placing payout on compliance hold:', 'Documentation verification');
                                    if (r) handleUpdatePayoutStatus(p._id, 'ON_HOLD', r);
                                  }}
                                  className="px-2.5 py-1 rounded-lg border border-amber-300 text-amber-800 bg-amber-50 font-bold text-[11px]"
                                >
                                  Hold
                                </button>
                              </>
                            )}
                            {p.status === 'ON_HOLD' && (
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleUpdatePayoutStatus(p._id, 'ELIGIBLE', 'Compliance verification cleared')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px]"
                              >
                                Release Hold
                              </button>
                            )}
                            {p.status === 'PAID' && (
                              <span className="text-[11px] font-mono text-emerald-700">Settled ✓</span>
                            )}
                          </div>
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

      {/* TAB 1: Economics */}
      {activeTab === 'METRICS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base font-heading">Marketplace Financial Isolation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              RideSetu maintains strict separation between customer rental revenue, tech platform fees, GST taxes, and 100% refundable security deposits.
            </p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between font-semibold">
                <span>Standard Take Rate Commission</span>
                <span className="text-brand-orange font-bold">15%</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Tech Convenience Platform Fee</span>
                <span className="text-slate-900 font-bold">₹49 / Booking</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>GST Tax Compliance</span>
                <span className="text-slate-900 font-bold">18%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base font-heading">Compliance Governance</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every partner vehicle is validated against Uttarakhand commercial rental guidelines with valid trade certificates and comprehensive passenger insurance.
            </p>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div className="font-bold">✓ 100% Commercial Permit Compliance</div>
              <div>All 10 active partner agencies operate under legal rental permits.</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Disputes */}
      {activeTab === 'DISPUTES' && (
        <div className="space-y-4">
          {disputes.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">Zero Open Damage Disputes</h3>
              <p className="text-xs text-slate-500">All digital handovers completed without damage conflicts.</p>
            </div>
          ) : (
            disputes.map((disp) => (
              <div
                key={disp._id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs text-slate-400">Dispute ID: {disp._id}</span>
                    <h3 className="font-bold text-slate-900 text-base mt-0.5">
                      Damage Claim: ₹{disp.claimedAmount}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                      disp.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {disp.status}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-900">Partner Claim Remarks:</div>
                  <p className="text-slate-700">{disp.vendorRemarks}</p>
                </div>

                {disp.status === 'OPEN' && (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleResolveDispute(disp._id, 'RESOLVED', disp.claimedAmount)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                    >
                      Approve ₹{disp.claimedAmount} Deduction
                    </button>
                    <button
                      onClick={() => handleResolveDispute(disp._id, 'REJECTED', 0)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold"
                    >
                      Reject Claim (100% Customer Refund)
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
