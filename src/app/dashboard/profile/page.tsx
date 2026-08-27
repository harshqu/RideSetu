'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DocumentUploadModal from '@/components/profile/DocumentUploadModal';
import { User, ShieldCheck, FileText, CheckCircle2, AlertCircle, RefreshCw, Upload, Edit3, ArrowRight, Lock } from 'lucide-react';

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadDocType, setUploadDocType] = useState<'DRIVING_LICENCE' | 'AADHAAR' | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/customer/profile');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load profile');
      }

      setProfile(data.profile);
    } catch (err: any) {
      setError(err.message || 'Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const getDocStatusBadge = (status?: string) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">✓ VERIFIED</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px]">⏳ Under Review</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[10px]">✕ Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">Not Uploaded</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-16">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-extrabold text-brand-orange uppercase tracking-wider">RideSetu Identity Vault</div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-navy-950">My Profile & Documents</h1>
          </div>

          <button
            type="button"
            onClick={() => fetchProfile()}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Profile</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Loading identity profile...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-2 text-rose-700">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        ) : !profile ? null : (
          <div className="space-y-6">
            {/* Personal Info Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-navy-950 text-white flex items-center justify-center font-black text-xl shadow-md">
                  {profile.name ? profile.name[0].toUpperCase() : 'U'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-navy-950">{profile.name}</h2>
                    {profile.profileComplete && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">
                        ✓ KYC Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-500">{profile.email}</p>
                  <p className="text-xs font-semibold text-slate-500">{profile.phone}</p>
                </div>
              </div>
            </div>

            {/* Smart KYC Auto-Fill Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 rounded-3xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-emerald-950">Smart KYC Auto-Fill Enabled</h3>
                  <p className="text-xs font-semibold text-emerald-800">
                    Your verified identity documents will be automatically used when booking a vehicle for yourself.
                  </p>
                </div>
              </div>

              <Link
                href="/vendors"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shrink-0 transition-all"
              >
                Book Ride
              </Link>
            </div>

            {/* Identity Documents Vault */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-navy-950 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-orange" />
                  Identity Documents Vault
                </h3>
              </div>

              {/* Driving License */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">Driving License</span>
                    {getDocStatusBadge(profile.documents?.drivingLicense?.status || profile.drivingLicenseStatus)}
                  </div>
                  <div className="font-mono font-bold text-slate-600">
                    {profile.drivingLicenseNumberMasked || 'XXXXXX4321'}
                  </div>
                  {profile.documents?.drivingLicense?.rejectionReason && (
                    <p className="text-[11px] text-rose-600 font-bold">
                      Reason: {profile.documents.drivingLicense.rejectionReason}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setUploadDocType('DRIVING_LICENCE')}
                  className="px-4 py-2 bg-navy-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm self-start sm:self-auto transition-all"
                >
                  {profile.documents?.drivingLicense ? 'Replace Document' : 'Upload DL'}
                </button>
              </div>

              {/* Aadhaar Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">Aadhaar Card</span>
                    {getDocStatusBadge(profile.documents?.aadhaar?.status)}
                  </div>
                  <div className="font-mono font-bold text-slate-600">
                    {profile.documents?.aadhaar?.maskedNumber || 'XXXX-XXXX-1234'}
                  </div>
                  {profile.documents?.aadhaar?.rejectionReason && (
                    <p className="text-[11px] text-rose-600 font-bold">
                      Reason: {profile.documents.aadhaar.rejectionReason}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setUploadDocType('AADHAAR')}
                  className="px-4 py-2 bg-navy-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm self-start sm:self-auto transition-all"
                >
                  {profile.documents?.aadhaar ? 'Replace Document' : 'Upload Aadhaar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Document Upload Modal */}
      {uploadDocType && (
        <DocumentUploadModal
          documentType={uploadDocType}
          isOpen={!!uploadDocType}
          onClose={() => setUploadDocType(null)}
          onSuccess={() => fetchProfile()}
        />
      )}
    </div>
  );
}
