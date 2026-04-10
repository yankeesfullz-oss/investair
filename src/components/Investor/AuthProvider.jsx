"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiClient';

const InvestorAuthContext = createContext({
  user: null,
  wallets: [],
  loading: true,
  login: async () => null,
  signup: async () => null,
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

  async function loadSessionFromToken() {
    const [profile, nextWallets] = await Promise.all([
      apiFetch('/api/users/me', { tokenStorageKey: INVESTOR_TOKEN_KEY }),
      apiFetch('/api/wallets', { tokenStorageKey: INVESTOR_TOKEN_KEY }).catch(() => []),
    ]);

    setUser(profile || null);
    setWallets(Array.isArray(nextWallets) ? nextWallets : []);
    return profile;
  }

  async function refreshWallets() {
    const nextWallets = await apiFetch('/api/wallets', { tokenStorageKey: INVESTOR_TOKEN_KEY });
    setWallets(nextWallets);
    return nextWallets;
  }

  async function login({ email, password }) {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      tokenStorageKey: INVESTOR_TOKEN_KEY,
      body: JSON.stringify({ email, password }),
    });

    if (typeof window !== 'undefined' && response?.token) {
      localStorage.setItem(INVESTOR_TOKEN_KEY, response.token);
    }

    if (response?.user) {
      setUser(response.user);
    }

    await loadSessionFromToken();
    return response;
  }

  async function signup({ fullName, email, password, confirmPassword, referralCode }) {
    const response = await apiFetch('/api/auth/signup', {
      method: 'POST',
      tokenStorageKey: INVESTOR_TOKEN_KEY,
      body: JSON.stringify({ fullName, email, password, confirmPassword, referralCode }),
    });

    if (typeof window !== 'undefined' && response?.token) {
      localStorage.setItem(INVESTOR_TOKEN_KEY, response.token);
    }

    if (response?.user) {
      setUser(response.user);
    }

    await loadSessionFromToken();
    return response;
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (typeof window === 'undefined') {
        return;
      }

      const token = localStorage.getItem(INVESTOR_TOKEN_KEY);
      if (!token) {
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

      try {
        const profile = await loadSessionFromToken();
        if (!mounted) {
          return;
        }

        if (isAuthPage) {
          router.replace(profile?.role === 'investor' ? '/investor/dashboard' : '/');
        }
      } catch {
        if (!mounted) {
          return;
        }

        setUser(null);
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

    void load();
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
    <InvestorAuthContext.Provider value={{ user, wallets, loading, login, signup, logout, refreshWallets }}>
      {children}
    </InvestorAuthContext.Provider>
  );
}

export { INVESTOR_TOKEN_KEY };