'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Building2, CheckCircle2 } from 'lucide-react';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function PartnerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProf() {
      try {
        setLoading(true);
        const res = await fetch('/api/vendor/profile');
        const data = await res.json();
        if (data.vendor) setProfile(data.vendor);
      } catch (err) {
        console.error('Profile load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProf();
  }, []);

  const businessName = profile?.businessName || user?.vendor?.businessName || user?.name || 'RideSetu Partner';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-black font-heading text-white">Partner Business Profile & Operating Details</h1>
        </div>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Public operator profile shown on vehicle rental marketplace listings.
        </p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="p-6 bg-slate-950/70 border border-white/10 rounded-3xl space-y-4 shadow-sm text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400">Verified Mobility Partner</span>
              <h2 className="text-xl font-black text-white font-heading">{businessName}</h2>
            </div>
            <span className="font-black uppercase px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 font-semibold block">Primary Contact</span>
              <span className="font-bold text-white text-sm">{profile?.ownerName || user?.name} ({profile?.phone || user?.phone})</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Hub City & Location</span>
              <span className="font-bold text-white text-sm">{profile?.city || 'Rishikesh'}, {profile?.state || 'Uttarakhand'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Operating Hours</span>
              <span className="font-bold text-white text-sm">{profile?.operatingHours?.open || '08:00 AM'} – {profile?.operatingHours?.close || '09:00 PM'} ({profile?.operatingHours?.days || 'Mon - Sun'})</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Delivery Radius</span>
              <span className="font-bold text-white text-sm">{profile?.deliveryRadiusKm || 15} km from Hub</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
