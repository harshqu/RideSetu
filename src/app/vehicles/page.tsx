'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchWidget from '@/components/marketplace/SearchWidget';
import VehicleCard from '@/components/marketplace/VehicleCard';
import FilterSidebar from '@/components/marketplace/FilterSidebar';
import { Car, Layers, Filter, Sparkles, AlertCircle } from 'lucide-react';

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
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Right Vehicles Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header summary */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h1 className="font-extrabold font-heading text-slate-900 text-lg sm:text-xl capitalize">
                Verified Rental Rides in {destinationParam}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {vehicles.length} available vehicles from verified local partners
              </p>
            </div>
            <div className="text-xs font-semibold text-brand-orange bg-brand-light px-3 py-1 rounded-full">
              100% Deposit Refund Guarantee
            </div>
          </div>

          {/* Vehicles Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 animate-pulse">
                  <div className="aspect-[16/10] bg-slate-200 rounded-xl"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-8 bg-slate-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">No vehicles match your current filter</h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                Try expanding your price range or selecting all categories to view more verified local partner inventory.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-md shadow-brand-orange/20"
              >
                Reset All Filters
              </button>
            </div>
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
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading verified fleet...</div>}>
      <VehiclesSearchContent />
    </Suspense>
  );
}
