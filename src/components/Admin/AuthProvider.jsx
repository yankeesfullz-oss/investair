"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiFetch } from '@/lib/apiClient';

const AuthContext = createContext({ user: null, loading: true });
const ADMIN_TOKEN_KEY = 'admin_token';

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    if (pathname?.startsWith('/admin/login')) {
      setUser(null);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    async function load() {
      setLoading(true);
      try {
        const profile = await apiFetch('/api/users/me', { tokenStorageKey: ADMIN_TOKEN_KEY });
        if (!mounted) return;
        setUser(profile);
        // redirect non-admins away from admin routes
        if (profile?.role !== 'admin' && pathname?.startsWith('/admin')) {
          router.push('/');
        }
      } catch (err) {
        if (!mounted) return;
        setUser(null);
        // if not on login page, redirect to admin login
        if (!pathname?.startsWith('/admin/login')) {
          router.push('/admin/login');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, [pathname]);

  function logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
    setUser(null);
    router.push('/admin/login');
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
