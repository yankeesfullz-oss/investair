"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, UserPlus, WalletCards } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { INVESTOR_TOKEN_KEY } from '@/components/Investor/AuthProvider';

export default function InvestorSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/api/auth/investor/register', {
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

      router.replace('/investor/dashboard');
    } catch (requestError) {
      setError(requestError.message || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fff7fb_0%,_#ffffff_38%,_#f8fbff_100%)] px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:grid-cols-[0.94fr_1.06fr]">
        <section className="flex items-center border-b border-slate-100 p-6 sm:p-10 lg:border-b-0 lg:border-r">
          <div className="w-full">
            <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
              <UserPlus className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-semibold text-slate-900">Create an investor account</h1>
            <p className="mt-2 text-sm text-slate-500">Sign up and receive your dedicated BTC and USDT funding addresses instantly.</p>
            {error ? <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div> : null}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-pink-300"
                  placeholder="investor@example.com"
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
                  placeholder="Create a secure password"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
                {loading ? 'Creating account...' : 'Create account'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-6 text-sm text-slate-500">
              Already registered?{' '}
              <Link href="/investor/login" className="font-medium text-pink-600 hover:text-pink-700">
                Log in here
              </Link>
            </p>
          </div>
        </section>
        <section className="flex items-center bg-[linear-gradient(180deg,_rgba(15,23,42,0.98),_rgba(29,78,216,0.88))] p-6 text-white sm:p-10">
          <div className="w-full space-y-6">
            <p className="inline-flex rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-pink-200">Instant wallet provisioning</p>
            <h2 className="max-w-lg text-4xl font-semibold leading-tight">Your dashboard is ready the moment your account is created.</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <WalletCards className="mb-4 h-6 w-6 text-pink-200" />
                <div className="text-lg font-semibold">Unique BTC address</div>
                <p className="mt-2 text-sm text-slate-300">Receive your personal Bitcoin deposit address automatically on signup.</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <WalletCards className="mb-4 h-6 w-6 text-pink-200" />
                <div className="text-lg font-semibold">Unique USDT address</div>
                <p className="mt-2 text-sm text-slate-300">Fund your portfolio with a dedicated Tether deposit wallet immediately.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}