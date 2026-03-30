"use client";

import { useEffect, useState } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import { apiFetch } from '@/lib/apiClient';
import { formatCurrency, formatDateTime } from '@/lib/dashboardFormatting';

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch('/api/deposits', { tokenStorageKey: 'admin_token' });
        if (!cancelled) {
          setDeposits(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setDeposits([]);
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

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="inline-flex rounded-full border border-pink-100 bg-pink-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-pink-600">Deposits</div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">See detected deposits in real time and monitor confirmation status.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">This page auto-refreshes so admins can watch incoming deposits and handle support issues quickly.</p>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="space-y-3">
          {loading ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">Loading deposits…</div>
          ) : deposits.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">No deposits detected yet.</div>
          ) : (
            deposits.map((deposit) => (
              <article key={deposit._id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{deposit.user?.fullName || deposit.user?.email || 'Investor'}</div>
                    <div className="mt-1 text-sm text-slate-500">{formatCurrency(deposit.amount || 0)} · {deposit.currency} · {formatDateTime(deposit.createdAt)}</div>
                    <div className="mt-2 text-sm text-slate-600">Wallet: {deposit.wallet?.address || 'Address unavailable'}</div>
                    <div className="mt-1 text-xs text-slate-500">Tx Hash: {deposit.txHash}</div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={deposit.status} />
                    <div className="mt-2 text-xs text-slate-500">Confirmations: {deposit.confirmations || 0}</div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}