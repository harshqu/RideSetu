import React from 'react';

export const VehicleCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm space-y-4 animate-pulse">
      <div className="w-full h-44 bg-slate-100 rounded-2xl animate-shimmer" />
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-slate-200 rounded-md w-1/2" />
          <div className="h-5 bg-slate-200 rounded-md w-12" />
        </div>
        <div className="h-3.5 bg-slate-100 rounded-md w-3/4" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-6 bg-slate-100 rounded-lg w-16" />
        <div className="h-6 bg-slate-100 rounded-lg w-16" />
        <div className="h-6 bg-slate-100 rounded-lg w-20" />
      </div>
      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
        <div className="h-6 bg-slate-200 rounded-md w-24" />
        <div className="h-9 bg-slate-200 rounded-xl w-24" />
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-28 bg-slate-100 rounded-3xl" />
        <div className="h-28 bg-slate-100 rounded-3xl" />
        <div className="h-28 bg-slate-100 rounded-3xl" />
      </div>
      <div className="h-64 bg-slate-100 rounded-3xl" />
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-slate-200 rounded-md w-3/4" />
        </td>
      ))}
    </tr>
  );
};
