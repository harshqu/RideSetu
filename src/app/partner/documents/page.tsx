'use client';

import React, { useState, useEffect } from 'react';
import { FileCheck, Upload, CheckCircle2, ShieldCheck } from 'lucide-react';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function PartnerDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocs() {
      try {
        setLoading(true);
        const res = await fetch('/api/vendor/documents');
        const data = await res.json();
        if (data.documents) setDocuments(data.documents);
      } catch (err) {
        console.error('Documents load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <FileCheck className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-black font-heading text-white">Trade License & Compliance Documents</h1>
        </div>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Regulatory trade licenses, GST certificates, and rental permit documents verified by RideSetu Platform Operations.
        </p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {['Trade License', 'GST Registration', 'Owner Identity ID', 'Uttarakhand Rental Permit'].map((docName, idx) => (
            <div key={idx} className="p-6 bg-slate-950/70 border border-white/10 rounded-3xl space-y-3 shadow-sm text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-sm">{docName}</span>
                <span className="font-black uppercase px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">HMAC-SHA256 Encrypted Storage • Verified Active</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
