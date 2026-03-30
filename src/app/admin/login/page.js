"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiClient';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/auth/admin/login', {
        method: 'POST',
        tokenStorageKey: 'admin_token',
        body: JSON.stringify({ email, password }),
      });
      if (data?.token) {
        if (typeof window !== 'undefined') localStorage.setItem('admin_token', data.token);
        router.push('/admin');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,207,232,0.9),_rgba(255,255,255,1)_55%)] p-4">
      <div className="w-full max-w-md rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-[0_30px_100px_rgba(244,114,182,0.18)] backdrop-blur">
        <h1 className="mb-2 text-xl font-semibold text-slate-900">Admin Login</h1>
        <p className="mb-4 text-sm text-slate-500">Sign in to manage the InvestAir platform.</p>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 outline-none transition focus:border-pink-300" />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="rounded-2xl bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800 disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
