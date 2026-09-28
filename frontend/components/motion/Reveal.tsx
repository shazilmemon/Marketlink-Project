'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

export type AnimationVariant =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'scale'
  | 'fade'
  | 'zoom-in';

export interface RevealProps {
  children: React.ReactNode;
  animation?: AnimationVariant;
  variant?: AnimationVariant;
  delay?: number; // milliseconds
  duration?: number; // milliseconds
  threshold?: number;
  once?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  animation = 'fade-up',
  variant,
  delay = 0,
  duration = 600,
  threshold = 0.15,
  once = true,
  className = '',
  style = {},
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeAnimation = variant || animation;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Handle accessibility preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    switch (activeAnimation) {
      case 'fade-up':
        return 'translate3d(0, 45px, 0)';
      case 'fade-down':
        return 'translate3d(0, -35px, 0)';
      case 'fade-left':
        return 'translate3d(35px, 0, 0)';
      case 'fade-right':
        return 'translate3d(-35px, 0, 0)';
      case 'scale':
      case 'zoom-in':
        return 'scale(0.92) translateZ(0)';
      case 'fade':
      default:
        return 'translate3d(0, 0, 0)';
    }
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0,0,0) scale(1)' : getInitialTransform(),
        transitionProperty: 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay}ms`,
        willChange: 'transform, opacity',
        ...style,
      }}
      className={cn('gpu-accelerated', className)}
    >
      {children}
    </div>
  );
};
