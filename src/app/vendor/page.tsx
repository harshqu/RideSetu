'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import DigitalInspectionModal from '@/components/handover/DigitalInspectionModal';
import { formatINR, formatDateTime } from '@/lib/utils';
import { StatusBadge, RatingBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { DashboardSkeleton, TableRowSkeleton } from '@/components/ui/Skeleton';
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
  Edit3,
  X,
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
        setProfileMsg({ type: 'success', text: 'Business profile updated successfully!' });
        loadVendorData();
      } else {
        setProfileMsg({ type: 'error', text: data.error || 'Failed to update profile.' });
      }
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Error updating profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingVehicle(true);
      const res = await fetch('/api/vendor/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleForm),
      });
      if (res.ok) {
        setShowAddVehicleModal(false);
        loadVendorData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add vehicle');
      }
    } catch (err: any) {
      alert(err.message || 'Error adding vehicle');
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleReplyToReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyModalReview || !replyText.trim()) return;

    try {
      setReplySubmitting(true);
      const res = await fetch(`/api/reviews/${replyModalReview._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText: replyText.trim() }),
      });

      if (res.ok) {
        setReplyModalReview(null);
        setReplyText('');
        loadVendorData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit response');
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting response');
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleSavePayoutProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingPayout(true);
      setPayoutMessage(null);

      const payload: any = { method: payoutFormMethod };
      if (payoutFormMethod === 'BANK_ACCOUNT') {
        if (accountNumber !== confirmAccountNumber) {
          setPayoutMessage({ type: 'error', text: 'Account numbers do not match.' });
          setSavingPayout(false);
          return;
        }
        payload.beneficiaryName = beneficiaryName;
        payload.bankName = bankName;
        payload.accountNumber = accountNumber;
        payload.ifscCode = ifscCode;
        payload.accountType = accountType;
      } else {
        payload.upiId = upiId;
        payload.beneficiaryName = beneficiaryName;
      }

      const res = await fetch('/api/vendor/payout-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setPayoutMessage({ type: 'success', text: 'Payout details encrypted and saved securely!' });
        loadVendorData();
      } else {
        setPayoutMessage({ type: 'error', text: data.error || 'Failed to save payout details.' });
      }
    } catch (err: any) {
      setPayoutMessage({ type: 'error', text: err.message || 'Error saving payout details.' });
    } finally {
      setSavingPayout(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-white/10">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
            <Store className="w-3.5 h-3.5" /> Mobility Partner Operations Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-white">
            {vendorProfile?.businessName || user?.vendor?.businessName || 'Partner Fleet Hub'}
          </h1>
          <p className="text-xs text-slate-300 max-w-xl font-normal leading-relaxed">
            Manage your verified rental inventory, inspect digital handovers, process return audits, and track net payout settlements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadVendorData}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Refresh Fleet Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setShowAddVehicleModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-dark hover:to-brand-orange text-white text-xs font-black shadow-lg shadow-brand-orange/30 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar">
        {[
          { id: 'OVERVIEW', label: 'Overview', icon: TrendingUp },
          { id: 'FLEET', label: `Fleet Inventory (${vehicles.length})`, icon: Car },
          { id: 'BOOKINGS', label: `Bookings & Handovers (${bookings.length})`, icon: Calendar },
          { id: 'REVIEWS', label: `Customer Reviews (${reviews.length})`, icon: Star },
          { id: 'PAYOUTS', label: 'Payout Settlements', icon: DollarSign },
          { id: 'DOCUMENTS', label: 'Trade Documents', icon: FileCheck2 },
          { id: 'ONBOARDING', label: 'Business Profile', icon: Building2 },
          { id: 'NOTIFICATIONS', label: 'Alerts', icon: Bell, unread: unreadNotifCount },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-navy-950 text-white shadow-md shadow-navy-950/20'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.unread ? (
                <span className="w-5 h-5 rounded-full bg-brand-orange text-white text-[10px] font-black flex items-center justify-center">
                  {tab.unread}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* TAB: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Metric KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase">Gross Booking Revenue</span>
                  <div className="text-2xl sm:text-3xl font-black text-navy-950 font-heading">
                    {formatINR(metrics?.grossRevenue || 18450)}
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold">Excludes customer security deposits</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase">Net Payout Accrued</span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-heading">
                    {formatINR(metrics?.netPayout || 15682)}
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold">Post platform commission deduction</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase">Active Fleet</span>
                  <div className="text-2xl sm:text-3xl font-black text-navy-950 font-heading">
                    {vehicles.filter((v) => v.status === 'APPROVED' || v.status === 'VERIFIED').length} / {vehicles.length}
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold">Vehicles live on marketplace</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase">Partner Rating</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-amber-500 font-heading">
                      {Number(reviewSummary?.averageRating || 4.9).toFixed(1)}★
                    </span>
                    <span className="text-xs text-slate-400 font-bold">({reviews.length} reviews)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold">Based on verified renter reviews</p>
                </div>
              </div>

              {/* Action Required / Active Handovers Table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold font-heading text-navy-950 text-base">Pending Handovers & Return Inspections</h3>
                  <button onClick={() => setActiveTab('BOOKINGS')} className="text-xs font-bold text-brand-orange hover:underline">
                    View All
                  </button>
                </div>

                {bookings.length === 0 ? (
                  <EmptyState
                    title="No bookings pending action"
                    description="When customers reserve your fleet, pickup checklists and return inspections will appear here."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
                          <th className="pb-3">Code</th>
                          <th className="pb-3">Vehicle</th>
                          <th className="pb-3">Customer</th>
                          <th className="pb-3">Pickup Window</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Handover Inspection</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bookings.slice(0, 5).map((b) => (
                          <tr key={b._id} className="hover:bg-slate-50/80">
                            <td className="py-3 font-mono font-bold text-slate-900">{b.bookingCode}</td>
                            <td className="py-3 font-bold text-slate-900">{b.vehicleId?.brand} {b.vehicleId?.model}</td>
                            <td className="py-3 text-slate-600">{b.customerDetails?.fullName || 'Aarav Sharma'}</td>
                            <td className="py-3 text-slate-500">{formatDateTime(b.pickupDateTime)}</td>
                            <td className="py-3"><StatusBadge status={b.status} size="sm" /></td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() =>
                                  setInspectionModal({
                                    open: true,
                                    bookingId: b._id,
                                    vehicleId: b.vehicleId?._id || '',
                                    vehicleName: `${b.vehicleId?.brand} ${b.vehicleId?.model}`,
                                    handoverType: b.status === 'CONFIRMED' ? 'PICKUP' : 'RETURN',
                                  })
                                }
                                className="px-3 py-1.5 rounded-xl bg-navy-950 hover:bg-slate-900 text-white font-extrabold text-[11px] shadow-sm active:scale-95"
                              >
                                {b.status === 'CONFIRMED' ? '📷 Start Pickup Inspection' : '🔍 Process Return Audit'}
                              </button>
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

          {/* TAB: FLEET INVENTORY */}
          {activeTab === 'FLEET' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black font-heading text-navy-950 text-xl">Fleet Inventory ({vehicles.length})</h3>
                  <p className="text-xs text-slate-500 font-medium">Manage pricing, deposits, and availability status for your listed fleet.</p>
                </div>
                <button
                  onClick={() => setShowAddVehicleModal(true)}
                  className="px-4 py-2 bg-brand-orange hover:bg-brand-dark text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Vehicle
                </button>
              </div>

              {vehicles.length === 0 ? (
                <EmptyState
                  title="No vehicles in inventory"
                  description="List your first scooter, motorcycle, or car to start receiving bookings."
                  actionText="Add Vehicle to Fleet"
                  onAction={() => setShowAddVehicleModal(true)}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
                        <th className="pb-3">Vehicle</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Reg. Number</th>
                        <th className="pb-3">Daily Rate</th>
                        <th className="pb-3">Deposit</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vehicles.map((v) => (
                        <tr key={v._id} className="hover:bg-slate-50">
                          <td className="py-3.5 flex items-center gap-3">
                            <div className="w-10 h-8 rounded-lg bg-slate-200 relative overflow-hidden shrink-0">
                              <Image
                                src={v.images?.[0] || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=100&q=80'}
                                alt={v.model}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                            <span className="font-extrabold text-slate-900 font-heading">{v.brand} {v.model}</span>
                          </td>
                          <td className="py-3.5 font-semibold text-slate-600">{v.category}</td>
                          <td className="py-3.5 font-mono font-bold text-slate-700">{v.registrationNumber || 'UK07-XX-0000'}</td>
                          <td className="py-3.5 font-black text-navy-950 font-heading">{formatINR(v.pricePerDay)}/day</td>
                          <td className="py-3.5 font-bold text-emerald-700">{formatINR(v.securityDeposit)}</td>
                          <td className="py-3.5"><StatusBadge status={v.status || 'APPROVED'} size="sm" /></td>
                          <td className="py-3.5 text-right">
                            <Link href={`/vehicles/${v._id}`} className="p-2 text-slate-600 hover:text-brand-orange font-bold text-xs">
                              Preview
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: BOOKINGS & HANDOVERS */}
          {activeTab === 'BOOKINGS' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-black font-heading text-navy-950 text-xl">All Fleet Bookings & Inspections</h3>

              {bookings.length === 0 ? (
                <EmptyState
                  title="No bookings recorded"
                  description="When riders reserve vehicles, all trip manifests and digital inspection histories appear here."
                />
              ) : (
                <div className="space-y-4">
                  {bookings.map((b) => (
                    <div key={b._id} className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-xs px-2 py-0.5 rounded bg-white border">{b.bookingCode}</span>
                          <span className="font-black text-navy-950 text-base font-heading">{b.vehicleId?.brand} {b.vehicleId?.model}</span>
                          <StatusBadge status={b.status} size="sm" />
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-1">Rider: {b.customerDetails?.fullName} ({b.customerDetails?.phone})</p>
                        <p className="text-[11px] text-slate-400 font-medium">{formatDateTime(b.pickupDateTime)} → {formatDateTime(b.returnDateTime)}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right mr-2">
                          <div className="font-black text-navy-950 font-heading text-base">{formatINR(b.pricing?.totalPrice || 999)}</div>
                          <span className="text-[10px] text-emerald-700 font-bold">Deposit: {formatINR(b.pricing?.securityDeposit || 1000)}</span>
                        </div>

                        <button
                          onClick={() =>
                            setInspectionModal({
                              open: true,
                              bookingId: b._id,
                              vehicleId: b.vehicleId?._id || '',
                              vehicleName: `${b.vehicleId?.brand} ${b.vehicleId?.model}`,
                              handoverType: b.status === 'CONFIRMED' ? 'PICKUP' : 'RETURN',
                            })
                          }
                          className="px-4 py-2 bg-navy-950 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95"
                        >
                          {b.status === 'CONFIRMED' ? '📷 Pickup Inspection' : '🔍 Return Inspection'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: REVIEWS */}
          {activeTab === 'REVIEWS' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-black font-heading text-navy-950 text-xl">Customer Reviews & Host Replies ({reviews.length})</h3>

              {reviews.length === 0 ? (
                <EmptyState
                  title="No reviews yet"
                  description="When riders complete trips with your vehicles, their ratings and feedback will appear here."
                />
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r._id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{r.customerName}</span>
                          <span className="text-[10px] text-slate-400">({r.vehicleId?.brand} {r.vehicleId?.model})</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: r.overallRating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-700">{r.reviewText}</p>

                      {r.vendorReply?.text ? (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-600">
                          <strong className="text-slate-900 block text-[11px]">Your Public Response:</strong>
                          <p className="text-xs">{r.vendorReply.text}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyModalReview(r)}
                          className="px-3 py-1.5 bg-navy-950 text-white rounded-xl font-bold text-[11px]"
                        >
                          Reply to Review
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: PAYOUT SETTLEMENTS */}
          {activeTab === 'PAYOUTS' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-black font-heading text-navy-950 text-xl">Bank Account & Payout Settings</h3>
                <p className="text-xs text-slate-500 font-medium">Encrypted payout account for weekly automated settlements.</p>
              </div>

              {payoutMessage && (
                <div className={`p-4 rounded-2xl text-xs font-bold ${payoutMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                  {payoutMessage.text}
                </div>
              )}

              <form onSubmit={handleSavePayoutProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Beneficiary Name</label>
                  <input
                    type="text"
                    required
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      required
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Account Number</label>
                    <input
                      type="password"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Confirm Account Number</label>
                    <input
                      type="text"
                      required
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none font-mono font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingPayout}
                  className="px-6 py-2.5 bg-navy-950 hover:bg-slate-900 text-white rounded-xl font-extrabold text-xs shadow-md transition-all"
                >
                  {savingPayout ? 'Encrypting & Saving...' : 'Save Payout Profile'}
                </button>
              </form>
            </div>
          )}

          {/* TAB: ONBOARDING & BUSINESS PROFILE */}
          {activeTab === 'ONBOARDING' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-black font-heading text-navy-950 text-xl">Business Profile & Operating Hours</h3>
                <p className="text-xs text-slate-500 font-medium">Commercial details shown on marketplace listings.</p>
              </div>

              {profileMsg && (
                <div className={`p-4 rounded-2xl text-xs font-bold ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Business Name</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Owner Name</label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Shop Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">City Hub</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">GST Number</label>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Rental Permit No.</label>
                    <input
                      type="text"
                      value={rentalLicenseNumber}
                      onChange={(e) => setRentalLicenseNumber(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-navy-950 hover:bg-slate-900 text-white rounded-xl font-extrabold text-xs shadow-md"
                >
                  {savingProfile ? 'Saving...' : 'Update Business Profile'}
                </button>
              </form>
            </div>
          )}
        </>
      )}

      {/* DIGITAL HANDOVER INSPECTION MODAL */}
      {inspectionModal && (
        <DigitalInspectionModal
          isOpen={inspectionModal.open}
          onClose={() => setInspectionModal(null)}
          bookingId={inspectionModal.bookingId}
          vehicleId={inspectionModal.vehicleId}
          vehicleName={inspectionModal.vehicleName}
          handoverType={inspectionModal.handoverType}
          onInspectionComplete={() => {
            setInspectionModal(null);
            loadVendorData();
          }}
        />
      )}
    </div>
  );
}
