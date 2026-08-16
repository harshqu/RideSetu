'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Clock, Car, Sparkles, Search, Compass, ChevronRight } from 'lucide-react';

interface SearchWidgetProps {
  initialDestination?: string;
  initialCategory?: string;
  className?: string;
}

export const SearchWidget: React.FC<SearchWidgetProps> = ({
  initialDestination = 'rishikesh',
  initialCategory = 'ALL',
  className = '',
}) => {
  const router = useRouter();

  // Tomorrow 09:00 to Day after tomorrow 20:00 default
  const defaultPickup = new Date();
  defaultPickup.setDate(defaultPickup.getDate() + 1);
  defaultPickup.setHours(9, 0, 0, 0);

  const defaultReturn = new Date(defaultPickup);
  defaultReturn.setDate(defaultReturn.getDate() + 2);
  defaultReturn.setHours(20, 0, 0, 0);

  const [destination, setDestination] = useState(initialDestination);
  const [category, setCategory] = useState(initialCategory);
  const [pickupDate, setPickupDate] = useState(defaultPickup.toISOString().split('T')[0]);
  const [pickupTime, setPickupTime] = useState('09:00');
  const [returnDate, setReturnDate] = useState(defaultReturn.toISOString().split('T')[0]);
  const [returnTime, setReturnTime] = useState('20:00');
  const [pickupLocation, setPickupLocation] = useState('ALL');

  const categories = [
    { id: 'ALL', label: 'All Fleet', icon: '✨' },
    { id: 'SCOOTER', label: 'Scooty', icon: '🛵' },
    { id: 'MOTORCYCLE', label: 'Bike', icon: '🏍️' },
    { id: 'CAR', label: 'Car / SUV', icon: '🚗' },
    { id: 'EV', label: 'Electric EV', icon: '⚡' },
  ];

  const destinations = [
    { slug: 'rishikesh', name: 'Rishikesh', badge: 'Adventure' },
    { slug: 'mussoorie', name: 'Mussoorie', badge: 'Hill Station' },
    { slug: 'dehradun', name: 'Dehradun', badge: 'Airport Hub' },
    { slug: 'nainital', name: 'Nainital', badge: 'Lake City' },
    { slug: 'haridwar', name: 'Haridwar', badge: 'Holy Ghats' },
    { slug: 'haldwani', name: 'Haldwani', badge: 'Kathgodam Rail' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const pickupDateTime = `${pickupDate}T${pickupTime}:00`;
    const returnDateTime = `${returnDate}T${returnTime}:00`;

    const params = new URLSearchParams({
      destination,
      category,
      pickupDateTime,
      returnDateTime,
    });

    if (pickupLocation !== 'ALL') {
      params.append('location', pickupLocation);
    }

    router.push(`/vehicles?${params.toString()}`);
  };

  return (
    <div className={`bg-white rounded-3xl shadow-xl shadow-slate-900/10 border border-slate-100 p-4 sm:p-6 ${className}`}>
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-slate-100 no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              category === c.id
                ? 'bg-navy-900 text-white shadow-md'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Destination Picker */}
        <div className="bg-slate-50/80 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-200 transition-colors">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-brand-orange" />
            Where are you going?
          </label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-transparent font-bold text-slate-900 text-sm outline-none cursor-pointer"
          >
            {destinations.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}, Uttarakhand ({d.badge})
              </option>
            ))}
          </select>
        </div>

        {/* Pickup Date & Time */}
        <div className="bg-slate-50/80 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-200 transition-colors">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-brand-orange" />
            Pickup Date & Time
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              required
              value={pickupDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setPickupDate(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 text-xs sm:text-sm outline-none w-3/5"
            />
            <select
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 text-xs outline-none w-2/5"
            >
              {Array.from({ length: 24 }).map((_, i) => {
                const hour = i.toString().padStart(2, '0');
                return (
                  <React.Fragment key={hour}>
                    <option value={`${hour}:00`}>{`${hour}:00`}</option>
                    <option value={`${hour}:30`}>{`${hour}:30`}</option>
                  </React.Fragment>
                );
              })}
            </select>
          </div>
        </div>

        {/* Return Date & Time */}
        <div className="bg-slate-50/80 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-200 transition-colors">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-brand-orange" />
            Return Date & Time
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              required
              value={returnDate}
              min={pickupDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 text-xs sm:text-sm outline-none w-3/5"
            />
            <select
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 text-xs outline-none w-2/5"
            >
              {Array.from({ length: 24 }).map((_, i) => {
                const hour = i.toString().padStart(2, '0');
                return (
                  <React.Fragment key={hour}>
                    <option value={`${hour}:00`}>{`${hour}:00`}</option>
                    <option value={`${hour}:30`}>{`${hour}:30`}</option>
                  </React.Fragment>
                );
              })}
            </select>
          </div>
        </div>

        {/* Search CTA */}
        <div className="flex flex-col justify-end">
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-dark hover:to-brand-orange text-white font-bold text-sm shadow-lg shadow-brand-orange/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
          >
            <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Search Verified Rides</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchWidget;
