'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AgriCard } from '../../components/motion/AgriMotion';
import { ShieldCheck, QrCode, Search, Calendar, MapPin, CheckCircle2, Truck, Sparkles, Award, Leaf } from 'lucide-react';

export default function TraceabilityPage() {
  const [batchCode, setBatchCode] = useState('BATCH-2026-ORGANIC-889');
  const [activeBatch, setActiveBatch] = useState({
    code: 'BATCH-2026-ORGANIC-889',
    cropName: 'Heirloom Organic Honeycrisp Apples',
    farmName: 'Sunnyside Orchards & Organic Apiary',
    farmerName: 'Marcus Vance',
    location: 'Oakland Valley Farm Block 4B',
    harvestDate: 'September 24, 2026 - 06:30 AM',
    certifications: ['100% Certified Organic', 'Zero Chemical Pesticides', 'Regenerative Soil Standard'],
    timeline: [
      { step: 1, title: 'Seed Planting & Soil Audit', date: 'April 12, 2026', location: 'Block 4B Soil Bed', desc: 'Tested 0% synthetic nitrate residue. Rich compost enriched.' },
      { step: 2, title: 'Harvesting & Hand Picked', date: 'Sept 24, 2026 - 06:30 AM', location: 'Sunnyside Orchards', desc: 'Harvested at peak Brix sweetness level (14.2Â°).' },
      { step: 3, title: 'Cold-Chain Transport', date: 'Sept 24, 2026 - 11:00 AM', location: 'Refrigerated Transport (38Â°F)', desc: 'Temperature-monitored transit via eGreen Fleet.' },
      { step: 4, title: 'Market Stall Arrival', date: 'Sept 25, 2026 - 07:00 AM', location: 'Downtown Market Stall #A-12', desc: 'Verified and ready for pre-order customer pickup.' },
    ],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] text-[#10251D] flex flex-col gap-0 pb-20">

      {/* â”€â”€ Page Header: AgriFlow Deep Forest Green â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="relative bg-[#10251D] text-[#F5F0E6] py-20 px-6 text-center overflow-hidden border-b border-[#C9A45C]/20">
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=1600&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10251D] via-[#10251D]/80 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-4">
          <span className="inline-flex items-center gap-2 bg-[#C9A45C]/20 text-[#C9A45C] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider border border-[#C9A45C]/40 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Farm-to-Table Traceability
          </span>
          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-[#F5F0E6] drop-shadow-md">
            Batch QR Verification
          </h1>
          <p className="text-[#F5F0E6]/85 text-base md:text-lg max-w-2xl leading-relaxed font-normal">
            Every MarketLink crop harvest batch is recorded with verified origin timestamping and soil quality compliance logs. Scan any QR code to trace your produce.
          </p>
          <div className="flex items-center gap-2 text-sm text-[#F5F0E6]/70 mt-2 font-medium">
            <Link href="/" className="hover:underline hover:text-[#F5F0E6] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#C9A45C] font-black">Traceability & QR</span>
          </div>
        </div>
      </div>

      {/* â”€â”€ Page Body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="max-w-5xl mx-auto flex flex-col gap-10 pb-16 pt-10 px-4 sm:px-6 w-full">

        {/* Batch Code Search */}
        <form onSubmit={handleSearch} className="bg-[#F5F0E6] p-4 rounded-lg border border-[#C9A45C]/25 shadow-sm flex gap-3 max-w-xl mx-auto w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9874B] pointer-events-none" />
            <input
              type="text"
              placeholder="Enter Batch ID (e.g. BATCH-2026-ORGANIC-889)"
              value={batchCode}
              onChange={(e) => setBatchCode(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#C9A45C]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C9A45C] text-[#10251D] placeholder-stone-400 font-medium"
            />
          </div>
          <button
            type="submit"
            className="btn-harvest text-sm py-2.5 px-5 shrink-0"
          >
            Verify
          </button>
        </form>

        {/* Batch Details & QR Card */}
        <div className="bg-[#F5F0E6] rounded-md border border-[#C9A45C]/25 p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#263A2E]/10 rounded-full blur-3xl -z-0 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#C9A45C]/25">
            <div>
              {/* Verification Badge */}
              <div className="inline-flex items-center gap-1.5 bg-[#263A2E]/10 text-[#263A2E] border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#263A2E]" />
                <span>Verified Organic Harvest</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#10251D] font-display">{activeBatch.cropName}</h2>
              <p className="text-xs text-[#263A2E] mt-1 font-mono font-semibold">
                Batch Reference: <span className="text-[#263A2E]">{activeBatch.code}</span>
              </p>
            </div>

            {/* QR Code Card */}
            <div className="p-4 rounded-lg bg-[#E9DFC9] border border-[#C9A45C]/25 flex items-center gap-4 shrink-0 shadow-sm">
              <div className="w-20 h-20 bg-[#F5F0E6] p-2 rounded-md border border-[#C9A45C]/20 flex items-center justify-center">
                <QrCode className="w-16 h-16 text-[#10251D]" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#263A2E] block">Digital Seal</span>
                <span className="text-xs font-bold text-[#10251D] block mt-0.5">Scan to Verify</span>
                <span className="text-[11px] text-[#263A2E] font-semibold block mt-1">100% Authentic</span>
              </div>
            </div>
          </div>

          {/* Batch Meta Grid */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-md bg-[#263A2E]/10 text-[#263A2E] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-[#263A2E] font-semibold block">Origin Farm</span>
                <span className="text-sm font-bold text-[#10251D]">{activeBatch.farmName}</span>
                <span className="text-xs text-[#263A2E] block">{activeBatch.location}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-[#263A2E] font-semibold block">Harvest Timestamp</span>
                <span className="text-sm font-bold text-[#10251D]">{activeBatch.harvestDate}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-md bg-[#263A2E]/10 text-[#263A2E] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-[#263A2E] font-semibold block">Compliance Certs</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeBatch.certifications.map((c) => (
                    <span key={c} className="text-[10px] font-extrabold bg-[#263A2E]/10 text-[#263A2E] px-2 py-0.5 rounded-md">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div>
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 text-xs font-black text-[#10251D] uppercase tracking-wider bg-[#C9A45C]/20 px-3.5 py-1.5 rounded-full border border-[#C9A45C]/40 mb-3">
              <Truck className="w-3.5 h-3.5 text-[#A9874B]" />
              Custody Chain
            </div>
            <h3 className="text-2xl font-black text-[#10251D] font-display">Sequential Harvest Timeline</h3>
            <p className="text-xs text-[#263A2E] mt-1">Step-by-step custody tracking from soil bed to market stall.</p>
          </div>

          <div className="relative border-l-2 border-[#C9A45C]/40 ml-4 space-y-6">
            {activeBatch.timeline.map((event, idx) => (
              <div key={event.step} className="relative pl-6 group">
                {/* Timeline Bullet */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#10251D] border-2 border-white shadow-sm group-hover:scale-125 transition-transform" />

                <AgriCard className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <h4 className="font-extrabold text-[#10251D] text-base flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#C9A45C] text-[#10251D] flex items-center justify-center font-black text-xs shrink-0">
                        {event.step}
                      </span>
                      {event.title}
                    </h4>
                    <span className="text-xs font-bold text-[#263A2E] bg-[#263A2E]/10 px-2.5 py-0.5 rounded-full border border-emerald-200 w-fit">
                      {event.date}
                    </span>
                  </div>
                  <p className="text-xs text-[#263A2E] mb-2 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#C9A45C] shrink-0" />
                    {event.location}
                  </p>
                  <p className="text-xs text-stone-700 leading-relaxed">{event.desc}</p>
                </AgriCard>
              </div>
            ))}
          </div>
        </div>

        {/* How it works summary */}
        <div className="bg-[#10251D] rounded-md p-8 sm:p-12 text-[#F5F0E6] border border-[#C9A45C]/30 shadow-lg relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(234,179,8,0.08),_transparent_65%)]" />
          <div className="relative z-10 text-center max-w-2xl mx-auto mb-8">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A45C]/20 border border-[#C9A45C]/40 text-[#C9A45C] text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              How MarketLink QR Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-[#F5F0E6]">
              Immutable Farm-to-Table Records
            </h2>
          </div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { step: '1', title: 'Farmer Logs Harvest', desc: 'The farmer scans a QR and logs the batch at harvest time with soil data and timestamps.', icon: Leaf },
              { step: '2', title: 'Chain of Custody', desc: 'Every handoff from farm to transport to market is cryptographically recorded.', icon: Truck },
              { step: '3', title: 'Consumer Verification', desc: 'Customers scan the QR to see the complete origin story â€” from soil to stall.', icon: ShieldCheck },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#C9A45C] text-[#10251D] flex items-center justify-center font-black text-lg shadow-lg">
                  {item.step}
                </div>
                <h4 className="font-black text-[#F5F0E6] text-base">{item.title}</h4>
                <p className="text-xs text-[#E9DFC9] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
