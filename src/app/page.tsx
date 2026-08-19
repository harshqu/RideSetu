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
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Cinematic Animated Himalayan Hero Section */}
      <section className="relative pt-24 sm:pt-28 md:pt-36 pb-20 sm:pb-28 md:pb-36 px-4 sm:px-6 lg:px-8 overflow-hidden text-white min-h-[660px] md:min-h-[740px] flex items-center justify-center">
        {/* Multi-Layered Cinematic Himalayan & Rider Visual Scene */}
        <CinematicHero />

        {/* Foreground Content with High Contrast Hierarchy */}
        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6 sm:space-y-7">
          {/* Tagline Badge - Stagger 1 */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-950/80 backdrop-blur-md border border-white/20 text-xs font-extrabold text-brand-orange animate-stagger-1 shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Uttarakhand Verified Travel Mobility Marketplace</span>
          </div>

          {/* Main Hero Headline - Stagger 2 */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-white tracking-tight leading-[1.15] max-w-4xl mx-auto animate-stagger-2 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            Rent. Ride. <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300">Explore Himalayan Trails.</span>
          </h1>

          {/* Subheading - Stagger 3 */}
          <p className="text-slate-100 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed animate-stagger-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Discover and book verified scooters, touring motorcycles, and self-drive cars from certified local operators across Rishikesh, Mussoorie, Dehradun & Nainital.
          </p>

          {/* Floating Glassmorphic Search Widget - Stagger 4 */}
          <div className="pt-2 sm:pt-4 max-w-5xl mx-auto text-left animate-stagger-4">
            <SearchWidget />
          </div>

          {/* Integrated Translucent Dark Glass Trust Metrics Bar */}
          <div className="pt-6 sm:pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-center">
            <div className="bg-navy-950/75 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/10 shadow-xl transition-transform hover:scale-105 duration-200">
              <StatCounter target={6} suffix="+" label="Uttarakhand Hubs" colorClass="text-white" />
            </div>
            <div className="bg-navy-950/75 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/10 shadow-xl transition-transform hover:scale-105 duration-200">
              <StatCounter target={10} suffix="+" label="Verified Operators" colorClass="text-amber-400" />
            </div>
            <div className="bg-navy-950/75 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/10 shadow-xl transition-transform hover:scale-105 duration-200">
              <StatCounter target={30} suffix="+" label="Inspected Vehicles" colorClass="text-emerald-400" />
            </div>
            <div className="bg-navy-950/75 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/10 shadow-xl transition-transform hover:scale-105 duration-200">
              <StatCounter target={100} suffix="%" label="Deposit Isolation" colorClass="text-brand-orange" />
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Marketplace Trust */}
      <ScrollReveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="card-premium card-premium-hover p-6 rounded-3xl space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand-orange flex items-center justify-center transition-transform group-hover:scale-110 duration-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base font-heading">
                100% Verified Partners
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every vendor passes physical verification of trade licences, commercial permits, and fleet fitness certificates.
              </p>
            </div>

            <div className="card-premium card-premium-hover p-6 rounded-3xl space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110 duration-200">
                <span className="font-black text-lg">₹0</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-base font-heading">
                Zero Hidden Charges
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transparent itemized bills separating rental charges from your 100% refundable security deposit.
              </p>
            </div>

            <div className="card-premium card-premium-hover p-6 rounded-3xl space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110 duration-200">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base font-heading">
                360° Digital Handover
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mutual digital inspection recording odometer, fuel level, and scratches at pickup to prevent dispute on return.
              </p>
            </div>

            <div className="card-premium card-premium-hover p-6 rounded-3xl space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110 duration-200">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base font-heading">
                24/7 Mountain SOS
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Immediate roadside breakdown assistance and emergency dispatch across all mountain highway routes.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Popular Rental Destinations in Uttarakhand */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase text-brand-orange tracking-wider">Top Hubs</span>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-navy-950 mt-1">
              Popular Uttarakhand Rental Hubs
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mt-1">
              Pick up from local partner shops or request doorstep delivery directly at your hotel or homestay.
            </p>
          </div>
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-brand-dark transition-colors group"
          >
            <span>Explore All 6 Destinations</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <Link
              key={dest._id}
              href={`/destinations/${dest.slug}`}
              className="group relative h-64 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 block focus-ring"
            >
              <Image
                src={dest.image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80'}
                alt={dest.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300">
                    {dest.state}
                  </span>
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-brand-orange" /> {dest.popularPlaces?.length || 4} Hubs
                  </span>
                </div>
                <h3 className="text-xl font-black font-heading group-hover:text-amber-400 transition-colors">
                  {dest.name}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {dest.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Verified Vehicles Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase text-brand-orange tracking-wider">Top Rated</span>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-navy-950 mt-1">
              Featured Verified Fleet
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mt-1">
              Mechanically inspected scooties, touring bikes, and 4x4s available for instant reservation.
            </p>
          </div>
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-brand-dark transition-colors group"
          >
            <span>View All Fleet</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredVehicles.map((veh) => (
            <VehicleCard key={veh._id} vehicle={veh} />
          ))}
        </div>
      </section>

      {/* Comparison CTA Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-brand-orange/20 text-brand-orange border border-brand-orange/30">
              Side-by-Side Comparison
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-heading tracking-tight">
              Can’t decide between Royal Enfield Himalayan or Activa 6G?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Use our interactive comparison engine to benchmark engine cc, mileage, terrain suitability, security deposit, and vendor ratings side-by-side.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/compare"
                className="px-6 py-3 rounded-2xl bg-brand-orange hover:bg-brand-dark text-white font-bold text-xs shadow-lg shadow-brand-orange/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <span>Launch Compare Engine</span>
                <Layers className="w-4 h-4" />
              </Link>
              <Link
                href="/vehicles"
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/15 transition-all"
              >
                Browse All Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase text-brand-orange tracking-wider">Got Questions?</span>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-navy-950">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Everything you need to know about renting with RideSetu in Uttarakhand.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm transition-all"
            >
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:text-brand-orange transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    activeFaq === idx ? 'rotate-90 text-brand-orange' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
