'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AgriCard, AgriMotion } from '../../components/motion/AgriMotion';
import {
  Users, MapPin, Star, ShieldCheck, Sprout, Search,
  Calendar, Phone, ArrowRight, CheckCircle2, Award, Sparkles, Store
} from 'lucide-react';

interface FarmerProfile {
  id: string;
  name: string;
  farmName: string;
  location: string;
  stall: string;
  marketName: string;
  marketDays: string;
  specialty: string;
  rating: string;
  reviewsCount: number;
  imageUrl: string;
  badge: string;
  experienceYears: number;
  crops: string[];
  bio: string;
}

const FARMERS_DATA: FarmerProfile[] = [
  {
    id: 'farmer-1',
    name: 'Haris Ahmed',
    farmName: 'Green Valley Organic Farm',
    location: 'Malir Farms, Karachi',
    stall: 'Stall #A-04',
    marketName: 'Empress Market & Malir Hub',
    marketDays: 'Sat & Sun â€¢ 8:00 AM â€“ 2:00 PM',
    specialty: 'Heirloom Tomatoes, Bell Peppers & Cucumbers',
    rating: '5.0',
    reviewsCount: 128,
    imageUrl: 'https://i.pinimg.com/736x/47/7b/a5/477ba5bdde12f5a29071a19f1d49e8e6.jpg',
    badge: 'Core Specialist',
    experienceYears: 16,
    crops: ['Heirloom Tomatoes', 'Spinach', 'Sweet Bell Peppers', 'Zucchini'],
    bio: 'Pioneering organic soil regenerations in the Malir river basin with zero chemical pesticides and drip irrigation.',
  },
  {
    id: 'farmer-2',
    name: 'Aisha Siddiqui',
    farmName: 'Siddiqui Citrus & Berries',
    location: 'Gadap Agriculture Zone',
    stall: 'Stall #B-12',
    marketName: 'Downtown Farmers Market',
    marketDays: 'Friday & Saturday â€¢ 7:30 AM â€“ 1:30 PM',
    specialty: 'Organic Citrus, Strawberries & Farm Preserves',
    rating: '4.9',
    reviewsCount: 94,
    imageUrl: 'https://i.pinimg.com/736x/ec/39/12/ec3912a4707eeef95639ff588170a6a3.jpg',
    badge: 'Verified Expert',
    experienceYears: 12,
    crops: ['Fresh Strawberries', 'Mandarin Oranges', 'Meyer Lemons', 'Fruit Jams'],
    bio: 'Family-run certified orchard specializing in tree-ripened citrus fruits, sweet seasonal berries, and raw preserves.',
  },
  {
    id: 'farmer-3',
    name: 'Rahim Khan',
    farmName: 'Artisan Dairy & Honey Farm',
    location: 'Kathore Rural Market',
    stall: 'Stall #C-08',
    marketName: 'Liberty Market Bazaar',
    marketDays: 'Wednesday & Sunday â€¢ 8:00 AM â€“ 3:00 PM',
    specialty: 'Pure Wildflower Honey, Fresh Butter & Cheeses',
    rating: '4.8',
    reviewsCount: 86,
    imageUrl: 'https://i.pinimg.com/736x/a2/c7/7c/a2c77c05492aa6037bcf76482cf5d1ed.jpg',
    badge: 'Master Producer',
    experienceYears: 22,
    crops: ['Wildflower Raw Honey', 'Pasture Butter', 'Organic Milk', 'Free-Range Eggs'],
    bio: 'Sustainable apiary and pasture grazing farm producing raw unfiltered wildflower honey and artisanal farm dairy.',
  },
  {
    id: 'farmer-4',
    name: 'Marcus Vance',
    farmName: 'Oakland Heritage Produce',
    location: 'Oakland Valley Block 4B',
    stall: 'Stall #A-12',
    marketName: 'Downtown Farmers Market',
    marketDays: 'Saturday & Sunday â€¢ 8:00 AM â€“ 2:00 PM',
    specialty: 'Crisp Apples, Stone Fruit & Cold-Pressed Cider',
    rating: '4.9',
    reviewsCount: 110,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    badge: 'Certified Organic',
    experienceYears: 18,
    crops: ['Honeycrisp Apples', 'Organic Peaches', 'Plums', 'Fresh Cider'],
    bio: 'Heritage fruit orchard utilizing integrated biological pest controls and regenerative bio-diverse cover cropping.',
  },
  {
    id: 'farmer-5',
    name: 'Elena Rostova',
    farmName: 'Valley Microgreens & Herbs',
    location: 'Sunnyside Rural Zone',
    stall: 'Stall #D-03',
    marketName: 'Sunnyside Community Market',
    marketDays: 'Sunday â€¢ 9:00 AM â€“ 3:00 PM',
    specialty: 'Nutrient-Dense Microgreens & Culinary Herbs',
    rating: '5.0',
    reviewsCount: 72,
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    badge: 'Hydroponic Master',
    experienceYears: 9,
    crops: ['Pea Shoots', 'Radish Microgreens', 'Genovese Basil', 'Mint Leaves'],
    bio: 'Specialized in year-round controlled environment microgreens packed with vital nutrients for top regional chefs.',
  },
  {
    id: 'farmer-6',
    name: 'Tariq Mansoor',
    farmName: 'Indus Valley Olive & Grains',
    location: 'Indus Valley Plains',
    stall: 'Stall #E-01',
    marketName: 'Liberty Market Bazaar',
    marketDays: 'Wednesday & Saturday â€¢ 7:00 AM â€“ 2:00 PM',
    specialty: 'Cold-Pressed Extra Virgin Olive Oil & Ancient Grains',
    rating: '4.8',
    reviewsCount: 65,
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    badge: 'Ancient Grains Lead',
    experienceYears: 25,
    crops: ['Extra Virgin Olive Oil', 'Heirloom Wheat', 'Whole Grain Flour', 'Organic Olives'],
    bio: 'Preserving heirloom grains and cold-pressing small batch single-estate olive oil using traditional stone mill techniques.',
  },
];

