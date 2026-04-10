"use client";

import { useEffect, useMemo, useState } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import { apiFetch } from '@/lib/apiClient';
import { formatCurrency, formatDateTime } from '@/lib/dashboardFormatting';

export default function AdminPayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [payouts, setPayouts] = useState([]);
  const [processingId, setProcessingId] = useState('');
  const [referralCommissions, setReferralCommissions] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [payoutData, referralData] = await Promise.all([
          apiFetch('/api/payouts', { tokenStorageKey: 'admin_token' }),
          apiFetch('/api/referrals/admin/commissions', { tokenStorageKey: 'admin_token' }),
        ]);

        if (!cancelled) {
          setPayouts(Array.isArray(payoutData) ? payoutData : []);
          setReferralCommissions(Array.isArray(referralData) ? referralData : []);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error.message || 'Unable to load payout activity.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    const interval = window.setInterval(load, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const pendingReferralTotal = useMemo(
    () => referralCommissions.filter((commission) => commission.status === 'earned').reduce((sum, commission) => sum + Number(commission.commissionAmount || 0), 0),
    [referralCommissions]
  );
  const paidReferralTotal = useMemo(
    () => referralCommissions.filter((commission) => commission.status === 'paid').reduce((sum, commission) => sum + Number(commission.commissionAmount || 0), 0),
    [referralCommissions]
  );
  const propertyPayoutTotal = useMemo(
    () => payouts.filter((payout) => payout.source !== 'referral_commission').reduce((sum, payout) => sum + Number(payout.amount || 0), 0),
    [payouts]
  );

  async function refresh() {
    const [payoutData, referralData] = await Promise.all([
      apiFetch('/api/payouts', { tokenStorageKey: 'admin_token' }),
      apiFetch('/api/referrals/admin/commissions', { tokenStorageKey: 'admin_token' }),
    ]);

    setPayouts(Array.isArray(payoutData) ? payoutData : []);
    setReferralCommissions(Array.isArray(referralData) ? referralData : []);
  }

  async function payReferralCommission(commissionId) {
    setProcessingId(commissionId);
    setMessage('');

    try {
      const adminNote = window.prompt('Admin note (optional):', '') || '';
      await apiFetch(`/api/referrals/${commissionId}/pay`, {
        tokenStorageKey: 'admin_token',
        method: 'PATCH',
        body: JSON.stringify({ adminNote }),
      });

      setMessage('Referral commission paid successfully.');
      await refresh();
    } catch (error) {
      setMessage(error.message || 'Unable to pay referral commission.');
    } finally {
      setProcessingId('');
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="inline-flex rounded-full border border-pink-100 bg-pink-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-pink-600">Payouts</div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Track automatic property payouts and referral commissions in one place.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Use this page to review pending referral commission payouts and monitor completed investor payout activity.</p>
        {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Pending referral payouts</div>
          <div className="mt-3 text-3xl font-semibold text-slate-950">{formatCurrency(pendingReferralTotal)}</div>
        </div>
        <div className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Paid referral commissions</div>
          <div className="mt-3 text-3xl font-semibold text-slate-950">{formatCurrency(paidReferralTotal)}</div>
        </div>
        <div className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Property payout history</div>
          <div className="mt-3 text-3xl font-semibold text-slate-950">{formatCurrency(propertyPayoutTotal)}</div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Referral commission queue</h2>
            <p className="mt-1 text-sm text-slate-500">Each referred investor can trigger one $500 payout after their first $3,000+ qualifying investment.</p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">Loading referral commissions…</div>
        ) : referralCommissions.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">No referral commissions yet.</div>
        ) : (
          <div className="space-y-3">
            {referralCommissions.map((commission) => (
              <article key={commission._id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{commission.referrerUser?.fullName || commission.referrerUser?.email || 'Investor'}</div>
                    <div className="mt-1 text-sm text-slate-500">Referred user: {commission.referredInvestorUser?.email || 'Unavailable'}</div>
                    <div className="mt-1 text-sm text-slate-500">Qualified amount: {formatCurrency(commission.qualifyingAmount || 0)} · Earned: {formatDateTime(commission.earnedAt)}</div>
                    {commission.adminNote ? <div className="mt-2 text-sm text-slate-600">Admin note: {commission.adminNote}</div> : null}
                  </div>
                  <div className="flex min-w-60 flex-col items-end gap-3">
                    <div className="text-2xl font-semibold text-slate-900">{formatCurrency(commission.commissionAmount || 0)}</div>
                    <StatusBadge status={commission.status} />
                    {commission.status === 'earned' ? (
                      <button type="button" disabled={processingId === commission._id} onClick={() => payReferralCommission(commission._id)} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50">Mark paid</button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Payout history</h2>
            <p className="mt-1 text-sm text-slate-500">Completed property payouts and referral commission credits.</p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">Loading payout history…</div>
        ) : payouts.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">No payouts recorded yet.</div>
        ) : (
          <div className="space-y-3">
            {payouts.map((payout) => (
              <article key={payout._id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{payout.user?.fullName || payout.user?.email || 'Investor'}</div>
                    <div className="mt-1 text-sm text-slate-500">{payout.source === 'referral_commission' ? 'Referral commission payout' : payout.periodLabel}</div>
                    <div className="mt-1 text-sm text-slate-500">Created: {formatDateTime(payout.createdAt)}</div>
                  </div>
                  <div className="flex min-w-55 flex-col items-end gap-3">
                    <div className="text-2xl font-semibold text-slate-900">{formatCurrency(payout.amount || 0)}</div>
                    <StatusBadge status={payout.status} />
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