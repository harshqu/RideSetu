'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import DigitalInspectionModal from '@/components/handover/DigitalInspectionModal';
import { formatINR, formatDateTime } from '@/lib/utils';
import {
  Store,
  Car,
  Calendar,
  Layers,
  Star,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  TrendingUp,
  Clock,
  Plus,
  RefreshCw,
  XCircle,
  Truck,
  Upload,
  FileText,
  Eye,
  ShieldCheck,
  Building2,
  DollarSign,
  MapPin,
  Info,
  Bell,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewSummary, setReviewSummary] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'FLEET' | 'BOOKINGS' | 'REVIEWS' | 'NOTIFICATIONS' | 'CALENDAR' | 'ONBOARDING' | 'DOCUMENTS' | 'PAYOUTS'
  >('OVERVIEW');

  // Vendor Profile & Onboarding State
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile Form Fields
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Rishikesh');
  const [state, setState] = useState('Uttarakhand');
  const [pincode, setPincode] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [rentalLicenseNumber, setRentalLicenseNumber] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState(2);
  const [operatingOpen, setOperatingOpen] = useState('08:00 AM');
  const [operatingClose, setOperatingClose] = useState('09:00 PM');
  const [operatingDays, setOperatingDays] = useState('Mon - Sun');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState(15);
  const [baseDeliveryFee, setBaseDeliveryFee] = useState(100);

  // Documents State
  const [vendorDocs, setVendorDocs] = useState<any[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docMsg, setDocMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Vehicle Modal State
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    brand: '',
    model: '',
    variant: '',
    category: 'SCOOTER',
    year: new Date().getFullYear(),
    color: 'Black',
    registrationNumber: '',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    description: '',
    pricePerDay: 500,
    pricePerHour: 50,
    weeklyPrice: 3000,
    monthlyPrice: 10000,
    securityDeposit: 1000,
    kmLimitPerDay: 150,
    excessKmCharge: 4,
    deliveryAvailable: true,
    hotelDeliveryAvailable: true,
    hostelDeliveryAvailable: true,
    pickupAvailable: true,
    lateReturnFeePerHour: 100,
    helmetIncluded: true,
    roadsideAssistance: true,
  });

  // Reply to Review Modal
  const [replyModalReview, setReplyModalReview] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Payout Profile State
  const [payoutFormMethod, setPayoutFormMethod] = useState<'BANK_ACCOUNT' | 'UPI'>('BANK_ACCOUNT');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountType, setAccountType] = useState<'SAVINGS' | 'CURRENT'>('CURRENT');
  const [upiId, setUpiId] = useState('');
  const [savingPayout, setSavingPayout] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Handover Inspection Modal State
  const [inspectionModal, setInspectionModal] = useState<{
    open: boolean;
    bookingId: string;
    vehicleId: string;
    vehicleName: string;
    handoverType: 'PICKUP' | 'RETURN';
  } | null>(null);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      const [metRes, bookRes, vehRes, profRes, docRes, payProfileRes, notifRes, revRes] = await Promise.all([
        fetch('/api/vendor/metrics'),
        fetch('/api/vendor/bookings'),
        fetch('/api/vendor/vehicles'),
        fetch('/api/vendor/profile'),
        fetch('/api/vendor/documents'),
        fetch('/api/vendor/payout-profile'),
        fetch('/api/notifications'),
        fetch('/api/reviews?aggregate=true'),
      ]);

      const metData = await metRes.json();
      const bookData = await bookRes.json();
      const vehData = await vehRes.json();
      const profData = await profRes.json();
      const docData = await docRes.json();
      const payProfileData = await payProfileRes.json();
      const notifData = await notifRes.json();
      const revData = await revRes.json();

      if (metData.metrics) setMetrics(metData.metrics);
      if (bookData.bookings) setBookings(bookData.bookings);
      if (vehData.vehicles) setVehicles(vehData.vehicles);
      if (docData.documents) setVendorDocs(docData.documents);
      if (notifData.notifications) {
        setNotifications(notifData.notifications);
        setUnreadNotifCount(notifData.unreadCount || 0);
      }
      if (revData.reviews) {
        setReviews(revData.reviews);
        setReviewSummary(revData.summary);
      }

      if (profData.vendor) {
        const v = profData.vendor;
        setVendorProfile(v);
        setBusinessName(v.businessName || '');
        setOwnerName(v.ownerName || '');
        setPhone(v.phone || '');
        setEmail(v.email || '');
        setAddress(v.address || '');
        setCity(v.city || 'Rishikesh');
        setState(v.state || 'Uttarakhand');
        setPincode(v.pincode || '');
        setGstNumber(v.gstNumber || '');
        setRentalLicenseNumber(v.rentalLicenseNumber || '');
        setBusinessDescription(v.businessDescription || '');
        setYearsInBusiness(v.yearsInBusiness || 2);
        if (v.operatingHours) {
          setOperatingOpen(v.operatingHours.open || '08:00 AM');
          setOperatingClose(v.operatingHours.close || '09:00 PM');
          setOperatingDays(v.operatingHours.days || 'Mon - Sun');
        }
        setPickupInstructions(v.pickupInstructions || '');
        setDeliveryRadiusKm(v.deliveryRadiusKm || 15);
        setBaseDeliveryFee(v.baseDeliveryFee || 100);
      }

      if (payProfileData.payoutProfile) {
        const p = payProfileData.payoutProfile;
        setPayoutFormMethod(p.method || 'BANK_ACCOUNT');
        setBeneficiaryName(p.beneficiaryName || '');
        setBankName(p.bankName || '');
        setAccountType(p.accountType || 'CURRENT');
        setIfscCode(p.ifscCode || '');
        setUpiId(p.upiId || '');
      }
    } catch (err) {
      console.error('Vendor data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileMsg(null);
      const res = await fetch('/api/vendor/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          ownerName,
          phone,
          email,
          address,
          city,
          state,
          pincode,
          gstNumber,
          rentalLicenseNumber,
          businessDescription,
          yearsInBusiness: Number(yearsInBusiness),
          operatingHours: {
            open: operatingOpen,
            close: operatingClose,
            days: operatingDays,
          },
          pickupInstructions,
          deliveryRadiusKm: Number(deliveryRadiusKm),
          baseDeliveryFee: Number(baseDeliveryFee),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg({ type: 'success', text: 'Onboarding profile saved! Status updated to Under Review.' });
        loadVendorData();
      } else {
        setProfileMsg({ type: 'error', text: data.error || 'Failed to save profile' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingDoc(true);
      setDocMsg(null);

      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await fetch('/api/vendor/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            docType,
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            fileBase64: base64Data,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setDocMsg({ type: 'success', text: `${docType.replace('_', ' ')} uploaded & encrypted securely.` });
          loadVendorData();
        } else {
          setDocMsg({ type: 'error', text: data.error || 'Upload failed' });
        }
        setUploadingDoc(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setDocMsg({ type: 'error', text: 'Document upload failed' });
      setUploadingDoc(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (vendorProfile?.verificationStatus !== 'VERIFIED') {
      alert('Your vendor agency must be VERIFIED by RideSetu Admin before listing fleet vehicles.');
      return;
    }

    try {
      setSavingVehicle(true);
      const res = await fetch('/api/vendor/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleForm),
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddVehicleModal(false);
        alert('Vehicle created successfully! It is now UNDER_REVIEW by RideSetu Admin.');
        loadVendorData();
      } else {
        alert(data.error || 'Failed to add vehicle');
      }
    } catch (err) {
      console.error('Add vehicle error:', err);
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleReplyReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyModalReview || !replyText.trim()) return;
    try {
      setReplySubmitting(true);
      const res = await fetch(`/api/reviews/${replyModalReview._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText }),
      });
      const data = await res.json();
      if (res.ok) {
        setReplyModalReview(null);
        setReplyText('');
        loadVendorData();
      } else {
        alert(data.error || 'Failed to publish reply.');
      }
    } catch (err) {
      console.error('Review reply error:', err);
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleSavePayoutProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingPayout(true);
      setPayoutMessage(null);
      const res = await fetch('/api/vendor/payout-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: payoutFormMethod,
          beneficiaryName,
          bankName,
          accountNumber,
          ifscCode,
          accountType,
          upiId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPayoutMessage({ type: 'success', text: 'Payout profile verified & encrypted successfully!' });
        loadVendorData();
      } else {
        setPayoutMessage({ type: 'error', text: data.error || 'Failed to save payout profile' });
      }
    } catch (err) {
      setPayoutMessage({ type: 'error', text: 'Payout profile update error' });
    } finally {
      setSavingPayout(false);
    }
  };

  const verificationStatus = vendorProfile?.verificationStatus || 'PENDING';
  const reliabilityScore = vendorProfile?.reliabilityScore ?? 98;
  const cancellationCount = vendorProfile?.cancellationCount ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-orange text-xs font-bold tracking-wide uppercase">
            <Store className="w-3.5 h-3.5" /> Fleet Operator Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            {businessName || 'Operator Control Hub'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Manage your fleet, verified customer reviews, rental handovers, calendar blocks, and settlements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setShowAddVehicleModal(true)}
            className="px-4 py-2.5 bg-brand-orange hover:bg-orange-600 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-950/20"
          >
            <Plus className="w-4 h-4" /> Add Fleet Vehicle
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
        {[
          { key: 'OVERVIEW', label: 'Overview & Metrics' },
          { key: 'FLEET', label: `Fleet Inventory (${vehicles.length})` },
          { key: 'BOOKINGS', label: `Bookings (${bookings.length})` },
          { key: 'REVIEWS', label: `Reviews & Ratings (${reviews.length})` },
          { key: 'NOTIFICATIONS', label: `Notifications (${unreadNotifCount})` },
          { key: 'ONBOARDING', label: 'Agency Profile' },
          { key: 'DOCUMENTS', label: `Compliance Docs (${vendorDocs.length})` },
          { key: 'PAYOUTS', label: 'Payout Settings' },
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

      {/* TAB: REVIEWS & RATINGS */}
      {activeTab === 'REVIEWS' && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">Overall Rating</div>
              <div className="text-2xl font-extrabold text-navy-900 flex items-center gap-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                {reviewSummary?.overallRating || 4.8}
              </div>
              <div className="text-[11px] text-slate-500">{reviewSummary?.totalReviews || reviews.length} verified reviews</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">Vehicle Condition</div>
              <div className="text-xl font-bold text-slate-800">{reviewSummary?.vehicleConditionRating || 4.9}★</div>
              <div className="text-[11px] text-slate-500">Fleet maintenance</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">Host Behavior</div>
              <div className="text-xl font-bold text-slate-800">{reviewSummary?.vendorBehaviorRating || 4.8}★</div>
              <div className="text-[11px] text-slate-500">Customer politeness</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">Pickup Experience</div>
              <div className="text-xl font-bold text-slate-800">{reviewSummary?.pickupExperienceRating || 4.8}★</div>
              <div className="text-[11px] text-slate-500">Punctual handovers</div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">Reliability Score</div>
              <div className="text-xl font-bold text-emerald-700">{reliabilityScore} / 100</div>
              <div className="text-[11px] text-slate-500">{cancellationCount} vendor cancellations</div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base font-heading">Traveller Reviews for Your Fleet</h3>

            {reviews.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed rounded-2xl text-slate-400 text-xs">
                No customer reviews yet. Reviews will appear here once riders complete their rentals.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reviews.map((r) => (
                  <div key={r._id} className="py-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{r.customerName}</span>
                        {r.isVerifiedRental && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[9px] flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Verified Ride
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: r.overallRating || 5 }).map((_, si) => (
                          <Star key={si} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 text-[10px] text-slate-500">
                      <span className="bg-slate-50 px-2 py-0.5 rounded border">Vehicle: {r.vehicleConditionRating || r.overallRating}★</span>
                      <span className="bg-slate-50 px-2 py-0.5 rounded border">Host: {r.vendorBehaviorRating || r.overallRating}★</span>
                      <span className="bg-slate-50 px-2 py-0.5 rounded border">Pickup: {r.pickupExperienceRating || r.overallRating}★</span>
                    </div>

                    <p className="text-slate-700">{r.reviewText}</p>

                    {r.vendorReply && r.vendorReply.text ? (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-slate-900">Your Response:</strong>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyModalReview(r);
                              setReplyText(r.vendorReply.text);
                            }}
                            className="text-brand-orange hover:underline font-bold"
                          >
                            Edit Response
                          </button>
                        </div>
                        <p className="text-slate-700">{r.vendorReply.text}</p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setReplyModalReview(r);
                          setReplyText('');
                        }}
                        className="px-3 py-1.5 bg-navy-900 hover:bg-navy-950 text-white rounded-xl font-bold text-xs flex items-center gap-1 mt-2"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Reply to Review
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: NOTIFICATIONS */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base font-heading flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-orange" /> Operator Notifications
          </h3>

          {notifications.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed rounded-2xl text-slate-400 text-xs">
              No notifications yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div key={n._id} className="p-4 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">{n.title}</div>
                    <p className="text-slate-600">{n.message}</p>
                    <span className="text-[10px] text-slate-400">{formatDateTime(n.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: FLEET */}
      {activeTab === 'FLEET' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base font-heading">Fleet Vehicles</h3>
              <button
                type="button"
                onClick={() => setShowAddVehicleModal(true)}
                className="px-4 py-2 bg-brand-orange text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Vehicle
              </button>
            </div>

            {vehicles.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed rounded-2xl text-slate-400 text-xs">
                No vehicles listed yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b text-slate-400 uppercase text-[10px]">
                      <th className="pb-3 px-3">Vehicle</th>
                      <th className="pb-3 px-3">Registration</th>
                      <th className="pb-3 px-3">Daily Rent</th>
                      <th className="pb-3 px-3">Deposit</th>
                      <th className="pb-3 px-3">Rating</th>
                      <th className="pb-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehicles.map((v) => (
                      <tr key={v._id}>
                        <td className="py-3 px-3 font-bold text-slate-900">{v.brand} {v.model}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">{v.registrationNumber}</td>
                        <td className="py-3 px-3 font-bold">{formatINR(v.pricePerDay)}/day</td>
                        <td className="py-3 px-3 font-semibold text-emerald-700">{formatINR(v.securityDeposit)}</td>
                        <td className="py-3 px-3 font-bold text-amber-600">{v.rating || 4.8}★</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${v.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {v.status || (v.isVerified ? 'APPROVED' : 'UNDER_REVIEW')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: ONBOARDING */}
      {activeTab === 'ONBOARDING' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6">
          <h3 className="font-bold text-slate-900 text-base font-heading">Agency Business Profile</h3>
          {profileMsg && (
            <div className={`p-3 rounded-xl text-xs font-bold ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
              {profileMsg.text}
            </div>
          )}
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Owner Name *</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 bg-navy-900 text-white rounded-xl font-bold"
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      )}

      {/* REPLY TO REVIEW MODAL */}
      {replyModalReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base font-heading flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-orange" /> Reply to Customer Review
              </h3>
              <button type="button" onClick={() => setReplyModalReview(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border text-xs space-y-1">
              <div className="font-bold text-slate-800">{replyModalReview.customerName} ({replyModalReview.overallRating}★)</div>
              <p className="text-slate-600 italic">&ldquo;{replyModalReview.reviewText}&rdquo;</p>
            </div>

            <form onSubmit={handleReplyReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Official Host Reply *</label>
                <textarea
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank the customer or address any feedback constructively..."
                  className="w-full p-3 border rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setReplyModalReview(null)} className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replySubmitting}
                  className="px-5 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {replySubmitting ? 'Submitting...' : 'Post Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD VEHICLE MODAL */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base font-heading flex items-center gap-2">
                <Car className="w-5 h-5 text-brand-orange" /> Add Vehicle to Fleet
              </h3>
              <button type="button" onClick={() => setShowAddVehicleModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="Honda / Royal Enfield"
                    value={vehicleForm.brand}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="Activa 6G / Himalayan"
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={vehicleForm.category}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, category: e.target.value })}
                    className="w-full p-2.5 border rounded-xl bg-white"
                  >
                    <option value="SCOOTER">Scooter</option>
                    <option value="MOTORCYCLE">Motorcycle</option>
                    <option value="CAR">Car</option>
                    <option value="EV">Electric Vehicle (EV)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registration Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="UK07AZ1234"
                    value={vehicleForm.registrationNumber}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, registrationNumber: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 border rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Daily Rent (₹) *</label>
                  <input
                    type="number"
                    required
                    value={vehicleForm.pricePerDay}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, pricePerDay: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Security Deposit (₹)</label>
                  <input
                    type="number"
                    value={vehicleForm.securityDeposit}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, securityDeposit: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button type="button" onClick={() => setShowAddVehicleModal(false)} className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingVehicle}
                  className="px-5 py-2 bg-brand-orange text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {savingVehicle ? 'Submitting...' : 'Submit Vehicle for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
