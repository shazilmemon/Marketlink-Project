'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AgriCard, AgriMotion } from '../../components/motion/AgriMotion';
import {
  Sparkles, TrendingDown, Clock, ShieldCheck, ArrowRight,
  ShoppingBag, CheckCircle2, AlertCircle, Sprout, HeartHandshake,
  Tag, MapPin, Store
} from 'lucide-react';

interface SurplusItem {
  id: string;
  name: string;
  farm: string;
  location: string;
  marketStall: string;
  image: string;
  originalPrice: number;
  surplusPrice: number;
  discountPct: number;
  unit: string;
  lbsAvailable: number;
  harvestHoursAgo: number;
  hoursLeft: number;
  reason: string;
  category: string;
}

const SURPLUS_ITEMS: SurplusItem[] = [
  {
    id: 's-1',
    name: 'Ripe Heirloom Beefsteak Tomatoes',
    farm: 'Green Valley Organic Farm',
    location: 'Malir Farms, Karachi',
    marketStall: 'Empress Market â€¢ Stall #A-04',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    originalPrice: 4.5,
    surplusPrice: 2.7,
    discountPct: 40,
    unit: 'lb',
    lbsAvailable: 45,
    harvestHoursAgo: 14,
    hoursLeft: 18,
    reason: 'Bountiful weekend greenhouse harvest',
    category: 'Vegetables',
  },
  {
    id: 's-2',
    name: 'Sweet Seasonal Strawberries (Pulp Grade A)',
    farm: 'Siddiqui Citrus & Berries',
    location: 'Gadap Agriculture Zone',
    marketStall: 'Downtown Farmers Market â€¢ Stall #B-12',
    image: 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?auto=format&fit=crop&w=600&q=80',
    originalPrice: 7.0,
    surplusPrice: 4.5,
    discountPct: 35,
    unit: 'box (2 lbs)',
    lbsAvailable: 60,
    harvestHoursAgo: 8,
    hoursLeft: 22,
    reason: 'Peak berry ripening surge',
    category: 'Fruits',
  },
  {
    id: 's-3',
    name: 'Farm Fresh Pasture Eggs (Extra Large)',
    farm: 'Valley Crest Poultry & Dairy',
    location: 'Oakland Valley',
    marketStall: 'Downtown Market â€¢ Stall #C-02',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80',
    originalPrice: 7.5,
    surplusPrice: 5.25,
    discountPct: 30,
    unit: 'dozen',
    lbsAvailable: 35,
    harvestHoursAgo: 20,
    hoursLeft: 30,
    reason: 'Weekly flock surplus yield',
    category: 'Dairy',
  },
  {
    id: 's-4',
    name: 'Artisan Wildflower Summer Honey',
    farm: 'Kathore Artisan Apiary',
    location: 'Kathore Rural Market',
    marketStall: 'Liberty Market Bazaar â€¢ Stall #C-08',
    image: 'https://i.pinimg.com/736x/c8/52/d0/c852d0629bebd3feed5d77c2baf93298.jpg',
    originalPrice: 15.0,
    surplusPrice: 10.5,
    discountPct: 30,
    unit: 'jar (16 oz)',
    lbsAvailable: 28,
    harvestHoursAgo: 36,
    hoursLeft: 48,
    reason: 'End-of-season apiary decanting',
    category: 'Honey',
  },
  {
    id: 's-5',
    name: 'Crisp Honeycrisp Apples',
    farm: 'Sunnyside Orchards',
    location: 'Seattle Rural Hub',
    marketStall: 'Sunnyside Market â€¢ Stall #A-12',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
    originalPrice: 3.8,
    surplusPrice: 2.5,
    discountPct: 34,
    unit: 'lb',
    lbsAvailable: 80,
    harvestHoursAgo: 16,
    hoursLeft: 26,
    reason: 'Bumper tree crop after warm spell',
    category: 'Fruits',
  },
  {
    id: 's-6',
    name: 'Hydroponic Genovese Basil & Mint',
    farm: 'Valley Microgreens',
    location: 'Sunnyside Rural Zone',
    marketStall: 'Sunnyside Market â€¢ Stall #D-03',
    image: 'https://images.unsplash.com/photo-1618375531912-867984bdfd87?auto=format&fit=crop&w=600&q=80',
    originalPrice: 4.0,
    surplusPrice: 2.8,
    discountPct: 30,
    unit: 'bundle',
    lbsAvailable: 40,
    harvestHoursAgo: 6,
    hoursLeft: 14,
    reason: 'Hydroponic rotation cycle harvest',
    category: 'Herbs',
  },
];

