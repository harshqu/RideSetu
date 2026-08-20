'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { formatDateTime } from '@/lib/utils';

export default function PartnerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifs() {
      try {
        setLoading(true);
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (data.notifications) setNotifications(data.notifications);
      } catch (err) {
        console.error('Notifications load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNotifs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-black font-heading text-white">Partner Notifications & Alerts</h1>
        </div>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Instant alerts for new customer bookings, digital inspection handovers, and payout settlements.
        </p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No unread alerts"
          description="Operational notifications and booking updates will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n._id} className="p-4 bg-slate-950/70 border border-white/10 rounded-2xl flex items-start gap-3 text-xs">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="font-extrabold text-white">{n.title}</div>
                <p className="text-slate-300">{n.message}</p>
                <span className="text-[10px] text-slate-400 block">{formatDateTime(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
