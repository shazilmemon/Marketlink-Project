'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Users, ArrowRight, Sprout, ShieldCheck, Sparkles } from 'lucide-react';

export const HeroVideoSection: React.FC = () => {
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-[#0A1610] text-white">
      {/* ── 1. Full-Bleed Panoramic Background Image ─────────────────── */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center scale-100 transform motion-safe:transition-transform duration-[10000ms]"
        style={{
          backgroundImage: `url('/images/cinematic_hero_farm.jpg')`,
        }}
      >
        {/* Cinematic Gradient Overlays matching target design */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/35 z-10" />
        <div className="absolute inset-0 bg-black/15 z-10" />
      </div>

      {/* ── 2. Hero Content Container ────────────────────────────────── */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-8 w-full flex-1 flex flex-col justify-between">
        
        {/* Main Grid: Headline & Text (Left) + Floating Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full my-auto py-2">
          
          {/* Left Column: Eyebrow, Title, Subtitle & Buttons */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-start text-left max-w-2xl">
            
            {/* 100% Organic Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A45C]/50 bg-black/40 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-[#E9DFC9] shadow-sm">
              <Sprout className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>100% Organic Produce &amp; Direct Farm Pre-Orders</span>
            </div>

            {/* Tagline Eyebrow */}
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.25em] text-stone-300/80 uppercase mt-8 mb-4">
              SUPPORT LOCAL &nbsp;/&nbsp; EAT FRESH &nbsp;/&nbsp; BUILD A SUSTAINABLE FUTURE
            </p>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-serif text-white tracking-tight leading-[1.08] mb-6 drop-shadow-lg">
              Farm Fresh Harvests,<br />
              <span className="text-[#C9A45C] italic font-serif">Just A Click Away.</span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg text-stone-200/90 max-w-xl font-normal leading-relaxed mb-8">
              Connect directly with local verified farmers, explore weekly market inventories, and reserve fresh organic produce before market day.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/markets"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E5B54F] hover:bg-[#d4a33e] px-8 py-3.5 text-sm font-extrabold text-[#10251D] shadow-lg shadow-[#E5B54F]/25 transition-all hover:scale-105 active:scale-95"
              >
                <span>Explore Markets</span>
                <ArrowRight className="w-4 h-4 text-[#10251D]" />
              </Link>
              <Link
                href="/farmers"
                className="inline-flex items-center justify-center rounded-full border border-[#C9A45C]/60 hover:border-[#C9A45C] bg-black/30 hover:bg-black/50 backdrop-blur-sm px-8 py-3.5 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
              >
                Meet Local Farmers
              </Link>
            </div>
          </div>

          {/* Right Column: Floating Live Farm Network Glass Card */}
          <div className="lg:col-span-5 xl:col-span-4 flex justify-end">
            <div className="w-full max-w-md rounded-2xl bg-[#0C1A14]/85 backdrop-blur-md border border-[#1A3324] p-6 shadow-2xl">
              {/* Card Header: Live Network & Rating */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-emerald-400 uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE FARM NETWORK
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E5B54F] bg-black/40 px-3 py-1 rounded-full border border-[#E5B54F]/25">
                  <Star className="w-3.5 h-3.5 fill-[#E5B54F] text-[#E5B54F]" />
                  4.9 / 5.0
                </span>
              </div>

              {/* Stat Highlight */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#E5B54F] flex items-center justify-center text-[#10251D] shrink-0 shadow-md">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-serif text-white">
                    33k+ Active Customers
                  </h3>
                  <p className="text-xs font-semibold text-[#C9A45C]">
                    100+ Local Farmers
                  </p>
                </div>
              </div>

              {/* Explanatory Text */}
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-6">
                Connecting regional communities directly to fresh seasonal harvests, farm stalls, and zero-waste pre-orders.
              </p>

              {/* Farmer Avatars Stack & View Stalls Link */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center -space-x-2">
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0C1A14] object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                    alt="Customer 1"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0C1A14] object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                    alt="Customer 2"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-[#0C1A14] object-cover"
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80"
                    alt="Customer 3"
                  />
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E5B54F] text-[10px] font-black text-[#10251D] ring-2 ring-[#0C1A14]">
                    +97
                  </div>
                </div>

                <Link
                  href="/farmers"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E5B54F] hover:text-yellow-300 transition-colors group/link"
                >
                  <span>View Stalls</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* ── 3. Bottom Trust Bar (Zero Middleman, QR Traceability, AI Demand) ── */}
        <div className="mt-6 sm:mt-8 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 px-6 sm:px-8 py-4 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x md:divide-white/10 shadow-xl max-w-3xl">
          {/* Feature 1 */}
          <div className="flex items-center gap-3.5 pr-4">
            <div className="w-9 h-9 rounded-full bg-[#C9A45C]/15 border border-[#C9A45C]/30 flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4 text-[#C9A45C]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">Zero Middleman Fees</h4>
              <p className="text-[11.5px] text-stone-300 mt-0.5">More value for farmers, better prices for you.</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-center gap-3.5 md:px-6">
            <div className="w-9 h-9 rounded-full bg-[#C9A45C]/15 border border-[#C9A45C]/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#C9A45C]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">QR Traceability Guaranteed</h4>
              <p className="text-[11.5px] text-stone-300 mt-0.5">Know your food, know your farmer.</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-center gap-3.5 md:pl-6">
            <div className="w-9 h-9 rounded-full bg-[#C9A45C]/15 border border-[#C9A45C]/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#C9A45C]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">AI Demand Forecasting</h4>
              <p className="text-[11.5px] text-stone-300 mt-0.5">Freshness, always on time.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export const HeroVideo = HeroVideoSection;
export default HeroVideoSection;
