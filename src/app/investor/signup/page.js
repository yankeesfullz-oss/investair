"use client";

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, UserPlus, WalletCards } from 'lucide-react';
import { useInvestorAuth } from '@/components/Investor/AuthProvider';
import { PASSWORD_REQUIREMENTS_TEXT, validateInvestorSignupForm } from '@/lib/investorAuthValidation';

export default function InvestorSignupPage() {
  return (
    <Suspense fallback={null}>
      <InvestorSignupPageContent />
    </Suspense>
  );
}

function InvestorSignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signup, loading } = useInvestorAuth();
  const redirectTo = searchParams.get('redirectTo') || '/investor/dashboard';
  const months = searchParams.get('months');
  const referralCode = searchParams.get('ref') || '';
  const loginHref = `/investor/login?redirectTo=${encodeURIComponent(redirectTo)}${months ? `&months=${encodeURIComponent(months)}` : ''}${referralCode ? `&ref=${encodeURIComponent(referralCode)}` : ''}`;
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectTo);
    }
  }, [loading, redirectTo, router, user]);

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setServerError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateInvestorSignupForm(form);
    setErrors(nextErrors);
    setServerError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await signup({ ...form, referralCode });
      router.replace(redirectTo);
    } catch (error) {
      setServerError(error.message || 'Unable to create your account right now.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7fb_0%,#ffffff_38%,#f8fbff_100%)] px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:grid-cols-[0.94fr_1.06fr]">
        <section className="flex items-center border-b border-slate-100 p-6 sm:p-10 lg:border-b-0 lg:border-r">
          <div className="w-full">
            <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
              <UserPlus className="h-6 w-6" />
            </div>
            {referralCode ? <div className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">Referral code applied: {referralCode}</div> : null}
            <h1 className="text-3xl font-semibold text-slate-900">Create an investor account</h1>
            <p className="mt-2 text-sm text-slate-500">Create your account with your full name, email address, and a strong password.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Full name</label>
                <input
                  value={form.fullName}
                  onChange={(event) => handleChange('fullName', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-300"
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
                {errors.fullName ? <p className="mt-2 text-sm text-rose-600">{errors.fullName}</p> : null}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-300"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email ? <p className="mt-2 text-sm text-rose-600">{errors.email}</p> : null}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-pink-300">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(event) => handleChange('password', event.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="Create a password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="ml-3 text-slate-500 transition hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">{PASSWORD_REQUIREMENTS_TEXT}</p>
                {errors.password ? <p className="mt-2 text-sm text-rose-600">{errors.password}</p> : null}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Confirm password</label>
                <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-pink-300">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(event) => handleChange('confirmPassword', event.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="ml-3 text-slate-500 transition hover:text-slate-700"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword ? <p className="mt-2 text-sm text-rose-600">{errors.confirmPassword}</p> : null}
              </div>
              {serverError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{serverError}</div> : null}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Creating account...' : 'Create investor account'}
              </button>
            </form>
            <p className="mt-6 text-sm text-slate-500">
              Already registered?{' '}
              <Link href={loginHref} className="font-medium text-pink-600 hover:text-pink-700">
                Log in here
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}