import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-agri-dark/60 backdrop-blur-sm animate-fade-in">
      <div
        className={cn(
          'w-full max-w-md bg-[#F5F0E6] rounded-lg border border-agri-border shadow-lg overflow-hidden flex flex-col',
          className
        )}
      >
        <div className="p-6 pb-4 flex items-start justify-between border-b border-agri-border">
          <div>
            <h3 className="text-base font-bold text-agri-dark">{title}</h3>
            {description && <p className="text-xs text-agri-muted mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-agri-dark transition-colors p-1 rounded-lg hover:bg-agri-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[75vh]">{children}</div>
      </div>
    </div>
  );
};
