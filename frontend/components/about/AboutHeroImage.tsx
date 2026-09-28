'use client';

import React from 'react';
import { Award, ShieldCheck, Zap } from 'lucide-react';

export const AboutHeroImage: React.FC = () => {
  return (
    <div className="relative group w-full">
      {/* Animated Ambient Glow Ring on Hover */}
      <div className="absolute -inset-1.5 rounded-md bg-gradient-to-r from-[#10251D] via-[#C9A45C] to-[#263A2E] opacity-0 blur-xl transition-all duration-700 group-hover:opacity-40 group-hover:scale-[1.02] pointer-events-none" />

      {/* Main Image Card with 3D Motion */}
      <div className="relative overflow-hidden rounded-md bg-[#10251D] shadow-xl border border-[#C9A45C]/25 transition-all duration-500 ease-out group-hover:scale-[1.01] group-hover:-translate-y-1.5 group-hover:shadow-lg">
        
        {/* Shimmer Light Beam */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

        {/* Feature High-Res Image */}
        <img
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200"
          alt="MarketLink Agricultural Infrastructure & Regional Farm Network"
          className="w-full h-[360px] sm:h-[420px] md:h-[480px] object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Gradient Overlay for Text Readability: AgriFlow Deep Forest Green */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#10251D]/95 via-[#10251D]/40 to-transparent z-10" />

        {/* Floating Stat Badges */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#10251D]/90 backdrop-blur-md text-[#F5F0E6] text-xs font-bold shadow-lg border border-[#C9A45C]/40">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A45C]" /> Verified Organic Network
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#C9A45C] backdrop-blur-md text-[#10251D] text-xs font-black shadow-lg border border-[#A9874B]/40">
            <Award className="w-3.5 h-3.5" /> Direct From Farmers
          </span>
        </div>

        {/* Bottom Hero Caption */}
        <div className="absolute bottom-6 left-6 right-6 z-20 text-[#F5F0E6] flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <span className="text-[#C9A45C] text-xs font-black uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 fill-[#C9A45C]" /> Modern Agricultural Ecosystem
            </span>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-[#F5F0E6] drop-shadow-md font-display">
              Smart Agricultural Pre-Orders &amp; Local Market Network
            </h3>
            <p className="text-[#E9DFC9] text-xs md:text-sm mt-1 max-w-xl leading-relaxed">
              Empowering regional farmers with fair valuation, automated batch QR traceability, and smart seasonal demand forecasting.
            </p>
          </div>

          <div className="bg-[#F5F0E6]/10 backdrop-blur-md border border-white/20 p-3.5 rounded-lg flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-2xl font-black text-[#C9A45C]">100%</p>
              <p className="text-[10px] text-stone-200 uppercase font-bold">Organic Traceability</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
