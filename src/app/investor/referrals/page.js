"use client";

import { useEffect, useMemo, useState } from 'react';
import { Copy, Share2, Users } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { apiFetch } from '@/lib/apiClient';
import { formatCurrency, formatDateTime } from '@/lib/dashboardFormatting';

function buildReferralLink(referralCode) {
  if (!referralCode || typeof window === 'undefined') {
    return '';
  }

  return `${window.location.origin}/investor/signup?ref=${encodeURIComponent(referralCode)}`;
}

export default function InvestorReferralsPage() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch('/api/referrals/me', { tokenStorageKey: 'investor_token' });
        if (!cancelled) {
          setSummary(data);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error.message || 'Unable to load referrals right now.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const referralLink = useMemo(() => buildReferralLink(summary?.referralCode), [summary?.referralCode]);

  async function handleCopy() {
    if (!referralLink || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function handleShare() {
    if (!referralLink) {
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          text: `Join InvestAir with my referral link and earn access to the platform.`,
          title: 'InvestAir referral link',
          url: referralLink,
        });
        return;
      } catch {
        return;
      }
    }

    await handleCopy();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-emerald-700">Referrals</div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Earn $500 when a referred investor completes their first $3,000+ investment.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Share your link through WhatsApp, Instagram, SMS, email, or any app on your phone. Once your referral signs up and completes a qualifying investment, your commission appears here for payout tracking.</p>
        {message ? <p className="mt-3 text-sm text-rose-600">{message}</p> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Pending commissions</div>
          <div className="mt-3 text-3xl font-semibold text-slate-950">{formatCurrency(summary?.totals?.totalPending || 0)}</div>
        </div>
        <div className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Paid commissions</div>
          <div className="mt-3 text-3xl font-semibold text-slate-950">{formatCurrency(summary?.totals?.totalPaid || 0)}</div>
        </div>
        <div className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Qualified referrals</div>
          <div className="mt-3 text-3xl font-semibold text-slate-950">{String(summary?.commissions?.length || 0)}</div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(236,253,245,0.95),rgba(255,255,255,0.95))] p-6 shadow-[0_20px_70px_rgba(16,185,129,0.12)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-700">
              <Users className="h-3.5 w-3.5" />
              Shareable link
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">Invite new investors with your personal code.</h2>
            <p className="mt-2 text-sm text-slate-600">Referral code: <span className="font-semibold text-slate-900">{summary?.referralCode || 'Loading...'}</span></p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleCopy} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              <Copy className="h-4 w-4" />
              {copied ? 'Copied' : 'Copy link'}
            </button>
            <button type="button" onClick={handleShare} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
              <Share2 className="h-4 w-4" />
              Share link
            </button>
          </div>
        </div>
        <div className="mt-5 rounded-[1.5rem] border border-emerald-100 bg-white px-4 py-4 text-sm text-slate-700 break-all">{referralLink || 'Generating your referral link...'}</div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Referral commissions</h2>
            <p className="mt-1 text-sm text-slate-500">Your one-time commission is earned when each referred investor completes their first qualifying investment.</p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">Loading referrals…</div>
        ) : !summary?.commissions?.length ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">No qualified referrals yet.</div>
        ) : (
          <div className="space-y-3">
            {summary.commissions.map((commission) => (
              <article key={commission._id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{commission.referredInvestorUser?.fullName || commission.referredInvestorUser?.email || 'Referred investor'}</div>
                    <div className="mt-1 text-sm text-slate-500">{commission.referredInvestorUser?.email || 'Email unavailable'}</div>
                    <div className="mt-2 text-sm text-slate-600">Qualified investment: {formatCurrency(commission.qualifyingAmount || 0)} on {formatDateTime(commission.earnedAt)}</div>
                    {commission.paidAt ? <div className="mt-1 text-sm text-slate-600">Paid on {formatDateTime(commission.paidAt)}</div> : null}
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-2xl font-semibold text-slate-900">{formatCurrency(commission.commissionAmount || 0)}</div>
                    <StatusBadge status={commission.status} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}