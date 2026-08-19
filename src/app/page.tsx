'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SearchWidget from '@/components/marketplace/SearchWidget';
import VehicleCard from '@/components/marketplace/VehicleCard';
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
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white">
        {/* Background Decorative Aura */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FF6B00_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-brand-orange animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Uttarakhand Verified Travel Mobility Marketplace</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Rent. Ride. <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-amber-400 to-brand-saffron">Explore Himalayan Trails.</span>
          </h1>

          {/* Subheading */}
          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Discover and book verified scooters, touring motorcycles, and self-drive cars from certified local operators across Rishikesh, Mussoorie, Dehradun & Nainital.
          </p>

          {/* Floating Search Widget */}
          <div className="pt-6 max-w-5xl mx-auto text-left">
            <SearchWidget />
          </div>

          {/* Trust Metrics Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-center text-xs">
            <div className="p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-black text-white font-heading">6+</div>
              <div className="text-slate-400 text-xs mt-0.5">Uttarakhand Hubs</div>
            </div>
            <div className="p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-black text-amber-400 font-heading">10+</div>
              <div className="text-slate-400 text-xs mt-0.5">Verified Operators</div>
            </div>
            <div className="p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-black text-emerald-400 font-heading">30+</div>
              <div className="text-slate-400 text-xs mt-0.5">Inspected Vehicles</div>
            </div>
            <div className="p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
              <div className="text-2xl font-black text-brand-orange font-heading">100%</div>
              <div className="text-slate-400 text-xs mt-0.5">Deposit Isolation</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Marketplace Trust */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand-orange flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base font-heading">
              100% Verified Partners
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every vendor passes physical verification of trade licences, commercial permits, and fleet fitness certificates.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="font-black text-lg">₹0</span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-base font-heading">
              Zero Hidden Charges
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent itemized bills separating rental charges from your 100% refundable security deposit.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base font-heading">
              360° Digital Handover
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pre-ride photo inspections timestamped on cloud storage protect you from unjustified damage claims on return.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base font-heading">
              24/7 Roadside SOS
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instant mobile mechanic dispatch and breakdown helpline across mountain ghats and high-altitude trails.
            </p>
          </div>
        </div>
      </section>

      {/* Destination-First Discovery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Uttarakhand Travel Hubs
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-navy-950 mt-1">
              Find Verified Rides By Destination
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Select your base location to discover verified operators, transparent rates, and hotel delivery radiuses.
            </p>
          </div>
          <Link
            href="/vehicles"
            className="text-xs font-bold text-brand-orange hover:text-brand-dark flex items-center gap-1 shrink-0"
          >
            <span>View All Fleet</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <Link
              key={dest.slug}
              href={`/destinations/${dest.slug}`}
              className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-slate-200 bg-navy-950 transition-all duration-300 aspect-[16/11]"
            >
              <Image
                src={dest.heroImage || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80'}
                alt={dest.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />

              <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold">
                    📍 {dest.state}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-brand-orange text-white text-[10px] font-extrabold shadow-sm">
                    {dest.totalVehicles || 6} Rides Listed
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-2xl font-black font-heading group-hover:text-amber-400 transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {dest.tagline || dest.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-white/15 text-xs font-semibold">
                    <span className="text-slate-300">
                      Scooters from <strong className="text-white font-heading">{formatINR(dest.averagePrices?.scooter || 399)}/day</strong>
                    </span>
                    <span className="text-brand-orange flex items-center gap-0.5 group-hover:translate-x-1 transition-transform font-bold">
                      Explore Hub <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Multi-Vendor Comparison Highlight Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden border border-white/10 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="px-3 py-1 rounded-full bg-brand-orange/20 text-brand-orange font-bold text-xs border border-brand-orange/30">
              ⚡ Marketplace Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
              Multi-Vendor Side-by-Side Comparison
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Don’t settle for single-vendor pricing. Compare up to 4 rental vehicles from different verified local partners across daily rates, excess KM fees, security deposits, and inclusions in a single transparent matrix.
            </p>
            <div className="pt-2">
              <Link
                href="/compare"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-dark hover:to-brand-orange text-white font-extrabold text-xs shadow-lg shadow-brand-orange/30 transition-all active:scale-95"
              >
                <Layers className="w-4 h-4" />
                <span>Launch Comparison Engine</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Featured Vehicles Grid */}
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                Popular Rental Fleet
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-navy-950 mt-1">
                Top Booked Bikes, Scooters & Cars
              </h2>
            </div>
            <Link
              href="/vehicles"
              className="text-xs font-bold text-brand-orange hover:text-brand-dark flex items-center gap-1 shrink-0"
            >
              <span>Explore All Fleet</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
          </div>
        </div>
      </section>

      {/* Digital Handover Step-by-Step Roadmap */}
      <section className="bg-slate-100/80 py-16 sm:py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Transparency First
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-navy-950">
              How Digital Handover Protects You
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              We eliminated unfair damage deductions and deposit withholdings through timestamped cloud inspection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-navy-950 text-white flex items-center justify-center font-black text-sm">
                1
              </div>
              <h3 className="font-extrabold text-slate-900 text-base font-heading">
                Pre-Ride 360° Photo Capture
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                At pickup, partner agents record existing scratches, fuel gauge, and odometer readings. You confirm with mutual verification.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-brand-orange text-white flex items-center justify-center font-black text-sm">
                2
              </div>
              <h3 className="font-extrabold text-slate-900 text-base font-heading">
                Isolated Security Deposit Escrow
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your ₹1,000 security deposit is kept in an isolated account, never commingled with partner earnings or platform revenue.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                3
              </div>
              <h3 className="font-extrabold text-slate-900 text-base font-heading">
                Instant Automatic Deposit Release
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                On vehicle return, automated diff inspection certifies vehicle condition and initiates 100% deposit refund back to your source payment method.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-navy-950">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-extrabold text-slate-900 text-sm font-heading"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                    activeFaq === idx ? 'rotate-90 text-brand-orange' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
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
