"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
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
      if (typeof window === 'undefined') {
        return;
      }

      const token = localStorage.getItem(INVESTOR_TOKEN_KEY);
      if (!token) {
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

      try {
        const profile = await apiFetch('/api/users/me', { tokenStorageKey: INVESTOR_TOKEN_KEY });
        if (!mounted) {
          return;
        }

        if (profile?.role !== 'investor') {
          localStorage.removeItem(INVESTOR_TOKEN_KEY);
          setUser(null);
          setWallets([]);
          setLoading(false);
          router.replace('/investor/login');
          return;
        }

        setUser(profile);
        const nextWallets = await apiFetch('/api/wallets', { tokenStorageKey: INVESTOR_TOKEN_KEY });
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
        localStorage.removeItem(INVESTOR_TOKEN_KEY);
        setUser(null);
        setWallets([]);
        if (!isAuthPage) {
          router.replace('/investor/login');
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
  }, [isAuthPage, pathname, router]);

  function logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(INVESTOR_TOKEN_KEY);
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