'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CustomerLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        throw new Error(res.error || 'Customer sign in failed.');
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-orange to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-orange/30">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black font-heading text-navy-950">
              Ride<span className="text-brand-orange">Setu</span>
            </span>
          </Link>
          <h1 className="text-xl font-extrabold font-heading text-slate-900">
            Your next Himalayan ride starts here
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Rider Account Sign In
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-slate-700 block font-extrabold">Email Address / Phone</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rider@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-orange text-slate-900 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 block font-extrabold">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-orange text-slate-900 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-dark hover:to-brand-orange text-white font-black text-xs shadow-md shadow-brand-orange/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In as Customer'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500 space-y-2">
          <div>
            Don&apos;t have an account?{' '}
            <Link href="/login" className="text-brand-orange font-bold hover:underline">
              Create Account
            </Link>
          </div>
          <div>
            <Link href="/login" className="text-slate-400 hover:text-slate-600 font-semibold">
              ← Back to Portal Selection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
