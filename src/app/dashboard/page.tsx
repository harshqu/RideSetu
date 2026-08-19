'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { formatINR, formatDateTime } from '@/lib/utils';
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Zap,
  AlertTriangle,
  FileText,
  Star,
  CheckCircle2,
  RefreshCw,
  Plus,
  ArrowRight,
  User as UserIcon,
  ShieldAlert,
  Eye,
  Mail,
  Phone,
  Edit3,
  X,
  Upload,
  Lock,
  Bell,
  XCircle,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'ACTIVE' | 'ALL' | 'NOTIFICATIONS' | 'PROFILE' | 'KYC' | 'LOCATIONS' | 'PAYMENTS' | 'SUPPORT'
  >('ACTIVE');
  const [sosSending, setSosSending] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [extendModalBooking, setExtendModalBooking] = useState<any | null>(null);
  const [newExtendDate, setNewExtendDate] = useState('');
  const [savedLocations, setSavedLocations] = useState<any[]>([]);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [newLocLabel, setNewLocLabel] = useState('Home / Hotel');
  const [newLocType, setNewLocType] = useState('HOTEL');
  const [newLocBuilding, setNewLocBuilding] = useState('');
  const [newLocRoom, setNewLocRoom] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');
  const [newLocCity, setNewLocCity] = useState('Rishikesh');
  const [newLocLat, setNewLocLat] = useState('30.1317');
  const [newLocLng, setNewLocLng] = useState('78.3242');

  // Customer Profile & KYC States
  const [profile, setProfile] = useState<any>(null);
  const [kycData, setKycData] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profName, setProfName] = useState('');
  const [profDob, setProfDob] = useState('');
  const [profEmergName, setProfEmergName] = useState('');
  const [profEmergPhone, setProfEmergPhone] = useState('');
  const [profEmergRelation, setProfEmergRelation] = useState('Family');

  // OTP Verification Modal
  const [otpModalChannel, setOtpModalChannel] = useState<'EMAIL' | 'PHONE' | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [devCodeNotice, setDevCodeNotice] = useState('');

  // KYC Submission Form State
  const [showKycForm, setShowKycForm] = useState(false);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [kycFormError, setKycFormError] = useState('');
  const [dlNumber, setDlNumber] = useState('');
  const [dlName, setDlName] = useState('');
  const [dlDob, setDlDob] = useState('');
  const [dlIssue, setDlIssue] = useState('');
  const [dlExpiry, setDlExpiry] = useState('');
  const [dlClasses, setDlClasses] = useState<string[]>(['MCWG']);
  const [dlFrontBase64, setDlFrontBase64] = useState('');
  const [dlFrontName, setDlFrontName] = useState('');
  const [dlBackBase64, setDlBackBase64] = useState('');
  const [dlBackName, setDlBackName] = useState('');

  // Document Preview Modal
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

  // Review Modal State
  const [reviewModalBooking, setReviewModalBooking] = useState<any | null>(null);
  const [reviewOverall, setReviewOverall] = useState(5);
  const [reviewVehicle, setReviewVehicle] = useState(5);
  const [reviewVendor, setReviewVendor] = useState(5);
  const [reviewPickup, setReviewPickup] = useState(5);
  const [reviewDelivery, setReviewDelivery] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Cancellation Modal State
  const [cancelModalBooking, setCancelModalBooking] = useState<any | null>(null);
  const [cancelPreview, setCancelPreview] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of travel plans');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Dispute Modal State
  const [disputeModalBooking, setDisputeModalBooking] = useState<any | null>(null);
  const [disputeCategory, setDisputeCategory] = useState('VEHICLE_CONDITION');
  const [disputeRemarks, setDisputeRemarks] = useState('');
  const [disputeClaimAmount, setDisputeClaimAmount] = useState(0);
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bookRes, locRes, profRes, kycRes, payRes, notifRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/customer/saved-locations'),
        fetch('/api/customer/profile'),
        fetch('/api/customer/kyc'),
        fetch('/api/customer/payments'),
        fetch('/api/notifications'),
      ]);

      const bookData = await bookRes.json();
      if (bookData.bookings) setBookings(bookData.bookings);

      if (locRes.ok) {
        const locData = await locRes.json();
        if (locData.locations) setSavedLocations(locData.locations);
      }

      if (profRes.ok) {
        const pData = await profRes.json();
        if (pData.profile) {
          setProfile(pData.profile);
          setProfName(pData.profile.name || '');
          setProfDob(pData.profile.dateOfBirth ? pData.profile.dateOfBirth.split('T')[0] : '');
          setProfEmergName(pData.profile.emergencyContact?.name || '');
          setProfEmergPhone(pData.profile.emergencyContact?.phone || '');
          setProfEmergRelation(pData.profile.emergencyContact?.relation || 'Family');
        }
      }

      if (kycRes.ok) {
        const kData = await kycRes.json();
        if (kData.kyc) setKycData(kData.kyc);
      }

      if (payRes.ok) {
        const payData = await payRes.json();
        if (payData.payments) setPayments(payData.payments);
      }

      if (notifRes.ok) {
        const nData = await notifRes.json();
        if (nData.notifications) setNotifications(nData.notifications);
        if (nData.unreadCount !== undefined) setUnreadNotifCount(nData.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profName,
          dateOfBirth: profDob,
          emergencyContact: {
            name: profEmergName,
            phone: profEmergPhone,
            relation: profEmergRelation,
          },
        }),
      });
      if (res.ok) {
        setEditingProfile(false);
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Save profile error:', err);
    }
  };

  const handleOpenCancelModal = async (booking: any) => {
    try {
      setCancelModalBooking(booking);
      setCancelPreview(null);
      const res = await fetch(`/api/cancellation/preview?bookingId=${booking._id}`);
      const data = await res.json();
      if (res.ok && data.calculation) {
        setCancelPreview(data.calculation);
      }
    } catch (err) {
      console.error('Fetch cancellation preview error:', err);
    }
  };

  const handleExecuteCancellation = async () => {
    if (!cancelModalBooking) return;
    try {
      setCancelLoading(true);
      const res = await fetch(`/api/bookings/${cancelModalBooking._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CANCEL',
          reason: cancelReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCancelModalBooking(null);
        fetchDashboardData();
      } else {
        alert(data.error || 'Cancellation failed.');
      }
    } catch (err) {
      console.error('Cancellation execution error:', err);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalBooking) return;
    try {
      setReviewSubmitting(true);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: reviewModalBooking._id,
          overallRating: reviewOverall,
          vehicleConditionRating: reviewVehicle,
          vendorBehaviorRating: reviewVendor,
          pickupExperienceRating: reviewPickup,
          deliveryExperienceRating: reviewDelivery,
          reviewText,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewModalBooking(null);
        setReviewText('');
        fetchDashboardData();
      } else {
        alert(data.error || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Submit review error:', err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeModalBooking) return;
    try {
      setDisputeSubmitting(true);
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: disputeModalBooking._id,
          category: disputeCategory,
          claimedAmount: disputeClaimAmount,
          customerRemarks: disputeRemarks,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDisputeModalBooking(null);
        setDisputeRemarks('');
        fetchDashboardData();
      } else {
        alert(data.error || 'Failed to file dispute.');
      }
    } catch (err) {
      console.error('Submit dispute error:', err);
    } finally {
      setDisputeSubmitting(false);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const handleTriggerSOS = () => {
    setSosSending(true);
    setTimeout(() => {
      setSosSending(false);
      setSosSent(true);
      setTimeout(() => setSosSent(false), 5000);
    }, 1200);
  };

  const currentKycStatus = profile?.kycStatus || kycData?.status || 'NOT_STARTED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-orange text-xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-3.5 h-3.5" /> Customer Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            Welcome back, {profile?.name || user?.name || 'Rider'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Manage your rides, cancellations, reviews, notifications, and identity verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10 w-full md:w-auto">
          <button
            type="button"
            onClick={handleTriggerSOS}
            disabled={sosSending || sosSent}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
              sosSent ? 'bg-emerald-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            {sosSending ? 'Sending SOS...' : sosSent ? 'SOS Dispatched' : '24/7 Roadside SOS'}
          </button>

          <Link
            href="/vehicles"
            className="px-4 py-2.5 bg-brand-orange hover:bg-orange-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-950/20"
          >
            <Plus className="w-4 h-4" /> Book New Ride
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
        {[
          { key: 'ACTIVE', label: 'Active Rides' },
          { key: 'ALL', label: 'Booking History' },
          { key: 'NOTIFICATIONS', label: `Notifications (${unreadNotifCount})` },
          { key: 'PAYMENTS', label: `Payments (${payments.length})` },
          { key: 'PROFILE', label: 'My Profile' },
          { key: 'KYC', label: 'Identity & KYC' },
          { key: 'LOCATIONS', label: 'Saved Locations' },
          { key: 'SUPPORT', label: 'Roadside Support' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-navy-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base font-heading flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-orange" /> Notification Center
              </h3>
              <p className="text-xs text-slate-500">Real-time alerts for bookings, cancellations, refunds, and ride handovers.</p>
            </div>
            {unreadNotifCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllNotifsRead}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Mark All Read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed rounded-2xl text-slate-400 text-xs">
              No notifications yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div key={n._id} className={`p-4 flex items-start justify-between gap-4 ${n.read ? 'opacity-70' : 'bg-orange-50/30'}`}>
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-brand-orange"></span>}
                      {n.title}
                    </div>
                    <p className="text-slate-600">{n.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{formatDateTime(n.createdAt)}</span>
                  </div>
                  {n.link && (
                    <Link href={n.link} className="px-3 py-1 bg-navy-900 text-white rounded-lg text-xs font-bold shrink-0">
                      View
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BOOKINGS LIST (ACTIVE / ALL) */}
      {(activeTab === 'ACTIVE' || activeTab === 'ALL') && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <Compass className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">No bookings found</h3>
              <Link href="/vehicles" className="inline-block px-4 py-2 bg-brand-orange text-white text-xs font-bold rounded-xl">
                Browse Vehicles
              </Link>
            </div>
          ) : (
            bookings
              .filter((b) => activeTab === 'ALL' || b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'ACTIVE')
              .map((b) => (
                <div key={b._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-3">
                    <div>
                      <span className="font-mono text-xs text-slate-400">Booking ID: {b.bookingNumber}</span>
                      <h3 className="font-bold text-slate-900 text-base">{b.vehicleId?.brand} {b.vehicleId?.model}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                          b.bookingStatus === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'ACTIVE'
                            ? 'bg-blue-100 text-blue-800'
                            : b.bookingStatus.includes('CANCELLED')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.bookingStatus.replace('_', ' ')}
                      </span>

                      {b.cancellationRefundAmount > 0 && (
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
                          Refund: {formatINR(b.cancellationRefundAmount)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-2xl">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Pickup Time</span>
                      <span className="font-bold text-slate-900">{formatDateTime(b.pickupDateTime)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Return Time</span>
                      <span className="font-bold text-slate-900">{formatDateTime(b.returnDateTime)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Paid</span>
                      <span className="font-bold text-navy-900">{formatINR(b.totalPayable)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Deposit</span>
                      <span className="font-bold text-emerald-700">{formatINR(b.securityDeposit)} (Isolated)</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t">
                    {b.bookingStatus === 'COMPLETED' && (
                      <button
                        type="button"
                        onClick={() => setReviewModalBooking(b)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" /> Rate Your Ride
                      </button>
                    )}

                    {(b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'PENDING') && (
                      <button
                        type="button"
                        onClick={() => handleOpenCancelModal(b)}
                        className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold text-xs"
                      >
                        Cancel Ride
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setDisputeModalBooking(b)}
                      className="px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-xs"
                    >
                      Raise Dispute
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* RATE YOUR RIDE MODAL */}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base font-heading flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-400" /> Rate Your Ride Experience
                </h3>
                <span className="text-xs text-slate-400">{reviewModalBooking.bookingNumber} • {reviewModalBooking.vehicleId?.brand} {reviewModalBooking.vehicleId?.model}</span>
              </div>
              <button type="button" onClick={() => setReviewModalBooking(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              {/* Overall Stars */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Overall Trip Rating (1–5 Stars) *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewOverall(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewOverall ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    </button>
                  ))}
                  <span className="font-bold text-slate-800 text-sm ml-2">{reviewOverall} / 5</span>
                </div>
              </div>

              {/* Sub-category breakdown */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">Vehicle Condition</label>
                  <select
                    value={reviewVehicle}
                    onChange={(e) => setReviewVehicle(Number(e.target.value))}
                    className="w-full p-2 border rounded-xl bg-white"
                  >
                    {[5, 4, 3, 2, 1].map((s) => (
                      <option key={s} value={s}>{s} Stars</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">Host / Operator Behaviour</label>
                  <select
                    value={reviewVendor}
                    onChange={(e) => setReviewVendor(Number(e.target.value))}
                    className="w-full p-2 border rounded-xl bg-white"
                  >
                    {[5, 4, 3, 2, 1].map((s) => (
                      <option key={s} value={s}>{s} Stars</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">Pickup Experience</label>
                  <select
                    value={reviewPickup}
                    onChange={(e) => setReviewPickup(Number(e.target.value))}
                    className="w-full p-2 border rounded-xl bg-white"
                  >
                    {[5, 4, 3, 2, 1].map((s) => (
                      <option key={s} value={s}>{s} Stars</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">Delivery Experience</label>
                  <select
                    value={reviewDelivery}
                    onChange={(e) => setReviewDelivery(Number(e.target.value))}
                    className="w-full p-2 border rounded-xl bg-white"
                  >
                    {[5, 4, 3, 2, 1].map((s) => (
                      <option key={s} value={s}>{s} Stars</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Detailed Feedback *</label>
                <textarea
                  required
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details about bike condition, cleanliness, pickup punctuality..."
                  className="w-full p-3 border rounded-xl outline-none"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>This review will display a <strong>Verified Ride</strong> badge derived from your completed booking.</span>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setReviewModalBooking(null)} className="px-4 py-2 border rounded-xl font-bold text-slate-600">
                  Cancel
                </button>
                <button type="submit" disabled={reviewSubmitting} className="px-5 py-2 bg-navy-900 text-white rounded-xl font-bold shadow-md disabled:opacity-50">
                  {reviewSubmitting ? 'Publishing...' : 'Submit Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL RIDE MODAL WITH REAL-TIME PREVIEW */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base font-heading text-red-600 flex items-center gap-2">
                <XCircle className="w-5 h-5" /> Cancel Rental Booking
              </h3>
              <button type="button" onClick={() => setCancelModalBooking(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs text-slate-600">
              Authoritative refund calculation calculated server-side according to RideSetu cancellation policy.
            </p>

            {cancelPreview ? (
              <div className="bg-slate-50 p-4 rounded-2xl border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Hours Before Pickup:</span>
                  <span className="font-bold text-slate-900">{cancelPreview.hoursBeforePickup} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rental Refund ({cancelPreview.rentalRefundPercent}%):</span>
                  <span className="font-bold text-slate-900">{formatINR(cancelPreview.rentalRefundAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Security Deposit Refund (100%):</span>
                  <span className="font-bold text-emerald-700">{formatINR(cancelPreview.depositRefundAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Fee Refund:</span>
                  <span className="font-bold text-slate-900">{formatINR(cancelPreview.deliveryRefundAmount)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-sm font-extrabold">
                  <span className="text-slate-900">Total Refund Payable:</span>
                  <span className="text-emerald-600">{formatINR(cancelPreview.totalRefundAmount)}</span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">Loading authoritative refund preview...</div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1 text-xs">Cancellation Reason *</label>
              <textarea
                required
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-xs outline-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setCancelModalBooking(null)} className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600">
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleExecuteCancellation}
                disabled={cancelLoading}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAISE DISPUTE MODAL */}
      {disputeModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base font-heading flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-brand-orange" /> Open Dispute Ticket
              </h3>
              <button type="button" onClick={() => setDisputeModalBooking(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmitDispute} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dispute Category</label>
                <select
                  value={disputeCategory}
                  onChange={(e) => setDisputeCategory(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white"
                >
                  <option value="VEHICLE_CONDITION">Vehicle Condition / Breakdown</option>
                  <option value="DAMAGE_CHARGE">Incorrect Damage Deduction</option>
                  <option value="VENDOR_BEHAVIOR">Host / Vendor Behaviour</option>
                  <option value="PICKUP_ISSUE">Pickup Punctuality / Issue</option>
                  <option value="DELIVERY_ISSUE">Delivery Location Issue</option>
                  <option value="REFUND_ISSUE">Deposit / Refund Dispute</option>
                  <option value="OTHER">Other Issues</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Claim Amount (if applicable)</label>
                <input
                  type="number"
                  min={0}
                  value={disputeClaimAmount}
                  onChange={(e) => setDisputeClaimAmount(Number(e.target.value))}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Explanation & Evidence Remarks *</label>
                <textarea
                  required
                  rows={3}
                  value={disputeRemarks}
                  onChange={(e) => setDisputeRemarks(e.target.value)}
                  placeholder="Explain the conflict clearly for administrative review..."
                  className="w-full p-2.5 border rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setDisputeModalBooking(null)} className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600">
                  Cancel
                </button>
                <button type="submit" disabled={disputeSubmitting} className="px-5 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50">
                  {disputeSubmitting ? 'Filing...' : 'Submit Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
