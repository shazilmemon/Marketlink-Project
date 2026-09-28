'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '../../lib/utils';

export const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to Top"
      className={cn(
        'fixed bottom-8 right-8 z-50 p-3.5 rounded-full bg-[#263A2E]/10 text-[#F5F0E6] shadow-xl hover:bg-[#263A2E]/10 transition-all duration-300 transform hover:-translate-y-1 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 animate-fade-in gpu-accelerated'
      )}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};
