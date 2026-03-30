"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Building2, CircleDollarSign, Landmark, Users } from 'lucide-react';
import EmptyStateCard from '@/components/ui/EmptyStateCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { apiFetch } from '@/lib/apiClient';
import { formatCurrency, formatDateTime } from '@/lib/dashboardFormatting';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ properties: [], investments: [], users: [], deposits: [], withdrawals: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const [properties, investments, users, deposits, withdrawals] = await Promise.allSettled([
          apiFetch('/api/properties', { tokenStorageKey: 'admin_token' }),
          apiFetch('/api/investments', { tokenStorageKey: 'admin_token' }),
          apiFetch('/api/users', { tokenStorageKey: 'admin_token' }),
          apiFetch('/api/deposits', { tokenStorageKey: 'admin_token' }),
          apiFetch('/api/withdrawals', { tokenStorageKey: 'admin_token' }),
        ]);

        if (!mounted) return;

        setStats({
          properties: properties.status === 'fulfilled' && Array.isArray(properties.value) ? properties.value : [],
          investments: investments.status === 'fulfilled' && Array.isArray(investments.value) ? investments.value : [],
          users: users.status === 'fulfilled' && Array.isArray(users.value) ? users.value : [],
          deposits: deposits.status === 'fulfilled' && Array.isArray(deposits.value) ? deposits.value : [],
          withdrawals: withdrawals.status === 'fulfilled' && Array.isArray(withdrawals.value) ? withdrawals.value : [],
        });
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
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

  const pendingWithdrawals = useMemo(() => stats.withdrawals.filter((item) => ['pending', 'processing'].includes(item.status)), [stats.withdrawals]);
  const detectedDeposits = useMemo(() => stats.deposits.filter((item) => ['pending', 'detected', 'confirming'].includes(item.status)), [stats.deposits]);
  const activeSlots = useMemo(() => stats.investments.filter((item) => ['active', 'reserved'].includes(item.status)), [stats.investments]);
  const trackedSlotValue = useMemo(() => activeSlots.reduce((sum, item) => sum + Number(item.slotPrice || item.amount || 0), 0), [activeSlots]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,247,251,0.9))] p-6 shadow-[0_20px_80px_rgba(15,23,42,0.07)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-pink-100 bg-pink-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-pink-600">Admin control tower</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Run deposits, withdrawals, and property inventory from one dashboard.</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">These operational queues refresh automatically so admins can monitor detected deposits in real time, approve withdrawals after settlement, and keep property inventory current.</p>
          </div>
          <div className="text-sm text-slate-500">Auto-refresh every 10 seconds</div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 text-sm text-slate-500 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">Loading admin operations…</div>
      ) : error ? (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              { label: 'Total Properties', value: String(stats.properties.length) },
              { label: 'Active Rental Slots', value: String(activeSlots.length) },
              { label: 'Pending Deposits', value: String(detectedDeposits.length) },
              { label: 'Pending Withdrawals', value: String(pendingWithdrawals.length) },
              { label: 'Tracked Slot Value', value: formatCurrency(trackedSlotValue) },
            ].map((card) => (
              <div key={card.label} className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">{card.label}</div>
                <div className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</div>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Needs attention</h2>
                  <p className="mt-1 text-sm text-slate-500">Quick access to the most important operational work queues.</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { href: '/admin/withdrawals', icon: CircleDollarSign, title: 'Pending withdrawals', value: `${pendingWithdrawals.length} waiting for approval` },
                  { href: '/admin/deposits', icon: Landmark, title: 'Detected deposits', value: `${detectedDeposits.length} visible in live monitoring` },
                  { href: '/admin/properties', icon: Building2, title: 'Property management', value: `${stats.properties.length} properties in inventory` },
                  { href: '/admin/investors', icon: Users, title: 'Investor support', value: `${stats.users.length} investors available for review` },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link key={item.title} href={item.href} className="flex items-center justify-between rounded-[1.5rem] border border-slate-100 bg-slate-50/80 px-4 py-4 transition hover:border-slate-200 hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-pink-500 shadow-sm">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900">{item.title}</div>
                          <div className="text-sm text-slate-500">{item.value}</div>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Live withdrawal queue</h2>
                  <p className="mt-1 text-sm text-slate-500">Approve withdrawals after off-platform settlement.</p>
                </div>
                <Link href="/admin/withdrawals" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">Open page</Link>
              </div>

              {pendingWithdrawals.length === 0 ? (
                <EmptyStateCard eyebrow="Queue clear" title="No pending withdrawals right now" description="New investor withdrawal requests will appear here automatically as they are submitted." />
              ) : (
                <div className="space-y-3">
                  {pendingWithdrawals.slice(0, 5).map((withdrawal) => (
                    <div key={withdrawal._id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-900">{withdrawal.user?.fullName || withdrawal.user?.email || 'Investor'}</div>
                          <div className="mt-1 text-sm text-slate-500">{formatCurrency(withdrawal.amount || 0)} · {withdrawal.currency} · {formatDateTime(withdrawal.createdAt)}</div>
                        </div>
                        <StatusBadge status={withdrawal.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
