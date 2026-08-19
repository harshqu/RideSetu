'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Clock, Car, Sparkles, Search, ChevronRight, Compass } from 'lucide-react';

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
    { id: 'MOTORCYCLE', label: 'Bikes', icon: '🏍️' },
    { id: 'CAR', label: 'Self-Drive Cars', icon: '🚗' },
    { id: 'EV', label: 'Electric EV', icon: '⚡' },
  ];

  const destinations = [
    { slug: 'rishikesh', name: 'Rishikesh', badge: 'Tapovan & Ghats' },
    { slug: 'mussoorie', name: 'Mussoorie', badge: 'Mall Road Hills' },
    { slug: 'dehradun', name: 'Dehradun', badge: 'Airport & ISBT' },
    { slug: 'nainital', name: 'Nainital', badge: 'Lake City' },
    { slug: 'haridwar', name: 'Haridwar', badge: 'Holy Railway Hub' },
    { slug: 'haldwani', name: 'Haldwani', badge: 'Kathgodam Base' },
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
    <div className={`bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-950/20 border border-white/60 p-5 sm:p-7 text-slate-900 ${className}`}>
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 border-b border-slate-100 no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
              category === c.id
                ? 'bg-navy-950 text-white shadow-md shadow-navy-950/20'
                : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Destination Picker */}
        <div className="bg-slate-50 hover:bg-slate-100/90 p-3.5 rounded-2xl border border-slate-200/80 transition-colors">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-brand-orange" />
            Destination Hub
          </label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-transparent font-black text-slate-900 text-sm focus:outline-none cursor-pointer"
          >
            {destinations.map((d) => (
              <option key={d.slug} value={d.slug} className="text-slate-900">
                {d.name} ({d.badge})
              </option>
            ))}
          </select>
        </div>

        {/* Pickup Date & Time */}
        <div className="bg-slate-50 hover:bg-slate-100/90 p-3.5 rounded-2xl border border-slate-200/80 transition-colors">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-brand-orange" />
            Pickup Date & Time
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={pickupDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setPickupDate(e.target.value)}
              className="bg-transparent font-bold text-slate-900 text-xs focus:outline-none w-full"
            />
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="bg-transparent font-bold text-slate-900 text-xs focus:outline-none w-20"
            />
          </div>
        </div>

        {/* Return Date & Time */}
        <div className="bg-slate-50 hover:bg-slate-100/90 p-3.5 rounded-2xl border border-slate-200/80 transition-colors">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-brand-orange" />
            Return Date & Time
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={returnDate}
              min={pickupDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="bg-transparent font-bold text-slate-900 text-xs focus:outline-none w-full"
            />
            <input
              type="time"
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              className="bg-transparent font-bold text-slate-900 text-xs focus:outline-none w-20"
            />
          </div>
        </div>

        {/* Search Submit Button */}
        <div className="flex items-center">
          <button
            type="submit"
            className="w-full h-full min-h-[52px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-dark hover:to-brand-orange text-white font-extrabold text-sm shadow-xl shadow-brand-orange/30 flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 group"
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
