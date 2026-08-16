'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { compareList } = useCompare();
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'LOGIN' | 'REGISTER_CUSTOMER' | 'REGISTER_VENDOR'>('LOGIN');
  const [isDestDropdownOpen, setDestDropdownOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-orange/25 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold font-heading text-navy-900 tracking-tight">
                  Ride<span className="text-brand-orange">Setu</span>
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified
                </span>
              </div>
              <p className="text-[9px] text-slate-500 font-medium tracking-wide -mt-1 hidden sm:block">
                One Place. Every Ride. Every Destination.
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
            {/* Destination Dropdown */}
            <div className="relative" onMouseLeave={() => setDestDropdownOpen(false)}>
              <button
                onClick={() => setDestDropdownOpen(!isDestDropdownOpen)}
                onMouseEnter={() => setDestDropdownOpen(true)}
                className="flex items-center gap-1.5 py-2 hover:text-brand-orange transition-colors"
              >
                <MapPin className="w-4 h-4 text-brand-orange" />
                <span>Destinations</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isDestDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Uttarakhand Launch Hubs
                  </div>
                  {destinations.map((d) => (
                    <Link
                      key={d.slug}
                      href={`/destinations/${d.slug}`}
                      onClick={() => setDestDropdownOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 transition-colors group"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 text-sm group-hover:text-brand-orange">
                          {d.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{d.state}</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-light text-brand-dark font-medium">
                        {d.tag}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/vehicles" className="hover:text-brand-orange transition-colors flex items-center gap-1.5">
              <Car className="w-4 h-4 text-slate-400" />
              <span>Explore Rides</span>
            </Link>

            {/* Compare Link with Badge */}
            <Link
              href="/compare"
              className="hover:text-brand-orange transition-colors flex items-center gap-1.5 relative"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Compare</span>
              {compareList.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {compareList.length}
                </span>
              )}
            </Link>

            <Link href="/#how-it-works" className="hover:text-brand-orange transition-colors">
              How It Works
            </Link>
          </nav>

          {/* Right Action Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" onMouseLeave={() => setUserMenuOpen(false)}>
                <button
                  onClick={() => setUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-sm"
                >
                  <Image
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <span className="font-semibold text-slate-800 text-xs max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-100 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900 text-xs truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'ADMIN' ? (
                      <>
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Admin Control Center
                        </Link>
                      </>
                    ) : user.role === 'VENDOR' ? (
                      <>
                        <Link
                          href="/vendor"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Store className="w-4 h-4 text-amber-600" /> Vendor Dashboard
                        </Link>
                        <Link
                          href="/vendor/vehicles"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Car className="w-4 h-4 text-slate-500" /> Manage Vehicles
                        </Link>
                        <Link
                          href="/vendor/calendar"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Layers className="w-4 h-4 text-slate-500" /> Availability Calendar
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Compass className="w-4 h-4 text-brand-orange" /> My Dashboard & Rides
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => { setUserMenuOpen(false); logout(); }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setAuthTab('LOGIN'); setAuthOpen(true); }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthTab('REGISTER_CUSTOMER'); setAuthOpen(true); }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-orange hover:bg-brand-dark rounded-xl transition-all shadow-sm shadow-brand-orange/25"
                >
                  Book a Ride
                </button>
              </div>
            )}

            {user?.role !== 'VENDOR' && user?.role !== 'ADMIN' && (
              <button
                onClick={() => { setAuthTab('REGISTER_VENDOR'); setAuthOpen(true); }}
                className="text-xs font-medium text-slate-600 hover:text-brand-orange transition-colors flex items-center gap-1 pl-2 border-l border-slate-200"
              >
                <Store className="w-3.5 h-3.5" />
                <span>List Fleet</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 animate-in slide-in-from-top duration-150">
            <div className="font-bold text-xs text-slate-400 uppercase tracking-wider">Destinations</div>
            <div className="grid grid-cols-2 gap-2">
              {destinations.map((d) => (
                <Link
                  key={d.slug}
                  href={`/destinations/${d.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-slate-50 text-xs font-medium text-slate-800 hover:bg-brand-light hover:text-brand-dark"
                >
                  {d.name}
                </Link>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-2 space-y-1">
              <Link
                href="/vehicles"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Car className="w-4 h-4 text-brand-orange" /> Explore Vehicles
              </Link>
              <Link
                href="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-orange" /> Compare Vehicles
                </span>
                {compareList.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-brand-orange text-white text-xs font-bold">
                    {compareList.length}
                  </span>
                )}
              </Link>
              {user ? (
                <Link
                  href={user.role === 'VENDOR' ? '/vendor' : user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg text-sm font-semibold text-brand-orange bg-brand-light"
                >
                  <Compass className="w-4 h-4" /> Go to {user.role === 'VENDOR' ? 'Vendor Portal' : user.role === 'ADMIN' ? 'Admin Portal' : 'My Dashboard'}
                </Link>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); setAuthTab('LOGIN'); setAuthOpen(true); }}
                  className="w-full text-left p-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Sign In / Register
                </button>
              )}
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
