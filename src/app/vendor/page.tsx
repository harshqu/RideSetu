'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import DigitalInspectionModal from '@/components/handover/DigitalInspectionModal';
import { formatINR, formatDateTime } from '@/lib/utils';
import {
  Store,
  Car,
  Calendar,
  Layers,
  Star,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  TrendingUp,
  Clock,
  Plus,
  RefreshCw,
  XCircle,
  Truck,
} from 'lucide-react';

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'BOOKINGS' | 'FLEET' | 'CALENDAR' | 'PAYOUTS'>('BOOKINGS');
  const [payoutProfile, setPayoutProfile] = useState<any>(null);
  const [payoutsList, setPayoutsList] = useState<any[]>([]);
  const [payoutFormMethod, setPayoutFormMethod] = useState<'BANK_ACCOUNT' | 'UPI'>('BANK_ACCOUNT');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [accountType, setAccountType] = useState<'SAVINGS' | 'CURRENT'>('CURRENT');
  const [savingPayout, setSavingPayout] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Inspection Modal State
  const [inspectionModal, setInspectionModal] = useState<{
    open: boolean;
    bookingId: string;
    vehicleId: string;
    vehicleName: string;
    handoverType: 'PICKUP' | 'RETURN';
  } | null>(null);

  // Calendar Block State
  const [selectedVehicleForBlock, setSelectedVehicleForBlock] = useState('');
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState<'MAINTENANCE' | 'MANUAL_BLOCK'>('MAINTENANCE');
  const [blockNotes, setBlockNotes] = useState('');

  const loadVendorData = async () => {
    try {
      setLoading(true);
      const [metRes, bookRes, vehRes, payProfRes] = await Promise.all([
        fetch('/api/vendor/metrics'),
        fetch('/api/bookings'),
        fetch('/api/vehicles?limit=50'),
        fetch('/api/vendor/payout-profile'),
      ]);

      const metData = await metRes.json();
      const bookData = await bookRes.json();
      const vehData = await vehRes.json();

      if (metData.metrics) setMetrics(metData.metrics);
      if (bookData.bookings) setBookings(bookData.bookings);
      if (vehData.vehicles) setVehicles(vehData.vehicles);

      if (payProfRes.ok) {
        const profData = await payProfRes.json();
        if (profData.exists && profData.profile) {
          setPayoutProfile(profData.profile);
          setBeneficiaryName(profData.profile.beneficiaryName || '');
          setBankName(profData.profile.bankName || '');
          setIfscCode(profData.profile.ifscCode || '');
          setPayoutFormMethod(profData.profile.payoutMethod || 'BANK_ACCOUNT');
        }
      }
    } catch (err) {
      console.error('Vendor data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayoutProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPayout(true);
    setPayoutMessage(null);
    try {
      const res = await fetch('/api/vendor/payout-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beneficiaryName,
          payoutMethod: payoutFormMethod,
          bankName,
          accountNumber,
          confirmAccountNumber,
          ifscCode,
          upiId,
          accountType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save payout profile');
      }

      setPayoutProfile(data.profile);
      setAccountNumber('');
      setConfirmAccountNumber('');
      setPayoutMessage({ type: 'success', text: data.message || 'Payout details saved & encrypted successfully.' });
    } catch (err: any) {
      setPayoutMessage({ type: 'error', text: err.message || 'Failed to save payout details' });
    } finally {
      setSavingPayout(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, []);

  const handleBookingAction = async (bookingId: string, action: 'START_RIDE' | 'COMPLETE' | 'CANCEL') => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        loadVendorData();
      }
    } catch (err) {
      console.error('Booking action failed:', err);
    }
  };

  const handleBlockDates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleForBlock || !blockStart || !blockEnd) return;

    try {
      const res = await fetch('/api/vendor/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: selectedVehicleForBlock,
          startDate: `${blockStart}T00:00:00`,
          endDate: `${blockEnd}T23:59:59`,
          reason: blockReason,
          notes: blockNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to block dates');
        return;
      }

      alert('Dates successfully blocked to prevent overlapping customer bookings.');
      setBlockStart('');
      setBlockEnd('');
      setBlockNotes('');
      loadVendorData();
    } catch (err: any) {
      alert(err.message || 'Block failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-navy-950 text-white p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-heading">
                {user?.vendor?.businessName || 'Himalayan Wheels & Expeditions'}
              </h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase border border-emerald-500/30">
                Verified Partner
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Local Mobility Operator • Tapovan, Rishikesh Hub
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadVendorData}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Live Data
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Bookings</span>
          <div className="text-2xl font-black font-heading text-navy-900">
            {metrics?.totalBookings || bookings.length}
          </div>
          <div className="text-[11px] text-slate-500">{metrics?.activeBookings || 1} currently active on road</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Fleet Size</span>
          <div className="text-2xl font-black font-heading text-navy-900">
            {metrics?.totalVehicles || vehicles.length}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">{metrics?.availableVehicles || vehicles.length} ready to ride</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Gross Fleet Revenue</span>
          <div className="text-2xl font-black font-heading text-emerald-600">
            {formatINR(metrics?.grossRevenue || 12450)}
          </div>
          <div className="text-[11px] text-slate-500">Excludes refundable customer deposits</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Partner Rating</span>
          <div className="text-2xl font-black font-heading text-amber-500 flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span>{metrics?.avgRating || 4.9}</span>
          </div>
          <div className="text-[11px] text-slate-500">Based on verified reviews</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('BOOKINGS')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'BOOKINGS'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Customer Bookings Queue ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('FLEET')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'FLEET'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Fleet Management ({vehicles.length})
        </button>
        <button
          onClick={() => setActiveTab('CALENDAR')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'CALENDAR'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Availability & Maintenance Blocker
        </button>
      </div>

      {/* TAB 1: Bookings Operations */}
      {activeTab === 'BOOKINGS' && (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-20 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                  <Image
                    src={b.vehicleId?.images?.[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=200&q=80'}
                    alt="v"
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">
                      {b.vehicleId?.brand} {b.vehicleId?.model}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        b.bookingStatus === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.bookingStatus === 'ACTIVE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.bookingStatus}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">Ref: {b.bookingNumber} • Rider: {b.customerDetails?.fullName} ({b.customerDetails?.phone})</div>
                  <div className="text-xs text-slate-600">
                    📅 {formatDateTime(b.pickupDateTime)} → {formatDateTime(b.returnDateTime)} ({b.pickupType})
                  </div>
                  <div className="text-xs text-slate-500">📍 {b.pickupLocation}</div>
                </div>
              </div>

              {/* Handover & Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0">
                {b.bookingStatus === 'CONFIRMED' && (
                  <button
                    onClick={() =>
                      setInspectionModal({
                        open: true,
                        bookingId: b._id,
                        vehicleId: b.vehicleId?._id || b.vehicleId,
                        vehicleName: `${b.vehicleId?.brand} ${b.vehicleId?.model}`,
                        handoverType: 'PICKUP',
                      })
                    }
                    className="px-4 py-2 bg-brand-orange hover:bg-brand-dark text-white rounded-xl text-xs font-bold shadow-md shadow-brand-orange/20 flex items-center gap-1.5"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Start Pickup Handover Inspection</span>
                  </button>
                )}

                {b.bookingStatus === 'ACTIVE' && (
                  <button
                    onClick={() =>
                      setInspectionModal({
                        open: true,
                        bookingId: b._id,
                        vehicleId: b.vehicleId?._id || b.vehicleId,
                        vehicleName: `${b.vehicleId?.brand} ${b.vehicleId?.model}`,
                        handoverType: 'RETURN',
                      })
                    }
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete Return Check-in</span>
                  </button>
                )}

                {b.bookingStatus === 'ACTIVE' && (
                  <button
                    onClick={() => handleBookingAction(b._id, 'COMPLETE')}
                    className="px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold"
                  >
                    Release & Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Fleet Management */}
      {activeTab === 'FLEET' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <div key={v._id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-slate-200">
                  <Image
                    src={v.images?.[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80'}
                    alt="v"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {v.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1">{v.brand} {v.model}</h3>
                  <p className="text-xs text-slate-500">{v.registrationNumber}</p>
                </div>
                <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                  <span className="text-base font-extrabold text-navy-900 font-heading">{formatINR(v.pricePerDay)}/day</span>
                  <span className="text-xs text-emerald-700 font-semibold">{formatINR(v.securityDeposit)} Deposit</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Calendar Blocker */}
      {activeTab === 'CALENDAR' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-6 max-w-2xl">
          <div>
            <h3 className="font-bold text-slate-900 text-base font-heading">
              Block Vehicle Availability / Scheduled Maintenance
            </h3>
            <p className="text-xs text-slate-500">
              Blocked dates prevent customer reservations and eliminate double bookings.
            </p>
          </div>

          <form onSubmit={handleBlockDates} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Vehicle</label>
              <select
                required
                value={selectedVehicleForBlock}
                onChange={(e) => setSelectedVehicleForBlock(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white outline-none font-semibold cursor-pointer"
              >
                <option value="">-- Choose a Vehicle --</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.brand} {v.model} ({v.registrationNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Block Start Date</label>
                <input
                  type="date"
                  required
                  value={blockStart}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBlockStart(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Block End Date</label>
                <input
                  type="date"
                  required
                  value={blockEnd}
                  min={blockStart}
                  onChange={(e) => setBlockEnd(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason</label>
              <select
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value as any)}
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white outline-none"
              >
                <option value="MAINTENANCE">Periodic Maintenance & Service</option>
                <option value="MANUAL_BLOCK">Manual Shop Block / Personal Use</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Notes</label>
              <input
                type="text"
                placeholder="e.g. Brake pad change & oil replacement"
                value={blockNotes}
                onChange={(e) => setBlockNotes(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Block Selected Dates
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: Payout & Bank Details */}
      {activeTab === 'PAYOUTS' && (
        <div className="space-y-6 max-w-4xl">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base font-heading">
                  Vendor Payout Settings & Settlement Account
                </h3>
                <p className="text-xs text-slate-500">
                  Direct automated settlements for completed vehicle rentals. Protected with enterprise AES-256-GCM encryption.
                </p>
              </div>
              {payoutProfile ? (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    payoutProfile.verificationStatus === 'VERIFIED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {payoutProfile.verificationStatus}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  Not Configured
                </span>
              )}
            </div>

            {/* Current Masked Account Display */}
            {payoutProfile && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Beneficiary Name</span>
                  <span className="font-bold text-slate-900">{payoutProfile.beneficiaryName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">
                    {payoutProfile.payoutMethod === 'BANK_ACCOUNT' ? 'Masked Bank Account' : 'Masked UPI VPA'}
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {payoutProfile.maskedAccountNumber || payoutProfile.upiId || '•••• •••• ••••'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">
                    {payoutProfile.payoutMethod === 'BANK_ACCOUNT' ? 'IFSC Code' : 'Settlement Mode'}
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {payoutProfile.ifscCode || payoutProfile.payoutMethod}
                  </span>
                </div>
              </div>
            )}

            {payoutMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  payoutMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{payoutMessage.text}</span>
              </div>
            )}

            {/* Payout Configuration Form */}
            <form onSubmit={handleSavePayoutProfile} className="space-y-4 text-xs pt-2">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPayoutFormMethod('BANK_ACCOUNT')}
                  className={`flex-1 p-3 rounded-xl border text-center font-bold transition-all ${
                    payoutFormMethod === 'BANK_ACCOUNT'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Bank Account (NEFT / IMPS)
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutFormMethod('UPI')}
                  className={`flex-1 p-3 rounded-xl border text-center font-bold transition-all ${
                    payoutFormMethod === 'UPI'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Instant UPI ID (VPA)
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Registered Beneficiary / Account Holder Name *</label>
                <input
                  type="text"
                  required
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra / Himalayan Wheels Pvt Ltd"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              {payoutFormMethod === 'BANK_ACCOUNT' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. HDFC Bank / State Bank of India"
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Account Type</label>
                      <select
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value as any)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
                      >
                        <option value="CURRENT">Current Account</option>
                        <option value="SAVINGS">Savings Account</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Bank Account Number *</label>
                      <input
                        type="password"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter full 9-18 digit account number"
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Confirm Account Number *</label>
                      <input
                        type="text"
                        required
                        value={confirmAccountNumber}
                        onChange={(e) => setConfirmAccountNumber(e.target.value)}
                        placeholder="Re-enter bank account number"
                        className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bank IFSC Code *</label>
                    <input
                      type="text"
                      required
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g. HDFC0001234 / SBIN0000456"
                      className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-mono uppercase"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">UPI ID / Virtual Payment Address *</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                    placeholder="e.g. partner.ridesetu@okhdfcbank"
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-mono lowercase"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPayout}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-75"
                >
                  {savingPayout ? 'Encrypting & Saving Credentials...' : 'Save & Verify Payout Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Inspection Modal */}
      {inspectionModal && (
        <DigitalInspectionModal
          isOpen={inspectionModal.open}
          onClose={() => setInspectionModal(null)}
          bookingId={inspectionModal.bookingId}
          vehicleId={inspectionModal.vehicleId}
          vehicleName={inspectionModal.vehicleName}
          handoverType={inspectionModal.handoverType}
          onInspectionComplete={() => {
            loadVendorData();
          }}
        />
      )}
    </div>
  );
}
