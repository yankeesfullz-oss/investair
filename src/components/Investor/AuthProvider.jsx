"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAccessToken, useUser } from '@auth0/nextjs-auth0/client';
import { usePathname, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiClient';

const InvestorAuthContext = createContext({
  user: null,
  wallets: [],
  loading: true,
  logout: () => {},
  refreshWallets: async () => [],
});

const INVESTOR_TOKEN_KEY = 'investor_token';

export function useInvestorAuth() {
  return useContext(InvestorAuthContext);
}

export default function InvestorAuthProvider({ children }) {
  const { user: auth0User, isLoading: authLoading } = useUser();
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/investor/login') || pathname?.startsWith('/investor/signup');

  async function refreshWallets() {
    const nextWallets = await apiFetch('/api/wallets', { tokenStorageKey: INVESTOR_TOKEN_KEY });
    setWallets(nextWallets);
    return nextWallets;
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (typeof window === 'undefined' || authLoading) {
        return;
      }

      if (!auth0User) {
        localStorage.removeItem(INVESTOR_TOKEN_KEY);
        if (mounted) {
          setUser(null);
          setWallets([]);
          setLoading(false);
        }
        if (!isAuthPage) {
          router.replace('/investor/login');
        }
        return;
      }

      const sessionUser = {
        email: auth0User.email,
        fullName: auth0User.name || auth0User.nickname || 'Investor',
        role: 'investor',
        auth0Sub: auth0User.sub,
      };

      try {
        const accessToken = await getAccessToken();
        if (accessToken) {
          localStorage.setItem(INVESTOR_TOKEN_KEY, accessToken);
        }

        if (!accessToken) {
          if (!mounted) {
            return;
          }
          setUser(sessionUser);
          setWallets([]);
          if (isAuthPage) {
            router.replace('/investor/dashboard');
          }
          return;
        }

        const profile = await apiFetch('/api/users/sync', {
          method: 'POST',
          tokenStorageKey: INVESTOR_TOKEN_KEY,
        }).catch(() => apiFetch('/api/users/me', { tokenStorageKey: INVESTOR_TOKEN_KEY })).catch(() => sessionUser);
        if (!mounted) {
          return;
        }

        setUser(profile);
        const nextWallets = await apiFetch('/api/wallets', { tokenStorageKey: INVESTOR_TOKEN_KEY }).catch(() => []);
        if (!mounted) {
          return;
        }
        setWallets(nextWallets);

        if (isAuthPage) {
          router.replace('/investor/dashboard');
        }
      } catch {
        if (!mounted) {
          return;
        }

        setUser(sessionUser);
        setWallets([]);

        if (typeof window !== 'undefined') {
          localStorage.removeItem(INVESTOR_TOKEN_KEY);
        }

        if (isAuthPage) {
          router.replace('/investor/dashboard');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [auth0User, authLoading, isAuthPage, pathname, router]);

  function logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(INVESTOR_TOKEN_KEY);
      window.location.assign('/auth/logout?returnTo=/investor/login');
      return;
    }
    setUser(null);
    setWallets([]);
    router.replace('/investor/login');
  }

  return (
    <InvestorAuthContext.Provider value={{ user, wallets, loading, logout, refreshWallets }}>
      {children}
    </InvestorAuthContext.Provider>
  );
}

export { INVESTOR_TOKEN_KEY };