'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCompare } from '@/context/CompareContext';
import AuthModal from './AuthModal';
import {
  Compass,
  MapPin,
  Car,
  Layers,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Store,
  LogOut,
} from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle';

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
            ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/90 dark:border-white/10 shadow-md shadow-navy-950/5 py-2.5'
            : 'bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-white/10 py-3.5'
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
                <span className="text-xl font-black font-heading text-navy-950 dark:text-white tracking-tight">
                  Ride<span className="text-brand-orange">Setu</span>
                </span>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/30">
                  Verified
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide -mt-0.5 hidden sm:block">
                One Place. Every Ride. Every Destination.
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-extrabold text-slate-700 dark:text-slate-300">
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
                href="/partner/dashboard"
                className={`flex items-center gap-1.5 py-2 hover:text-brand-orange transition-colors focus-ring rounded-lg ${
                  pathname.startsWith('/partner') ? 'text-amber-500 font-black' : ''
                }`}
              >
                <Store className="w-3.5 h-3.5 text-amber-500" />
                <span>Partner Portal</span>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/ops/dashboard"
                className={`flex items-center gap-1.5 py-2 hover:text-brand-orange transition-colors focus-ring rounded-lg ${
                  pathname.startsWith('/ops') ? 'text-emerald-600 font-black' : ''
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ops Console</span>
              </Link>
            )}
          </nav>

          {/* Desktop Right CTA / User Section */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
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
                        href="/ops/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Operations Console
                      </Link>
                    ) : user.role === 'VENDOR' ? (
                      <Link
                        href="/partner/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
                      >
                        <Store className="w-4 h-4 text-amber-600" /> Partner Portal
                      </Link>
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
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-dark hover:to-brand-orange text-white text-xs font-black shadow-md shadow-brand-orange/20 transition-all active:scale-95 focus-ring"
                >
                  Rider Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="p-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus-ring"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
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
