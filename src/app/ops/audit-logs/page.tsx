'use client';

import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function OpsAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/audit-logs');
        const data = await res.json();
        if (data.logs) setLogs(data.logs);
      } catch (err) {
        console.error('Ops audit logs error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-black font-heading text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-emerald-400" /> Immutable Platform Audit Logs
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Cryptographically immutable security telemetry for every administrative action, KYC decision, and vendor approval.
        </p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="bg-slate-950/70 rounded-3xl border border-white/10 p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Action</th>
                <th className="pb-3">Target Entity</th>
                <th className="pb-3">Admin User</th>
                <th className="pb-3">IP Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-white/5">
                  <td className="py-3.5 font-mono text-slate-400">{formatDateTime(log.createdAt)}</td>
                  <td className="py-3.5 font-extrabold text-emerald-400">{log.action}</td>
                  <td className="py-3.5 text-white font-bold">{log.entityType}: {log.entityId}</td>
                  <td className="py-3.5 text-slate-300">{log.adminName || 'Super Admin'}</td>
                  <td className="py-3.5 font-mono text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
