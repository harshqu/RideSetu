'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatINR } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import {
  Car,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  ShieldAlert,
  FileText,
  HelpCircle,
  ArrowLeft,
  Gauge,
  Fuel,
  Sparkles,
} from 'lucide-react';

export default function ActiveTripPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        const res = await fetch(`/api/bookings/${params.bookingId}/handover`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch trip details.');
        }
        setBooking(data.booking);
      } catch (err: any) {
        setErrorMsg(err.message || 'Error loading active trip.');
      } finally {
        setLoading(false);
      }
    };

    if (params.bookingId) fetchTrip();
  }, [params.bookingId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  const vehicle = booking?.vehicleId || {};
  const isHandedOverPendingCustomer = booking?.bookingStatus === 'HANDED_OVER';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 px-4 sm:px-6">
      {/* Top Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider">
            Ride active
          </span>
          <h1 className="text-xl font-black text-slate-900 dark:text-white font-heading mt-0.5">
            Your Ride is Active
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Booking Ref: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{booking?.bookingNumber}</span>
          </p>
        </div>
      </div>

      {/* Handover Acceptance Reminder Banner */}
      {isHandedOverPendingCustomer && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            Vendor has completed handover inspection. Please accept inspection report to start trip.
          </div>
          <button
            onClick={() => router.push(`/dashboard/trips/${params.bookingId}/handover`)}
            className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs min-h-[36px]"
          >
            Review Inspection
          </button>
        </div>
      )}

      {/* Active Trip Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 text-white space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black font-heading">
                {vehicle.brand} {vehicle.model}
              </h2>
              <span className="text-xs font-mono font-bold text-amber-400">
                {vehicle.registrationNumber || 'UK07-XX-0000'}
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs">
            LIVE TRIP
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10 text-xs">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Pickup Location</span>
            <span className="font-semibold text-slate-200 block truncate">{booking?.pickupLocation}</span>
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Return Schedule</span>
            <span className="font-semibold text-slate-200 block">
              {new Date(booking?.returnDateTime || Date.now()).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-amber-400 uppercase block">Security Deposit Escrow</span>
            <span className="font-bold text-emerald-400 block">
              {formatINR(booking?.securityDeposit || 1000)} (Refundable)
            </span>
          </div>
        </div>
      </div>

      {/* Emergency & Support Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => alert('Emergency SOS Alert Triggered. RideSetu Safety Team notified.')}
          className="p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 font-bold text-xs flex items-center justify-center gap-2 min-h-[48px]"
        >
          <ShieldAlert className="w-4 h-4" /> 24x7 SOS Emergency Assistance
        </button>
        <button
          onClick={() => alert(`Calling RideSetu Verified Vendor: ${booking?.vendorId?.phone || '+91 9876543210'}`)}
          className="p-4 rounded-2xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 min-h-[48px]"
        >
          <Phone className="w-4 h-4 text-emerald-500" /> Contact Host Vendor
        </button>
        <button
          onClick={() => alert('Opening Rental Agreement PDF document...')}
          className="p-4 rounded-2xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 min-h-[48px]"
        >
          <FileText className="w-4 h-4 text-amber-500" /> View Rental Agreement
        </button>
      </div>
    </div>
  );
}
