'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

export type AgriAnimationType =
  | 'slideInDown'
  | 'fadeInUp'
  | 'fadeIn'
  | 'zoomIn'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right';

export interface AgriMotionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: AgriAnimationType;
  delay?: number; // ms
  duration?: number; // ms
  threshold?: number;
  once?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * GPU-Accelerated AgriFlow Motion Component
 * Provides silky smooth cubic-bezier(0.16, 1, 0.3, 1) entrances
 */
export const AgriMotion: React.FC<AgriMotionProps> = ({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 700,
  threshold = 0.12,
  once = true,
  className = '',
  style = {},
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  const getInitialTransform = (): string => {
    switch (animation) {
      case 'slideInDown':
      case 'fade-down':
        return 'translate3d(0, -28px, 0)';
      case 'fadeInUp':
      case 'fade-up':
        return 'translate3d(0, 36px, 0)';
      case 'fade-left':
        return 'translate3d(36px, 0, 0)';
      case 'fade-right':
        return 'translate3d(-36px, 0, 0)';
      case 'zoomIn':
        return 'scale(0.92) translateZ(0)';
      case 'fadeIn':
      default:
        return 'translate3d(0, 10px, 0)';
    }
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0) scale(1)' : getInitialTransform(),
        transitionProperty: 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay}ms`,
        willChange: 'transform, opacity',
        ...style,
      }}
      className={cn('gpu-accelerated', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export interface AgriCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

/**
 * AgriFlow Card Component
 * Implements the GPU-accelerated hover lift & harvest gold glow:
 * - translateY(-8px) scale(1.01)
 * - Pure white background (#FFFFFF) with ultra-soft border (border-[#C9A45C]/25)
 * - Deep forest green (#10251D) shadow with warm gold ambient glow
 */
export const AgriCard: React.FC<AgriCardProps> = ({
  children,
  className = '',
  glow = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'agriflow-card bg-[#F5F0E6] rounded-lg border border-[#C9A45C]/25 p-6 shadow-sm overflow-hidden',
        glow && 'hover:border-[#C9A45C]/60',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface AgriFloatingBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * AgriFlow Floating Interactive Stat Card
 * Subtle continuous floating keyframe animation translateY(-8px) loop
 */
export const AgriFloatingBadge: React.FC<AgriFloatingBadgeProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={cn(
        'animate-bounce-slow backdrop-blur-md bg-[#F5F0E6]/90 border border-[#C9A45C]/25 shadow-lg rounded-lg select-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface AgriImgZoomProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

/**
 * AgriFlow Image with Zoom & Micro-Rotation Hover Effect
 */
export const AgriImgZoom: React.FC<AgriImgZoomProps> = ({
  className = '',
  alt = '',
  ...props
}) => {
  return (
    <img
      alt={alt}
      className={cn('agriflow-img-zoom w-full h-full object-cover', className)}
      {...props}
    />
  );
};
