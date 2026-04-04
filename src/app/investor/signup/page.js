"use client";

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, UserPlus, WalletCards } from 'lucide-react';

export default function InvestorSignupPage() {
  return (
    <Suspense fallback={null}>
      <InvestorSignupPageContent />
    </Suspense>
  );
}

function InvestorSignupPageContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/investor/dashboard';
  const months = searchParams.get('months');
  const googleConnection = process.env.NEXT_PUBLIC_AUTH0_GOOGLE_CONNECTION || 'google-oauth2';

  const loginHref = `/investor/login?redirectTo=${encodeURIComponent(redirectTo)}${months ? `&months=${encodeURIComponent(months)}` : ''}`;
  const signupHref = `/auth/login?screen_hint=signup&returnTo=${encodeURIComponent(redirectTo)}`;
  const googleSignupHref = `/auth/login?screen_hint=signup&connection=${encodeURIComponent(googleConnection)}&returnTo=${encodeURIComponent(redirectTo)}`;
  const authLoginHref = `/auth/login?returnTo=${encodeURIComponent(redirectTo)}`;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7fb_0%,#ffffff_38%,#f8fbff_100%)] px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:grid-cols-[0.94fr_1.06fr]">
        <section className="flex items-center border-b border-slate-100 p-6 sm:p-10 lg:border-b-0 lg:border-r">
          <div className="w-full">
            <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
              <UserPlus className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-semibold text-slate-900">Create an investor account</h1>
            <p className="mt-2 text-sm text-slate-500">Create your account with Google in one click, or use Auth0 email/password if you prefer.</p>
            <div className="mt-6 space-y-4">
              <a href={googleSignupHref} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800">
                Continue with Google
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href={signupHref} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                Sign up with email or password
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href={authLoginHref} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-pink-200 bg-pink-50 px-5 py-3 font-medium text-pink-700 transition hover:bg-pink-100">
                Already have an account? Log in
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              Already registered?{' '}
              <Link href={loginHref} className="font-medium text-pink-600 hover:text-pink-700">
                Log in here
              </Link>
            </p>
          </div>
        </section>
        <section className="flex items-center bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(29,78,216,0.88))] p-6 text-white sm:p-10">
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