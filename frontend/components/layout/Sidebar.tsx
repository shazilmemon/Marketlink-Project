'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Heart, 
  Clock, 
  Store, 
  Package, 
  TrendingUp, 
  Leaf, 
  Users, 
  ShieldCheck, 
  FileText,
  Activity,
  Cpu,
  Settings
} from 'lucide-react';

export interface SidebarProps {
  role?: 'CUSTOMER' | 'FARMER' | 'ADMIN';
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ role = 'CUSTOMER', activeTab, onTabChange }) => {
  const pathname = usePathname();

  const customerNav: NavItem[] = [
    { id: 'orders', label: 'My Pre-Orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'favorites', label: 'Favorite Vendors', icon: <Heart className="w-4 h-4" /> },
    { id: 'history', label: 'Order History', icon: <Clock className="w-4 h-4" /> },
  ];

  const farmerNav: NavItem[] = [
    { id: 'overview', label: 'AI Command Center', icon: <Store className="w-4 h-4" />, href: '/farmer/dashboard' },
    { id: 'forecasting', label: 'AI Demand Forecast', icon: <Cpu className="w-4 h-4" />, href: '/farmer/analytics/forecasting' },
    { id: 'insights', label: 'Smart Vendor Insights', icon: <TrendingUp className="w-4 h-4" />, href: '/farmer/analytics/insights' },
    { id: 'inventory', label: 'Produce & Dynamic Pricing', icon: <Package className="w-4 h-4" />, href: '/farmer/products' },
    { id: 'orders', label: 'Manage Orders', icon: <ShoppingBag className="w-4 h-4" />, href: '/farmer/orders' },
    { id: 'favorites', label: 'Saved Favorites', icon: <Heart className="w-4 h-4" />, href: '/farmer/favorites' },
    { id: 'settings', label: 'Shop Profile', icon: <Settings className="w-4 h-4" />, href: '/farmer/settings' },
  ];

  const adminNav: NavItem[] = [
    { id: 'overview', label: 'Platform Metrics', icon: <Activity className="w-4 h-4" /> },
    { id: 'verifications', label: 'Farmer Verifications', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'users', label: 'User Directory', icon: <Users className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Logs', icon: <FileText className="w-4 h-4" /> },
  ];

  let items: NavItem[] = customerNav;
  let title = 'Customer Portal';
  if (role === 'FARMER' || pathname.startsWith('/farmer')) {
    items = farmerNav;
    title = 'Farmer Vendor Portal';
  } else if (role === 'ADMIN' || pathname.startsWith('/admin')) {
    items = adminNav;
    title = 'Admin Management';
  }

  return (
    <aside className="w-full md:w-64 bg-[#F5F0E6] rounded-lg border border-agri-border p-4 shadow-card flex flex-col gap-6 h-fit">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-agri-muted px-3 mb-2">{title}</p>
        <div className="flex flex-col gap-1">
          {items.map((item) => {
            const isSelected = activeTab === item.id || (item.href && pathname.startsWith(item.href));
            const btnContent = (
              <div
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-all text-left cursor-pointer',
                  isSelected
                    ? 'bg-agri-dark text-[#F5F0E6] shadow-sm'
                    : 'text-agri-charcoal hover:bg-agri-surface'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            );

            if (item.href) {
              return (
                <Link key={item.id} href={item.href}>
                  {btnContent}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onTabChange && onTabChange(item.id)}
                className="w-full text-left"
              >
                {btnContent}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-agri-border">
        <p className="text-[10px] text-agri-muted px-3 mb-2 font-mono">ROLE SCOPE: {role}</p>
        <div className="bg-agri-surface p-3 rounded-md border border-agri-border text-[11px] text-agri-charcoal">
          <p className="font-semibold text-agri-dark">Production Architecture</p>
          <p className="text-[10px] text-agri-muted mt-0.5">Authorization enforced on backend via `requireRole` middleware.</p>
        </div>
      </div>
    </aside>
  );
};
