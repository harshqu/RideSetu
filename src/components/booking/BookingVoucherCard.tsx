'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatINR, formatDateTime } from '@/lib/utils';
import {
  CheckCircle2,
  QrCode,
  MapPin,
  Calendar,
  Clock,
  PhoneCall,
  ShieldCheck,
  Printer,
  Compass,
  ArrowRight,
} from 'lucide-react';

interface BookingVoucherCardProps {
  booking: any;
}

export const BookingVoucherCard: React.FC<BookingVoucherCardProps> = ({ booking }) => {
  const vehicle = booking.vehicleId || {};
  const vendor = booking.vendorId || {};

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-2xl mx-auto my-8">
      {/* Top Banner */}
      <div className="bg-emerald-600 text-white p-6 text-center space-y-2 relative">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-extrabold font-heading">Booking Confirmed!</h2>
        <p className="text-emerald-100 text-xs sm:text-sm">
          Your ride reservation is active and locked with verified partner{' '}
          <strong>{vendor.businessName || 'Himalayan Wheels'}</strong>.
        </p>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Booking Reference Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Booking Reference
            </div>
            <div className="font-mono text-lg font-black text-navy-900">
              {booking.bookingNumber}
            </div>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
              Paid • Verified
            </span>
          </div>
        </div>

        {/* Vehicle & Vendor Card */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
          <div className="relative w-full sm:w-28 h-24 rounded-xl overflow-hidden border border-slate-200 shrink-0">
            <Image
              src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=300&q=80'}
              alt={`${vehicle.brand} ${vehicle.model}`}
              fill
              sizes="(max-width: 640px) 100vw, 112px"
              className="object-cover"
            />
          </div>
          <div className="flex-1 space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              {vehicle.category}
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-xs text-slate-500">{vehicle.variant}</p>
            <div className="text-xs font-medium text-slate-600 flex items-center justify-center sm:justify-start gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Partner: {vendor.businessName}</span>
            </div>
          </div>
        </div>

        {/* Schedule & Handover Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-brand-orange" />
              Pickup Schedule
            </div>
            <div className="font-bold text-slate-900 text-sm">
              {formatDateTime(booking.pickupDateTime)}
            </div>
            <div className="text-slate-500">{booking.pickupLocation}</div>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-orange" />
              Return Schedule
            </div>
            <div className="font-bold text-slate-900 text-sm">
              {formatDateTime(booking.returnDateTime)}
            </div>
            <div className="text-slate-500">{booking.dropoffLocation}</div>
          </div>
        </div>

        {/* QR Code & Fast Handover Instructions */}
        <div className="p-4 bg-navy-950 text-white rounded-2xl flex flex-col sm:flex-row items-center gap-4">
          <div className="w-20 h-20 bg-white p-1 rounded-xl shrink-0 flex items-center justify-center">
            <QrCode className="w-16 h-16 text-slate-900" />
          </div>
          <div className="space-y-1 text-center sm:text-left text-xs">
            <div className="font-bold text-amber-400">⚡ Instant 5-Minute Digital Handover</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Show this QR code at pickup. The partner agent will complete a 360° digital inspection of the odometer, fuel & existing scratches to protect your deposit.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:flex-1 py-3 rounded-xl bg-brand-orange hover:bg-brand-dark text-white font-bold text-xs text-center transition-all shadow-md shadow-brand-orange/20 flex items-center justify-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>Open Active Ride Companion</span>
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Voucher</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingVoucherCard;
