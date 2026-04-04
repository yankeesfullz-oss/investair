"use client";

import { Suspense } from 'react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, LogIn } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { INVESTOR_TOKEN_KEY } from '@/components/Investor/AuthProvider';

export default function InvestorLoginPage() {
  return (
    <Suspense fallback={null}>
      <InvestorLoginPageContent />
    </Suspense>
  );
}

function InvestorLoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/investor/dashboard';
  const months = searchParams.get('months');

  const signupHref = `/investor/signup?redirectTo=${encodeURIComponent(redirectTo)}${months ? `&months=${encodeURIComponent(months)}` : ''}`;

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/api/auth/investor/login', {
        method: 'POST',
        tokenStorageKey: INVESTOR_TOKEN_KEY,
        body: JSON.stringify({ email, password }),
      });

      if (!data?.token) {
        throw new Error('Invalid response from server');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(INVESTOR_TOKEN_KEY, data.token);
      }

      router.replace(redirectTo);
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(251,207,232,0.95),rgba(255,255,255,1)_48%)] px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(17,24,39,0.92))] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-pink-200">Investor access</p>
            <h1 className="max-w-md text-4xl font-semibold leading-tight">Fund your account with dedicated BTC and USDT deposit addresses.</h1>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
            Each investor account receives unique funding rails instantly after signup, so deposits are traceable and investment-ready from the first session.
          </div>
        </section>
        <section className="flex items-center p-6 sm:p-10">
          <div className="w-full">
            <div className="mb-8">
              <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
                <LogIn className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-semibold text-slate-900">Investor login</h2>
              <p className="mt-2 text-sm text-slate-500">Access your wallets and funding dashboard.</p>
            </div>
            {error ? <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-pink-300"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-pink-300"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
                {loading ? 'Signing in...' : 'Log in'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-6 text-sm text-slate-500">
              New to InvestAir?{' '}
              <Link href={signupHref} className="font-medium text-pink-600 hover:text-pink-700">
                Create your investor account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}