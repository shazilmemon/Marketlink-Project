'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchApi } from '../../lib/api';
import {
  Mail, Lock, User, Store, UserPlus, Eye, EyeOff,
  ShoppingBag, Tractor, Package, Check, ArrowRight,
  Shield, Star, Zap, AlertTriangle, CheckCircle2, ArrowLeft
} from 'lucide-react';

type RoleKey = 'CUSTOMER' | 'FARMER' | 'PARTNER';

const ROLES: { key: RoleKey; label: string; sub: string; icon: React.ReactNode }[] = [
  {
    key: 'CUSTOMER',
    label: 'Customer',
    sub: 'Browse & pre-order fresh local produce',
    icon: <ShoppingBag className="w-5 h-5" />,
  },
  {
    key: 'FARMER',
    label: 'Farmer',
    sub: 'Sell your harvest at local markets',
    icon: <Tractor className="w-5 h-5" />,
  },
  {
    key: 'PARTNER',
    label: 'Vendor',
    sub: 'Partner distributor or agri-business',
    icon: <Package className="w-5 h-5" />,
  },
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ chars', ok: password.length >= 8 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
    { label: 'Symbol', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['#ef4444', '#f97316', '#E5B54F', '#22c55e'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{
              background: i < score ? colors[score - 1] : 'rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        {checks.map(c => (
          <span
            key={c.label}
            className={`text-[10px] font-medium flex items-center gap-1 ${
              c.ok ? 'text-[#E5B54F]' : 'text-stone-400'
            }`}
          >
            <Check className="w-2.5 h-2.5" />
            {c.label}
          </span>
        ))}
        {score > 0 && (
          <span className="text-[10px] font-bold" style={{ color: colors[score - 1] }}>
            {labels[score - 1]}
          </span>
        )}
      </div>
    </div>
  );
}

