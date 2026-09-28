'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'unknown';

  const reasonMessages: Record<string, string> = {
    google_denied: 'Google authentication was cancelled or consent was denied by the user.',
    github_denied: 'GitHub authentication was cancelled or consent was denied.',
    linkedin_denied: 'LinkedIn authentication was cancelled or consent was denied.',
    oauth_failed: 'An unexpected authentication error occurred while verifying OAuth tokens with the provider.',
    unknown: 'Authentication process encountered an unexpected issue.',
  };

  const message = reasonMessages[reason] || reasonMessages.unknown;

  return (
    <Card className="w-full max-w-md bg-[#F5F0E6] border-agri-border shadow-xl">
      <CardHeader className="text-center">
        <div className="w-12 h-12 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-2 shadow-md">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <Badge variant="rose" className="w-fit mx-auto mb-1">OAuth Verification Notice</Badge>
        <CardTitle className="text-xl">Authentication Error</CardTitle>
        <CardDescription>We were unable to complete your social login request.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Alert type="error" title="Callback Failure" message={message} />
        
        <p className="text-xs text-agri-muted leading-relaxed text-center">
          Note: For live OAuth provider logins, ensure provider Client ID and Secret environment variables are configured in `.env`.
        </p>
      </CardContent>

      <CardFooter className="justify-between">
        <Link href="/login" className="w-full">
          <Button variant="emerald" size="md" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return to Sign In
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-8">
      <Suspense fallback={<Skeleton className="w-full max-w-md h-80" />}>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
