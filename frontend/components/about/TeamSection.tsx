'use client';

import React from 'react';
import { Linkedin, Github, Twitter, Award, CheckCircle2 } from 'lucide-react';
import { AgriCard } from '../motion/AgriMotion';

export const ABOUT_TEAM_MEMBERS = [
  {
    id: 'team-1',
    name: 'Muhammad Shazil Asif',
    role: 'Lead Architect & Full-Stack Developer',
    imageUrl: 'https://i.pinimg.com/736x/47/7b/a5/477ba5bdde12f5a29071a19f1d49e8e6.jpg',
    badge: 'Core Lead',
  },
  {
    id: 'team-2',
    name: 'Aisha Siddiqui',
    role: 'UI/UX & Front-End Specialist',
    imageUrl: 'https://i.pinimg.com/736x/ec/39/12/ec3912a4707eeef95639ff588170a6a3.jpg',
    badge: 'UI Specialist',
  },
  {
    id: 'team-3',
    name: 'Haris Ahmed',
    role: 'Backend & Database Engineer',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    badge: 'DB Specialist',
  },
  {
    id: 'team-4',
    name: 'Rahim Khan',
    role: 'AI Engine & Quality Assurance',
    imageUrl: 'https://i.pinimg.com/736x/a2/c7/7c/a2c77c05492aa6037bcf76482cf5d1ed.jpg',
    badge: 'AI Specialist',
  },
];

export const TeamSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Section Header */}
      <div className="text-center max-w-xl mx-auto flex flex-col items-center gap-2">
        <span className="text-[#10251D] font-black text-xs uppercase tracking-widest bg-[#C9A45C]/20 px-3.5 py-1 rounded-full border border-[#C9A45C]/40">
          Engineering &amp; Agronomy
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-[#10251D] tracking-tight font-display">
          Experienced Team Members
        </h2>
        <p className="text-[#263A2E] text-xs md:text-sm">
          Meet the core engineering and agriculture specialists building the MarketLink platform.
        </p>
      </div>

      {/* Compact 4-Card Row Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 w-full">
        {ABOUT_TEAM_MEMBERS.map((member) => (
          <AgriCard
            key={member.id}
            className="p-4 flex flex-col justify-between items-center text-center relative group"
          >
            {/* Top Badge */}
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center gap-1 bg-[#10251D]/90 backdrop-blur-md text-[#C9A45C] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#C9A45C]/40 shadow-sm">
                <CheckCircle2 className="w-2.5 h-2.5 text-[#C9A45C]" />
                {member.badge}
              </span>
            </div>

            {/* Image Container with Hover Scale */}
            <div className="relative w-full h-44 sm:h-52 rounded-md overflow-hidden mb-3 bg-[#E9DFC9]">
              <img
                src={member.imageUrl}
                alt={member.name}
                className="w-full h-full object-cover object-center agriflow-img-zoom"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10251D]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                {/* Social Quick Links */}
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#F5F0E6] text-[#10251D] hover:bg-[#C9A45C] flex items-center justify-center transition-colors cursor-pointer shadow-sm">
                    <Linkedin className="w-3.5 h-3.5" />
                  </span>
                  <span className="w-7 h-7 rounded-full bg-[#F5F0E6] text-[#10251D] hover:bg-[#C9A45C] flex items-center justify-center transition-colors cursor-pointer shadow-sm">
                    <Github className="w-3.5 h-3.5" />
                  </span>
                  <span className="w-7 h-7 rounded-full bg-[#F5F0E6] text-[#10251D] hover:bg-[#C9A45C] flex items-center justify-center transition-colors cursor-pointer shadow-sm">
                    <Twitter className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Text Details */}
            <div className="flex flex-col items-center w-full">
              <h3 className="font-black text-[#10251D] text-base sm:text-lg leading-snug group-hover:text-[#A9874B] transition-colors font-display">
                {member.name}
              </h3>
              <p className="text-[#A9874B] text-xs font-bold mt-0.5 line-clamp-1">
                {member.role}
              </p>
            </div>
          </AgriCard>
        ))}
      </div>
    </div>
  );
};
