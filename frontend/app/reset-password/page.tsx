'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { fetchApi } from '../../lib/api';
import { Lock, CheckCircle2 } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!token) {
      setErrorMsg('Password reset token is missing from the URL.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-[#F5F0E6] border-agri-border shadow-xl">
      <CardHeader className="text-center">
        <div className="w-12 h-12 rounded-lg bg-agri-dark text-agri-emerald flex items-center justify-center mx-auto mb-2 shadow-md">
          <Lock className="w-6 h-6" />
        </div>
        <Badge variant="emerald" className="w-fit mx-auto mb-1">Set New Password</Badge>
        <CardTitle className="text-xl">Reset Your Password</CardTitle>
        <CardDescription>Enter a new strong password for your MarketLink account.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {errorMsg && <Alert type="error" message={errorMsg} />}
        {successMsg && <Alert type="success" message={successMsg} />}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="New Password"
            type="password"
            placeholder="At least 8 chars, 1 uppercase, 1 number"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="emerald"
            size="md"
            className="w-full mt-2"
            isLoading={isLoading}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Update Password
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center text-xs text-agri-muted">
        Remembered your password?{' '}
        <Link href="/login" className="font-bold text-agri-emerald hover:underline ml-1">
          Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-8">
      <Suspense fallback={<Skeleton className="w-full max-w-md h-80" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
