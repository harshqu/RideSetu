'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchWidget from '@/components/marketplace/SearchWidget';
import VehicleCard from '@/components/marketplace/VehicleCard';
import FilterSidebar from '@/components/marketplace/FilterSidebar';
import { VehicleCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Car, Layers, Filter, Sparkles, AlertCircle, SlidersHorizontal, X } from 'lucide-react';

function VehiclesSearchContent() {
  const searchParams = useSearchParams();

  const destinationParam = searchParams.get('destination') || 'rishikesh';
  const categoryParam = searchParams.get('category') || 'ALL';
  const pickupDateTime = searchParams.get('pickupDateTime') || '';
  const returnDateTime = searchParams.get('returnDateTime') || '';

  const [filters, setFilters] = useState({
    category: categoryParam,
    minPrice: 0,
    maxPrice: 4500,
    fuelType: 'ALL',
    transmission: 'ALL',
    minRating: 0,
    deliveryOnly: false,
    verifiedOnly: true,
    sort: 'recommended',
  });

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams();

        if (destinationParam) query.append('destination', destinationParam);
        if (filters.category && filters.category !== 'ALL') query.append('category', filters.category);
        if (filters.maxPrice < 4500) query.append('maxPrice', filters.maxPrice.toString());
        if (filters.fuelType && filters.fuelType !== 'ALL') query.append('fuelType', filters.fuelType);
        if (filters.transmission && filters.transmission !== 'ALL') query.append('transmission', filters.transmission);
        if (filters.deliveryOnly) query.append('delivery', 'true');
        if (filters.verifiedOnly) query.append('verifiedOnly', 'true');
        if (filters.sort) query.append('sort', filters.sort);
        if (pickupDateTime) query.append('pickupDateTime', pickupDateTime);
        if (returnDateTime) query.append('returnDateTime', returnDateTime);

        const res = await fetch(`/api/vehicles?${query.toString()}`);
        const data = await res.json();

        if (data.vehicles) {
          setVehicles(data.vehicles);
          setTotalCount(data.pagination?.totalCount || data.vehicles.length);
        }
      } catch (err) {
        console.error('Error fetching vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [destinationParam, filters, pickupDateTime, returnDateTime]);

  const handleResetFilters = () => {
    setFilters({
      category: 'ALL',
      minPrice: 0,
      maxPrice: 4500,
      fuelType: 'ALL',
      transmission: 'ALL',
      minRating: 0,
      deliveryOnly: false,
      verifiedOnly: true,
      sort: 'recommended',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Search Widget in Compact Style */}
      <SearchWidget initialDestination={destinationParam} initialCategory={filters.category} />

      {/* Main Grid: Sidebar Filters + Vehicles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar for Desktop */}
        <div className="hidden lg:block lg:col-span-1">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Drawer Overlay */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
            <div className="relative ml-auto w-full max-w-xs bg-white h-full p-5 overflow-y-auto z-10 shadow-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-extrabold font-heading text-slate-900 text-base">Filters & Sort</h3>
                  <button onClick={() => setMobileFilterOpen(false)} className="p-2 text-slate-500 hover:text-slate-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterSidebar
                  filters={filters}
                  onChange={setFilters}
                  onReset={handleResetFilters}
                />
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 bg-brand-orange text-white font-extrabold text-sm rounded-2xl shadow-md"
                >
                  Apply Filters ({vehicles.length} Rides)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right Vehicles Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header summary & Mobile Filter Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm gap-4">
            <div>
              <h1 className="font-black font-heading text-navy-950 text-xl sm:text-2xl capitalize">
                Verified Rental Rides in {destinationParam}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Showing {vehicles.length} available vehicles from verified local partners
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden px-3.5 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              </button>
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                100% Deposit Protection
              </div>
            </div>
          </div>

          {/* Vehicles Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <VehicleCardSkeleton key={i} />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <EmptyState
              title="No vehicles match your current filter"
              description="Try expanding your price range or selecting all categories to view more verified local partner inventory."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle._id}
                  vehicle={vehicle}
                  pickupDateTime={pickupDateTime}
                  returnDateTime={returnDateTime}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-bold">Loading verified fleet...</div>}>
      <VehiclesSearchContent />
    </Suspense>
  );
}
