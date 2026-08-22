'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Calendar,
  CreditCard,
  User,
  ShieldCheck,
  Check,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const loadNotifications = React.useCallback(async (cat = activeTab) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notifications?category=${cat}`);
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) setNotifications(data.notifications);
        if (typeof data.unreadCount === 'number') setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load customer notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadNotifications(activeTab);
  }, [activeTab, loadNotifications]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        loadNotifications(activeTab);
      }
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      loadNotifications(activeTab);
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FF6B00] flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black font-heading text-slate-900 flex items-center gap-2">
              Notifications {unreadCount > 0 && <span className="px-2 py-0.5 rounded-full bg-[#FF6B00] text-white text-xs font-bold">{unreadCount}</span>}
            </h1>
            <p className="text-xs text-slate-600 font-medium">Updates regarding your bookings, payments, and account activity.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors min-h-[44px]"
            >
              Mark All as Read
            </button>
          )}
          <button
            onClick={() => loadNotifications(activeTab)}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold">
        {[
          { id: 'ALL', label: 'All' },
          { id: 'UNREAD', label: 'Unread' },
          { id: 'BOOKING', label: 'Bookings' },
          { id: 'PAYMENT', label: 'Payments' },
          { id: 'ACCOUNT', label: 'Account' },
          { id: 'SAFETY', label: 'Safety & System' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl border transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {loading ? (
        <DashboardSkeleton />
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-extrabold text-slate-800">No notifications found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">You&apos;re all caught up! New booking updates and messages will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.read && handleMarkSingleRead(n._id)}
              className={`bg-white rounded-3xl border p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:border-orange-300 shadow-sm ${
                !n.read ? 'border-orange-200 bg-orange-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                  !n.read ? 'bg-orange-100 text-[#FF6B00]' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 font-heading">{n.title}</h4>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#FF6B00]"></span>}
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{n.message}</p>
                  <span className="text-[11px] text-slate-400 font-bold block pt-1">{formatDateTime(n.createdAt)}</span>
                </div>
              </div>

              {n.link && (
                <Link
                  href={n.link}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 shadow-sm flex items-center gap-1 min-h-[44px]"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
