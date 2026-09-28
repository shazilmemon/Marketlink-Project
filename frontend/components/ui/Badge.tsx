import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'emerald' | 'amber' | 'rose' | 'slate' | 'outline';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  icon,
  ...props
}) => {
  const variants = {
    default: 'bg-[#E9DFC9] text-zinc-900 border-[#C9A45C]/20',
    emerald: 'bg-amber-100 text-amber-900 border-amber-300',
    amber: 'bg-amber-100 text-amber-900 border-amber-300',
    rose: 'bg-rose-100 text-rose-800 border-rose-300',
    slate: 'bg-stone-200 text-zinc-800 border-stone-300',
    outline: 'bg-transparent text-zinc-800 border-stone-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
};
