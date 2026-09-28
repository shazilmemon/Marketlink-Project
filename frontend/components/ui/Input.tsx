import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-agri-charcoal tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && <div className="absolute left-3.5 text-gray-400 pointer-events-none">{leftIcon}</div>}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full bg-[#F5F0E6] border border-agri-border rounded-md px-3.5 py-2.5 text-sm text-agri-charcoal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-agri-emerald/50 focus:border-agri-emerald transition-all duration-150',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-rose-500 focus:ring-rose-500/50 focus:border-rose-500',
              className
            )}
            {...props}
          />
          {rightIcon && <div className="absolute right-3.5 text-gray-400">{rightIcon}</div>}
        </div>
        {error && <p className="text-xs font-medium text-rose-600 mt-0.5 animate-shake">{error}</p>}
        {helperText && !error && <p className="text-xs text-agri-muted mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