export default function FarmersPage() {
  const [search, setSearch] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('ALL');

  const filteredFarmers = FARMERS_DATA.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.farmName.toLowerCase().includes(search.toLowerCase()) ||
      f.location.toLowerCase().includes(search.toLowerCase()) ||
      f.specialty.toLowerCase().includes(search.toLowerCase());

    const matchesBadge = selectedBadge === 'ALL' || f.badge === selectedBadge;

    return matchesSearch && matchesBadge;
  });

  return (
    <div className="min-h-screen bg-[#F5F0E6] text-[#10251D] flex flex-col gap-12 pb-20">
      
      {/* â”€â”€ Page Header: AgriFlow Deep Forest Green â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="relative bg-[#10251D] text-[#F5F0E6] py-20 px-6 text-center overflow-hidden border-b border-[#C9A45C]/20">
        <div 
          className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url('/images/hero.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10251D] via-[#10251D]/80 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-4">
          <span className="inline-flex items-center gap-2 bg-[#C9A45C]/20 text-[#C9A45C] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider border border-[#C9A45C]/40 shadow-sm">
            <Users className="w-3.5 h-3.5" />
            Verified Regional Producers
          </span>
          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-[#F5F0E6] drop-shadow-md">
            Farmers &amp; Market Stalls
          </h1>
          <p className="text-[#F5F0E6]/85 text-base md:text-lg max-w-2xl leading-relaxed font-normal">
            Meet the certified organic growers behind your harvests. View weekly market stand schedules, explore specialties, and reserve direct from the soil.
          </p>
          <div className="flex items-center gap-2 text-sm text-[#F5F0E6]/70 mt-2 font-medium">
            <Link href="/" className="hover:underline hover:text-[#F5F0E6] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#C9A45C] font-black">Farmers &amp; Stalls</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-10">
        
        {/* â”€â”€ Search & Filter Controls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="bg-[#F5F0E6] p-4 sm:p-6 rounded-lg border border-[#C9A45C]/25 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#A9874B] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by farmer, farm name, or produce..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-md border border-[#C9A45C]/20 text-xs sm:text-sm text-[#10251D] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C9A45C]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {['ALL', 'Core Specialist', 'Verified Expert', 'Master Producer', 'Certified Organic'].map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBadge(b)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all ${
                  selectedBadge === b
                    ? 'bg-[#10251D] text-[#C9A45C] shadow-sm'
                    : 'bg-[#E9DFC9] text-stone-600 hover:bg-stone-200'
                }`}
              >
                {b === 'ALL' ? 'All Farmers' : b}
              </button>
            ))}
          </div>
        </div>

        {/* â”€â”€ Farmers Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFarmers.map((f) => (
            <AgriCard
              key={f.id}
              className="p-6 sm:p-7 flex flex-col justify-between group relative"
            >
              <div>
                {/* Header Badge & Rating */}
                <div className="flex items-center justify-between gap-2 mb-5">
                  <span className="bg-[#263A2E]/10 text-[#263A2E] text-[11px] font-black px-3 py-1 rounded-full border border-emerald-200">
                    {f.badge}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#10251D] bg-[#C9A45C]/20 px-2.5 py-1 rounded-full border border-[#C9A45C]/40">
                    <Star className="w-3.5 h-3.5 fill-[#C9A45C] text-[#C9A45C]" />
                    <span>{f.rating}</span>
                    <span className="text-[10px] text-[#263A2E] font-semibold">({f.reviewsCount})</span>
                  </div>
                </div>

                {/* Farmer Image & Title */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 border-[#C9A45C]/50 shadow-md">
                    <img
                      src={f.imageUrl}
                      alt={f.name}
                      className="w-full h-full object-cover agriflow-img-zoom"
                    />
                    <span className="absolute bottom-0 right-0 bg-[#10251D] text-[#C9A45C] w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center border border-white">
                      âœ“
                    </span>
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-[#10251D] font-display leading-tight group-hover:text-[#A9874B] transition-colors">
                      {f.name}
                    </h3>
                    <p className="text-xs font-bold text-[#A9874B] mt-0.5">
                      {f.farmName}
                    </p>
                    <p className="text-[11px] text-[#263A2E] font-semibold flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#C9A45C]" />
                      {f.location}
                    </p>
                  </div>
                </div>

                {/* Stall & Market Schedule Box */}
                <div className="p-3.5 rounded-md bg-[#E9DFC9] border border-[#C9A45C]/25 mb-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-[#10251D] flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-[#C9A45C]" />
                      {f.stall}
                    </span>
                    <span className="text-[11px] text-[#263A2E] font-bold">{f.marketName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-600 font-medium">
                    <Calendar className="w-3 h-3 text-[#A9874B]" />
                    <span>{f.marketDays}</span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-stone-600 leading-relaxed mb-4 line-clamp-2">
                  {f.bio}
                </p>

                {/* Crop Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {f.crops.map((c) => (
                    <span
                      key={c}
                      className="bg-[#F5F0E6] border border-[#C9A45C]/20 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-md"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-[#C9A45C]/25">
                <Link
                  href="/products"
                  className="flex-1 py-2.5 rounded-md bg-[#10251D] hover:bg-[#263A2E] text-[#F5F0E6] text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Sprout className="w-3.5 h-3.5 text-[#C9A45C]" />
                  <span>Reserve Stall Produce</span>
                </Link>
                <Link
                  href="/markets"
                  className="p-2.5 rounded-md border border-[#C9A45C]/20 hover:border-[#C9A45C] text-[#10251D] hover:bg-[#C9A45C]/10 transition-all"
                  title="View on Map"
                >
                  <MapPin className="w-4 h-4 text-[#10251D]" />
                </Link>
              </div>
            </AgriCard>
          ))}
        </div>

        {/* â”€â”€ Become a Farmer CTA Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="bg-[#10251D] rounded-md p-8 sm:p-12 text-[#F5F0E6] border border-[#C9A45C]/30 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 mt-6">
          <div className="max-w-2xl text-center md:text-left">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A45C]/20 border border-[#C9A45C]/30 text-[#C9A45C] text-xs font-black uppercase tracking-wider mb-3">
              <Award className="w-3.5 h-3.5" />
              Grower Partnership Program
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-display text-[#F5F0E6] mb-2 leading-tight">
              Are You a Certified Local Grower?
            </h2>
            <p className="text-[#E9DFC9] text-xs sm:text-sm leading-relaxed">
              Join 100+ local producers selling direct-from-soil harvest pre-orders, managing weekly market stalls, and utilizing smart AI yield forecasting.
            </p>
          </div>

          <Link
            href="/register?role=FARMER"
            className="btn-harvest shrink-0"
          >
            <span>Register as Farmer Producer</span>
            <ArrowRight className="w-4 h-4 text-[#10251D]" />
          </Link>
        </div>

      </div>
    </div>
  );
}
