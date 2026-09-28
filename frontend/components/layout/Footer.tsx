'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '../brand/Logo';
import { ShieldCheck, Cpu, Leaf, MapPin, Globe, ArrowRight, Heart } from 'lucide-react';

const linkClass =
  'text-[#F5F0E6]/75 hover:text-[#C9A45C] transition-colors duration-200 text-xs sm:text-sm font-medium';

export const Footer: React.FC = () => {
  return (
    <footer className="relative overflow-hidden bg-[#10251D] text-[#F5F0E6] border-t border-[#C9A45C]/20 pt-16 pb-12 mt-auto">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(234,179,8,0.08),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A45C]/60 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">

          <div className="flex flex-col gap-4">
            <Logo variant="luxury" />
            <p className="text-xs sm:text-sm text-[#F5F0E6]/70 leading-relaxed">
              Empowering regional agriculture and local farmers through zero-middleman pre-ordering,
              immutable produce traceability, and smart AI demand forecasting.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#C9A45C] font-black bg-[#C9A45C]/15 px-3.5 py-2 rounded-md border border-[#C9A45C]/30 w-fit">
              <ShieldCheck className="w-4 h-4 text-[#C9A45C]" /> Verified Organic Marketplace
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#C9A45C]">Marketplace</h4>
            <ul className="flex flex-col gap-2.5">
              <li><Link href="/markets" className={linkClass}>Local Markets Directory</Link></li>
              <li><Link href="/products" className={linkClass}>Fresh Farm Produce</Link></li>
              <li><Link href="/register?role=FARMER" className={linkClass}>Join as Farmer Producer</Link></li>
              <li><Link href="/customer/orders" className={linkClass}>Customer Pre-Orders</Link></li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#C9A45C]">Key Innovations</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/farmer/analytics/forecasting" className={`flex items-center gap-2 ${linkClass}`}>
                  <Cpu className="w-3.5 h-3.5 text-[#C9A45C]" /> AI Demand Forecasting
                </Link>
              </li>
              <li>
                <Link href="/traceability" className={`flex items-center gap-2 ${linkClass}`}>
                  <Leaf className="w-3.5 h-3.5 text-[#C9A45C]" /> QR Batch Traceability
                </Link>
              </li>
              <li>
                <Link href="/markets" className={`flex items-center gap-2 ${linkClass}`}>
                  <MapPin className="w-3.5 h-3.5 text-[#C9A45C]" /> OpenStreetMap Stall Locator
                </Link>
              </li>
              <li>
                <Link href="/products" className={`flex items-center gap-2 ${linkClass}`}>
                  <Globe className="w-3.5 h-3.5 text-[#C9A45C]" /> Surplus Produce Matching
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#C9A45C]">eGreen Basket Mission</h4>
            <p className="text-xs sm:text-sm text-[#F5F0E6]/70 leading-relaxed">
              Designed to eliminate agricultural food waste and guarantee living wages for certified growers.
            </p>
            <div className="text-[11.5px] font-mono text-[#C9A45C]/90 bg-[#071912]/80 p-3.5 rounded-md border border-[#C9A45C]/20">
              Platform: MarketLink v1.0<br />
              Stack: Next.js â€¢ MongoDB â€¢ Leaflet
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#F5F0E6]/60 gap-4">
          <p>Â© {new Date().getFullYear()} MarketLink (eGreen Basket). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className={linkClass}>About Architecture</Link>
            <span className="text-[#C9A45C]/40">â€¢</span>
            <span>Security Verified</span>
            <span className="text-[#C9A45C]/40">â€¢</span>
            <span className="text-[#C9A45C] font-bold">AgriFlow System Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
