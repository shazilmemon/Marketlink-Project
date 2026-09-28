'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../lib/api';
import { Activity, Server } from 'lucide-react';

export const HealthStatusPill: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [dbStatus, setDbStatus] = useState<string>('checking');

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const res = await fetchApi('/health');
        if (isMounted && res.success) {
          setStatus('connected');
          setDbStatus(res.database || 'active');
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setDbStatus('offline');
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agri-surface/80 border border-agri-border text-xs font-medium text-agri-charcoal shadow-sm">
      <Server className="w-3.5 h-3.5 text-agri-emerald" />
      <span>Backend:</span>
      {status === 'loading' && <span className="text-amber-600 animate-pulse font-mono">Checking...</span>}
      {status === 'connected' && (
        <span className="inline-flex items-center gap-1.5 font-semibold text-[#263A2E]">
          <span className="w-2 h-2 rounded-full bg-[#263A2E]/10 animate-ping"></span>
          API Online ({dbStatus})
        </span>
      )}
      {status === 'error' && (
        <span className="inline-flex items-center gap-1.5 font-semibold text-rose-600">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          Offline (Fallback)
        </span>
      )}
    </div>
  );
};
