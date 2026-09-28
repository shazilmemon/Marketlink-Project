'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Sprout,
  ArrowRight,
  ShoppingBag,
  MapPin,
  CheckCircle2,
  Sparkles,
  Play,
  Pause,
  ShieldCheck,
  Star,
  Users
} from 'lucide-react';
import { AgriFloatingBadge } from '../motion/AgriMotion';

export const HeroSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <section className="relative w-full min-h-[90vh] lg:min-h-[94vh] flex items-center overflow-hidden bg-[#10251D]">
      {/* â”€â”€ 1. Background Video Loop with HTML5 Fallback â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster="/images/hero.jpg"
          className="w-full h-full object-cover object-center scale-105 transform motion-safe:transition-transform duration-[10000ms]"
        >
          {/* High quality farm produce harvesting video streams */}
          <source
            src="https://cdn.coverr.co/videos/coverr-tractor-harvesting-in-a-field-5259/1080p.mp4"
            type="video/mp4"
          />
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-farmer-hands-holding-freshly-harvested-vegetables-41221-large.mp4"
            type="video/mp4"
          />
        </video>

        {/* Fallback image layer in case video takes time or is offline */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none -z-10"
          style={{ backgroundImage: `url('/images/hero.jpg')` }}
        />

        {/* â”€â”€ Dark Gradient Overlay as specified: from-[#10251D]/90 via-[#10251D]/70 to-transparent â”€â”€ */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#10251D]/90 via-[#10251D]/70 to-transparent z-10" />

        {/* Vertical gradient for smooth blend with page base */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#10251D] via-transparent to-[#10251D]/40 z-10" />

        {/* Subtle radial glow */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#C9A45C]/10 rounded-full blur-3xl pointer-events-none z-10" />
      </div>

      {/* â”€â”€ Main Content Container â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column: Text Entrance Sequence */}
          <div className="lg:col-span-8 flex flex-col items-start text-left">

            {/* Step 1: Badge / Eyebrow -> slideInDown */}
            <div
              className="animate-slide-in-down inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#10251D]/80 backdrop-blur-md border border-[#C9A45C]/40 shadow-lg text-[#F5F0E6] mb-6 group hover:border-[#C9A45C] transition-all cursor-default"
              style={{ animationDuration: '700ms' }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#C9A45C] animate-pulse" />
              <span className="text-xs sm:text-sm font-black tracking-wide text-[#F5F0E6]">
                ðŸŒ± 100% Organic &amp; Farm Fresh Pre-Orders
              </span>
              <span className="hidden sm:inline-block text-[11px] font-bold text-[#C9A45C] bg-[#C9A45C]/15 px-2 py-0.5 rounded-full ml-1">
                Verified Direct
              </span>
            </div>

            {/* Step 2: Main Heading -> Staggered fadeInUp (delay 100ms) */}
            <h1
              className="animate-fade-in-up font-display font-black text-4xl sm:text-6xl lg:text-7xl text-[#F5F0E6] tracking-tight leading-[1.08] mb-6 drop-shadow-md"
              style={{ animationDelay: '100ms', animationDuration: '800ms' }}
            >
              Fresh Farm Produce <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A45C] via-[#C9A45C] to-[#E9DFC9]">
                Directly From Local
              </span>{' '}
              Growers.
            </h1>

            {/* Step 3: Subtitle & Action CTA Buttons -> fadeInUp (delay 200ms) */}
            <p
              className="animate-fade-in-up text-base sm:text-lg lg:text-xl text-[#F5F0E6]/85 max-w-2xl font-normal leading-relaxed mb-8 drop-shadow"
              style={{ animationDelay: '200ms', animationDuration: '800ms' }}
            >
              Skip middleman costs. Connect directly with certified local farm stalls,
              reserve seasonal harvests with verified batch traceability, and support sustainable regional agriculture.
            </p>

            {/* Action CTA Buttons */}
            <div
              className="animate-fade-in-up flex flex-wrap items-center gap-4 mb-10"
              style={{ animationDelay: '260ms', animationDuration: '800ms' }}
            >
              <Link
                href="/products"
                className="btn-harvest text-sm sm:text-base font-black px-8 py-4 shadow-xl group"
              >
                <ShoppingBag className="w-5 h-5 text-[#10251D] transition-transform group-hover:rotate-12" />
                <span>Explore Farm Produce</span>
                <ArrowRight className="w-4 h-4 text-[#10251D] transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/markets"
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-[#10251D]/60 hover:bg-[#10251D]/90 text-[#F5F0E6] font-bold text-sm sm:text-base border border-white/20 hover:border-[#C9A45C]/60 backdrop-blur-md transition-all duration-300 shadow-lg hover:scale-105 active:scale-95"
              >
                <MapPin className="w-4 h-4 text-[#C9A45C]" />
                <span>Find Local Markets</span>
              </Link>

              {/* Video control button */}
              <button
                onClick={toggleVideo}
                aria-label={isPlaying ? 'Pause background video' : 'Play background video'}
                className="w-12 h-12 rounded-full bg-[#F5F0E6]/10 hover:bg-[#F5F0E6]/20 backdrop-blur-md border border-white/20 text-[#F5F0E6] flex items-center justify-center transition-all hover:scale-110 ml-1"
                title={isPlaying ? 'Pause video' : 'Play video'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
            </div>

            {/* Trust Micro-Metrics */}
            <div
              className="animate-fade-in-up flex flex-wrap items-center gap-6 text-xs sm:text-sm font-semibold text-[#F5F0E6]/80 pt-2 border-t border-white/10"
              style={{ animationDelay: '320ms', animationDuration: '800ms' }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C9A45C]" />
                <span>Zero Middleman Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C9A45C]" />
                <span>QR Traceability Guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C9A45C]" />
                <span>AI Demand Forecasting</span>
              </div>
            </div>

          </div>

          {/* Right Column: Floating Interactive Stat Card on Hero Corner */}
          <div className="lg:col-span-4 relative flex flex-col items-center lg:items-end justify-center">

            {/* â”€â”€ 3. Floating Interactive Stat Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <AgriFloatingBadge className="w-full max-w-sm p-6 bg-[#10251D]/85  border border-[#C9A45C]/40 shadow-[0_25px_50px_-12px_rgba(14,42,31,0.65)] hover:border-[#C9A45C] transition-all duration-300">
              {/* Header with verified badge */}
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#263A2E]/10 animate-ping" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#263A2E]">
                    Live Farm Network
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[#C9A45C] text-xs font-black bg-[#C9A45C]/15 px-2.5 py-1 rounded-full border border-[#C9A45C]/30">
                  <Star className="w-3 h-3 fill-[#C9A45C]" />
                  <span>4.9 / 5.0</span>
                </div>
              </div>

              {/* Main Badge Content: 33k+ Active Customers | 100+ Local Farmers */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#C9A45C] to-[#A9874B] flex items-center justify-center text-[#10251D] shadow-lg shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#F5F0E6] font-display leading-tight">
                      33k+ Active Customers
                    </h3>
                    <p className="text-xs font-bold text-[#C9A45C]">
                      100+ Local Farmers
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#F5F0E6]/75 leading-relaxed pt-1">
                  Connecting regional communities directly to fresh seasonal harvests, farm stalls, and zero-waste pre-orders.
                </p>

                {/* Farmer Avatars Stack */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex -space-x-2.5 overflow-hidden">
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-[#10251D] object-cover"
                      src="https://i.pinimg.com/736x/47/7b/a5/477ba5bdde12f5a29071a19f1d49e8e6.jpg"
                      alt="Farmer Haris"
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-[#10251D] object-cover"
                      src="https://i.pinimg.com/736x/ec/39/12/ec3912a4707eeef95639ff588170a6a3.jpg"
                      alt="Farmer Aisha"
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-[#10251D] object-cover"
                      src="https://i.pinimg.com/736x/a2/c7/7c/a2c77c05492aa6037bcf76482cf5d1ed.jpg"
                      alt="Farmer Rahim"
                    />
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A45C] text-[10px] font-black text-[#10251D] ring-2 ring-[#10251D]">
                      +97
                    </div>
                  </div>

                  <Link
                    href="/markets"
                    className="text-xs font-extrabold text-[#C9A45C] hover:text-[#C9A45C] flex items-center gap-1 group/link"
                  >
                    <span>View Stalls</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>
            </AgriFloatingBadge>

            {/* Additional Decorative Micro-badge */}
            <div className="mt-4 w-full max-w-sm hidden sm:flex items-center justify-between p-3.5 rounded-md bg-[#F5F0E6]/10 backdrop-blur-md border border-white/10 text-[#F5F0E6]/90 text-xs font-bold">
              <span className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-[#C9A45C]" />
                Fresh Harvest Season Active
              </span>
              <span className="text-[#C9A45C] font-black">Pre-Orders Open</span>
            </div>

          </div>

        </div>
      </div>

      {/* Decorative Wave Divider to seamlessly blend into #F5F0E6 page content */}
      <div className="absolute bottom-0 inset-x-0 h-10 pointer-events-none z-20">
        <svg
          viewBox="0 0 1440 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full preserve-3d"
        >
          <path
            d="M0 40C360 10 720 10 1080 25C1260 32.5 1350 38 1440 40V40H0Z"
            fill="#F5F0E6"
          />
        </svg>
      </div>
    </section>
  );
};
