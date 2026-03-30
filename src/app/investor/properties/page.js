"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Building2, CalendarRange, DollarSign } from 'lucide-react';
import EmptyStateCard from '@/components/ui/EmptyStateCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { apiFetch } from '@/lib/apiClient';
import { formatCurrency, formatDate } from '@/lib/dashboardFormatting';

export default function InvestorPropertiesPage() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await apiFetch('/api/investments', { tokenStorageKey: 'investor_token' });
        if (!cancelled) {
          setInvestments(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setInvestments([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    const interval = window.setInterval(load, 12000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-pink-100 bg-pink-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-pink-600">Property management</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Monitor your reserved and active rental slots.</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">This page shows the properties you have secured for rental-income periods, including slot dates, payout expectations, and current status.</p>
          </div>
          <Link href="/invest" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800">Browse properties</Link>
        </div>
      </section>

      {loading ? (
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 text-sm text-slate-500 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">Loading your properties…</div>
      ) : investments.length === 0 ? (
        <EmptyStateCard
          eyebrow="No investments yet"
          title="You do not have any properties under management"
          description="Go to the investment marketplace, choose a property, and reserve a rental income period to activate your property dashboard."
          actionHref="/invest"
          actionLabel="Go to invest"
        />
      ) : (
        <section className="grid gap-5 xl:grid-cols-2">
          {investments.map((investment) => (
            <article key={investment._id} className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.07)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-700">
                    <Building2 className="h-3.5 w-3.5" />
                    Rental slot
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-900">{investment.property?.name || 'Property pending sync'}</h2>
                  <p className="mt-1 text-sm text-slate-500">{investment.property?.location || 'Location pending'}</p>
                </div>
                <StatusBadge status={investment.status} />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Date range</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{formatDate(investment.startDate)} to {formatDate(investment.endDate)}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Slot price</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{formatCurrency(investment.slotPrice || 0)}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Daily payout</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{formatCurrency(investment.expectedDailyPayout || 0)}</div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
                  <CalendarRange className="h-4 w-4 text-pink-500" />
                  {investment.durationMonths} month term
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
                  <DollarSign className="h-4 w-4 text-pink-500" />
                  Accrued: {formatCurrency(investment.accruedPayoutTotal || 0)}
                </span>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}