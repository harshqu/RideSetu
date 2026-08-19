'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SearchWidget from '@/components/marketplace/SearchWidget';
import VehicleCard from '@/components/marketplace/VehicleCard';
import StatCounter from '@/components/ui/StatCounter';
import ScrollReveal from '@/components/ui/ScrollReveal';
import CinematicHero from '@/components/home/cinematic/CinematicHero';
import { formatINR } from '@/lib/utils';
import {
  Compass,
  ShieldCheck,
  Star,
  MapPin,
  Car,
  Layers,
  Truck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronRight,
  PhoneCall,
  Lock,
  ThumbsUp,
  FileCheck2,
  Store,
  HelpCircle,
  Clock,
} from 'lucide-react';

export default function HomePage() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [featuredVehicles, setFeaturedVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [destRes, vehRes] = await Promise.all([
          fetch('/api/destinations'),
          fetch('/api/vehicles?limit=6&sort=popular'),
        ]);

        const destData = await destRes.json();
        const vehData = await vehRes.json();

        if (destData.destinations) setDestinations(destData.destinations);
        if (vehData.vehicles) setFeaturedVehicles(vehData.vehicles);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const faqs = [
    {
      q: 'How is RideSetu different from traditional single-vendor rental apps?',
      a: 'RideSetu is India\'s verified multi-vendor marketplace. Instead of owning fleet, we aggregate trusted, legally licensed local rental partners across destinations. This allows you to compare models, prices, security deposits, and customer ratings side-by-side in one place with zero hidden fees.',
    },
    {
      q: 'What is the Digital Vehicle Handover and how does it protect my deposit?',
      a: 'Before you start your ride, the partner agent conducts a 360° digital inspection recording existing scratches, fuel percentage, and odometer reading. You confirm via mutual sign-off. On return, a diff comparison ensures your deposit is refunded without false damage claims.',
    },
    {
      q: 'Can I get my rental scooter or bike delivered to my hotel or hostel?',
      a: 'Yes! Most verified partners on RideSetu offer doorstep delivery to hotels, hostels (like Zostel), railway stations, and airports for a nominal fee displayed transparently before checkout.',
    },
    {
      q: 'What documents are required to rent a vehicle?',
      a: 'A valid original Driving Licence and a Government ID (Aadhaar, Passport, or Voter ID). You can upload them digitally during checkout for instant 5-minute handover at pickup.',
    },
    {
      q: 'What happens in case of an emergency or breakdown in mountain areas?',
      a: 'Every active RideSetu rental includes 24/7 Roadside Assistance. You can press the "GET HELP / SOS" button in your live companion to instantly connect with our local mechanical dispatch unit.',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-20 pb-16 w-full max-w-full overflow-hidden">
      {/* Cinematic Animated Himalayan Hero Section */}
      <section className="relative pt-20 sm:pt-28 md:pt-36 pb-16 sm:pb-24 md:pb-32 px-3 sm:px-6 lg:px-8 overflow-hidden text-white min-h-[620px] sm:min-h-[720px] md:min-h-[780px] w-full max-w-full flex items-center justify-center">
        {/* Multi-Layered Cinematic Himalayan & Rider Visual Scene */}
        <CinematicHero />

        {/* Foreground Content with Responsive Typography */}
        <div className="w-full max-w-5xl mx-auto relative z-10 text-center space-y-4 sm:space-y-6 px-1 sm:px-4">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-navy-950/85 backdrop-blur-md border border-white/20 text-[10px] sm:text-xs font-extrabold text-brand-orange animate-stagger-1 shadow-xl max-w-[95%] mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Uttarakhand Verified Travel Mobility Marketplace</span>
          </div>

          {/* Main Hero Headline (Natural wrapping without overflow) */}
          <h1 className="text-[32px] sm:text-5xl lg:text-6xl font-black font-heading text-white tracking-tight leading-[1.08] sm:leading-[1.15] w-full max-w-4xl mx-auto animate-stagger-2 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] break-words px-2 sm:px-0">
            Rent. Ride.{' '}
            <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300">
              Explore Himalayan Trails.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-slate-100 text-xs sm:text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed animate-stagger-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] px-3 sm:px-0">
            Discover and book verified scooters, touring motorcycles, and self-drive cars from certified local operators across Rishikesh, Mussoorie, Dehradun & Nainital.
          </p>

          {/* Floating Glassmorphic Search Widget */}
          <div className="pt-2 sm:pt-4 w-full max-w-4xl mx-auto text-left animate-stagger-4">
            <SearchWidget />
          </div>

          {/* Integrated Translucent Dark Glass Trust Metrics Bar (2-column on mobile) */}
          <div className="pt-4 sm:pt-6 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 max-w-4xl mx-auto text-center w-full px-1 sm:px-0">
            <div className="bg-navy-950/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/10 shadow-xl transition-transform hover:scale-105 duration-200">
              <StatCounter target={6} suffix="+" label="Uttarakhand Hubs" colorClass="text-white" />
            </div>
            <div className="bg-navy-950/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/10 shadow-xl transition-transform hover:scale-105 duration-200">
              <StatCounter target={10} suffix="+" label="Verified Operators" colorClass="text-amber-400" />
            </div>
            <div className="bg-navy-950/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/10 shadow-xl transition-transform hover:scale-105 duration-200">
              <StatCounter target={30} suffix="+" label="Inspected Vehicles" colorClass="text-emerald-400" />
            </div>
            <div className="bg-navy-950/80 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/10 shadow-xl transition-transform hover:scale-105 duration-200">
              <StatCounter target={100} suffix="%" label="Deposit Escrow" colorClass="text-brand-orange" />
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Marketplace Trust */}
      <ScrollReveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="card-premium card-premium-hover p-5 sm:p-6 rounded-3xl space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand-orange flex items-center justify-center transition-transform group-hover:scale-110 duration-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg font-heading">
                Multi-Vendor Comparison
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Compare verified local operators across Uttarakhand. View real ratings, deposits, inclusions, and transparent pricing in one place.
              </p>
            </div>

            <div className="card-premium card-premium-hover p-5 sm:p-6 rounded-3xl space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110 duration-200">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg font-heading">
                Digital Handover Checklist
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                360° digital condition sign-off at pickup and return. Fuel level, odometer, and scratches recorded to ensure 100% deposit protection.
              </p>
            </div>

            <div className="card-premium card-premium-hover p-5 sm:p-6 rounded-3xl space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110 duration-200">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg font-heading">
                Doorstep Hotel Delivery
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Get your scooter or motorcycle delivered directly to your hotel, hostel, railway station, or airport terminal in Tapovan, Mall Road & ISBT.
              </p>
            </div>

            <div className="card-premium card-premium-hover p-5 sm:p-6 rounded-3xl space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110 duration-200">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg font-heading">
                Isolated Deposit Escrow
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Security deposits are held in isolated digital escrow and automatically released upon return sign-off. Never worry about held deposits.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Explore Popular Launch Hubs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-4 sm:pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light text-brand-dark text-xs font-black uppercase tracking-wider mb-2">
              <MapPin className="w-3.5 h-3.5" /> Launch Hubs
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
              Popular Uttarakhand Destinations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Verified local rental operators ready with scooters, bikes, and cars at key transit hubs.
            </p>
          </div>
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-orange hover:text-brand-dark transition-colors group"
          >
            <span>View All Fleet</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {destinations.map((d) => (
            <Link
              key={d.slug}
              href={`/destinations/${d.slug}`}
              className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 bg-white border border-slate-200/80 flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                <Image
                  src={d.image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80'}
                  alt={d.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-black text-slate-900 shadow-sm">
                  {d.vehicleCount || 10}+ Verified Rides
                </div>
                <div className="absolute bottom-3 left-4 text-white">
                  <h3 className="text-xl font-black font-heading text-white">{d.name}</h3>
                  <p className="text-xs text-slate-300 font-medium">{d.state}</p>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex items-center justify-between bg-white text-xs">
                <span className="font-extrabold text-slate-700">From {formatINR(d.startingPrice || 450)}/day</span>
                <span className="inline-flex items-center gap-1 text-brand-orange font-black group-hover:translate-x-0.5 transition-transform">
                  <span>Explore</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Verified Rides */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-4 sm:pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider mb-2 border border-emerald-200/80">
              <ShieldCheck className="w-3.5 h-3.5" /> Inspected Fleet
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
              Featured Verified Vehicles
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Top-rated models with instant confirmation, digital condition records, and 24/7 roadside assistance.
            </p>
          </div>
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-orange hover:text-brand-dark transition-colors group"
          >
            <span>Browse Full Marketplace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-5 border border-slate-200 animate-pulse space-y-4">
                <div className="h-44 bg-slate-100 rounded-2xl" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {featuredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>

      {/* How RideSetu Works 3-Step Flow */}
      <ScrollReveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 rounded-3xl p-6 sm:p-10 lg:p-14 text-white shadow-2xl space-y-8 sm:space-y-10 border border-white/10 relative overflow-hidden">
            <div className="text-center max-w-2xl mx-auto space-y-2 relative z-10">
              <span className="text-xs font-black text-brand-orange uppercase tracking-wider">
                Seamless Rental Journey
              </span>
              <h2 className="text-2xl sm:text-4xl font-black font-heading text-white">
                How RideSetu Works in 3 Simple Steps
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-normal">
                Transparent multi-vendor booking with zero hidden charges and instant digital handover.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-brand-orange text-white font-black text-base flex items-center justify-center">
                  1
                </div>
                <h3 className="text-base sm:text-lg font-black font-heading text-white">
                  Discover & Compare
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Select your destination, dates, and vehicle category. Compare partner ratings, inclusions, prices, and security deposits transparently.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-navy-950 font-black text-base flex items-center justify-center">
                  2
                </div>
                <h3 className="text-base sm:text-lg font-black font-heading text-white">
                  Instant Reserve & Digital KYC
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Lock your vehicle instantly with Razorpay test payment. Pre-clear your Driving Licence digitally for 10-second pickup at the hub.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-black text-base flex items-center justify-center">
                  3
                </div>
                <h3 className="text-base sm:text-lg font-black font-heading text-white">
                  360° Handover & Ride
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Record vehicle condition digitally at pickup or hotel delivery. Enjoy your Himalayan ride with 24/7 Roadside SOS and automated deposit return.
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Frequently Asked Questions Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-black uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-brand-orange" /> FAQs
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Everything you need to know about renting with RideSetu in Uttarakhand.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-black text-slate-900 text-xs sm:text-sm flex items-center justify-between gap-4 hover:text-brand-orange transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className={`transform transition-transform text-brand-orange font-bold text-base ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 leading-relaxed font-normal border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Vendor List Fleet Call to Action */}
      <ScrollReveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-500 via-brand-orange to-orange-600 rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white inline-block">
                For Rental Operators & Fleet Owners
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
                Own Scooters, Bikes or Cars in Uttarakhand?
              </h2>
              <p className="text-xs sm:text-sm text-white/90 max-w-xl font-medium">
                Partner with RideSetu. Get verified bookings, automated customer KYC, daily calendar management, and instant direct bank payouts.
              </p>
            </div>
            <Link
              href="/vendor"
              className="px-6 py-3.5 rounded-2xl bg-navy-950 hover:bg-slate-900 text-white font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 shrink-0 transition-transform active:scale-95"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>List Your Fleet Today</span>
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
