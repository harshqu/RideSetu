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
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
                pathname === '/vehicles' ? 'text-brand-orange' : ''
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Explore Rides</span>
            </Link>

            {/* Compare Link with Badge */}
            <Link
              href="/compare"
              className={`flex items-center gap-1.5 py-2 hover:text-brand-orange transition-colors relative focus-ring rounded-lg ${
                pathname === '/compare' ? 'text-brand-orange' : ''
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Compare</span>
              {compareList.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand-orange text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                  {compareList.length}
                </span>
              )}
            </Link>

            <Link
              href="/#how-it-works"
              className="py-2 hover:text-brand-orange transition-colors focus-ring rounded-lg"
            >
              How It Works
            </Link>
          </nav>

          {/* Right Action Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" onMouseLeave={() => setUserMenuOpen(false)}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs focus-ring"
                >
                  <Image
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    width={26}
                    height={26}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <span className="font-bold text-slate-800 text-xs max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 animate-fade-in-up z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <div className="font-black text-slate-900 text-xs truncate font-heading">{user.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                      <span className="inline-block mt-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'ADMIN' ? (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Admin Console
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

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              aria-label="Toggle Navigation Menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 text-slate-700 hover:text-navy-950 rounded-2xl bg-slate-100 active:scale-95 focus-ring"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-5 space-y-4 animate-fade-in-up">
            <div className="font-black text-[10px] text-slate-400 uppercase tracking-wider">Destinations</div>
            <div className="grid grid-cols-2 gap-2">
              {destinations.map((d) => (
                <Link
                  key={d.slug}
                  href={`/destinations/${d.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-2xl bg-slate-50 text-xs font-bold text-slate-800 hover:bg-brand-light hover:text-brand-dark flex items-center justify-between"
                >
                  <span>{d.name}</span>
                  <span className="text-[9px] text-slate-400 font-normal">{d.state}</span>
                </Link>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-1.5">
              <Link
                href="/vehicles"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-2xl text-xs font-bold text-slate-800 hover:bg-slate-50"
              >
                <Car className="w-4 h-4 text-brand-orange" /> Explore Vehicles
              </Link>
              <Link
                href="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold text-slate-800 hover:bg-slate-50"
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
                  className="flex items-center gap-2 p-2.5 rounded-2xl text-xs font-bold text-brand-orange bg-brand-light"
                >
                  <Compass className="w-4 h-4" /> Go to {user.role === 'VENDOR' ? 'Vendor Portal' : user.role === 'ADMIN' ? 'Admin Portal' : 'My Dashboard'}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); setAuthTab('LOGIN'); setAuthOpen(true); }}
                  className="w-full text-left p-2.5 rounded-2xl text-xs font-bold text-slate-800 hover:bg-slate-50"
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
