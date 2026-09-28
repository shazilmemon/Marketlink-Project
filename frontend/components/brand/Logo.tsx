'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout } from 'lucide-react';

export const Logo: React.FC<{ className?: string; variant?: 'default' | 'luxury' | 'light' }> = ({
  className = '',
  variant = 'luxury',
}) => {
  const isLight = variant === 'light';

  return (
    <Link
      href="/"
      className={`group relative inline-flex items-center gap-3 select-none ${className}`}
      aria-label="MarketLink Home"
    >
      {/* AgriFlow Leaf / Sprout Icon with Gold Glow */}
      <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-[#C9A45C] via-[#C9A45C] to-[#A9874B] flex items-center justify-center text-[#10251D] shadow-[0_4px_18px_rgba(234,179,8,0.4)] group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
        <Sprout className="w-6 h-6 stroke-[2.4] text-[#10251D] transition-transform group-hover:scale-110" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#F5F0E6] ring-2 ring-[#10251D] animate-pulse" />
      </div>

      <div className="relative flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-2xl font-serif font-bold tracking-tight leading-none transition-colors duration-300 ${
              isLight
                ? 'text-[#10251D] group-hover:text-[#C9A45C]'
                : 'text-white group-hover:text-[#C9A45C]'
            }`}
          >
            MarketLink
          </span>
        </div>

        <div className="relative overflow-hidden pt-0.5">
          <span
            className={`text-[8.5px] font-bold tracking-[0.25em] uppercase transition-colors duration-300 ${
              isLight
                ? 'text-[#4A5A52] group-hover:text-[#10251D]'
                : 'text-[#C9A45C] group-hover:text-white'
            }`}
          >
            EGREEN BASKET NETWORK
          </span>
        </div>
      </div>
    </Link>
  );
};
