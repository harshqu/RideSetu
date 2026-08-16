'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, User, Store, ArrowRightLeft } from 'lucide-react';

export const DemoRoleBar: React.FC = () => {
  const { user, switchDemoRole, loading } = useAuth();

  return (
    <div className="bg-navy-950 text-white text-xs py-1.5 px-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 z-50 relative">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-brand-orange/20 text-brand-orange font-bold text-[10px] uppercase tracking-wider border border-brand-orange/30">
          Demo Sandbox
        </span>
        <span className="text-slate-300 hidden sm:inline">
          Active Role:
        </span>
        <span className="font-semibold text-white flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded">
          {user?.role === 'ADMIN' ? (
            <>
              <Shield className="w-3 h-3 text-emerald-400" /> Admin ({user?.name})
            </>
          ) : user?.role === 'VENDOR' ? (
            <>
              <Store className="w-3 h-3 text-amber-400" /> Vendor ({user?.vendor?.businessName || user?.name})
            </>
          ) : (
            <>
              <User className="w-3 h-3 text-brand-orange" /> Customer ({user ? user.name : 'Guest'})
            </>
          )}
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="text-slate-400 text-[11px] hidden md:inline">1-Click Switcher:</span>
        <button
          disabled={loading}
          onClick={() => switchDemoRole('CUSTOMER')}
          className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
            user?.role === 'CUSTOMER'
              ? 'bg-brand-orange text-white shadow-sm'
              : 'bg-white/10 hover:bg-white/20 text-slate-200'
          }`}
        >
          <User className="w-3 h-3" /> Customer
        </button>

        <button
          disabled={loading}
          onClick={() => switchDemoRole('VENDOR')}
          className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
            user?.role === 'VENDOR'
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
              : 'bg-white/10 hover:bg-white/20 text-slate-200'
          }`}
        >
          <Store className="w-3 h-3" /> Vendor
        </button>

        <button
          disabled={loading}
          onClick={() => switchDemoRole('ADMIN')}
          className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
            user?.role === 'ADMIN'
              ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
              : 'bg-white/10 hover:bg-white/20 text-slate-200'
          }`}
        >
          <Shield className="w-3 h-3" /> Admin
        </button>
      </div>
    </div>
  );
};

export default DemoRoleBar;
