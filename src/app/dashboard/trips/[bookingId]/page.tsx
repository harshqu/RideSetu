'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import GoogleTripMap from '@/components/maps/GoogleTripMap';
import { formatINR, formatDateTime } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import {
  Car,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  ShieldAlert,
  ArrowLeft,
  Share2,
  Navigation,
  Check,
} from 'lucide-react';

export default function ActiveTripPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  const fetchTripTelemetry = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/trips/${params.bookingId}/location`);
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (err) {
      console.error('Failed to fetch trip telemetry:', err);
    }
  }, [params.bookingId]);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        const res = await fetch(`/api/bookings/${params.bookingId}`);
        const data = await res.json();
        if (!res.ok || !data.booking) {
          throw new Error(data.error || 'Failed to fetch trip details.');
        }
        setBooking(data.booking);
      } catch (err: any) {
        setErrorMsg(err.message || 'Error loading active trip.');
      } finally {
        setLoading(false);
      }
    };

    if (params.bookingId) {
      fetchTrip();
      fetchTripTelemetry();
      const interval = setInterval(fetchTripTelemetry, 10000); // 10s telemetry polling
      return () => clearInterval(interval);
    }
  }, [params.bookingId, fetchTripTelemetry]);

  const handleShareTrip = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/dashboard/trips/${params.bookingId}`;
      navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 font-sans">
        <DashboardSkeleton />
      </div>
    );
  }

  if (errorMsg || !booking) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center space-y-4 font-sans">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-black text-slate-900">Unable to load trip</h2>
        <p className="text-xs text-slate-600 font-medium">{errorMsg || 'Trip details not found.'}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Bookings
        </button>

        <button
          onClick={handleShareTrip}
          className="px-4 py-2 rounded-xl bg-orange-50 border border-orange-200 text-[#FF6B00] text-xs font-bold flex items-center gap-1.5 hover:bg-orange-100 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>{shareCopied ? 'Trip Link Copied ✓' : 'Share Live Trip'}</span>
        </button>
      </div>

      {/* Live Status Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Trip Status: {booking.bookingStatus}
            </span>
            <h1 className="text-xl font-black font-heading text-white mt-1">
              Booking #{booking.bookingNumber} — {booking.vehicleId?.brand} {booking.vehicleId?.model}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Pickup Point: {booking.pickupLocation || 'Vendor Hub'}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-black text-amber-400 block">
              {telemetry?.distanceKm ? `${telemetry.distanceKm} km remaining` : 'Tracking Active'}
            </span>
            <span className="text-[11px] text-slate-300 font-bold block">
              {telemetry?.etaMinutes ? `ETA ~ ${telemetry.etaMinutes} minutes` : 'Live Telemetry'}
            </span>
          </div>
        </div>
      </div>

      {/* Embedded Live Google Map */}
      <GoogleTripMap
        pickup={{ lat: 30.1317, lng: 78.3242, address: booking.pickupLocation }}
        destination={{
          lat: booking.deliveryLocation?.latitude || 30.1257,
          lng: booking.deliveryLocation?.longitude || 78.3276,
          address: booking.deliveryLocation?.formattedAddress || booking.dropoffLocation,
        }}
        vendorLocation={{
          lat: telemetry?.latestLocation?.latitude || 30.1317,
          lng: telemetry?.latestLocation?.longitude || 78.3242,
          speed: telemetry?.latestLocation?.speed || 0,
          heading: telemetry?.latestLocation?.heading || 0,
          telemetryStatus: telemetry?.telemetryStatus || 'LIVE',
          secondsAgo: telemetry?.secondsAgo || 4,
        }}
        trackingMode="CUSTOMER"
        height="400px"
      />

      {/* Vehicle & Vendor Info */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm text-xs font-semibold">
        <h3 className="font-extrabold text-sm text-slate-900 font-heading">Trip Details & Emergency Assistance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-extrabold text-[10px] uppercase">Vehicle Information</span>
            <p className="text-slate-900 font-extrabold">{booking.vehicleId?.brand} {booking.vehicleId?.model}</p>
            <p className="text-slate-600">Reg: {booking.vehicleId?.registrationNumber}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-extrabold text-[10px] uppercase">Vendor Partner</span>
            <p className="text-slate-900 font-extrabold">{booking.vendorId?.businessName || 'RideSetu Partner'}</p>
            <p className="text-slate-600">Helpline: +91 98765 43210</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-extrabold text-[10px] uppercase">Scheduled Dates</span>
            <p className="text-slate-900 font-extrabold">{formatDateTime(booking.pickupDateTime)}</p>
            <p className="text-slate-600">Return: {formatDateTime(booking.returnDateTime)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
