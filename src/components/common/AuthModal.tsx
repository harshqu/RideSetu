'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Lock, Mail, User, Phone, Store, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'LOGIN' | 'REGISTER_CUSTOMER' | 'REGISTER_VENDOR';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'LOGIN',
}) => {
  const { login, register, switchDemoRole } = useAuth();
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER_CUSTOMER' | 'REGISTER_VENDOR'>(initialTab);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('Rishikesh');
  const [rentalLicenseNumber, setRentalLicenseNumber] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'LOGIN') {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Login failed');
        } else {
          onClose();
        }
      } else if (tab === 'REGISTER_CUSTOMER') {
        const res = await register({
          name,
          email,
          phone,
          password,
          role: 'CUSTOMER',
        });
        if (!res.success) {
          setError(res.error || 'Registration failed');
        } else {
          onClose();
        }
      } else if (tab === 'REGISTER_VENDOR') {
        const res = await register({
          name,
          email,
          phone,
          password,
          role: 'VENDOR',
          businessName,
          city,
          rentalLicenseNumber,
        });
        if (!res.success) {
          setError(res.error || 'Vendor onboarding failed');
        } else {
          onClose();
          window.location.href = '/vendor';
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCreds = (type: 'CUSTOMER' | 'VENDOR' | 'ADMIN') => {
    if (type === 'CUSTOMER') {
      setEmail('customer@ridesetu.demo');
      setPassword('customer123');
    } else if (type === 'VENDOR') {
      setEmail('vendor@ridesetu.demo');
      setPassword('vendor123');
    } else {
      setEmail('admin@ridesetu.demo');
      setPassword('admin123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-navy-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center font-black text-white text-base">
              RS
            </span>
            <span className="text-xl font-bold font-heading tracking-tight">RideSetu</span>
          </div>
          <p className="text-slate-300 text-xs">
            {tab === 'LOGIN'
              ? 'Access your bookings, favorites & active rentals.'
              : tab === 'REGISTER_CUSTOMER'
              ? 'Create an account to compare and book verified rides.'
              : 'Join RideSetu as a verified local rental business partner.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => { setTab('LOGIN'); setError(null); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              tab === 'LOGIN' ? 'border-brand-orange text-brand-orange bg-white' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('REGISTER_CUSTOMER'); setError(null); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              tab === 'REGISTER_CUSTOMER' ? 'border-brand-orange text-brand-orange bg-white' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            New Traveller
          </button>
          <button
            onClick={() => { setTab('REGISTER_VENDOR'); setError(null); }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              tab === 'REGISTER_VENDOR' ? 'border-brand-orange text-brand-orange bg-white' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Partner Join
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={() => {
              const role = tab === 'REGISTER_VENDOR' ? 'VENDOR' : 'CUSTOMER';
              window.location.href = `/api/auth/google?role=${role}`;
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-800 text-xs font-bold shadow-sm flex items-center justify-center gap-2.5 transition-all min-h-[44px]"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-2 text-[10px] uppercase font-bold text-slate-400 absolute">OR</span>
          </div>

          {tab !== 'LOGIN' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {tab === 'REGISTER_VENDOR' ? 'Owner / Contact Name' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                />
              </div>
            </div>
          )}

          {tab === 'REGISTER_VENDOR' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business / Fleet Name</label>
                <div className="relative">
                  <Store className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tapovan Moto Rentals"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none bg-white"
                  >
                    <option value="Rishikesh">Rishikesh</option>
                    <option value="Mussoorie">Mussoorie</option>
                    <option value="Dehradun">Dehradun</option>
                    <option value="Nainital">Nainital</option>
                    <option value="Haridwar">Haridwar</option>
                    <option value="Haldwani">Haldwani</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rental Permit/Trade No.</label>
                  <input
                    type="text"
                    required
                    placeholder="UK-RSH-RENT-2024"
                    value={rentalLicenseNumber}
                    onChange={(e) => setRentalLicenseNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
              />
            </div>
          </div>

          {tab !== 'LOGIN' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone (WhatsApp)</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-orange hover:bg-brand-dark text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-brand-orange/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : tab === 'LOGIN' ? (
              'Sign In to RideSetu'
            ) : tab === 'REGISTER_CUSTOMER' ? (
              'Create Free Account'
            ) : (
              'Submit Partner Application'
            )}
          </button>
        </form>

        {/* Demo Quick Fill Footnote */}
        {tab === 'LOGIN' && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs">
            <p className="text-slate-500 font-medium mb-2">Quick Fill Demo Accounts:</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => fillDemoCreds('CUSTOMER')}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg hover:border-brand-orange text-slate-700 text-[11px]"
              >
                👤 Customer (customer@ridesetu.demo)
              </button>
              <button
                type="button"
                onClick={() => fillDemoCreds('VENDOR')}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg hover:border-amber-500 text-slate-700 text-[11px]"
              >
                🏪 Vendor (vendor@ridesetu.demo)
              </button>
              <button
                type="button"
                onClick={() => fillDemoCreds('ADMIN')}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg hover:border-emerald-500 text-slate-700 text-[11px]"
              >
                🛡️ Admin (admin@ridesetu.demo)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
