'use client';

import React from 'react';
import { ProtectedRoute } from '../../../components/shared/ProtectedRoute';
import { useAuth } from '../../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ShieldCheck, Mail, Github, Linkedin, CheckCircle2, Plus } from 'lucide-react';

export default function ConnectedAccountsPage() {
  const { user, connectedAccounts } = useAuth();

  const providers = [
    {
      id: 'EMAIL',
      name: 'Email & Password',
      icon: <Mail className="w-5 h-5 text-agri-dark" />,
      description: 'Standard MarketLink credential authentication.',
    },
    {
      id: 'GOOGLE',
      name: 'Google OAuth',
      icon: <span className="font-bold text-sm text-blue-600">G</span>,
      description: 'Sign in with your Google Workspace or Personal account.',
    },
    {
      id: 'GITHUB',
      name: 'GitHub Developer',
      icon: <Github className="w-5 h-5 text-slate-800" />,
      description: 'Sign in with your GitHub developer identity.',
    },
    {
      id: 'LINKEDIN',
      name: 'LinkedIn OpenID Connect',
      icon: <Linkedin className="w-5 h-5 text-blue-700" />,
      description: 'Sign in with your LinkedIn professional identity.',
    },
  ];

  const isConnected = (providerId: string) => {
    return connectedAccounts.some((acc) => acc.provider === providerId) || user?.email?.includes(providerId.toLowerCase());
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-12">
        <div className="flex flex-col gap-2">
          <Badge variant="emerald" className="w-fit" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Security Settings
          </Badge>
          <h1 className="text-3xl font-extrabold text-agri-dark tracking-tight">Connected Accounts & Identity Providers</h1>
          <p className="text-xs md:text-sm text-agri-muted">
            Manage single sign-on identity connections linked to your MarketLink user profile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providers.map((p) => {
            const connected = isConnected(p.id);
            return (
              <Card key={p.id} className="hover:border-agri-emerald/50 transition-all">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-md bg-agri-surface border border-agri-border flex items-center justify-center">
                      {p.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <CardDescription className="text-[11px] mt-0.5">{p.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex items-center justify-between border-t border-agri-border/60">
                  {connected ? (
                    <Badge variant="emerald" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="slate">Not Connected</Badge>
                  )}

                  {!connected && (
                    <a href={`/api/v1/auth/${p.id.toLowerCase()}`}>
                      <Button variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                        Connect {p.name.split(' ')[0]}
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </ProtectedRoute>
  );
}
