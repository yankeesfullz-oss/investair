"use client";

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, LogIn } from 'lucide-react';

export default function InvestorLoginPage() {
  return (
    <Suspense fallback={null}>
      <InvestorLoginPageContent />
    </Suspense>
  );
}

function InvestorLoginPageContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/investor/dashboard';
  const months = searchParams.get('months');
  const googleConnection = process.env.NEXT_PUBLIC_AUTH0_GOOGLE_CONNECTION || 'google-oauth2';

  const signupHref = `/investor/signup?redirectTo=${encodeURIComponent(redirectTo)}${months ? `&months=${encodeURIComponent(months)}` : ''}`;
  const loginHref = `/auth/login?returnTo=${encodeURIComponent(redirectTo)}`;
  const googleLoginHref = `/auth/login?connection=${encodeURIComponent(googleConnection)}&returnTo=${encodeURIComponent(redirectTo)}`;
  const signupAuthHref = `/auth/login?screen_hint=signup&returnTo=${encodeURIComponent(redirectTo)}`;

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
              <p className="mt-2 text-sm text-slate-500">Use Google for one-click access, or continue with email and password through Auth0.</p>
            </div>
            <div className="space-y-4">
              <a href={googleLoginHref} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800">
                Continue with Google
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href={loginHref} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                Continue with email or password
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href={signupAuthHref} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-pink-200 bg-pink-50 px-5 py-3 font-medium text-pink-700 transition hover:bg-pink-100">
                Create investor account
                <ArrowRight className="h-4 w-4" />
              </a>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                The Google button jumps straight to Google through Auth0. The standard option keeps Auth0 email/password available.
              </div>
            </div>
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