"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowDownToLine, Bitcoin, Building2, Copy, CreditCard, Gem, QrCode, ShieldCheck, WalletCards } from 'lucide-react';
import { useInvestorAuth } from '@/components/Investor/AuthProvider';
import EmptyStateCard from '@/components/ui/EmptyStateCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { apiFetch } from '@/lib/apiClient';
import { formatCurrency, formatDate, formatDateTime, summarizeWallets } from '@/lib/dashboardFormatting';

const walletMeta = {
  BTC: { label: 'Bitcoin', network: 'Bitcoin Mainnet', qrValue: (address) => address },
  ETH: { label: 'Ethereum', network: 'Ethereum Mainnet', qrValue: (address) => address },
  USDT: { label: 'Tether', network: 'TRON (TRC20) Mainnet', qrValue: (address) => address },
};

function formatAssetAmount(value, currency) {
  const amount = Number(value || 0);
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: 8 })} ${currency}`;
}

function formatAddress(address) {
  if (!address) {
    return 'Address pending';
  }

  if (address.length <= 20) {
    return address;
  }

  return `${address.slice(0, 10)}...${address.slice(-10)}`;
}

export default function InvestorDashboardPage() {
  const { user, wallets, loading } = useInvestorAuth();
  const [copiedAddress, setCopiedAddress] = useState('');
  const [investments, setInvestments] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [payouts, setPayouts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [investmentData, depositData, withdrawalData, payoutData] = await Promise.allSettled([
        apiFetch('/api/investments', { tokenStorageKey: 'investor_token' }),
        apiFetch('/api/deposits', { tokenStorageKey: 'investor_token' }),
        apiFetch('/api/withdrawals', { tokenStorageKey: 'investor_token' }),
        apiFetch('/api/payouts', { tokenStorageKey: 'investor_token' }),
      ]);

      if (cancelled) {
        return;
      }

      setInvestments(investmentData.status === 'fulfilled' && Array.isArray(investmentData.value) ? investmentData.value : []);
      setDeposits(depositData.status === 'fulfilled' && Array.isArray(depositData.value) ? depositData.value : []);
      setWithdrawals(withdrawalData.status === 'fulfilled' && Array.isArray(withdrawalData.value) ? withdrawalData.value : []);
      setPayouts(payoutData.status === 'fulfilled' && Array.isArray(payoutData.value) ? payoutData.value : []);
    }

    load();
    const interval = window.setInterval(load, 12000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  async function handleCopy(address) {
    if (!address || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    window.setTimeout(() => setCopiedAddress(''), 1600);
  }

  const walletSummary = useMemo(() => summarizeWallets(wallets), [wallets]);
  const walletBalances = useMemo(
    () => wallets.map((wallet) => ({
      currency: wallet.currency,
      label: walletMeta[wallet.currency]?.label || wallet.currency,
      available: Number(wallet.availableBalance || 0),
      locked: Number(wallet.lockedBalance || 0),
      profit: Number(wallet.profitBalance || 0),
    })),
    [wallets]
  );
  const todayLabel = new Date().toISOString().slice(0, 10);
  const todayProfit = useMemo(
    () => payouts.filter((payout) => String(payout.payoutDate || '').slice(0, 10) === todayLabel).reduce((sum, payout) => sum + Number(payout.amount || 0), 0),
    [payouts, todayLabel]
  );
  const totalEarned = useMemo(() => payouts.reduce((sum, payout) => sum + Number(payout.amount || 0), 0), [payouts]);
  const pendingWithdrawal = useMemo(
    () => withdrawals.filter((item) => ['pending', 'processing'].includes(item.status)).reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [withdrawals]
  );
  const activeInvestments = useMemo(() => investments.filter((item) => ['reserved', 'active'].includes(item.status)), [investments]);
  const walletActivity = useMemo(() => {
    const rows = [
      ...deposits.map((item) => ({ id: item._id, type: 'Deposit Credit', amount: item.amount, status: item.status, date: item.createdAt, detail: item.currency })),
      ...withdrawals.map((item) => ({ id: item._id, type: 'Withdrawal', amount: item.amount, status: item.status, date: item.createdAt, detail: item.currency })),
      ...payouts.map((item) => ({ id: item._id, type: 'Profit Credit', amount: item.amount, status: item.status, date: item.createdAt, detail: item.currency })),
      ...investments.map((item) => ({ id: item._id, type: 'Investment Debit', amount: item.slotPrice || item.amount, status: item.status, date: item.createdAt, detail: item.currency || 'USDT' })),
    ];

    return rows.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 6);
  }, [deposits, withdrawals, payouts, investments]);

  if (loading) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Available Balance', value: formatCurrency(walletSummary.available) },
          { label: 'Locked Balance', value: formatCurrency(walletSummary.locked) },
          { label: 'Active Rental Slots', value: String(activeInvestments.length) },
          { label: "Today's Profit", value: formatCurrency(todayProfit) },
          { label: 'Pending Withdrawal', value: formatCurrency(pendingWithdrawal) },
        ].map((card) => (
          <div key={card.label} className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">{card.label}</div>
            <div className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {walletBalances.map((wallet) => (
          <div key={wallet.currency} className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">{wallet.currency} balance</div>
                <div className="mt-2 text-2xl font-semibold text-slate-950">{formatAssetAmount(wallet.available, wallet.currency)}</div>
                <div className="mt-1 text-sm text-slate-500">{wallet.label}</div>
              </div>
              <div className="rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-[11px] font-medium text-pink-700">Live wallet</div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 px-3 py-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Locked</div>
                <div className="mt-1 font-medium text-slate-900">{formatAssetAmount(wallet.locked, wallet.currency)}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Profit</div>
                <div className="mt-1 font-medium text-slate-900">{formatAssetAmount(wallet.profit, wallet.currency)}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,247,251,0.9))] p-6 shadow-[0_30px_100px_rgba(15,23,42,0.08)]">
          <div className="mb-4 inline-flex rounded-full border border-pink-100 bg-pink-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-pink-600">Investor operating center</div>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-slate-900">Track balances, rental slots, withdrawals, and profit credits from one place.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Your wallet separates available and locked funds, and your dashboard surfaces active slots, daily profit credits, and pending withdrawal activity with live refresh.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/investor/properties" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800">Manage properties</Link>
            <Link href="/investor/withdrawals" className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">Request withdrawal</Link>
            <Link href="/investor/transactions" className="rounded-2xl border border-pink-100 bg-pink-50 px-5 py-3 text-sm font-medium text-pink-700 transition hover:bg-pink-100">Open transactions</Link>
          </div>
        </div>
        <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50/80 p-6 shadow-[0_20px_70px_rgba(16,185,129,0.12)]">
          <div className="flex items-center gap-3 text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-medium">Verified investor profile</span>
          </div>
          <div className="mt-5 text-2xl font-semibold text-slate-900">{user?.fullName || 'Investor'}</div>
          <div className="mt-1 break-all text-sm text-slate-600">{user?.email}</div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl bg-white px-4 py-4">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Wallets assigned</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">{wallets.length}</div>
            </div>
            <div className="rounded-2xl bg-white px-4 py-4">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Total earned</div>
              <div className="mt-2 text-base font-semibold text-emerald-700">{formatCurrency(totalEarned)}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Property management</h3>
              <p className="mt-1 text-sm text-slate-500">Manage your reserved and active rental slots.</p>
            </div>
            <Link href="/investor/properties" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">Open page</Link>
          </div>

          {activeInvestments.length === 0 ? (
            <EmptyStateCard eyebrow="No investments yet" title="You do not have any rental slots yet" description="Pick a property from the investment marketplace to reserve your first rental income period and start receiving daily profit credits." actionHref="/invest" actionLabel="Go to invest" />
          ) : (
            <div className="space-y-4">
              {activeInvestments.slice(0, 4).map((investment) => (
                <article key={investment._id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-pink-500" />
                        <h4 className="text-lg font-semibold text-slate-900">{investment.property?.name || 'Rental Property'}</h4>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{formatDate(investment.startDate)} to {formatDate(investment.endDate)}</p>
                      <p className="mt-2 text-sm text-slate-600">Daily payout: {formatCurrency(investment.expectedDailyPayout || 0)}</p>
                    </div>
                    <StatusBadge status={investment.status} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Recent wallet activity</h3>
              <p className="mt-1 text-sm text-slate-500">Deposits, withdrawals, profit credits, and investment debits.</p>
            </div>
            <Link href="/investor/transactions" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">View all</Link>
          </div>

          <div className="space-y-3">
            {walletActivity.length === 0 ? (
              <EmptyStateCard eyebrow="No activity yet" title="Your transaction timeline is empty" description="Once you deposit, invest, or receive profit credits, the latest account activity will appear here." />
            ) : (
              walletActivity.map((activity) => (
                <div key={`${activity.type}-${activity.id}`} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                  <div>
                    <div className="font-medium text-slate-900">{activity.type}</div>
                    <div className="text-sm text-slate-500">{activity.detail} · {formatDateTime(activity.date)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">{formatCurrency(activity.amount || 0)}</div>
                    <StatusBadge status={activity.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section id="fund-account" className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
            <ArrowDownToLine className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Fund your account to start investing</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Send BTC or USDT to your assigned deposit address below. Once funds arrive, your balance can be used for future investment opportunities on the platform.</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Ethereum is also available for direct deposits using your dedicated ETH mainnet wallet.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/investor/withdrawals" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                <CreditCard className="h-4 w-4" />
                Withdraw funds
              </Link>
              <Link href="/investor/transactions" className="inline-flex items-center gap-2 rounded-2xl border border-pink-100 bg-pink-50 px-4 py-2 text-sm font-medium text-pink-700 transition hover:bg-pink-100">
                <WalletCards className="h-4 w-4" />
                View transaction history
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="wallets" className="grid gap-5 xl:grid-cols-2">
        {wallets.map((wallet) => (
          <article key={wallet._id} className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.07)]">
            {(() => {
              const meta = walletMeta[wallet.currency] || { label: wallet.currency, network: 'Assigned Network', qrValue: (address) => address };

              return (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                        {wallet.currency === 'BTC' ? <Bitcoin className="h-5 w-5" /> : wallet.currency === 'ETH' ? <Gem className="h-5 w-5" /> : <WalletCards className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">Deposit wallet</div>
                        <div className="text-xl font-semibold text-slate-900">{wallet.currency}</div>
                        <div className="mt-1 text-xs text-slate-500">{meta.label}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Active</div>
                      <div className="rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-[11px] font-medium text-pink-700">{meta.network}</div>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-4 md:grid-cols-[160px_1fr]">
                    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                        <QrCode className="h-3.5 w-3.5" />
                        Scan to fund
                      </div>
                      <div className="flex items-center justify-center rounded-2xl bg-white p-3 shadow-sm">
                        <QRCodeSVG value={meta.qrValue(wallet.address)} size={116} bgColor="transparent" fgColor="#0f172a" includeMargin={false} />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Wallet address</div>
                      <div className="mt-3 break-all font-mono text-sm text-slate-900">{wallet.address}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">Network: {meta.network}</span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">Available: {formatAssetAmount(wallet.availableBalance || 0, wallet.currency)}</span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">Locked: {formatAssetAmount(wallet.lockedBalance || 0, wallet.currency)}</span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">Profit: {formatAssetAmount(wallet.profitBalance || 0, wallet.currency)}</span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">Short view: {formatAddress(wallet.address)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">{copiedAddress === wallet.address ? 'Address copied to clipboard' : 'Use this address when funding your account'}</div>
                    <button type="button" onClick={() => handleCopy(wallet.address)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                  </div>
                </>
              );
            })()}
          </article>
        ))}
      </section>
    </div>
  );
}