import React from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  className,
}) => {
  const configs = {
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    },
    success: {
      bg: 'bg-[#263A2E]/10 border-emerald-200 text-[#263A2E]',
      icon: <CheckCircle2 className="w-5 h-5 text-[#263A2E] shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    },
  };

  const config = configs[type];

  return (
    <div
      className={cn(
        'w-full p-4 rounded-md border flex items-start gap-3 text-sm shadow-sm',
        config.bg,
        className
      )}
    >
      {config.icon}
      <div className="flex flex-col gap-0.5">
        {title && <span className="font-semibold text-xs tracking-wide">{title}</span>}
        <p className="text-xs leading-relaxed">{message}</p>
      </div>
    </div>
  );
};
