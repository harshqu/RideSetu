'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { formatINR, formatDateTime } from '@/lib/utils';
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Zap,
  AlertTriangle,
  FileText,
  Star,
  CheckCircle2,
  RefreshCw,
  Plus,
  ArrowRight,
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ALL' | 'KYC' | 'SUPPORT'>('ACTIVE');
  const [sosSending, setSosSending] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [extendModalBooking, setExtendModalBooking] = useState<any | null>(null);
  const [newExtendDate, setNewExtendDate] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const activeBooking = bookings.find((b) => b.bookingStatus === 'ACTIVE' || b.bookingStatus === 'CONFIRMED');

  const handleSos = async () => {
    if (!activeBooking) {
      alert('You do not have an active booking to trigger roadside SOS.');
      return;
    }
    setSosSending(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'EMERGENCY_ROADSIDE',
          priority: 'CRITICAL_EMERGENCY',
          bookingId: activeBooking._id,
          subject: `Emergency SOS: ${activeBooking.vehicleId?.brand || 'Vehicle'} at ${activeBooking.pickupLocation}`,
          message: `Rider ${user?.name} triggered Roadside SOS for booking ${activeBooking.bookingNumber}. Mechanical response unit assigned.`,
        }),
      });
      if (res.ok) {
        setSosSent(true);
      }
    } catch (err) {
      console.error('SOS error:', err);
    } finally {
      setSosSending(false);
    }
  };

  const handleExtendRental = async () => {
    if (!extendModalBooking || !newExtendDate) return;
    try {
      const res = await fetch(`/api/bookings/${extendModalBooking._id}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newReturnDateTime: `${newExtendDate}T20:00:00`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Extension unavailable due to overlapping reservation');
        return;
      }

      alert(data.message || 'Rental extended successfully!');
      setExtendModalBooking(null);
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to extend');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Image
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
            alt="avatar"
            width={48}
            height={48}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-orange/30"
          />
          <div>
            <h1 className="text-xl font-bold font-heading text-navy-900">
              Welcome Back, {user?.name || 'Traveller'}!
            </h1>
            <p className="text-xs text-slate-500">{user?.email} • Verified Rider</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> KYC Verified
          </span>
          <Link
            href="/vehicles"
            className="px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-dark text-white font-bold text-xs shadow-md shadow-brand-orange/20 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Book New Ride
          </Link>
        </div>
      </div>

      {/* ACTIVE RIDE COMPANION BANNER (Major Highlight) */}
      {activeBooking && (
        <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 text-white rounded-3xl p-6 sm:p-8 border border-white/15 shadow-xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-extrabold uppercase text-xs tracking-wider text-emerald-400">
                LIVE ACTIVE RIDE COMPANION
              </span>
            </div>
            <span className="font-mono text-xs text-slate-400 bg-white/10 px-2.5 py-1 rounded-lg">
              Booking: {activeBooking.bookingNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Vehicle Card */}
            <div className="flex items-center gap-3">
              <div className="relative w-20 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0">
                <Image
                  src={activeBooking.vehicleId?.images?.[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=200&q=80'}
                  alt="vehicle"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">
                  {activeBooking.vehicleId?.brand} {activeBooking.vehicleId?.model}
                </h3>
                <p className="text-xs text-slate-400">{activeBooking.vehicleId?.registrationNumber || 'UK 07 BD 4821'}</p>
                <div className="text-[11px] text-amber-400 font-semibold mt-1">
                  Partner: {activeBooking.vendorId?.businessName}
                </div>
              </div>
            </div>

            {/* Return Time & Location */}
            <div className="text-xs space-y-1 bg-white/5 p-3.5 rounded-2xl border border-white/10">
              <div className="text-slate-400 flex items-center gap-1 font-semibold">
                <Clock className="w-3.5 h-3.5 text-brand-orange" /> Return Due:
              </div>
              <div className="font-bold text-sm text-white">{formatDateTime(activeBooking.returnDateTime)}</div>
              <div className="text-slate-400 text-[11px]">📍 {activeBooking.dropoffLocation}</div>
            </div>

            {/* Actions: Emergency SOS & Extend */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSos}
                disabled={sosSending || sosSent}
                className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                  sosSent
                    ? 'bg-emerald-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 animate-pulse'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>{sosSent ? '✓ Roadside SOS Dispatched' : '24/7 Roadside Assistance SOS'}</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setExtendModalBooking(activeBooking);
                    setNewExtendDate(new Date(Date.now() + 259200000).toISOString().split('T')[0]);
                  }}
                  className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs text-center border border-white/10"
                >
                  Extend Rental
                </button>
                <a
                  href={`tel:${activeBooking.vendorId?.phone || '+919811122233'}`}
                  className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs text-center border border-white/10 flex items-center justify-center gap-1"
                >
                  <PhoneCall className="w-3 h-3" /> Call Partner
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'ACTIVE'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          My Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('KYC')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'KYC'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Digital KYC & Documents
        </button>
      </div>

      {/* Bookings List */}
      {activeTab === 'ACTIVE' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <Compass className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">No bookings yet</h3>
              <p className="text-xs text-slate-500">Explore Uttarakhand top destinations and reserve verified rides.</p>
              <Link href="/vehicles" className="inline-block px-4 py-2 bg-brand-orange text-white text-xs font-bold rounded-xl">
                Browse Fleet
              </Link>
            </div>
          ) : (
            bookings.map((b) => (
              <div
                key={b._id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-16 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                    <Image
                      src={b.vehicleId?.images?.[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=200&q=80'}
                      alt="vehicle"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">
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
                    <div className="text-xs text-slate-500 font-mono">Ref: {b.bookingNumber}</div>
                    <div className="text-xs text-slate-600">
                      📅 {formatDateTime(b.pickupDateTime)} → {formatDateTime(b.returnDateTime)}
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-1.5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="font-extrabold text-navy-900 font-heading text-lg">
                    {formatINR(b.totalPayable)}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">
                    {formatINR(b.securityDeposit)} Deposit ({b.depositStatus})
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* KYC Profile Tab */}
      {activeTab === 'KYC' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-6 max-w-2xl">
          <div>
            <h3 className="font-bold text-slate-900 text-base font-heading">Digital Driving License Verification</h3>
            <p className="text-xs text-slate-500">Your documents are authenticated for instant 5-minute handover.</p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-emerald-950">Driving License: UK0720210084920</div>
              <div className="text-emerald-800 text-[11px]">Status: Verified Active</div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] uppercase">
              Authenticated
            </span>
          </div>
        </div>
      )}

      {/* Rental Extension Modal */}
      {extendModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Extend Rental Period</h3>
            <p className="text-xs text-slate-500">
              Select your desired new return date. Our backend will atomically verify that no conflicting bookings exist.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Return Date</label>
              <input
                type="date"
                value={newExtendDate}
                min={new Date(extendModalBooking.returnDateTime).toISOString().split('T')[0]}
                onChange={(e) => setNewExtendDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setExtendModalBooking(null)}
                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExtendRental}
                className="flex-1 py-2.5 bg-brand-orange text-white rounded-xl text-xs font-bold shadow-md"
              >
                Confirm Extension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
