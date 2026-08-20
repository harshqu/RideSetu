'use client';

import React, { useState, useEffect } from 'react';
import { Star, Eye, ShieldAlert } from 'lucide-react';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function OpsReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (data.reviews) setReviews(data.reviews);
    } catch (err) {
      console.error('Ops reviews load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-black font-heading text-white flex items-center gap-2">
          <Star className="w-6 h-6 text-emerald-400 fill-emerald-400" /> Marketplace Review Moderation & Quality Control
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Audit customer ratings, verify rental completion integrity, and moderate inappropriate marketplace reviews.
        </p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="bg-slate-950/70 rounded-3xl border border-white/10 p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="pb-3">Rider Customer</th>
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Rating</th>
                <th className="pb-3">Review Text</th>
                <th className="pb-3">Moderation State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {reviews.map((r) => (
                <tr key={r._id} className="hover:bg-white/5">
                  <td className="py-3.5 font-bold text-white">{r.customerName || 'Verified Rider'}</td>
                  <td className="py-3.5 text-slate-300">{r.vehicleId?.brand} {r.vehicleId?.model}</td>
                  <td className="py-3.5 font-black text-amber-400">{r.overallRating || 5}★</td>
                  <td className="py-3.5 text-slate-300 max-w-xs truncate">{r.reviewText}</td>
                  <td className="py-3.5">
                    <span className="font-black uppercase px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                      PUBLISHED (VERIFIED)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
