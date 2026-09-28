import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'emerald' | 'amber' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-full active:scale-[0.98] transform hover:-translate-y-0.5 gpu-accelerated';

    const variants = {
      primary: 'bg-[#10251D] text-[#F5F0E6] hover:bg-[#263A2E] hover:shadow-lg focus:ring-[#C9A45C] shadow-md font-black',
      emerald: 'bg-[#C9A45C] text-[#10251D] hover:bg-[#C9A45C] hover:shadow-lg focus:ring-[#C9A45C] shadow-md font-black',
      amber:   'bg-[#C9A45C] text-[#10251D] hover:bg-[#C9A45C] hover:shadow-lg focus:ring-[#C9A45C] shadow-md font-black',
      gold:    'bg-[#C9A45C] text-[#10251D] hover:bg-[#C9A45C] hover:shadow-lg focus:ring-[#C9A45C] shadow-md font-black',
      secondary: 'bg-[#E9DFC9] text-[#10251D] hover:bg-stone-200 focus:ring-stone-400',
      outline:
        'border border-[#C9A45C]/25 bg-[#F5F0E6] text-[#10251D] hover:bg-[#E9DFC9] hover:border-[#C9A45C]/60 focus:ring-[#C9A45C]',
      ghost: 'bg-transparent text-[#10251D] hover:bg-[#E9DFC9] focus:ring-stone-300 transform-none hover:translate-y-0',
      danger: 'bg-rose-600 text-[#F5F0E6] hover:bg-rose-700 hover:shadow-md focus:ring-rose-500 shadow-sm',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5',
      md: 'text-sm px-5 py-2.5 gap-2',
      lg: 'text-base px-7 py-3.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
