import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'w-full flex flex-col items-center justify-center p-12 text-center rounded-lg border border-dashed border-agri-border bg-[#F5F0E6]/60 backdrop-blur-sm',
        className
      )}
    >
      {icon && (
        <div className="w-14 h-14 rounded-lg bg-agri-surface flex items-center justify-center text-agri-emerald mb-4 shadow-sm">
          {icon}
        </div>
      )}
      <h4 className="text-base font-bold text-agri-dark tracking-tight mb-1">{title}</h4>
      <p className="text-xs text-agri-muted max-w-sm leading-relaxed mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="emerald" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