export default function SurplusPage() {
  const [reservedItems, setReservedItems] = useState<Record<string, boolean>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleReserve = (id: string, name: string) => {
    setReservedItems((prev) => ({ ...prev, [id]: true }));
    setSuccessMsg(`Reserved 1 unit of ${name} at surplus rate! Pick up at market stall.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

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
            <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
            Zero Food Waste Initiative
          </span>
          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-[#F5F0E6] drop-shadow-md">
            Surplus Produce Matching
          </h1>
          <p className="text-[#F5F0E6]/85 text-base md:text-lg max-w-2xl leading-relaxed font-normal">
            AI-powered surplus matching connects regional farmers' excess seasonal harvests directly with conscious households at 20-40% savings. Zero food waste, 100% fair farmer valuation.
          </p>
          <div className="flex items-center gap-2 text-sm text-[#F5F0E6]/70 mt-2 font-medium">
            <Link href="/" className="hover:underline hover:text-[#F5F0E6] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#C9A45C] font-black">Surplus Matching</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-12">

        {/* Success Alert Notification */}
        {successMsg && (
          <div className="bg-[#263A2E]/10 border-2 border-emerald-500 text-[#263A2E] px-6 py-4 rounded-lg flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#263A2E] shrink-0" />
              <span className="text-xs sm:text-sm font-black">{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-[#263A2E] font-black text-sm hover:text-[#263A2E]"
            >
              âœ•
            </button>
          </div>
        )}

        {/* â”€â”€ Impact KPI Stat Cards 4-Col Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Harvest Food Saved', val: '2,500+ lbs', sub: 'Prevented from landfill waste', icon: Sprout },
            { label: 'Average Consumer Savings', val: '35% OFF', sub: 'Direct from soil discount', icon: TrendingDown },
            { label: 'Farm Value Returned', val: '92%', sub: 'Kept directly by growers', icon: HeartHandshake },
            { label: 'Freshness Guarantee', val: '< 24 Hours', sub: 'From vine/field to stall', icon: ShieldCheck },
          ].map((kpi, idx) => (
            <AgriCard key={idx} className="p-6 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-md bg-[#C9A45C]/20 flex items-center justify-center text-[#10251D] font-black mb-3">
                <kpi.icon className="w-5 h-5 text-[#10251D]" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-display text-[#10251D] mb-1">
                {kpi.val}
              </h3>
              <p className="text-xs font-black text-[#A9874B] uppercase tracking-wider mb-1">
                {kpi.label}
              </p>
              <span className="text-[11px] text-[#263A2E] font-semibold">{kpi.sub}</span>
            </AgriCard>
          ))}
        </div>

        {/* â”€â”€ Active Surplus Harvest Items Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-black text-[#10251D] uppercase tracking-wider bg-[#C9A45C]/20 px-3.5 py-1.5 rounded-full border border-[#C9A45C]/40 mb-2">
                <Clock className="w-3.5 h-3.5 text-[#A9874B]" />
                <span>Live Surplus Batches</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#10251D] font-display">
                Current Excess Harvests Ready For Pickup
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#263A2E] max-w-md">
              These verified organic items are discounted because local farms yielded surplus batches this week. Pre-order now to secure stall pickup.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {SURPLUS_ITEMS.map((item) => {
              const isReserved = reservedItems[item.id];

              return (
                <AgriCard
                  key={item.id}
                  className="p-0 flex flex-col justify-between group overflow-hidden"
                >
                  <div>
                    {/* Image with discount sticker and countdown */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E9DFC9]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover agriflow-img-zoom"
                      />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                        <span className="bg-[#C9A45C] text-[#10251D] text-xs font-black px-3 py-1 rounded-full shadow-md">
                          -{item.discountPct}% SURPLUS MATCH
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 bg-[#10251D]/80 backdrop-blur-md text-[#F5F0E6] text-[11px] font-black px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#C9A45C]" />
                        <span>{item.hoursLeft}h left</span>
                      </div>

                      <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/60 backdrop-blur-md rounded-md p-2 text-[#F5F0E6] text-[11px] flex items-center justify-between">
                        <span className="font-semibold text-stone-200">Harvested {item.harvestHoursAgo}h ago</span>
                        <span className="text-[#C9A45C] font-bold">{item.lbsAvailable} {item.unit} available</span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 sm:p-6 space-y-3">
                      <div>
                        <span className="text-[11px] font-black uppercase text-[#A9874B] tracking-wider block">
                          {item.farm}
                        </span>
                        <h3 className="font-black text-lg text-[#10251D] font-display group-hover:text-[#A9874B] transition-colors leading-snug mt-0.5">
                          {item.name}
                        </h3>
                      </div>

                      <p className="text-xs text-[#263A2E] italic">
                        Reason: {item.reason}
                      </p>

                      <div className="p-3 rounded-md bg-[#E9DFC9] border border-[#C9A45C]/25 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-[#10251D]">
                          <Store className="w-3.5 h-3.5 text-[#C9A45C]" />
                          <span>{item.marketStall}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#263A2E]">
                          <MapPin className="w-3 h-3 text-[#A9874B]" />
                          <span>{item.location}</span>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between pt-2 border-t border-[#C9A45C]/25">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-[#10251D]">
                            ${item.surplusPrice.toFixed(2)}
                          </span>
                          <span className="text-xs text-[#A9874B] line-through font-bold">
                            ${item.originalPrice.toFixed(2)}
                          </span>
                          <span className="text-xs font-bold text-[#263A2E]">/ {item.unit}</span>
                        </div>
                        <span className="text-[11px] font-black text-[#263A2E] bg-[#263A2E]/10 px-2 py-0.5 rounded-full border border-emerald-200">
                          Verified Organic
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reserve Action Button */}
                  <div className="p-5 sm:p-6 pt-0">
                    <button
                      onClick={() => handleReserve(item.id, item.name)}
                      disabled={isReserved}
                      className={`w-full py-3 rounded-md text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all ${
                        isReserved
                          ? 'bg-[#263A2E]/10 text-[#F5F0E6] cursor-default'
                          : 'btn-harvest'
                      }`}
                    >
                      {isReserved ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Reserved for Weekend Pickup</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-[#10251D]" />
                          <span>Pre-Order at {item.discountPct}% Discount</span>
                        </>
                      )}
                    </button>
                  </div>
                </AgriCard>
              );
            })}
          </div>
        </div>

        {/* â”€â”€ How Surplus Produce Matching Works â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="bg-[#F5F0E6] p-8 sm:p-12 rounded-md border border-[#C9A45C]/25 shadow-md">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase text-[#A9874B] tracking-widest bg-[#C9A45C]/20 px-3.5 py-1 rounded-full border border-[#C9A45C]/40">
              System Architecture
            </span>
            <h2 className="text-3xl font-black text-[#10251D] font-display mt-2">
              How the AI Surplus Matching Engine Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-lg bg-[#10251D] text-[#C9A45C] flex items-center justify-center font-black text-xl mb-4 shadow-lg">
                1
              </div>
              <h4 className="font-black text-[#10251D] text-base mb-2">Grower Yield Logging</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                When warm weather accelerates crop ripening, farmers log excess bushels directly on their vendor portal.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-lg bg-[#C9A45C] text-[#10251D] flex items-center justify-center font-black text-xl mb-4 shadow-lg">
                2
              </div>
              <h4 className="font-black text-[#10251D] text-base mb-2">Automated Pricing Match</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Our algorithm tags crops at 20-40% below market value and notifies nearby customers before the crops degrade.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-lg bg-[#10251D] text-[#C9A45C] flex items-center justify-center font-black text-xl mb-4 shadow-lg">
                3
              </div>
              <h4 className="font-black text-[#10251D] text-base mb-2">Zero-Waste Stall Pickup</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Customers pre-order online and pick up at the farmer's stall on market day. Zero dump waste, maximum grower earnings.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
