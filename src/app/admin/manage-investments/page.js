"use client";

import { useEffect, useState } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import { apiFetch } from '@/lib/apiClient';
import { formatCurrency, formatDate } from '@/lib/dashboardFormatting';

export default function ManageInvestmentsPage() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await apiFetch('/api/investments', { tokenStorageKey: 'admin_token' });
        if (!mounted) return;
        setInvestments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to load investments');
      } finally {
        setLoading(false);
      }
    }

    load();
    const interval = window.setInterval(load, 10000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="inline-flex rounded-full border border-pink-100 bg-pink-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-pink-600">Rental slots</div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">See live slot reservations and active income periods.</h1>
      </section>

      {loading ? (
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 text-sm text-slate-500 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">Loading rental slots…</div>
      ) : error ? (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
      ) : investments.length === 0 ? (
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 text-sm text-slate-500 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">No rental slots found yet.</div>
      ) : (
        <div className="space-y-3">
          {investments.map((inv) => (
            <div key={inv._id || inv.id} className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="font-medium text-slate-900">Property: {inv.property?.name || inv.property}</div>
                  <div className="mt-1 text-sm text-slate-500">Investor: {inv.user?.fullName || inv.user?.email || 'Investor'}</div>
                  <div className="mt-1 text-sm text-slate-500">Period: {formatDate(inv.startDate)} to {formatDate(inv.endDate)}</div>
                  <div className="mt-1 text-sm text-slate-600">Slot price: {formatCurrency(inv.slotPrice || inv.amount || 0)} · Daily payout: {formatCurrency(inv.expectedDailyPayout || 0)}</div>
                </div>
                <StatusBadge status={inv.status || 'active'} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
