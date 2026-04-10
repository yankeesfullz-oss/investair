"use client";

import { useEffect, useMemo, useState } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import { apiFetch } from '@/lib/apiClient';
import { formatCurrency, formatDateTime } from '@/lib/dashboardFormatting';

export default function InvestorTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [deposits, withdrawals, payouts, investments] = await Promise.allSettled([
        apiFetch('/api/deposits', { tokenStorageKey: 'investor_token' }),
        apiFetch('/api/withdrawals', { tokenStorageKey: 'investor_token' }),
        apiFetch('/api/payouts', { tokenStorageKey: 'investor_token' }),
        apiFetch('/api/investments', { tokenStorageKey: 'investor_token' }),
      ]);

      if (cancelled) {
        return;
      }

      const merged = [
        ...(deposits.status === 'fulfilled' ? deposits.value : []).map((item) => ({
          id: item._id,
          type: 'Deposit Credit',
          amount: item.amount,
          currency: item.currency,
          status: item.status,
          date: item.createdAt,
          note: item.txHash,
        })),
        ...(withdrawals.status === 'fulfilled' ? withdrawals.value : []).map((item) => ({
          id: item._id,
          type: 'Withdrawal',
          amount: item.amount,
          currency: item.currency,
          status: item.status,
          date: item.createdAt,
          note: item.destinationAddress,
        })),
        ...(payouts.status === 'fulfilled' ? payouts.value : []).map((item) => ({
          id: item._id,
          type: item.source === 'referral_commission' ? 'Referral Commission' : 'Profit Credit',
          amount: item.amount,
          currency: item.currency,
          status: item.status,
          date: item.createdAt,
          note: item.periodLabel,
        })),
        ...(investments.status === 'fulfilled' ? investments.value : []).map((item) => ({
          id: item._id,
          type: 'Investment Debit',
          amount: item.slotPrice || item.amount,
          currency: item.currency || 'USDT',
          status: item.status,
          date: item.createdAt,
          note: item.property?.name || 'Property reservation',
        })),
      ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

      setTransactions(merged);
      setLoading(false);
    }

    load();
    const interval = window.setInterval(load, 12000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const totals = useMemo(() => ({
    deposits: transactions.filter((item) => item.type === 'Deposit Credit').reduce((sum, item) => sum + Number(item.amount || 0), 0),
    profits: transactions.filter((item) => ['Profit Credit', 'Referral Commission'].includes(item.type)).reduce((sum, item) => sum + Number(item.amount || 0), 0),
    debits: transactions.filter((item) => ['Withdrawal', 'Investment Debit'].includes(item.type)).reduce((sum, item) => sum + Number(item.amount || 0), 0),
  }), [transactions]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="inline-flex rounded-full border border-pink-100 bg-pink-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-pink-600">Transactions</div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">See every deposit, withdrawal, profit credit, and investment debit.</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Deposits</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(totals.deposits)}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Profits</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(totals.profits)}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Debits</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(totals.debits)}</div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="space-y-3">
          {loading ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">Loading transactions…</div>
          ) : transactions.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">No transaction activity yet.</div>
          ) : (
            transactions.map((transaction) => (
              <article key={`${transaction.type}-${transaction.id}`} className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-900">{transaction.type}</div>
                  <div className="mt-1 text-sm text-slate-500">{formatDateTime(transaction.date)} · {transaction.currency}</div>
                  <div className="mt-2 text-sm text-slate-600">{transaction.note}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-slate-900">{formatCurrency(transaction.amount || 0)}</div>
                  <div className="mt-2"><StatusBadge status={transaction.status} /></div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}