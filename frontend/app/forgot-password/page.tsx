'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { fetchApi } from '../../lib/api';
import { Sprout, Mail, KeyRound, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const res = await fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setMessage(res.message || 'If an account exists for this email, reset instructions have been sent.');
    } catch (err: any) {
      setMessage('If an account exists for this email, reset instructions have been sent.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-8">
      <Card className="w-full max-w-md bg-[#F5F0E6] border-agri-border shadow-xl">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-lg bg-agri-dark text-agri-emerald flex items-center justify-center mx-auto mb-2 shadow-md">
            <KeyRound className="w-6 h-6" />
          </div>
          <Badge variant="emerald" className="w-fit mx-auto mb-1">Account Recovery</Badge>
          <CardTitle className="text-xl">Forgot Password?</CardTitle>
          <CardDescription>Enter your account email to receive a secure, time-limited reset link.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {message && <Alert type="info" message={message} />}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="emerald"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Send Password Reset Link
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-xs text-agri-muted">
          <Link href="/login" className="font-bold text-agri-emerald hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
