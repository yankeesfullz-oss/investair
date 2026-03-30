"use client";

import { useEffect, useState } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import { apiFetch } from '@/lib/apiClient';
import { formatCurrency, formatDateTime } from '@/lib/dashboardFormatting';

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch('/api/withdrawals', { tokenStorageKey: 'admin_token' });
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

  async function refresh() {
    const data = await apiFetch('/api/withdrawals', { tokenStorageKey: 'admin_token' });
    setWithdrawals(Array.isArray(data) ? data : []);
  }

  async function updateStatus(withdrawalId, action) {
    setProcessingId(withdrawalId);
    setMessage('');

    try {
      const adminNote = window.prompt('Admin note (optional):', '') || '';
      const body = { adminNote };

      if (action === 'paid') {
        body.paidTxHash = window.prompt('Paid transaction hash:', '') || '';
        body.paidAt = new Date().toISOString();
      }

      await apiFetch(`/api/withdrawals/${withdrawalId}/${action}`, {
        tokenStorageKey: 'admin_token',
        method: 'PATCH',
        body: JSON.stringify(body),
      });

      setMessage(`Withdrawal updated: ${action}`);
      await refresh();
    } catch (error) {
      setMessage(error.message || 'Unable to update withdrawal.');
    } finally {
      setProcessingId('');
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="inline-flex rounded-full border border-pink-100 bg-pink-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-pink-600">Withdrawals</div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Approve live withdrawal requests after settlement.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">This queue refreshes automatically so admins can see requests in real time, mark them as processing, and approve them after paying.</p>
        {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="space-y-3">
          {loading ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">Loading withdrawals…</div>
          ) : withdrawals.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">No withdrawal requests yet.</div>
          ) : (
            withdrawals.map((withdrawal) => (
              <article key={withdrawal._id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{withdrawal.user?.fullName || withdrawal.user?.email || 'Investor'}</div>
                    <div className="mt-1 text-sm text-slate-500">{formatCurrency(withdrawal.amount || 0)} · {withdrawal.currency} · {withdrawal.network}</div>
                    <div className="mt-1 text-sm text-slate-500">Requested: {formatDateTime(withdrawal.createdAt)}</div>
                    <div className="mt-2 break-all text-xs text-slate-500">Destination: {withdrawal.destinationAddress}</div>
                    {withdrawal.adminNote ? <div className="mt-2 text-sm text-slate-600">Admin note: {withdrawal.adminNote}</div> : null}
                    {withdrawal.paidTxHash ? <div className="mt-1 text-xs text-slate-500">Paid tx: {withdrawal.paidTxHash}</div> : null}
                  </div>
                  <div className="flex min-w-55 flex-col items-end gap-3">
                    <StatusBadge status={withdrawal.status} />
                    <div className="flex flex-wrap justify-end gap-2">
                      <button type="button" disabled={processingId === withdrawal._id} onClick={() => updateStatus(withdrawal._id, 'processing')} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100 disabled:opacity-50">Mark processing</button>
                      <button type="button" disabled={processingId === withdrawal._id} onClick={() => updateStatus(withdrawal._id, 'paid')} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50">Mark paid</button>
                      <button type="button" disabled={processingId === withdrawal._id} onClick={() => updateStatus(withdrawal._id, 'reject')} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-50">Reject</button>
                    </div>
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