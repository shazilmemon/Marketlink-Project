'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

const BASE = 'https://themewagon.github.io/milky/img';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      {/* Page Header Header with SlideInDown Animation */}
      <div className="relative bg-[#263A2E]/10 text-[#F5F0E6] py-16 px-6 text-center overflow-hidden animate-slide-in-down">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${BASE}/carousel-1.jpg)` }}
        />
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-3">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-md">
            404 Page Not Found
          </h1>
          <div className="flex items-center gap-2 text-sm text-[#263A2E] mt-2">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span className="text-[#263A2E] font-medium">404 Error</span>
          </div>
        </div>
      </div>

      {/* 404 Content Container with FadeInUp Animation */}
      <div className="max-w-2xl mx-auto px-6 py-16 text-center flex flex-col items-center gap-6 animate-fade-in-up my-auto">
        <div className="p-6 rounded-full bg-[#263A2E]/10 text-[#263A2E] animate-pulse-glow mb-2">
          <AlertTriangle className="w-20 h-20" />
        </div>

        <h1 className="text-7xl md:text-9xl font-black text-[#263A2E] tracking-wider">
          404
        </h1>

        <h2 className="text-3xl font-bold text-slate-900">
          Page Not Found
        </h2>

        <p className="text-slate-600 leading-relaxed text-base max-w-md">
          Weâ€™re sorry, the page you are looking for does not exist or has been moved. Maybe return to our homepage or explore our products!
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#263A2E]/10 hover:bg-[#263A2E]/10 text-[#F5F0E6] font-semibold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            <Home className="w-5 h-5" /> Go Back To Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-[#263A2E] font-semibold px-6 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" /> Previous Page
          </button>
        </div>
      </div>

    </div>
  );
}
