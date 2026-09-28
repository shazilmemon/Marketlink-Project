'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Tractor, Mail, Lock, LogIn, Eye, EyeOff,
  Shield, Zap, Star, ArrowRight, AlertTriangle, CheckCircle2
} from 'lucide-react';

function getRoleRedirect(role?: string): string {
  if (role === 'FARMER') return '/farmer/dashboard';
  if (role === 'ADMIN') return '/admin/dashboard';
  return '/dashboard';
}

function getErrorMessage(err: any): string {
  const status = err?.status;
  const message = err?.message || '';
  if (status === 401 || message.toLowerCase().includes('invalid')) return 'Invalid email or password. Please try again.';
  if (status === 403) return 'Your account has been deactivated. Please contact support.';
  if (status === 429) return 'Too many login attempts. Please wait a moment and try again.';
  if (status >= 500) return 'Server error. Please try again in a few moments.';
  if (!navigator.onLine || message.includes('Failed to fetch')) return 'Network error. Please check your connection.';
  return message || 'Login failed. Please check your credentials.';
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.success && res.data?.user) {
        const userData = res.data.user;
        setSuccessMsg('Welcome back! Redirecting to your dashboard...');
        login(userData);
        router.push(getRoleRedirect(userData.role));
      } else {
        setErrorMsg(res.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const submitDisabled = isLoading || !!successMsg;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 pt-28 sm:pt-32 pb-16 overflow-hidden bg-[#0A1610] text-white">
      {/* ── 1. Full-Bleed Scenic Farm Background ── */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/images/cinematic_hero_farm.jpg')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1610]/92 via-[#0A1610]/85 to-[#0A1610]/95 z-10" />
        <div className="absolute inset-0 bg-black/40 z-10" />
      </div>

      {/* ── 2. Card Container ── */}
      <div className="relative z-20 w-full max-w-md transition-all duration-300">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E5B54F] to-[#C9A45C] text-[#10251D] flex items-center justify-center shadow-lg shadow-[#E5B54F]/25 mx-auto mb-4">
            <Tractor className="w-7 h-7 text-[#10251D]" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            Welcome Back
          </h1>
          <p className="text-stone-300 text-sm mt-2">
            Sign in to your MarketLink account
          </p>
        </div>

        {/* Micro Trust Indicators */}
        <div className="flex items-center justify-center gap-5 sm:gap-7 mb-6 text-xs text-stone-300 font-medium">
          <span className="inline-flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#E5B54F]" /> Secure &amp; Private
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#E5B54F]" /> Instant Access
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-[#E5B54F] text-[#E5B54F]" /> 2,500+ Members
          </span>
        </div>

        {/* Emerald Glassmorphism Card */}
        <div className="rounded-3xl bg-[#0C1A14]/90 backdrop-blur-xl border border-[#1A3324] shadow-2xl p-6 sm:p-8">
          
          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-bold text-[#E9DFC9] tracking-wider uppercase">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative flex items-center rounded-xl bg-black/45 border border-white/15 focus-within:border-[#E5B54F] focus-within:ring-2 focus-within:ring-[#E5B54F]/20 transition-all">
                <span className="pl-4 text-[#E5B54F]">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent px-3.5 py-3 text-sm text-white placeholder-stone-500 focus:outline-none font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-bold text-[#E9DFC9] tracking-wider uppercase">
                Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative flex items-center rounded-xl bg-black/45 border border-white/15 focus-within:border-[#E5B54F] focus-within:ring-2 focus-within:ring-[#E5B54F]/20 transition-all">
                <span className="pl-4 text-[#E5B54F]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-transparent px-3.5 py-3 text-sm text-white placeholder-stone-500 focus:outline-none font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="pr-4 text-stone-400 hover:text-[#E5B54F] transition-colors focus:outline-none"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-right mt-1">
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#E5B54F] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitDisabled}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#E5B54F] hover:bg-[#d4a33e] text-[#10251D] font-extrabold px-8 py-3.5 text-sm shadow-xl shadow-[#E5B54F]/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Logins */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative bg-[#0C1A14] px-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Or continue with
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {['Google', 'GitHub', 'LinkedIn'].map(provider => (
              <button
                key={provider}
                type="button"
                className="py-2.5 px-3 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 hover:border-[#E5B54F]/40 text-stone-300 hover:text-white text-xs font-bold transition-all text-center focus:outline-none"
              >
                {provider}
              </button>
            ))}
          </div>

        </div>

        {/* Footer links */}
        <div className="text-center mt-5 text-xs text-stone-300">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#E5B54F] font-bold hover:underline">
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
}
