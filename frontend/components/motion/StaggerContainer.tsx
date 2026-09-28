'use client';

import React from 'react';
import { Reveal, AnimationVariant } from './Reveal';
import { cn } from '../../lib/utils';

export interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number; // ms between items
  baseDelay?: number; // ms initial delay
  animation?: AnimationVariant;
  duration?: number;
  threshold?: number;
  once?: boolean;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 80,
  baseDelay = 0,
  animation = 'fade-up',
  duration = 600,
  threshold = 0.15,
  once = true,
  className = '',
}) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={cn(className)}>
      {childrenArray.map((child, idx) => {
        if (!React.isValidElement(child)) return child;
        return (
          <Reveal
            key={child.key ?? idx}
            animation={animation}
            delay={baseDelay + idx * staggerDelay}
            duration={duration}
            threshold={threshold}
            once={once}
          >
            {child}
          </Reveal>
        );
      })}
    </div>
  );
};
