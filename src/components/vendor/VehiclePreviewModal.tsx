'use client';

import React from 'react';
import Image from 'next/image';
import { formatINR } from '@/lib/utils';
import {
  Car,
  X,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
} from 'lucide-react';

interface VehiclePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: any;
}

export default function VehiclePreviewModal({
  isOpen,
  onClose,
  vehicle,
}: VehiclePreviewModalProps) {
  if (!isOpen || !vehicle) return null;

  const images = vehicle.images?.length
    ? vehicle.images
    : ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80'];

  const depositEnabled = vehicle.securityDepositEnabled ?? true;
  const depositAmount = depositEnabled ? (vehicle.securityDepositAmount ?? vehicle.securityDeposit ?? 1000) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Banner */}
        <div className="bg-amber-400 text-slate-950 px-6 py-2.5 flex items-center justify-between font-black text-xs uppercase tracking-wider">
          <span className="flex items-center gap-1.5 font-heading">
            <Sparkles className="w-4 h-4" /> PREVIEW MODE — Not visible to customers yet
          </span>
          <button onClick={onClose} className="p-1 hover:bg-slate-950/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden border border-white/10">
              <Image src={images[0]} alt={vehicle.model} fill className="object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img: string, idx: number) => (
                  <div key={idx} className="w-20 h-14 relative rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-white/10">
                    <Image src={img} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details & Specifications */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-400 font-extrabold text-[10px] uppercase">
                  {vehicle.category}
                </span>
                <span className="text-xs font-mono text-slate-400">{vehicle.registrationNumber || 'UK07-XX-0000'}</span>
              </div>
              <h2 className="text-2xl font-black text-white font-heading mt-1">
                {vehicle.brand} {vehicle.model} {vehicle.variant}
              </h2>
              <p className="text-xs text-slate-400 mt-1">{vehicle.description || 'Verified vehicle available for rental in Uttarakhand.'}</p>
            </div>

            {/* Pricing Snapshot */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Daily Rental Rate</span>
                <span className="text-base font-black text-white font-heading">{formatINR(vehicle.pricePerDay)}/day</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Security Deposit</span>
                <span className={`text-base font-black font-heading ${depositEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {depositEnabled ? formatINR(depositAmount) : '₹0 Deposit'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Km Limit / Day</span>
                <span className="text-sm font-bold text-slate-200">{vehicle.kmLimitPerDay || 150} Km</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Excess Charge</span>
                <span className="text-sm font-bold text-slate-200">₹{vehicle.excessKmCharge || 4}/km</span>
              </div>
            </div>

            {/* Inclusions & Policies */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-300 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Helmet Included
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-300 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Roadside Assistance
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-300 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Doorstep Delivery
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
