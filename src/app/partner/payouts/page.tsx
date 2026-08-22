'use client';

import React, { useState, useEffect } from 'react';
import { formatINR } from '@/lib/utils';
import { Wallet, CheckCircle2 } from 'lucide-react';

export default function PartnerPayoutsPage() {
  const [payoutProfile, setPayoutProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/vendor/payout-profile');
        const data = await res.json();
        if (data.payoutProfile) setPayoutProfile(data.payoutProfile);
      } catch (err) {
        console.error('Payout profile error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-amber-600" />
          <h1 className="text-2xl font-black font-heading text-slate-900">Payout Settlements & Encrypted Bank Profile</h1>
        </div>
        <p className="text-xs text-slate-600 font-medium mt-1">
          Automated weekly bank transfers processed via Razorpay Route / Bank NEFT.
        </p>
      </div>

      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="font-extrabold text-slate-900 text-base font-heading">Encrypted Bank Account Details</h2>
          <span className="font-black uppercase px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Payout Profile Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block">Beneficiary Name</span>
            <span className="font-bold text-slate-900 text-sm">{payoutProfile?.beneficiaryName || 'Harshwardhan (Business Account)'}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Bank Name</span>
            <span className="font-bold text-slate-900 text-sm">{payoutProfile?.bankName || 'State Bank of India'}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Account Number</span>
            <span className="font-mono font-bold text-amber-700 text-sm">•••• •••• {payoutProfile?.accountNumberLast4 || '4829'}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">IFSC Code</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{payoutProfile?.ifscCode || 'SBIN0001234'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
