'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { marketsApi } from '../../lib/marketplaceApi';
import { Reveal } from '../../components/motion';
import { MarketMap } from '../../components/shared/MarketMap';
import {
  MapPin, Search, Store, Calendar, Clock, X,
  Users, Map as MapIcon, ChevronRight, Leaf, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const CITY_FILTERS = [
  { value: 'ALL', label: 'All Cities', emoji: 'ðŸŒ' },
  { value: 'Oakland', label: 'Oakland, CA', emoji: 'ðŸŒ‰' },
  { value: 'Seattle', label: 'Seattle, WA', emoji: 'ðŸŒ§ï¸' },
  { value: 'San Jose', label: 'San Jose, CA', emoji: 'â˜€ï¸' },
  { value: 'Karachi', label: 'Karachi, PK', emoji: 'ðŸ™ï¸' },
  { value: 'Lahore', label: 'Lahore, PK', emoji: 'ðŸŒº' },
];

const DEFAULT_MARKETS = [
  {
    _id: 'm1', name: 'Downtown Farmers Market', address: '1200 SW Park Ave',
    city: 'Oakland', state: 'CA', latitude: 37.8044, longitude: -122.2712,
    operatingDays: ['Saturday', 'Sunday'], operatingHours: '8:00 AM - 2:00 PM',
    description: 'Premier regional farmers market with 32+ fresh organic produce and artisanal goods vendors.',
    vendorsCount: 32,
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80',
    featured: true,
  },
  {
    _id: 'm2', name: 'Sunnyside Community Market', address: '4500 California Ave SW',
    city: 'Seattle', state: 'WA', latitude: 47.6062, longitude: -122.3321,
    operatingDays: ['Sunday'], operatingHours: '9:00 AM - 3:00 PM',
    description: 'Community gathering spot featuring local farm stalls and seasonal berries from Pacific Northwest.',
    vendorsCount: 24,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    featured: false,
  },
  {
    _id: 'm3', name: 'Oakridge Organic Exchange', address: '925 Blossom Hill Rd',
    city: 'San Jose', state: 'CA', latitude: 37.3382, longitude: -121.8863,
    operatingDays: ['Saturday'], operatingHours: '7:30 AM - 1:00 PM',
    description: 'Certified organic produce exchange with 40+ regional farmers. Specialty heirloom varieties.',
    vendorsCount: 40,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    featured: true,
  },
  {
    _id: 'm4', name: 'Empress Market', address: 'M.A. Jinnah Rd',
    city: 'Karachi', state: 'PK', latitude: 24.8607, longitude: 67.0011,
    operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    operatingHours: '7:00 AM - 10:00 PM',
    description: 'Historic farmers market in Karachi with fresh seasonal produce, spices, and local dairy.',
    vendorsCount: 85,
    image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=80',
    featured: true,
  },
  {
    _id: 'm5', name: 'Liberty Market Bazaar', address: 'Liberty Roundabout',
    city: 'Lahore', state: 'PK', latitude: 31.5204, longitude: 74.3587,
    operatingDays: ['Wednesday', 'Saturday', 'Sunday'], operatingHours: '6:00 AM - 9:00 PM',
    description: 'Vibrant weekly bazaar with fresh vegetables, fruits, and dairy from Punjab farms.',
    vendorsCount: 60,
    image: 'https://images.unsplash.com/photo-1519996409144-56c88c6a9ef0?auto=format&fit=crop&w=800&q=80',
    featured: false,
  },
  {
    _id: 'm6', name: 'Berkeley Bowl Market', address: '920 Heinz Ave',
    city: 'Oakland', state: 'CA', latitude: 37.8566, longitude: -122.2756,
    operatingDays: ['Saturday', 'Sunday'], operatingHours: '9:00 AM - 1:00 PM',
    description: 'Renowned for exotic and heirloom varieties. Over 200 types of fresh produce weekly.',
    vendorsCount: 18,
    image: 'https://images.unsplash.com/photo-1573246123961-7ac7ef78a823?auto=format&fit=crop&w=800&q=80',
    featured: false,
  },
];

const FALLBACK_STALLS = [
  { _id:'s1', stallNumber:'A-01', dayOfWeek:'Saturday', farmerProfile:{ farmName:'Heritage Farm', bio:'Organic veggies & heirloom berries' } },
  { _id:'s2', stallNumber:'A-02', dayOfWeek:'Saturday', farmerProfile:{ farmName:'Sunnyside Orchards', bio:'Fresh apples, peaches & stone fruits' } },
  { _id:'s3', stallNumber:'B-05', dayOfWeek:'Sunday', farmerProfile:{ farmName:'Cascade Apiaries', bio:'Raw artisan wildflower honey' } },
  { _id:'s4', stallNumber:'C-12', dayOfWeek:'Sunday', farmerProfile:{ farmName:'Valley Ridge Microgreens', bio:'Hydroponic greens & herbs' } },
];

export default function MarketsPage() {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState<any|null>(null);
  const [stalls, setStalls] = useState<any[]>([]);
  const [stallsLoading, setStallsLoading] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);

  useEffect(() => { setTimeout(() => setFilterVisible(true), 100); }, []);

  const fetchMarkets = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (cityFilter !== 'ALL') params.city = cityFilter;
      if (search) params.search = search;
      const res = await marketsApi.list(params);
      if (Array.isArray(res.data) && res.data.length > 0) setMarkets(res.data);
      else setMarkets(DEFAULT_MARKETS);
    } catch {
      setMarkets(DEFAULT_MARKETS);
    } finally {
      setLoading(false);
    }
  }, [cityFilter]);

  useEffect(() => { fetchMarkets(); }, [fetchMarkets]);

  const handleOpenStalls = async (market: any) => {
    setSelectedMarket(market);
    setStallsLoading(true);
    try {
      const res = await marketsApi.getStalls(market._id);
      if (Array.isArray(res.data) && res.data.length > 0) setStalls(res.data);
      else setStalls(FALLBACK_STALLS);
    } catch {
      setStalls(FALLBACK_STALLS);
    } finally {
      setStallsLoading(false);
    }
  };

  const filteredMarkets = markets.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = m.name.toLowerCase().includes(q) || (m.address||'').toLowerCase().includes(q) || (m.city||'').toLowerCase().includes(q);
    const matchCity = cityFilter === 'ALL' || m.city === cityFilter;
    return matchSearch && matchCity;
  });

  return (
    <div className="min-h-screen bg-[#F5F0E6] text-[#10251D] flex flex-col gap-0 pb-20">

      {/* â”€â”€ Page Header: AgriFlow Deep Forest Green â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="relative bg-[#10251D] text-[#F5F0E6] py-20 px-6 text-center overflow-hidden border-b border-[#C9A45C]/20">
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1600&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10251D] via-[#10251D]/80 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#10251D]/60 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-4">
          <span className="inline-flex items-center gap-2 bg-[#C9A45C]/20 text-[#C9A45C] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider border border-[#C9A45C]/40 shadow-sm">
            <MapPin className="w-3.5 h-3.5" />
            Regional Directory
          </span>
          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-[#F5F0E6] drop-shadow-md">
            Browse Local Farmers Markets
          </h1>
          <p className="text-[#F5F0E6]/85 text-base md:text-lg max-w-2xl leading-relaxed font-normal">
            Discover verified weekend pickup locations, view live interactive maps, and connect with registered organic vendors near you.
          </p>
          <div className="flex items-center gap-2 text-sm text-[#F5F0E6]/70 mt-2 font-medium">
            <Link href="/" className="hover:underline hover:text-[#F5F0E6] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#C9A45C] font-black">Explore Markets</span>
          </div>
        </div>
      </div>

      {/* â”€â”€ Page Body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-8 pt-10">

        {/* â”€â”€ Search + Map Toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Reveal animation="fade-up" delay={80}>
          <div className="bg-[#F5F0E6] p-4 rounded-lg border border-[#C9A45C]/25 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9874B] pointer-events-none" />
              <input
                type="text"
                placeholder="Search by market name, address or city..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#C9A45C]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C9A45C] font-medium text-[#10251D] placeholder-stone-400"
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A9874B] hover:text-[#10251D]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-bold text-sm shrink-0 whitespace-nowrap transition-all ${
                showMap
                  ? 'bg-[#10251D] text-[#F5F0E6] shadow-sm'
                  : 'bg-[#F5F0E6] text-[#10251D] border border-[#C9A45C]/20 hover:border-[#10251D]'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              {showMap ? 'Hide Live Map' : 'Show Live Map'}
            </button>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 bg-[#C9A45C]/15 text-[#10251D] text-xs font-black px-3 py-2 rounded-md border border-[#C9A45C]/30">
                <Store className="w-3.5 h-3.5 text-[#A9874B]" />
                {filteredMarkets.length} Markets
              </span>
            </div>
          </div>
        </Reveal>

        {/* â”€â”€ City Filter Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className={`flex flex-wrap gap-2 transition-all duration-500 ${filterVisible ? 'opacity-100' : 'opacity-0 -translate-y-2'}`}>
          {CITY_FILTERS.map((f, i) => (
            <button
              key={f.value}
              onClick={() => setCityFilter(f.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 ${
                cityFilter === f.value
                  ? 'bg-[#10251D] text-[#F5F0E6] border-[#10251D] shadow-sm'
                  : 'bg-[#F5F0E6] text-stone-600 border-[#C9A45C]/20 hover:border-[#10251D] hover:text-[#10251D]'
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span>{f.emoji}</span>
              {f.label}
              {cityFilter === f.value && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A45C] ml-0.5" />}
            </button>
          ))}
        </div>

        {/* â”€â”€ Interactive Leaflet Map â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {showMap && (
          <Reveal animation="fade-up" delay={100}>
            <MarketMap
              markets={filteredMarkets.map(m => ({
                id: m._id,
                name: m.name,
                address: m.address,
                city: m.city,
                latitude: m.latitude || DEFAULT_MARKETS[0].latitude,
                longitude: m.longitude || DEFAULT_MARKETS[0].longitude,
                operatingDays: m.operatingDays,
                operatingHours: m.operatingHours,
                vendorsCount: m.vendorsCount || 25,
              }))}
              onSelectMarket={m => {
                const fullM = markets.find(mk => mk._id === m.id);
                if (fullM) handleOpenStalls(fullM);
              }}
            />
          </Reveal>
        )}

        {/* â”€â”€ Markets Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-[#F5F0E6] rounded-lg border border-[#C9A45C]/25 overflow-hidden animate-pulse">
                <div className="h-44 bg-[#E9DFC9]" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-[#E9DFC9] rounded-lg w-3/4" />
                  <div className="h-3 bg-[#E9DFC9] rounded-lg w-1/2" />
                  <div className="h-8 bg-[#E9DFC9] rounded-md mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-[#E9DFC9] flex items-center justify-center">
              <Store className="w-8 h-8 text-[#A9874B]" />
            </div>
            <h3 className="text-lg font-black text-[#10251D]">No Markets Found</h3>
            <p className="text-sm text-[#263A2E]">No local farmers markets match your search. Try adjusting the city filter.</p>
            <button
              onClick={() => { setSearch(''); setCityFilter('ALL'); }}
              className="btn-harvest mt-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMarkets.map((market, i) => (
              <div
                key={market._id}
                className="group bg-[#F5F0E6] rounded-lg border border-[#C9A45C]/25 overflow-hidden agriflow-card flex flex-col"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* â”€â”€ Card Image â”€â”€ */}
                <div className="relative h-44 bg-[#E9DFC9] overflow-hidden">
                  <img
                    src={market.image || 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80'}
                    alt={market.name}
                    className="w-full h-full object-cover agriflow-img-zoom"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10251D]/85 via-[#10251D]/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {market.featured && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C9A45C] text-[#10251D] shadow-sm">
                        â­ Featured
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#F5F0E6]/95 text-[#263A2E] backdrop-blur-sm shadow-sm">
                      <Users className="w-2.5 h-2.5" />
                      {market.vendorsCount || 25}+
                    </span>
                  </div>

                  {/* Market name overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-base font-extrabold text-[#F5F0E6] line-clamp-1 font-display group-hover:text-[#C9A45C] transition-colors">
                      {market.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#F5F0E6]/80 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#C9A45C] shrink-0" />
                      <span className="truncate">{market.address}, {market.city}</span>
                    </div>
                  </div>
                </div>

                {/* â”€â”€ Card Body â”€â”€ */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <p className="text-[11.5px] text-[#263A2E] leading-relaxed line-clamp-2">{market.description}</p>

                  {/* Quick meta row */}
                  <div className="flex items-center gap-3 text-[11px] text-[#10251D] border-t border-[#C9A45C]/25 pt-3">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar className="w-3 h-3 text-[#263A2E]" />
                      {Array.isArray(market.operatingDays)
                        ? market.operatingDays.length > 2
                          ? `${market.operatingDays.slice(0,2).join(', ')}...`
                          : market.operatingDays.join(', ')
                        : 'Weekends'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-stone-300 shrink-0" />
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3 text-[#263A2E]" />
                      {market.operatingHours || '8am â€“ 2pm'}
                    </span>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleOpenStalls(market)}
                    className="mt-auto w-full flex items-center justify-between px-4 py-2.5 rounded-md bg-[#10251D] text-[#F5F0E6] text-xs font-bold hover:bg-[#263A2E] transition-all group/btn"
                  >
                    <span className="flex items-center gap-2">
                      <Store className="w-3.5 h-3.5" />
                      View Farmer Stalls
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* â”€â”€ Join as Farmer CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="bg-[#10251D] rounded-md p-8 sm:p-12 text-[#F5F0E6] border border-[#C9A45C]/30 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 mt-2">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(234,179,8,0.08),_transparent_65%)]" />
          <div className="max-w-2xl text-center md:text-left relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A45C]/20 border border-[#C9A45C]/30 text-[#C9A45C] text-xs font-black uppercase tracking-wider mb-3">
              <Store className="w-3.5 h-3.5" />
              Become a Vendor
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-display text-[#F5F0E6] mb-2 leading-tight">
              Register Your Farm Stall on MarketLink
            </h2>
            <p className="text-[#E9DFC9] text-xs sm:text-sm leading-relaxed">
              List your farmer stall location, set your weekly operating schedule, and let customers pre-order your fresh harvest directly.
            </p>
          </div>
          <Link href="/register?role=FARMER" className="btn-harvest shrink-0 relative z-10">
            <span>Register as Farmer</span>
            <ArrowRight className="w-4 h-4 text-[#10251D]" />
          </Link>
        </div>

      </div>

      {/* â”€â”€ Stalls Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {selectedMarket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F5F0E6] rounded-md max-w-2xl w-full shadow-lg border border-[#C9A45C]/25 relative max-h-[88vh] overflow-y-auto animate-zoom-in">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#F5F0E6] px-6 pt-6 pb-4 border-b border-[#C9A45C]/25 z-10 rounded-t-3xl">
              <button
                onClick={() => setSelectedMarket(null)}
                className="absolute top-4 right-4 p-2 text-[#A9874B] hover:text-[#10251D] rounded-full hover:bg-[#E9DFC9] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="inline-flex items-center gap-1.5 bg-[#263A2E]/10 text-[#263A2E] text-[11px] font-black px-3 py-1 rounded-full border border-emerald-300 mb-2">
                <Store className="w-3 h-3" /> Stall Directory
              </span>
              <h3 className="text-xl font-extrabold text-[#10251D] font-display">{selectedMarket.name}</h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-[#263A2E]">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{selectedMarket.address}, {selectedMarket.city}</span>
                {selectedMarket.operatingHours && <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{selectedMarket.operatingHours}</span>}
              </div>
            </div>

            <div className="p-6">
              {stallsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1,2,3,4].map(i=>(
                    <div key={i} className="p-4 rounded-lg border border-[#C9A45C]/25 animate-pulse">
                      <div className="h-3 bg-[#E9DFC9] rounded w-1/3 mb-2"/><div className="h-4 bg-[#E9DFC9] rounded w-2/3"/><div className="h-3 bg-[#E9DFC9] rounded w-full mt-2"/>
                    </div>
                  ))}
                </div>
              ) : stalls.length === 0 ? (
                <p className="text-center text-[#A9874B] text-xs py-8">No vendor stalls currently registered.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stalls.map((stall, i) => (
                    <div key={stall._id}
                      className="p-4 rounded-lg border border-[#C9A45C]/25 bg-[#E9DFC9]/50 agriflow-card"
                      style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black bg-[#10251D] text-[#F5F0E6] px-2.5 py-0.5 rounded-md">
                          Stall #{stall.stallNumber}
                        </span>
                        <span className="text-[11px] font-bold text-[#263A2E] bg-[#263A2E]/10 px-2 py-0.5 rounded-full">
                          {stall.dayOfWeek || 'Weekend'}
                        </span>
                      </div>
                      <h4 className="font-bold text-[#10251D] text-sm">{stall.farmerProfile?.farmName || 'Independent Farm'}</h4>
                      <p className="text-xs text-[#263A2E] mt-1 leading-snug flex items-start gap-1">
                        <Leaf className="w-3 h-3 text-[#263A2E] shrink-0 mt-0.5" />
                        {stall.farmerProfile?.bio || 'Organic seasonal producer'}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Get Directions link */}
              {selectedMarket.latitude && (
                <div className="mt-4 pt-4 border-t border-[#C9A45C]/25 flex justify-end">
                  <a
                    href={`https://www.openstreetmap.org/directions?to=${selectedMarket.latitude},${selectedMarket.longitude}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#263A2E] bg-[#263A2E]/10 hover:bg-[#263A2E]/10 border border-emerald-200 px-4 py-2.5 rounded-md transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Get Directions to {selectedMarket.name}
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
