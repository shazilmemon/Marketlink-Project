'use client';

import React, { useState } from 'react';
import { 
  Code2, Cpu, MapPin, Server, Database, ShieldCheck, 
  Layers, CheckCircle2, ChevronRight, Activity, Terminal
} from 'lucide-react';

export interface ArchitectureItem {
  id: string;
  category: 'ai' | 'geo' | 'security' | 'database';
  categoryName: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  specs: string[];
  status: string;
}

export const ARCHITECTURE_DATA: ArchitectureItem[] = [
  {
    id: 'arch-1',
    category: 'ai',
    categoryName: 'AI & Intelligence',
    title: 'AI Service Layer',
    subtitle: 'Gemini 1.5 Flash Neural Engine',
    description: 'Powers real-time assistant conversations, automated harvest yield predictions, and dynamic produce price recommendations for market vendors.',
    icon: Cpu,
    specs: ['Gemini 1.5 Flash API', 'Natural Language Produce Search', 'Predictive Yield Analytics', 'Contextual Customer Insights'],
    status: 'Operational (24ms latency)',
  },
  {
    id: 'arch-2',
    category: 'geo',
    categoryName: 'Geospatial',
    title: 'Location & Stall Mapping',
    subtitle: 'OpenStreetMap & Leaflet Integration',
    description: 'High-precision geospatial mapping layer indexing regional farmers markets, nearby harvest collection hubs, and active stall locations.',
    icon: MapPin,
    specs: ['Leaflet Vector Tile Renderer', 'GeoJSON Location Storage', 'Radius Stall Filtering', 'Interactive Map Pins'],
    status: 'Geospatial Index Active',
  },
  {
    id: 'arch-3',
    category: 'security',
    categoryName: 'Security & Auth',
    title: 'Security & Role Authorization',
    subtitle: 'HttpOnly JWT & OAuth 2.0',
    description: 'Strict multi-tier RBAC authorization protecting farmer dashboards, customer orders, and administrator system configurations.',
    icon: Server,
    specs: ['HttpOnly SameSite Cookies', 'OAuth 2.0 Social Login', 'Bcrypt Password Hashing', 'API Rate Limiting Shield'],
    status: 'Zero-Trust Enforced',
  },
  {
    id: 'arch-4',
    category: 'database',
    categoryName: 'Database',
    title: 'MongoDB & GeoJSON Storage',
    subtitle: 'Mongoose ODM & Audit Logs',
    description: 'High-throughput document database architecture with 2dsphere spatial indexing, compound query optimizations, and immutable transaction logs.',
    icon: Database,
    specs: ['Mongoose Schema Validation', '2dsphere Spatial Indexing', 'Compound Performance Indexes', 'Automated Daily Backups'],
    status: '99.99% Uptime',
  },
];

export const SystemArchitectureSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');

  const filteredItems = activeTab === 'all' 
    ? ARCHITECTURE_DATA 
    : ARCHITECTURE_DATA.filter((item) => item.category === activeTab);

  const tabs = [
    { id: 'all', label: 'All Architecture Layers', count: ARCHITECTURE_DATA.length, icon: Layers },
    { id: 'ai', label: 'AI & Intelligence', count: 1, icon: Cpu },
    { id: 'geo', label: 'Geospatial & Location', count: 1, icon: MapPin },
    { id: 'security', label: 'Security & Auth', count: 1, icon: Server },
    { id: 'database', label: 'Database & Storage', count: 1, icon: Database },
  ];

  return (
    <div className="flex flex-col gap-8 pt-8 border-t border-slate-200/80 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[#263A2E] font-extrabold text-xs uppercase tracking-widest border-b-2 border-emerald-600 pb-1 flex items-center gap-1.5 w-fit">
            <Code2 className="w-4 h-4 text-[#263A2E]" /> Technical Overview
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
            System Architecture & Technical Layer
          </h2>
          <p className="text-slate-600 text-xs md:text-sm mt-1 max-w-2xl">
            Interactive breakdown of the underlying technology stack powering Aldenaire & MarketLink web applications.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-[#263A2E]/10 text-[#263A2E] px-3.5 py-1.5 rounded-md border border-emerald-200/80 text-xs font-bold shrink-0">
          <Activity className="w-4 h-4 text-[#263A2E] animate-pulse" />
          <span>All Services Healthy</span>
        </div>
      </div>

      {/* Interactive Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-bold text-xs transition-all duration-300 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#263A2E]/10 text-[#F5F0E6] shadow-md shadow-emerald-900/20 border border-emerald-700 scale-[1.02]'
                  : 'bg-[#F5F0E6] text-slate-700 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#263A2E]' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-[#263A2E]/10 text-[#263A2E]' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Grid Rendering Based on Selected Tab */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
        {filteredItems.map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.id}
              className="group bg-[#F5F0E6] rounded-lg p-6 border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-emerald-400 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Card Top Info Bar */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-md bg-[#263A2E]/10/80 text-[#263A2E] group-hover:bg-[#263A2E]/10 group-hover:text-[#F5F0E6] transition-colors duration-300">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight">{item.title}</h3>
                      <p className="text-[#263A2E] text-xs font-semibold">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {item.categoryName}
                  </span>
                </div>

                {/* Description */}
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                  {item.description}
                </p>

                {/* Tech Specs Chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.specs.map((spec, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/70"
                    >
                      <CheckCircle2 className="w-3 h-3 text-[#263A2E] shrink-0" />
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Status */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                  <Terminal className="w-3.5 h-3.5 text-[#263A2E]" />
                  Status: <strong className="text-[#263A2E] font-semibold">{item.status}</strong>
                </span>
                <span className="text-[#263A2E] group-hover:translate-x-1 transition-transform duration-300 flex items-center gap-0.5 font-bold text-[11px] cursor-pointer">
                  Details <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
