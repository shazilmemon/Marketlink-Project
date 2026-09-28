'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { HeroVideoSection } from '../components/hero/HeroVideo';
import { AgriMotion, AgriCard } from '../components/motion/AgriMotion';
import { StaggerContainer, Reveal } from '../components/motion';
import {
  Sprout,
  ShieldCheck,
  TrendingUp,
  MapPin,
  ArrowRight,
  ShoppingBag,
  Star,
  CheckCircle2,
  Users,
  Award,
  Sparkles
} from 'lucide-react';

function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = Math.max(1, Math.floor(end / 60));
          const t = setInterval(() => {
            start += step;
            if (start >= end) {
              setCount(end);
              clearInterval(t);
            } else {
              setCount(start);
            }
          }, 20);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function AgriSectionTitle({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-10 text-left">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A45C]/15 border border-[#C9A45C]/40 text-[#10251D] text-xs font-black uppercase tracking-wider mb-3">
        <Sprout className="w-3.5 h-3.5 text-[#C9A45C]" />
        <span>{label}</span>
      </div>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#10251D] font-display leading-[1.15] tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-stone-600 text-base sm:text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

const products = [
  {
    img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    name: 'Heirloom Organic Tomatoes',
    farm: 'Green Valley Organic',
    price: '$4.50',
    old: '$6.00',
    unit: 'lb',
    tag: 'Fresh Harvest',
  },
  {
    img: 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?auto=format&fit=crop&w=600&q=80',
    name: 'Freshly Picked Strawberries',
    farm: 'Siddiqui Berry Farm',
    price: '$5.50',
    old: '$7.00',
    unit: 'box',
    tag: 'Sweet Seasonal',
  },
  {
    img: 'https://i.pinimg.com/736x/c8/52/d0/c852d0629bebd3feed5d77c2baf93298.jpg',
    name: 'Wildflower Raw Honey',
    farm: 'Kathore Artisan Apiary',
    price: '$12.00',
    old: '$15.00',
    unit: 'jar',
    tag: '100% Pure',
  },
  {
    img: 'https://i.pinimg.com/736x/31/6b/25/316b25abe6ad2cfcafe5fcc45529e55c.jpg',
    name: 'Artisan Cold-Pressed Olive Oil',
    farm: 'Valley Olive Groves',
    price: '$18.00',
    old: '$22.00',
    unit: 'bottle',
    tag: 'Cold Pressed',
  },
];

const EXACT_USER_FARMERS = [
  {
    id: 'farmer-1',
    name: 'Haris Ahmed',
    farmName: 'Green Valley Organic Farm',
    location: 'Malir Farms, Karachi',
    specialty: 'Lead Specialist & Organic Produce',
    rating: '5.0 â˜…',
    imageUrl: 'https://i.pinimg.com/736x/47/7b/a5/477ba5bdde12f5a29071a19f1d49e8e6.jpg',
    badge: 'Core Specialist',
  },
  {
    id: 'farmer-2',
    name: 'Aisha Siddiqui',
    farmName: 'Siddiqui Citrus & Berries',
    location: 'Gadap Agriculture Zone',
    specialty: 'Organic Citrus & Fresh Berries',
    rating: '4.9 â˜…',
    imageUrl: 'https://i.pinimg.com/736x/ec/39/12/ec3912a4707eeef95639ff588170a6a3.jpg',
    badge: 'Verified Expert',
  },
  {
    id: 'farmer-3',
    name: 'Rahim Khan',
    farmName: 'Artisan Dairy & Honey Farm',
    location: 'Kathore Rural Market',
    specialty: 'Pure Honey & Organic Crops',
    rating: '4.8 â˜…',
    imageUrl: 'https://i.pinimg.com/736x/a2/c7/7c/a2c77c05492aa6037bcf76482cf5d1ed.jpg',
    badge: 'Master Producer',
  },
];

const testimonials = [
  {
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    text: 'MarketLink made ordering fresh surplus produce directly from local farmers seamless and completely transparent! Our kitchen food costs dropped while produce quality skyrocketed.',
    name: 'Sarah Jenkins',
    role: 'Farm-to-Table Head Chef',
  },
  {
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    text: 'As an organic vegetable vendor, managing my weekly market stall pre-orders and inventory has never been this simple. Zero harvest waste each week.',
    name: 'Marcus Vance',
    role: 'Regional Farm Producer',
  },
  {
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    text: 'The QR batch verification feature gives our household complete peace of mind about farm-to-table traceability and harvest fresh dates.',
    name: 'Elena Rostova',
    role: 'Conscious Consumer',
  },
];

export default function HomePage() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((p) => (p + 1) % testimonials.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="overflow-hidden bg-[#F5F0E6] text-[#10251D]">
      {/* â”€â”€ 1. AgriFlow Hero Video Section With Auto-Playing Video â”€â”€ */}
      <HeroVideoSection />

      {/* â”€â”€ 2. About AgriFlow Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left: Image Grid with AgriFlow Zoom & Lift */}
          <div className="lg:col-span-6">
            <AgriMotion animation="zoomIn">
              <div className="grid grid-cols-2 gap-4">
                {/* 25+ Years Legacy Box */}
                <div className="bg-[#10251D] rounded-md flex flex-col items-center justify-center p-8 text-[#F5F0E6] min-h-[190px] shadow-xl border border-[#C9A45C]/30 agriflow-card">
                  <span className="text-5xl sm:text-6xl font-black font-display text-[#C9A45C] leading-none">
                    25+
                  </span>
                  <span className="text-sm font-black mt-2 text-center text-[#F5F0E6]">
                    Years Farming Legacy
                  </span>
                  <span className="text-[11px] text-[#C9A45C]/80 font-bold mt-1">
                    Organic Soil Stewardship
                  </span>
                </div>

                <div className="overflow-hidden rounded-md group shadow-md border border-[#C9A45C]/25 agriflow-card">
                  <img
                    src="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80"
                    alt="Farm Harvest"
                    className="w-full h-full object-cover aspect-square agriflow-img-zoom"
                  />
                </div>

                <div className="overflow-hidden rounded-md group shadow-md border border-[#C9A45C]/25 agriflow-card">
                  <img
                    src="https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80"
                    alt="Farmers Market Stall"
                    className="w-full h-full object-cover aspect-square agriflow-img-zoom"
                  />
                </div>

                <div className="overflow-hidden rounded-md group shadow-md border border-[#C9A45C]/25 agriflow-card">
                  <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"
                    alt="Fresh Produce Basket"
                    className="w-full h-full object-cover aspect-square agriflow-img-zoom"
                  />
                </div>
              </div>
            </AgriMotion>
          </div>

          {/* Right: Content Section */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <AgriSectionTitle
              label="About MarketLink"
              title="Direct-From-Farm Fresh Produce Network"
              subtitle="MarketLink connects certified organic growers, farm stalls, and conscious consumers through a transparent digital marketplace ecosystem."
            />

            <AgriMotion animation="fadeInUp" delay={150}>
              <p className="text-stone-600 leading-relaxed mb-8 text-base">
                We bridge regional farmland directly with neighborhood kitchens. Customers can reserve batch-harvested vegetables, fruits, honey, and dairy before market day, while farmers forecast seasonal demand without food waste.
              </p>
            </AgriMotion>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
              <AgriCard className="p-5">
                <div className="w-10 h-10 rounded-md bg-[#10251D]/10 text-[#10251D] flex items-center justify-center font-black mb-3">
                  <MapPin className="w-5 h-5 text-[#10251D]" />
                </div>
                <h4 className="font-black text-[#10251D] text-base mb-1">Direct Farmer Stalls</h4>
                <p className="text-xs text-[#263A2E] leading-relaxed">
                  Browse weekly vendor coordinates, open hours, and reserve produce right at the market stand.
                </p>
              </AgriCard>

              <AgriCard className="p-5">
                <div className="w-10 h-10 rounded-md bg-[#C9A45C]/20 text-[#10251D] flex items-center justify-center font-black mb-3">
                  <ShieldCheck className="w-5 h-5 text-[#A9874B]" />
                </div>
                <h4 className="font-black text-[#10251D] text-base mb-1">Verified Traceability</h4>
                <p className="text-xs text-[#263A2E] leading-relaxed">
                  Inspect harvest dates, pesticide-free verification, and organic certifications via batch QR codes.
                </p>
              </AgriCard>
            </div>

            <AgriMotion animation="fadeInUp" delay={250}>
              <Link
                href="/products"
                className="btn-harvest"
              >
                <span>Explore All Produce</span>
                <ArrowRight className="w-4 h-4 text-[#10251D]" />
              </Link>
            </AgriMotion>
          </div>

        </div>
      </section>

      {/* â”€â”€ 3. Why Choose Us & KPI Statistics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-6">
        <div className="bg-[#10251D] rounded-md p-8 sm:p-12 lg:p-16 text-[#F5F0E6] border border-[#C9A45C]/30 shadow-lg relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A45C]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A45C]/20 border border-[#C9A45C]/40 text-[#C9A45C] text-xs font-black uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
                <span>Why Choose MarketLink</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-[#F5F0E6] leading-tight mb-6">
                Empowering Local Growers, <br />
                <span className="text-[#C9A45C]">Rewarding Direct Buyers.</span>
              </h2>

              <p className="text-[#F5F0E6]/80 text-base leading-relaxed mb-8">
                By removing intermediaries, regional growers retain 92% of the shelf price while consumers enjoy crisp produce harvested within 24 hours.
              </p>

              <div className="space-y-3.5 mb-8">
                {[
                  'Fair living-wage valuation for small-scale regional farms',
                  'Predictive AI surplus matching prevents organic crop dumping',
                  'QR-verified food origin with immutable harvest logging',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-[#F5F0E6] text-sm font-bold">
                    <span className="w-6 h-6 rounded-full bg-[#C9A45C] text-[#10251D] flex items-center justify-center font-black text-xs shrink-0">
                      âœ“
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/about"
                className="btn-harvest"
              >
                <span>Read Our Mission Story</span>
                <ArrowRight className="w-4 h-4 text-[#10251D]" />
              </Link>
            </div>

            {/* KPI Stat Cards 2x2 */}
            <div className="lg:col-span-6">
              <AgriMotion animation="zoomIn">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { bg: 'bg-[#F5F0E6]/10 backdrop-blur-md border border-white/15', tc: 'text-[#F5F0E6]', sc: 'text-[#C9A45C]', val: 25, label: 'Years Experience' },
                    { bg: 'bg-[#C9A45C] border border-[#A9874B]', tc: 'text-[#10251D]', sc: 'text-[#10251D]/80', val: 180, label: 'Verified Farms' },
                    { bg: 'bg-[#C9A45C] border border-[#A9874B]', tc: 'text-[#10251D]', sc: 'text-[#10251D]/80', val: 2500, label: 'Harvest Saved (lbs)' },
                    { bg: 'bg-[#F5F0E6]/10 backdrop-blur-md border border-white/15', tc: 'text-[#F5F0E6]', sc: 'text-[#C9A45C]', val: 33000, label: 'Happy Customers', suffix: '+' },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className={`${s.bg} p-8 rounded-lg text-center flex flex-col items-center justify-center agriflow-card`}
                    >
                      <h3 className={`text-3xl lg:text-4xl font-black ${s.tc} font-display mb-1`}>
                        <AnimatedCounter end={s.val} suffix={s.suffix} />
                      </h3>
                      <span className={`text-xs font-black tracking-wide uppercase ${s.sc}`}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </AgriMotion>
            </div>

          </div>
        </div>
      </section>

      {/* â”€â”€ 4. Featured Produce & Harvests (AgriFlow Card Grid) â”€â”€ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <AgriSectionTitle
            label="Seasonal Produce"
            title="Featured Produce &amp; Fresh Harvests"
            subtitle="Pre-order today to pick up directly at your neighborhood farmer stall."
          />
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-black text-[#10251D] hover:text-[#A9874B] transition-colors mb-8 md:mb-10 group"
          >
            <span>View Complete Marketplace</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p, i) => (
            <AgriCard
              key={i}
              className="p-0 flex flex-col group"
            >
              {/* Image Container with Zoom & Badge */}
              <div className="relative aspect-square overflow-hidden bg-[#E9DFC9]">
                <img
                  src={p.img}
                  alt={p.name}
                  className="agriflow-img-zoom w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-[#10251D]/80 backdrop-blur-md text-[#F5F0E6] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#C9A45C]/40">
                  {p.tag}
                </span>

                <div className="absolute inset-0 bg-gradient-to-t from-[#10251D]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                  <Link
                    href="/products"
                    className="w-full py-2.5 rounded-md bg-[#C9A45C] text-[#10251D] text-xs font-black flex items-center justify-center gap-2 shadow-lg hover:bg-[#C9A45C] transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Pre-Order Item</span>
                  </Link>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-bold text-[#263A2E] uppercase tracking-wider mb-1">
                    {p.farm}
                  </p>
                  <h4 className="font-black text-[#10251D] text-base mb-2 group-hover:text-[#A9874B] transition-colors leading-snug">
                    {p.name}
                  </h4>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#C9A45C]/25">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-[#10251D]">{p.price}</span>
                    <span className="text-xs text-[#263A2E] font-bold">/ {p.unit}</span>
                    <span className="text-xs text-[#A9874B] line-through ml-1">{p.old}</span>
                  </div>
                  <span className="text-[11px] font-black text-[#263A2E] bg-[#263A2E]/10 px-2 py-0.5 rounded-full border border-emerald-200">
                    Organic
                  </span>
                </div>
              </div>
            </AgriCard>
          ))}
        </div>
      </section>

      {/* â”€â”€ 5. Verified Farmers & Community Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A45C]/15 border border-[#C9A45C]/40 text-[#10251D] text-xs font-black uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5 text-[#C9A45C]" />
            <span>Community Growers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#10251D] font-display">
            Verified Farmers &amp; Agronomists
          </h2>
          <p className="mt-3 text-stone-600 text-sm sm:text-base">
            Every grower on MarketLink is vetted for soil health, seasonal rotation, and fair organic practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {EXACT_USER_FARMERS.map((m) => (
            <AgriCard
              key={m.id}
              className="p-8 text-center relative group flex flex-col justify-between"
            >
              {/* Badge & Rating */}
              <div className="flex items-center justify-between gap-2 mb-6">
                <span className="bg-[#263A2E]/10 text-[#263A2E] text-[11px] font-black px-3 py-1 rounded-full border border-emerald-200">
                  {m.badge}
                </span>
                <span className="flex items-center gap-1 text-xs font-black text-[#10251D] bg-[#C9A45C]/20 px-2.5 py-1 rounded-full border border-[#C9A45C]/40">
                  <Star className="w-3 h-3 fill-[#C9A45C] text-[#C9A45C]" />
                  <span>{m.rating}</span>
                </span>
              </div>

              {/* Zero-Stretching Circular Avatar with Gold Ring */}
              <div className="relative w-28 h-28 mx-auto mb-6">
                <img
                  src={m.imageUrl}
                  alt={m.name}
                  className="w-full h-full rounded-full object-cover border-4 border-[#C9A45C]/40 shadow-lg agriflow-img-zoom"
                />
                <div className="absolute bottom-0 right-0 bg-[#10251D] text-[#C9A45C] w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center font-black text-sm z-10">
                  âœ“
                </div>
              </div>

              {/* Farmer Info */}
              <div className="flex flex-col gap-1.5 mb-4">
                <h4 className="font-black text-[#10251D] text-xl group-hover:text-[#A9874B] transition-colors">
                  {m.name}
                </h4>
                <p className="text-xs font-black text-[#A9874B]">
                  {m.farmName}
                </p>
                <div className="mt-3 bg-[#E9DFC9] rounded-md p-3.5 border border-[#C9A45C]/25 text-left">
                  <p className="text-xs font-bold text-stone-700 mb-1">{m.specialty}</p>
                  <p className="text-[11px] font-semibold text-[#263A2E]">ðŸ“ {m.location}</p>
                </div>
              </div>

              <Link
                href="/markets"
                className="w-full py-2.5 rounded-full border border-[#10251D]/20 hover:border-[#10251D] hover:bg-[#10251D] hover:text-[#F5F0E6] text-xs font-black text-[#10251D] transition-all text-center block mt-2"
              >
                View Farmer Stalls
              </Link>
            </AgriCard>
          ))}
        </div>
      </section>

      {/* â”€â”€ 6. Testimonials Carousel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <AgriCard className="p-8 sm:p-12 text-center bg-[#F5F0E6] border border-[#C9A45C]/25 shadow-xl relative">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#C9A45C]/20 text-[#10251D] flex items-center justify-center font-black text-2xl mb-6">
            â€œ
          </div>
          <p className="text-lg sm:text-xl font-bold text-[#10251D] leading-relaxed max-w-3xl mx-auto mb-8 min-h-[72px]">
            {testimonials[testimonialIdx].text}
          </p>
          <div className="flex flex-col items-center">
            <img
              src={testimonials[testimonialIdx].img}
              alt={testimonials[testimonialIdx].name}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#C9A45C] shadow-md mb-2"
            />
            <h5 className="font-black text-[#10251D] text-base">
              {testimonials[testimonialIdx].name}
            </h5>
            <span className="text-xs font-bold text-[#263A2E]">
              {testimonials[testimonialIdx].role}
            </span>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIdx(i)}
                aria-label={`Testimonial ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  testimonialIdx === i ? 'w-8 bg-[#C9A45C]' : 'w-2 bg-stone-300 hover:bg-stone-400'
                }`}
              />
            ))}
          </div>
        </AgriCard>
      </section>

      {/* â”€â”€ 7. Call To Action Banner (AgriFlow Signature) â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="relative overflow-hidden bg-[#10251D] py-20 px-4 sm:px-6 lg:px-8 border-t border-[#C9A45C]/30">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(234,179,8,0.1),_transparent_65%)]" />

        <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A45C]/15 border border-[#C9A45C]/30 text-[#C9A45C] text-xs font-black uppercase tracking-wider mb-4">
              <span>Join MarketLink</span>
            </div>
            <h2 className="text-[#F5F0E6] text-3xl sm:text-4xl lg:text-5xl font-black font-display mb-4 leading-tight">
              Ready to Experience Direct Farm-to-Table Freshness?
            </h2>
            <p className="text-[#F5F0E6]/80 text-sm sm:text-base leading-relaxed">
              Register as a local farmer to manage your weekly market stalls and inventory, or sign up as a customer to pre-order fresh harvests.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link
              href="/register?role=FARMER"
              className="btn-harvest"
            >
              <span>Register as Farmer</span>
              <ArrowRight className="w-4 h-4 text-[#10251D]" />
            </Link>
            <Link
              href="/register?role=CUSTOMER"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-[#C9A45C]/50 text-[#F5F0E6] font-black text-sm hover:bg-[#C9A45C]/10 hover:border-[#C9A45C] transition-all"
            >
              <span>Customer Sign Up</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