function FormInput({
  label, type = 'text', placeholder, value, onChange, icon, required = false,
  helperText, extra
}: {
  label: string; type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; icon: React.ReactNode; required?: boolean;
  helperText?: string; extra?: React.ReactNode;
}) {
  const [showPw, setShowPw] = useState(false);
  const isPw = type === 'password';
  const inputType = isPw ? (showPw ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label className="text-xs font-bold text-[#E9DFC9] tracking-wider uppercase">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <div className="relative flex items-center rounded-xl bg-black/45 border border-white/15 focus-within:border-[#E5B54F] focus-within:ring-2 focus-within:ring-[#E5B54F]/20 transition-all">
        <span className="pl-4 text-[#E5B54F]">
          {icon}
        </span>
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          className="w-full bg-transparent px-3.5 py-3 text-sm text-white placeholder-stone-500 focus:outline-none font-sans"
        />
        {isPw && (
          <button
            type="button"
            onClick={() => setShowPw(s => !s)}
            className="pr-4 text-stone-400 hover:text-[#E5B54F] transition-colors focus:outline-none"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {helperText && <span className="text-[11px] text-stone-400 leading-tight">{helperText}</span>}
      {extra}
    </div>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramRole = searchParams.get('role')?.toUpperCase() as RoleKey;
  const initialRole: RoleKey = ['CUSTOMER', 'FARMER', 'PARTNER'].includes(paramRole) ? paramRole : 'CUSTOMER';

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<RoleKey>(initialRole);
  const [farmName, setFarmName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [step, setStep]         = useState<'role' | 'form'>('role');

  const selectedRole = ROLES.find(r => r.key === role)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const payload: any = { name, email, password, role };
      if (role === 'FARMER' && farmName) payload.farmName = farmName;
      if (role === 'PARTNER' && farmName) payload.farmName = farmName;

      const res = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccessMsg('Account created! Redirecting to your dashboard...');
        setTimeout(() => {
          if (role === 'FARMER') router.push('/farmer/dashboard');
          else if (role === 'CUSTOMER') router.push('/dashboard');
          else router.push('/dashboard');
        }, 1200);
      } else {
        setErrorMsg(res.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="relative z-20 w-full max-w-xl transition-all duration-300">
        
        {/* Top Branding & Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E5B54F] to-[#C9A45C] text-[#10251D] flex items-center justify-center shadow-lg shadow-[#E5B54F]/25 mx-auto mb-4">
            <Tractor className="w-7 h-7 text-[#10251D]" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            Join Market<span className="text-[#E5B54F]">Link</span>
          </h1>
          <p className="text-stone-300 text-sm mt-2">
            {step === 'role' ? 'Choose your account type to get started' : `Setting up your ${selectedRole.label} account`}
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
          
          {/* ── Step 1: Role Selection ── */}
          {step === 'role' && (
            <div>
              <p className="text-xs text-stone-300 text-center mb-5">
                Your role determines your dashboard, features, and permissions.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
                {ROLES.map(r => {
                  const active = role === r.key;
                  return (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setRole(r.key)}
                      className={`relative flex flex-col items-center text-center p-5 rounded-2xl transition-all duration-200 cursor-pointer ${
                        active
                          ? 'border-2 border-[#E5B54F] bg-[#E5B54F]/15 shadow-lg shadow-[#E5B54F]/20 scale-[1.02]'
                          : 'border border-white/10 bg-black/40 hover:border-white/20 text-stone-300 hover:scale-[1.01]'
                      }`}
                    >
                      {active && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#E5B54F] text-[#10251D] flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                        active ? 'bg-[#E5B54F] text-[#10251D]' : 'bg-white/5 text-stone-300'
                      }`}>
                        {r.icon}
                      </div>
                      <span className="font-serif font-bold text-base text-white mb-1">
                        {r.label}
                      </span>
                      <span className="text-[11px] text-stone-300 leading-snug">
                        {r.sub}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#E5B54F] hover:bg-[#d4a33e] text-[#10251D] font-extrabold px-8 py-3.5 text-sm shadow-xl shadow-[#E5B54F]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Continue as {selectedRole.label}</span>
                <ArrowRight className="w-4 h-4 text-[#10251D]" />
              </button>
            </div>
          )}

          {/* ── Step 2: Input Details Form ── */}
          {step === 'form' && (
            <div>
              {/* Back navigation & current role badge */}
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setStep('role')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-300 hover:text-[#E5B54F] transition-colors focus:outline-none"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change role</span>
                </button>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E5B54F] bg-black/40 px-3 py-1 rounded-full border border-[#E5B54F]/30">
                  {selectedRole.icon}
                  <span>{selectedRole.label}</span>
                </span>
              </div>

              {/* Alert Feedback */}
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
                <FormInput
                  label="Full Name"
                  placeholder="e.g. Marcus Vance"
                  value={name}
                  onChange={setName}
                  icon={<User className="w-4 h-4" />}
                  required
                />

                <FormInput
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={setEmail}
                  icon={<Mail className="w-4 h-4" />}
                  required
                />

                {(role === 'FARMER' || role === 'PARTNER') && (
                  <FormInput
                    label={role === 'FARMER' ? 'Farm / Stall Name' : 'Business Name'}
                    placeholder={role === 'FARMER' ? 'Green Valley Organics' : 'Your business name'}
                    value={farmName}
                    onChange={setFarmName}
                    icon={<Store className="w-4 h-4" />}
                    required
                    helperText={role === 'FARMER'
                      ? 'Your stall will be created with PENDING verification status.'
                      : 'Your vendor partner account requires admin approval.'}
                  />
                )}

                <FormInput
                  label="Password"
                  type="password"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  value={password}
                  onChange={setPassword}
                  icon={<Lock className="w-4 h-4" />}
                  required
                  extra={<PasswordStrength password={password} />}
                />

                <button
                  type="submit"
                  disabled={isLoading || !!successMsg}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#E5B54F] hover:bg-[#d4a33e] text-[#10251D] font-extrabold px-8 py-3.5 text-sm shadow-xl shadow-[#E5B54F]/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                >
                  {isLoading ? (
                    <span>Creating Account...</span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create {selectedRole.label} Account</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Footer links */}
        <div className="text-center mt-5 text-xs text-stone-300">
          Already have an account?{' '}
          <Link href="/login" className="text-[#E5B54F] font-bold hover:underline">
            Sign In
          </Link>
        </div>

        <p className="text-center mt-2 text-[11px] text-stone-400">
          By creating an account, you agree to our{' '}
          <span className="text-[#E5B54F] cursor-pointer hover:underline">Terms of Service</span> and{' '}
          <span className="text-[#E5B54F] cursor-pointer hover:underline">Privacy Policy</span>
        </p>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A1610] flex items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-[#E5B54F] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
