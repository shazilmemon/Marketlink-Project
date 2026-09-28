'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchApi } from '../lib/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'FARMER' | 'ADMIN' | 'PARTNER';
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  verificationStatus: 'NOT_REQUIRED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  lastLoginAt?: string;
  createdAt: string;
}

export interface ConnectedAccount {
  provider: 'EMAIL' | 'GOOGLE' | 'GITHUB' | 'LINKEDIN';
  providerEmail?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  connectedAccounts: ConnectedAccount[];
  login: (userData: UserProfile) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);

  const fetchConnectedAccounts = useCallback(async () => {
    try {
      const res = await fetchApi<{ accounts: ConnectedAccount[] }>('/auth/connected-accounts');
      if (res.success && res.data?.accounts) {
        setConnectedAccounts(res.data.accounts);
      }
    } catch {
      // Non-critical: silently ignore if unauthenticated
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetchApi<{ user: UserProfile }>('/auth/me');
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        // Fetch connected accounts in background (non-blocking)
        fetchConnectedAccounts();
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err: any) {
      // 401 is expected when not logged in — treat as unauthenticated
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [fetchConnectedAccounts]);

  // Initialize auth on mount — runs once
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /**
   * Call after a successful login response.
   * Immediately sets the user in context (no refetch needed since login
   * response already contains the user data and cookies are set).
   */
  const login = useCallback((userData: UserProfile) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoading(false); // Ensure loading is cleared
    // Fetch connected accounts in background
    fetchConnectedAccounts();
  }, [fetchConnectedAccounts]);

  const logout = useCallback(async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore logout API errors — still clear local state
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setConnectedAccounts([]);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    await fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        connectedAccounts,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
