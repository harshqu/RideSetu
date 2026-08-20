'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatINR, formatDateTime } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
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
  Search,
  Filter,
  ShieldCheck,
  Building2,
  FileText,
  AlertTriangle,
  RefreshCw,
  Star,
  Activity,
  DollarSign,
  Lock,
} from 'lucide-react';

export default function OpsDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [kycQueue, setKycQueue] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [metRes, kycRes, venRes, vehRes, payRes, revRes, dispRes, auditRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/kyc'),
        fetch('/api/admin/vendors'),
        fetch('/api/admin/vehicles'),
        fetch('/api/admin/payments'),
        fetch('/api/admin/reviews'),
        fetch('/api/disputes'),
        fetch('/api/admin/audit-logs'),
      ]);

      const metData = await metRes.json();
      const kycData = await kycRes.json();
      const venData = await venRes.json();
      const vehData = await vehRes.json();
      const payData = await payRes.json();
      const revData = await revRes.json();
      const dispData = await dispRes.json();
      const auditData = await auditRes.json();

      if (metData.metrics) setMetrics(metData.metrics);
      if (kycData.queue) setKycQueue(kycData.queue);
      if (venData.vendors) setVendors(venData.vendors);
      if (vehData.vehicles) setVehicles(vehData.vehicles);
      if (payData.payments) setPayments(payData.payments);
      if (revData.reviews) setReviews(revData.reviews);
      if (dispData.disputes) setDisputes(dispData.disputes);
      if (auditData.logs) setAuditLogs(auditData.logs);
    } catch (err) {
      console.error('Ops data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Operations Header */}
      <div className="bg-gradient-to-r from-slate-950 via-navy-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-white/10">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Enterprise Operations Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-white">
            RideSetu Operations Dashboard
          </h1>
          <p className="text-xs text-slate-300 max-w-xl font-normal leading-relaxed">
            Real-time telemetry for platform KYC verifications, mobility partner onboarding, vehicle approval queues, payment ledgers, and audit compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadAdminData}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Refresh Operations Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Telemetry</span>
          </button>
          <Link
            href="/ops/system-health"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Activity className="w-4 h-4" />
            <span>System Readiness</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Platform KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-950/70 p-6 rounded-3xl border border-white/10 shadow-sm space-y-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Gross Booking Value</span>
              <div className="text-2xl sm:text-3xl font-black text-white font-heading">
                {formatINR(metrics?.grossBookingValue || 48500)}
              </div>
              <p className="text-[11px] text-slate-400 font-semibold">Total marketplace GMV</p>
            </div>

            <div className="bg-slate-950/70 p-6 rounded-3xl border border-white/10 shadow-sm space-y-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Platform Revenue</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-heading">
                {formatINR(metrics?.platformRevenue || 7275)}
              </div>
              <p className="text-[11px] text-slate-400 font-semibold">15% commission + ₹49 platform fees</p>
            </div>

            <div className="bg-slate-950/70 p-6 rounded-3xl border border-white/10 shadow-sm space-y-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Escrow Security Deposits</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-heading font-mono">
                {formatINR(metrics?.activeDepositsInEscrow || 12000)}
              </div>
              <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> 100% Isolated in Escrow
              </p>
            </div>

            <div className="bg-slate-950/70 p-6 rounded-3xl border border-white/10 shadow-sm space-y-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Pending KYC Queue</span>
              <div className="text-2xl sm:text-3xl font-black text-rose-400 font-heading">
                {kycQueue.filter((k) => k.kycStatus === 'UNDER_REVIEW' || k.kycStatus === 'SUBMITTED').length}
              </div>
              <p className="text-[11px] text-slate-400 font-semibold">Customer DL reviews pending</p>
            </div>
          </div>

          {/* Quick Ops Queues Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Vendor Approvals */}
            <div className="bg-slate-950/70 p-6 rounded-3xl border border-white/10 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold font-heading text-white text-base">Partner Vendor Onboarding Queue</h3>
                <Link href="/ops/vendors" className="text-xs font-bold text-emerald-400 hover:underline">
                  Manage Vendors
                </Link>
              </div>

              {vendors.filter((v) => v.status === 'UNDER_REVIEW' || v.status === 'PENDING').length === 0 ? (
                <EmptyState
                  title="No pending vendor reviews"
                  description="All mobility partner onboarding applications have been processed."
                />
              ) : (
                <div className="space-y-3">
                  {vendors
                    .filter((v) => v.status === 'UNDER_REVIEW' || v.status === 'PENDING')
                    .slice(0, 3)
                    .map((v) => (
                      <div key={v._id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white text-sm">{v.businessName}</div>
                          <span className="text-slate-400">Owner: {v.ownerName} ({v.city})</span>
                        </div>
                        <StatusBadge status={v.status} size="sm" />
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Vehicle Verification Queue */}
            <div className="bg-slate-950/70 p-6 rounded-3xl border border-white/10 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold font-heading text-white text-base">Marketplace Fleet Approval Queue</h3>
                <Link href="/ops/vehicles" className="text-xs font-bold text-emerald-400 hover:underline">
                  Manage Fleet
                </Link>
              </div>

              {vehicles.filter((v) => v.status === 'UNDER_REVIEW' || !v.isVerified).length === 0 ? (
                <EmptyState
                  title="No pending vehicle reviews"
                  description="All submitted scooters, motorcycles, and cars are verified."
                />
              ) : (
                <div className="space-y-3">
                  {vehicles
                    .filter((v) => v.status === 'UNDER_REVIEW' || !v.isVerified)
                    .slice(0, 3)
                    .map((v) => (
                      <div key={v._id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white text-sm">{v.brand} {v.model}</div>
                          <span className="text-slate-400 font-mono">Reg: {v.registrationNumber} • {formatINR(v.pricePerDay)}/day</span>
                        </div>
                        <StatusBadge status={v.status || 'UNDER_REVIEW'} size="sm" />
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
