'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCompare } from '@/context/CompareContext';
import AuthModal from './AuthModal';
import {
  Compass,
  MapPin,
  Car,
  Layers,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Store,
  Sparkles,
  Home,
  FileText,
  Bell,
  HelpCircle,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { compareList } = useCompare();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'LOGIN' | 'REGISTER_CUSTOMER' | 'REGISTER_VENDOR'>('LOGIN');
  const [isDestDropdownOpen, setDestDropdownOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
        setDestDropdownOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  const destinations = [
    { name: 'Rishikesh', slug: 'rishikesh', state: 'Uttarakhand', tag: 'Top Adventure' },
    { name: 'Mussoorie', slug: 'mussoorie', state: 'Uttarakhand', tag: 'Queen of Hills' },
    { name: 'Dehradun', slug: 'dehradun', state: 'Uttarakhand', tag: 'Airport Hub' },
    { name: 'Nainital', slug: 'nainital', state: 'Uttarakhand', tag: 'Lake City' },
    { name: 'Haridwar', slug: 'haridwar', state: 'Uttarakhand', tag: 'Holy Ghats' },
    { name: 'Haldwani', slug: 'haldwani', state: 'Uttarakhand', tag: 'Hill Gateway' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-md shadow-navy-950/5 py-2.5'
            : 'bg-white border-b border-slate-100 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group focus-ring rounded-xl">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-orange to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-orange/25 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black font-heading text-navy-950 tracking-tight">
                  Ride<span className="text-brand-orange">Setu</span>
                </span>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  Verified
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide -mt-0.5 hidden sm:block">
                One Place. Every Ride. Every Destination.
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-extrabold text-slate-700">
            {/* Destination Dropdown */}
            <div className="relative" onMouseLeave={() => setDestDropdownOpen(false)}>
              <button
                type="button"
                aria-expanded={isDestDropdownOpen}
                onClick={() => setDestDropdownOpen(!isDestDropdownOpen)}
                onMouseEnter={() => setDestDropdownOpen(true)}
                className="flex items-center gap-1.5 py-2 hover:text-brand-orange transition-colors focus-ring rounded-lg"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                <span>Destinations</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isDestDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 animate-fade-in-up z-50">
                  <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Uttarakhand Launch Hubs
                  </div>
                  {destinations.map((d) => (
                    <Link
                      key={d.slug}
                      href={`/destinations/${d.slug}`}
                      onClick={() => setDestDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div>
                        <div className="font-bold text-slate-800 text-xs group-hover:text-brand-orange">
                          {d.name}
                        </div>
                        <div className="text-[10px] text-slate-400">{d.state}</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-light text-brand-dark font-bold">
                        {d.tag}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/vehicles"
              className={`flex items-center gap-1.5 py-2 hover:text-brand-orange transition-colors focus-ring rounded-lg ${
                pathname === '/vehicles' ? 'text-brand-orange font-black' : ''
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Explore Rides</span>
            </Link>

            {/* Compare Link with Badge */}
            <Link
              href="/compare"
              className={`flex items-center gap-1.5 py-2 hover:text-brand-orange transition-colors relative focus-ring rounded-lg ${
                pathname === '/compare' ? 'text-brand-orange font-black' : ''
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Compare</span>
              {compareList.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand-orange text-white text-[10px] font-extrabold flex items-center justify-center -ml-0.5 shadow-sm">
                  {compareList.length}
                </span>
              )}
            </Link>

            {user?.role === 'CUSTOMER' && (
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 py-2 hover:text-brand-orange transition-colors focus-ring rounded-lg ${
                  pathname === '/dashboard' ? 'text-brand-orange font-black' : ''
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>My Dashboard</span>
              </Link>
            )}

            {user?.role === 'VENDOR' && (
              <Link
                href="/vendor"
                className={`flex items-center gap-1.5 py-2 hover:text-brand-orange transition-colors focus-ring rounded-lg ${
                  pathname === '/vendor' ? 'text-brand-orange font-black' : ''
                }`}
              >
                <Store className="w-3.5 h-3.5 text-amber-500" />
                <span>Vendor Portal</span>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 py-2 hover:text-brand-orange transition-colors focus-ring rounded-lg ${
                  pathname === '/admin' ? 'text-brand-orange font-black' : ''
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Admin Portal</span>
              </Link>
            )}
          </nav>

          {/* Desktop Right CTA / User Section */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={isUserMenuOpen}
                  onClick={() => setUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors focus-ring"
                >
                  <div className="w-7 h-7 rounded-xl bg-navy-950 text-white flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="text-left text-xs">
                    <span className="font-extrabold text-slate-800 block truncate max-w-[100px]">
                      {user.name || 'Account'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 animate-fade-in-up z-50">
                    <div className="p-3 border-b border-slate-100 text-xs">
                      <div className="font-extrabold text-slate-900 truncate">{user.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-black rounded-full bg-brand-light text-brand-dark uppercase">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'ADMIN' ? (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Master Admin
                      </Link>
                    ) : user.role === 'VENDOR' ? (
                      <>
                        <Link
                          href="/vendor"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
                        >
                          <Store className="w-4 h-4 text-amber-600" /> Vendor Dashboard
                        </Link>
                        <Link
                          href="/vendor/vehicles"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
                        >
                          <Car className="w-4 h-4 text-slate-500" /> Manage Vehicles
                        </Link>
                      </>
                    ) : (
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
                      >
                        <Compass className="w-4 h-4 text-brand-orange" /> Rider Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); logout(); }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setAuthTab('LOGIN'); setAuthOpen(true); }}
                  className="px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:text-navy-950 rounded-2xl hover:bg-slate-100 transition-colors focus-ring"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab('REGISTER_CUSTOMER'); setAuthOpen(true); }}
                  className="px-4 py-2 text-xs font-black text-white bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-dark hover:to-brand-orange rounded-2xl transition-all shadow-md shadow-brand-orange/20 active:scale-95 focus-ring"
                >
                  Book a Ride
                </button>
              </div>
            )}

            {user?.role !== 'VENDOR' && user?.role !== 'ADMIN' && (
              <button
                type="button"
                onClick={() => { setAuthTab('REGISTER_VENDOR'); setAuthOpen(true); }}
                className="text-xs font-bold text-slate-600 hover:text-brand-orange transition-colors flex items-center gap-1.5 pl-3 border-l border-slate-200 focus-ring rounded-lg"
              >
                <Store className="w-3.5 h-3.5" />
                <span>List Fleet</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Hamburger Button (Min 44x44px target) */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              aria-label="Toggle Navigation Drawer"
              aria-expanded={isMobileDrawerOpen}
              onClick={() => setMobileDrawerOpen(true)}
              className="min-w-[44px] min-h-[44px] p-2.5 text-slate-800 hover:text-brand-orange rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-transform active:scale-95 focus-ring"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Premium Mobile Slide-In Navigation Drawer */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop Blur Dark Overlay */}
            <div
              className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setMobileDrawerOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-In Drawer Container */}
            <div className="relative ml-auto w-full max-w-[320px] bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-fade-in-up duration-250 ease-out">
              <div className="p-5 space-y-5">
                {/* Top Header & Close */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <Link
                    href="/"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-orange to-amber-500 flex items-center justify-center text-white">
                      <Compass className="w-4 h-4" />
                    </div>
                    <span className="font-black font-heading text-navy-950 text-lg">
                      Ride<span className="text-brand-orange">Setu</span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="min-w-[44px] min-h-[44px] p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 flex items-center justify-center focus-ring"
                    aria-label="Close navigation drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Authenticated User Status Card */}
                {user ? (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-navy-950 text-white font-black text-sm flex items-center justify-center shrink-0">
                        {user.name ? user.name[0].toUpperCase() : 'U'}
                      </div>
                      <div className="truncate">
                        <div className="font-extrabold text-navy-950 text-xs truncate">{user.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 text-[10px]">
                      <span className="font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified {user.role}
                      </span>
                      <span className="text-slate-400 font-semibold">Active Session</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-gradient-to-br from-brand-orange/10 via-amber-500/5 to-transparent rounded-2xl border border-brand-orange/20 space-y-2.5">
                    <div className="text-xs font-black text-navy-950 font-heading">Himalayan Travel Mobility</div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Sign in for instant reservation holds, 1-click KYC certificates, and digital deposit tracking.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setMobileDrawerOpen(false); setAuthTab('LOGIN'); setAuthOpen(true); }}
                        className="flex-1 min-h-[44px] py-2 bg-navy-950 text-white font-extrabold text-xs rounded-xl shadow-sm"
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMobileDrawerOpen(false); setAuthTab('REGISTER_CUSTOMER'); setAuthOpen(true); }}
                        className="flex-1 min-h-[44px] py-2 bg-brand-orange text-white font-extrabold text-xs rounded-xl shadow-sm"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary Navigation Links */}
                <nav className="space-y-1 text-xs font-extrabold">
                  <Link
                    href="/"
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 min-h-[44px] rounded-xl transition-colors ${
                      pathname === '/' ? 'bg-brand-light text-brand-dark' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Home className="w-4 h-4 text-brand-orange" />
                    <span>Home</span>
                  </Link>

                  <Link
                    href="/vehicles"
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 min-h-[44px] rounded-xl transition-colors ${
                      pathname === '/vehicles' ? 'bg-brand-light text-brand-dark' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Car className="w-4 h-4 text-brand-orange" />
                    <span>Explore Verified Rides</span>
                  </Link>

                  <Link
                    href="/compare"
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center justify-between px-3 min-h-[44px] rounded-xl transition-colors ${
                      pathname === '/compare' ? 'bg-brand-light text-brand-dark' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="w-4 h-4 text-brand-orange" />
                      <span>Compare Fleet</span>
                    </div>
                    {compareList.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-orange text-white text-[10px] font-black">
                        {compareList.length}
                      </span>
                    )}
                  </Link>

                  {user && (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`flex items-center gap-3 px-3 min-h-[44px] rounded-xl transition-colors ${
                          pathname === '/dashboard' ? 'bg-brand-light text-brand-dark' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Compass className="w-4 h-4 text-brand-orange" />
                        <span>My Bookings & Companion</span>
                      </Link>

                      <Link
                        href="/dashboard"
                        onClick={() => setMobileDrawerOpen(false)}
                        className="flex items-center gap-3 px-3 min-h-[44px] text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>KYC & Driving Licence</span>
                      </Link>
                    </>
                  )}

                  {user?.role === 'VENDOR' && (
                    <Link
                      href="/vendor"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="flex items-center gap-3 px-3 min-h-[44px] text-amber-700 bg-amber-50 rounded-xl transition-colors font-black"
                    >
                      <Store className="w-4 h-4 text-amber-600" />
                      <span>Vendor Partner Dashboard</span>
                    </Link>
                  )}

                  {user?.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileDrawerOpen(false)}
                      className="flex items-center gap-3 px-3 min-h-[44px] text-indigo-700 bg-indigo-50 rounded-xl transition-colors font-black"
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>Master Admin Dashboard</span>
                    </Link>
                  )}

                  <Link
                    href="/safety"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 min-h-[44px] text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <span>Help & Mountain Safety</span>
                  </Link>

                  <Link
                    href="/contact"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 min-h-[44px] text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <PhoneCall className="w-4 h-4 text-teal-600" />
                    <span>24/7 Roadside SOS Support</span>
                  </Link>
                </nav>

                {/* Destinations Quick Grid */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Uttarakhand Hubs
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {destinations.map((d) => (
                      <Link
                        key={d.slug}
                        href={`/destinations/${d.slug}`}
                        onClick={() => setMobileDrawerOpen(false)}
                        className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-brand-light text-slate-800 hover:text-brand-dark text-[11px] font-bold truncate flex items-center justify-between"
                      >
                        <span>{d.name}</span>
                        <span className="text-[9px] text-slate-400">↗</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions / Sign Out */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
                {user ? (
                  <button
                    type="button"
                    onClick={() => { setMobileDrawerOpen(false); logout(); }}
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200/60"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setMobileDrawerOpen(false); setAuthTab('REGISTER_VENDOR'); setAuthOpen(true); }}
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 text-xs font-black text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                  >
                    <Store className="w-4 h-4 text-amber-500" />
                    <span>Partner: List Your Fleet</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setAuthOpen(false)}
        initialTab={authTab}
      />
    </>
  );
};

export default Navbar;
