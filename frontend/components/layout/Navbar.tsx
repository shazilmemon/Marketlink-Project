'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../brand/Logo';
import {
  Menu, X, LayoutDashboard, LogOut,
  Settings, Heart, ChevronDown, ShoppingBag,
  ShoppingCart, Sprout, Store, QrCode, Sparkles,
  Info, ExternalLink
} from 'lucide-react';
import { cn } from '../../lib/utils';

function getUserInitials(name?: string, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return 'U';
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  FARMER:   { label: 'Farmer',   color: '#EAB308', bg: 'rgba(234,179,8,0.18)'   },
  CUSTOMER: { label: 'Customer', color: '#10B981', bg: 'rgba(16,185,129,0.18)' },
  PARTNER:  { label: 'Vendor',   color: '#EAB308', bg: 'rgba(234,179,8,0.18)'   },
  ADMIN:    { label: 'Admin',    color: '#EF4444', bg: 'rgba(239,68,68,0.18)'   },
};

// Exact navigation links matching all Header Pages as specified
const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/markets', label: 'Explore Markets' },
  { href: '/farmers', label: 'Farmers & Stalls' },
  { href: '/traceability', label: 'Traceability & QR' },
  { href: '/surplus', label: 'Surplus Matching' },
  { href: '/about', label: 'About Us' },
];

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(3);
  const pathname = usePathname();
  const router = useRouter();

  const profileRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setCartOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCartOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const initials = getUserInitials(user?.name, user?.email);
  const roleConf = ROLE_CONFIG[user?.role || 'CUSTOMER'] ?? ROLE_CONFIG['CUSTOMER'];

  const isFarmer = user?.role === 'FARMER';
  const isAdmin  = user?.role === 'ADMIN';

  const ordersHref = isFarmer
    ? '/farmer/orders'
    : isAdmin
    ? '/admin/orders'
    : '/customer/orders';

  const favoritesHref = isFarmer
    ? '/farmer/favorites'
    : '/customer/favorites';

  const settingsHref = isFarmer
    ? '/farmer/settings'
    : isAdmin
    ? '/admin/settings'
    : '/customer/settings';

  const dashboardHref = isFarmer
    ? '/farmer/dashboard'
    : isAdmin
    ? '/admin/dashboard'
    : '/dashboard';

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-black/40 backdrop-blur-md border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Logo variant="luxury" />

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-3.5 xl:gap-6">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative text-[13px] xl:text-[14px] font-bold py-1.5 transition-all duration-200 group whitespace-nowrap',
                  active
                    ? 'text-white font-extrabold'
                    : 'text-stone-300 hover:text-white'
                )}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute -bottom-1 left-0 h-[2px] rounded-full bg-[#EAB308] transition-all duration-300 origin-left',
                    active
                      ? 'w-full opacity-100'
                      : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-90'
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right Action Items */}
        <div className="flex items-center gap-1.5 xl:gap-3">

          {/* ── 1. Cart Counter Icon with Harvest Gold Badge ──────── */}
          <div ref={cartRef} className="relative">
            <button
              onClick={() => setCartOpen((o) => !o)}
              aria-label="Pre-Order Cart"
              className="relative p-2.5 rounded-xl text-stone-200 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center focus:outline-none"
              title="Pre-Order Basket"
            >
              <ShoppingCart className="w-5 h-5 text-stone-200 hover:text-white transition-transform hover:scale-110" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#EAB308] text-[#0E2A1F] text-[10px] font-black flex items-center justify-center shadow-md animate-pulse ring-2 ring-[#0E2A1F]">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Cart Popover Dropdown */}
            {cartOpen && (
              <div className="absolute right-0 top-full mt-3 w-80 z-50 rounded-2xl overflow-hidden border border-stone-200/80 bg-white shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 text-[#0E2A1F]">
                <div className="p-4 bg-[#0E2A1F] text-white flex items-center justify-between border-b border-stone-700">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#EAB308]" />
                    <h4 className="font-black text-sm">Farm Pre-Order Basket</h4>
                  </div>
                  <span className="text-[11px] font-bold text-[#EAB308] bg-[#EAB308]/20 px-2 py-0.5 rounded-full">
                    {cartItemCount} items
                  </span>
                </div>

                <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                  <div className="flex items-center justify-between gap-3 text-xs pb-2 border-b border-stone-100">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#0E2A1F]">Heirloom Tomatoes</span>
                      <span className="text-[10px] text-stone-400">Green Valley Farm • 2 lbs</span>
                    </div>
                    <span className="font-black text-[#0E2A1F]">$9.00</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs pb-2 border-b border-stone-100">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#0E2A1F]">Organic Strawberries</span>
                      <span className="text-[10px] text-stone-400">Siddiqui Berry Farm • 1 box</span>
                    </div>
                    <span className="font-black text-[#0E2A1F]">$5.50</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#0E2A1F]">Raw Wildflower Honey</span>
                      <span className="text-[10px] text-stone-400">Surplus Matched • 1 jar</span>
                    </div>
                    <span className="font-black text-[#0E2A1F]">$12.00</span>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 border-t border-stone-200/70">
                  <div className="flex items-center justify-between text-xs font-bold mb-3">
                    <span className="text-stone-500">Estimated Total:</span>
                    <span className="text-sm font-black text-[#0E2A1F]">$26.50</span>
                  </div>
                  <Link
                    href="/customer/orders"
                    onClick={() => setCartOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-[#EAB308] hover:bg-yellow-400 text-[#0E2A1F] text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <span>Proceed to Pre-Orders</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── 2. Profile Dropdown or Auth Actions ───────────────── */}
          {isAuthenticated && user ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                aria-expanded={profileOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 group focus:outline-none"
                title={user.name}
              >
                <div className="avatar-badge group-hover:scale-105">
                  {initials}
                </div>
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 text-stone-300 transition-transform duration-200',
                    profileOpen && 'rotate-180'
                  )}
                />
              </button>

              {/* Working Profile Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 z-50 rounded-2xl overflow-hidden border border-stone-200/80 bg-white shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 text-[#0E2A1F]">
                  <div className="px-4 py-3.5 bg-stone-50 border-b border-stone-200/70">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-[#0E2A1F] font-black text-sm shadow-md shrink-0"
                        style={{ background: 'linear-gradient(135deg,#EAB308,#CA8A04)' }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-black text-[#0E2A1F] truncate">{user.name}</p>
                        <p className="text-[11.5px] text-stone-500 truncate">{user.email}</p>
                        <span
                          className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ color: roleConf.color, background: roleConf.bg }}
                        >
                          {roleConf.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <nav className="py-2">
                    <Link
                      href={dashboardHref}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-medium text-stone-700 hover:bg-stone-100 hover:text-[#0E2A1F] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-stone-400" />
                      <span>My Dashboard</span>
                    </Link>
                    <Link
                      href={ordersHref}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-medium text-stone-700 hover:bg-stone-100 hover:text-[#0E2A1F] transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 text-stone-400" />
                      <span>My Orders</span>
                    </Link>
                    <Link
                      href={favoritesHref}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-medium text-stone-700 hover:bg-stone-100 hover:text-[#0E2A1F] transition-colors"
                    >
                      <Heart className="w-4 h-4 text-stone-400" />
                      <span>Saved Favorites</span>
                    </Link>
                    <Link
                      href={settingsHref}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-medium text-stone-700 hover:bg-stone-100 hover:text-[#0E2A1F] transition-colors"
                    >
                      <Settings className="w-4 h-4 text-stone-400" />
                      <span>Account Settings</span>
                    </Link>
                  </nav>

                  <div className="px-2 pb-2 pt-1 border-t border-stone-200/70">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-[13.5px] font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/login">
                <button className="text-sm font-semibold text-white/90 hover:text-white px-3 py-2 transition-colors whitespace-nowrap">
                  Log In
                </button>
              </Link>
              <Link href="/register">
                <button className="rounded-full bg-[#E5B54F] hover:bg-[#d4a33e] text-[#10251D] text-sm font-extrabold px-6 py-2.5 shadow-md transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
                  Sign Up Free
                </button>
              </Link>
            </div>
          )}

          {/* ── 3. Mobile Menu Drawer Toggle ──────────────────────── */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-stone-200 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* ── Mobile Navigation Drawer with Smooth Slide Animation ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 backdrop-blur-2xl bg-[#0E2A1F]/95 border border-stone-700/60 shadow-2xl rounded-2xl p-5 animate-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === '/'
                  ? pathname === '/'
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-xl text-[14.5px] font-bold transition-all',
                    active
                      ? 'bg-white/15 text-white'
                      : 'text-stone-300 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <span>{link.label}</span>
                  {active && <span className="w-2 h-2 rounded-full bg-[#EAB308]" />}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 mt-3 border-t border-white/15">
            {isAuthenticated && user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[#0E2A1F] font-black text-xs shrink-0"
                    style={{ background: 'linear-gradient(135deg,#EAB308,#CA8A04)' }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-black text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
                  </div>
                </div>

                <Link
                  href={dashboardHref}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-200 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#EAB308]" />
                  <span>My Dashboard</span>
                </Link>
                <Link
                  href={ordersHref}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-200 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  <ShoppingBag className="w-4 h-4 text-[#EAB308]" />
                  <span>My Orders</span>
                </Link>
                <Link
                  href={favoritesHref}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-200 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  <Heart className="w-4 h-4 text-[#EAB308]" />
                  <span>Saved Favorites</span>
                </Link>
                <Link
                  href={settingsHref}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-200 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  <Settings className="w-4 h-4 text-[#EAB308]" />
                  <span>Account Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link href="/login" className="block">
                  <button className="w-full text-sm font-bold text-white border border-white/20 hover:border-white/40 py-2.5 rounded-xl transition-all">
                    Log In
                  </button>
                </Link>
                <Link href="/register" className="block">
                  <button className="w-full btn-harvest justify-center text-sm py-2.5">
                    Sign Up Free
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
