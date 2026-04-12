"use client";

import { useEffect, useState } from 'react';
import { useInvestorAuth } from '@/components/Investor/AuthProvider';
import StatusBadge from '@/components/ui/StatusBadge';
import { apiFetch } from '@/lib/apiClient';
import { formatCurrency, formatDateTime } from '@/lib/dashboardFormatting';
import { getWithdrawalRule, SUPPORTED_WITHDRAWAL_OPTIONS, validateWithdrawalForm } from '@/lib/withdrawalValidation';

export default function InvestorWithdrawalsPage() {
  const { wallets } = useInvestorAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [form, setForm] = useState({ amount: '', currency: 'USDT', destinationAddress: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState('neutral');
  const selectedWallet = wallets.find((wallet) => wallet.currency === form.currency) || null;
  const selectedRule = getWithdrawalRule(form.currency);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch('/api/withdrawals', { tokenStorageKey: 'investor_token' });
        if (!cancelled) {
          setWithdrawals(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setWithdrawals([]);
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

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateWithdrawalForm(form);
    if (validationError) {
      setMessageTone('error');
      setMessage(validationError);
      return;
    }

    setSubmitting(true);
    setMessage('');
    setMessageTone('neutral');

    try {
      await apiFetch('/api/withdrawals', {
        tokenStorageKey: 'investor_token',
        method: 'POST',
        body: JSON.stringify({
          amount: Number(form.amount),
          currency: form.currency,
          network: selectedRule?.network,
          destinationAddress: form.destinationAddress,
        }),
      });

      setForm({ amount: '', currency: form.currency, destinationAddress: '' });
      setMessageTone('success');
      setMessage('Withdrawal request submitted. The amount is now reserved and will stay pending until it is marked sent.');
      const data = await apiFetch('/api/withdrawals', { tokenStorageKey: 'investor_token' });
      setWithdrawals(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessageTone('error');
      setMessage(error.message || 'Unable to submit withdrawal request.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="inline-flex rounded-full border border-pink-100 bg-pink-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-pink-600">Withdraw funds</div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Submit a withdrawal request from your available balance.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Submitting a request immediately reserves the amount from your wallet. Supported withdrawals are limited to BTC, ETH, and USDT on TRC20. Admin only updates the request from pending to sent once the transfer has been completed externally.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Amount</label>
            <input value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} type="number" min="0" step="0.01" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Currency</label>
              <select value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value, destinationAddress: '' }))} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400">
                {SUPPORTED_WITHDRAWAL_OPTIONS.map((option) => (
                  <option key={option.currency} value={option.currency}>{option.currency}</option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500">Available now: {Number(selectedWallet?.availableBalance || 0).toLocaleString('en-US', { maximumFractionDigits: 8 })} {form.currency}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Network</label>
              <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {selectedRule?.networkLabel || 'Unavailable'}
              </div>
              <p className="mt-2 text-xs text-slate-500">{selectedRule?.hint}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Destination wallet address</label>
            <textarea value={form.destinationAddress} onChange={(event) => setForm((current) => ({ ...current, destinationAddress: event.target.value }))} className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400" required />
            {selectedRule ? <p className="mt-2 text-xs text-slate-500">{selectedRule.addressLabel}: {selectedRule.hint}</p> : null}
          </div>
          <button type="submit" disabled={submitting} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Submitting...' : 'Send'}
          </button>
          {message ? <p className={`text-sm ${messageTone === 'error' ? 'text-rose-600' : messageTone === 'success' ? 'text-emerald-600' : 'text-slate-600'}`}>{message}</p> : null}
        </form>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Withdrawal history</h2>
            <p className="mt-1 text-sm text-slate-500">Live status updates for your withdrawals.</p>
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Live refresh</div>
        </div>

        <div className="mt-5 space-y-3">
          {loading ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">Loading withdrawals…</div>
          ) : withdrawals.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">No withdrawals submitted yet.</div>
          ) : (
            withdrawals.map((withdrawal) => (
              <article key={withdrawal._id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{formatCurrency(withdrawal.amount || 0)} {withdrawal.currency}</div>
                    <div className="mt-1 text-sm text-slate-500">{withdrawal.network} · {formatDateTime(withdrawal.createdAt)}</div>
                    <div className="mt-2 break-all text-xs text-slate-500">Destination: {withdrawal.destinationAddress}</div>
                    {withdrawal.adminNote ? <div className="mt-2 text-sm text-slate-600">Admin note: {withdrawal.adminNote}</div> : null}
                    {withdrawal.sentTxHash ? <div className="mt-1 text-xs text-slate-500">Transfer reference: {withdrawal.sentTxHash}</div> : null}
                  </div>
                  <StatusBadge status={withdrawal.status} />
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}