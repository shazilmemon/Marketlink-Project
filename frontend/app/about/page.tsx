'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sprout, ShieldCheck, Award } from 'lucide-react';
import { AboutHeroImage } from '@/components/about/AboutHeroImage';
import { TeamSection } from '@/components/about/TeamSection';
import { SystemArchitectureSection } from '@/components/about/SystemArchitectureSection';
import { AgriCard } from '@/components/motion/AgriMotion';

const BASE = 'https://themewagon.github.io/milky/img';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E6] text-[#10251D] flex flex-col gap-14 pb-20">
      
      {/* Page Header with AgriFlow Forest Green & Clean Typography */}
      <div className="relative bg-[#10251D] text-[#F5F0E6] py-24 px-6 text-center overflow-hidden animate-slide-in-down border-b border-[#C9A45C]/20">
        <div 
          className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url('/images/hero.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10251D] via-[#10251D]/80 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-4">
          <span className="inline-flex items-center gap-2 bg-[#C9A45C]/20 text-[#C9A45C] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider border border-[#C9A45C]/40 shadow-sm">
            <Sprout className="w-3.5 h-3.5" />
            About MarketLink (eGreen Basket)
          </span>
          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-[#F5F0E6] drop-shadow-md">
            Agricultural Technology &amp; Direct Markets
          </h1>
          <p className="text-[#F5F0E6]/85 text-base md:text-lg max-w-2xl leading-relaxed font-normal">
            Bridging the gap between smallholder organic farmers, local weekly markets, and conscious consumers through modern web engineering and transparent food traceability.
          </p>
          <div className="flex items-center gap-2 text-sm text-[#F5F0E6]/70 mt-2 font-medium">
            <Link href="/" className="hover:underline hover:text-[#F5F0E6] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#C9A45C] font-black">About Us</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-16 w-full">

        {/* Section 1: Main Feature Hero Image with AgriFlow Theme */}
        <div className="w-full">
          <AboutHeroImage />
        </div>

        {/* Section 2: Info Content & Farm Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Image Grid with Experience Box */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#10251D] text-[#F5F0E6] p-8 rounded-md flex flex-col justify-center items-center text-center shadow-lg border border-[#C9A45C]/40 agriflow-card">
              <h2 className="text-5xl md:text-6xl font-black font-display text-[#C9A45C]">25+</h2>
              <p className="text-xs font-black uppercase tracking-wider mt-1 text-[#F5F0E6]">Years Experience</p>
              <span className="text-[10.5px] text-[#C9A45C]/80 font-bold mt-1">Direct Agriculture</span>
            </div>
            <div className="rounded-md overflow-hidden shadow-md group border border-[#C9A45C]/25 agriflow-card">
              <img src={`${BASE}/service-1.jpg`} alt="Farm Service 1" className="w-full h-48 object-cover agriflow-img-zoom" />
            </div>
            <div className="rounded-md overflow-hidden shadow-md group border border-[#C9A45C]/25 agriflow-card">
              <img src={`${BASE}/service-2.jpg`} alt="Farm Service 2" className="w-full h-48 object-cover agriflow-img-zoom" />
            </div>
            <div className="rounded-md overflow-hidden shadow-md group border border-[#C9A45C]/25 agriflow-card">
              <img src={`${BASE}/service-3.jpg`} alt="Farm Service 3" className="w-full h-48 object-cover agriflow-img-zoom" />
            </div>
          </div>

          {/* Right: Info Content */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#10251D] bg-[#C9A45C]/20 px-3.5 py-1.5 rounded-full border border-[#C9A45C]/40 w-fit">
              <Award className="w-3.5 h-3.5 text-[#A9874B]" />
              <span>Our Agricultural Mission</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#10251D] font-display leading-tight tracking-tight">
              Empowering Organic Growers &amp; Direct Regional Buyers
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              MarketLink empowers regional farmers with digital pre-orders, real-time stall management, and AI demand forecasting to eliminate post-harvest waste and connect fresh produce directly to families.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <AgriCard className="p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#10251D]/10 flex items-center justify-center text-[#10251D] shrink-0 font-black">
                  <Sprout className="w-6 h-6 text-[#10251D]" />
                </div>
                <div>
                  <h4 className="font-black text-[#10251D] text-base">Direct Stall Orders</h4>
                  <p className="text-xs text-[#263A2E] mt-1 leading-relaxed">Direct farmer-to-consumer fulfillment and market stall bookings.</p>
                </div>
              </AgriCard>

              <AgriCard className="p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#C9A45C]/20 flex items-center justify-center text-[#10251D] shrink-0 font-black">
                  <ShieldCheck className="w-6 h-6 text-[#A9874B]" />
                </div>
                <div>
                  <h4 className="font-black text-[#10251D] text-base">100% Organic</h4>
                  <p className="text-xs text-[#263A2E] mt-1 leading-relaxed">Verified soil stewardship, pesticide-free crops, and pure farm goods.</p>
                </div>
              </AgriCard>
            </div>

            <Link 
              href="/products" 
              className="btn-harvest w-fit mt-2"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4 text-[#10251D]" />
            </Link>
          </div>
        </div>

        {/* Section 3: Verified Agronomists & Team */}
        <div className="pt-4">
          <TeamSection />
        </div>

        {/* Section 4: System Architecture Section */}
        <div className="pt-4">
          <SystemArchitectureSection />
        </div>

      </div>
    </div>
  );
}
