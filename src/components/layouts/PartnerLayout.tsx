'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { VendorGuard } from '@/components/common/RoleGuard';
import {
  LayoutDashboard,
  Car,
  CalendarDays,
  Users,
  TrendingUp,
  Wallet,
  Star,
  FileCheck,
  Building2,
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface PartnerLayoutProps {
  children: React.ReactNode;
}

export const PartnerLayout: React.FC<PartnerLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const vendorStatus = (user?.vendor as any)?.status || user?.vendor?.verificationStatus || 'VERIFIED';
  const businessName = user?.vendor?.businessName || user?.name || 'RideSetu Partner';

  const navItems = [
    { name: 'Overview', href: '/partner/dashboard', icon: LayoutDashboard },
    { name: 'Fleet Management', href: '/partner/fleet', icon: Car },
    { name: 'Bookings & Handovers', href: '/partner/bookings', icon: CalendarDays },
    { name: 'Schedule Calendar', href: '/partner/calendar', icon: CalendarDays },
    { name: 'Rider Customers', href: '/partner/customers', icon: Users },
    { name: 'Earnings Ledger', href: '/partner/earnings', icon: TrendingUp },
    { name: 'Payout Requests', href: '/partner/payouts', icon: Wallet },
    { name: 'Customer Reviews', href: '/partner/reviews', icon: Star },
    { name: 'Legal Documents', href: '/partner/documents', icon: FileCheck },
    { name: 'Business Profile', href: '/partner/profile', icon: Building2 },
    { name: 'Notifications', href: '/partner/notifications', icon: Bell },
    { name: 'Partner Help', href: '/partner/help', icon: HelpCircle },
  ];

  return (
    <VendorGuard>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-brand-orange selection:text-white">
        {/* Sidebar for Desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-navy-950 border-r border-white/10 shrink-0 select-none">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <Link href="/partner/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-brand-orange flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-white text-base font-heading tracking-tight flex items-center gap-1">
                  Ride<span className="text-amber-400">Setu</span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Partner
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">B2B Mobility Portal</p>
              </div>
            </Link>
          </div>

          {/* Business Profile Card */}
          <div className="p-4 border-b border-white/10 bg-white/5 space-y-2">
            <div className="font-extrabold text-xs text-white truncate">{businessName}</div>
            <div className="flex items-center justify-between text-[10px]">
              <span
                className={`font-black uppercase px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                  vendorStatus === 'VERIFIED'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : vendorStatus === 'UNDER_REVIEW'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}
              >
                {vendorStatus === 'VERIFIED' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                {vendorStatus === 'UNDER_REVIEW' && <Clock className="w-3 h-3 text-amber-400" />}
                {vendorStatus === 'REJECTED' && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                {vendorStatus}
              </span>
              <span className="text-slate-400 font-semibold">Operator ID #{( (user as any)?.userId || (user as any)?._id || '849201' ).slice(-6)}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto text-xs font-bold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-brand-orange/20 text-amber-400 border border-amber-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer / Sign Out */}
          <div className="p-3 border-t border-white/10 bg-white/5 space-y-2">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              <Compass className="w-4 h-4 text-brand-orange" /> Switch to Marketplace
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-rose-500/20"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden bg-navy-950 border-b border-white/10 p-4 flex items-center justify-between sticky top-0 z-40">
          <Link href="/partner/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-white text-base font-heading">
              Ride<span className="text-amber-400">Setu</span> Partner
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="min-w-[44px] min-h-[44px] p-2 rounded-xl bg-white/10 text-white flex items-center justify-center"
            aria-label="Open Partner Navigation"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Mobile Drawer */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative ml-auto w-full max-w-xs bg-navy-950 h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-black text-white text-sm font-heading">Partner Portal</span>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="min-w-[44px] min-h-[44px] p-2 text-slate-400 hover:text-white rounded-xl flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-bold text-xs text-white truncate">{businessName}</div>
                <div className="text-[10px] text-amber-400 uppercase font-black">{vendorStatus}</div>
              </div>

              <nav className="space-y-1 text-xs font-bold flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 min-h-[44px] rounded-xl transition-colors ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-400 font-extrabold border border-amber-500/30'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-amber-400" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-white/10 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    logout();
                  }}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2 text-xs font-bold text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/20"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 bg-slate-900 min-h-screen p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </VendorGuard>
  );
};

export default PartnerLayout;
