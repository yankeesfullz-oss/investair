"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Sparkles,
  UserPlus,
  WalletCards,
} from 'lucide-react';
import InstallAppButton from '@/components/Public/InstallAppButton';
import useAppInstallPrompt from '@/lib/useAppInstallPrompt';
import { apiFetch } from '@/lib/apiClient';

const INVESTOR_TOKEN_KEY = 'investor_token';

const walletMeta = {
  BTC: { label: 'Bitcoin', network: 'Bitcoin Mainnet', qrValue: (address) => address },
  ETH: { label: 'Ethereum', network: 'Ethereum Mainnet', qrValue: (address) => address },
  USDT: { label: 'Tether', network: 'TRON (TRC20) Mainnet', qrValue: (address) => address },
};

const demoWallets = [
  {
    currency: 'BTC',
    address: 'bc1qinvestair8wallet4funding2preview0btc6demo4xv2',
    availableBalance: 18450,
    lockedBalance: 3200,
    profitBalance: 640,
  },
  {
    currency: 'USDT',
    address: 'TInvestAirPreviewWalletForFundingUSDT4MobileDemo',
    availableBalance: 12600,
    lockedBalance: 2100,
    profitBalance: 480,
  },
  {
    currency: 'ETH',
    address: '0xInvestAirPreviewWalletFundingEthMobileDemo0001',
    availableBalance: 4.8,
    lockedBalance: 1.1,
    profitBalance: 0.24,
  },
];

const demoProperty = {
  name: 'Wynwood Guest Loft',
  location: 'Miami, Florida',
  projectedNightly: 235,
  occupancyRate: 73,
  monthlySlotPrice: 3200,
};

const steps = [
  {
    id: 'register',
    title: 'Create your investor account',
    summary: 'Signup is the entry point. Once registered, the platform assigns your deposit wallets automatically.',
    icon: UserPlus,
    accent: 'from-rose-500 to-orange-400',
  },
  {
    id: 'wallet',
    title: 'Receive your personal wallet addresses',
    summary: 'Each investor gets dedicated wallet rails for funding and balance tracking inside the dashboard.',
    icon: WalletCards,
    accent: 'from-slate-950 to-slate-700',
  },
  {
    id: 'fund',
    title: 'Fund the wallet the right way',
    summary: 'Copy the address, scan the QR code, choose the correct network, and wait for funds to land before investing.',
    icon: CreditCard,
    accent: 'from-sky-500 to-cyan-400',
  },
  {
    id: 'invest',
    title: 'Reserve a property income period',
    summary: 'Browse opportunities, review projected performance, choose a supported duration, and invest from your funded balance.',
    icon: Building2,
    accent: 'from-emerald-500 to-teal-400',
  },
];

function formatAddress(address) {
  if (!address) {
    return 'Wallet assigned after signup';
  }

  if (address.length <= 22) {
    return address;
  }

  return `${address.slice(0, 12)}...${address.slice(-10)}`;
}

function formatUsd(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatAssetAmount(value, currency) {
  return `${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 8 })} ${currency}`;
}

export default function Tutorial() {
  const installPrompt = useAppInstallPrompt();
  const [currentStep, setCurrentStep] = useState(steps[0].id);
  const [selectedCurrency, setSelectedCurrency] = useState('BTC');
  const [selectedMonths, setSelectedMonths] = useState(6);
  const [copiedValue, setCopiedValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadInvestorPreview() {
      if (typeof window === 'undefined') {
        return;
      }

      const token = window.localStorage.getItem(INVESTOR_TOKEN_KEY);

      if (!token) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      try {
        const [userResult, walletResult] = await Promise.allSettled([
          apiFetch('/api/users/me', { tokenStorageKey: INVESTOR_TOKEN_KEY }),
          apiFetch('/api/wallets', { tokenStorageKey: INVESTOR_TOKEN_KEY }),
        ]);

        if (cancelled) {
          return;
        }

        if (userResult.status === 'fulfilled') {
          setUser(userResult.value || null);
        }

        if (walletResult.status === 'fulfilled' && Array.isArray(walletResult.value)) {
          setWallets(walletResult.value);
        }
      } catch {
        if (cancelled) {
          return;
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInvestorPreview();

    return () => {
      cancelled = true;
    };
  }, []);

  const previewWallets = wallets.length > 0 ? wallets : demoWallets;
  const activeWallet = previewWallets.find((wallet) => wallet.currency === selectedCurrency) || previewWallets[0];
  const dataMode = wallets.length > 0 ? 'live' : 'demo';
  const totalBalance = useMemo(
    () => previewWallets.reduce((sum, wallet) => sum + Number(wallet.availableBalance || 0), 0),
    [previewWallets]
  );
  const estimatedReservation = demoProperty.monthlySlotPrice * selectedMonths;
  const projectedGross = demoProperty.projectedNightly * 30 * selectedMonths;
  const projectedPerformance = projectedGross * (demoProperty.occupancyRate / 100);

  useEffect(() => {
    if (!activeWallet) {
      return;
    }

    setSelectedCurrency(activeWallet.currency);
  }, [activeWallet]);

  async function handleCopy(value) {
    if (!value || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopiedValue(value);
    window.setTimeout(() => setCopiedValue(''), 1600);
  }

  function renderPhoneScreen() {
    if (currentStep === 'register') {
      return (
        <div className="space-y-4">
          <div className="rounded-[1.9rem] bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.28)]">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-white/70">
              <span>Investor signup</span>
              <span>Step 1</span>
            </div>
            <h3 className="mt-4 text-2xl font-semibold">Open your InvestAir account</h3>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              Register once and the platform can issue your dedicated BTC, USDT, and ETH wallet rails instantly.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-3">
              {[
                user?.email || 'investor@example.com',
                'Create a secure password',
                'Choose the property flow you want to continue to',
              ].map((line) => (
                <div key={line} className="rounded-2xl border border-white bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                  {line}
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Wallet status</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">Provisioned on signup</div>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Flow handoff</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">Dashboard or property checkout</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 'wallet') {
      return (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {previewWallets.map((wallet) => (
              <button
                key={wallet.currency}
                type="button"
                onClick={() => setSelectedCurrency(wallet.currency)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${selectedCurrency === wallet.currency ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {wallet.currency}
              </button>
            ))}
          </div>

          <div className="rounded-[1.9rem] bg-slate-950 p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Assigned wallet</div>
                <div className="mt-2 text-2xl font-semibold">{activeWallet.currency}</div>
                <div className="mt-2 text-xs text-slate-400">{walletMeta[activeWallet.currency]?.network || 'Assigned network'}</div>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
                {dataMode === 'live' ? 'Live wallet' : 'Guided preview'}
              </div>
            </div>
            <div className="mt-5 rounded-[1.5rem] bg-white/8 p-4">
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Wallet address</div>
              <div className="mt-3 break-all font-mono text-sm text-white">{activeWallet.address}</div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/8 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Available</div>
                <div className="mt-2 text-sm font-semibold text-white">{formatAssetAmount(activeWallet.availableBalance, activeWallet.currency)}</div>
              </div>
              <div className="rounded-2xl bg-white/8 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Profit</div>
                <div className="mt-2 text-sm font-semibold text-white">{formatAssetAmount(activeWallet.profitBalance, activeWallet.currency)}</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 'fund') {
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[132px_1fr]">
            <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                <QrCode className="h-3.5 w-3.5" />
                Scan
              </div>
              <div className="flex items-center justify-center rounded-[1.25rem] bg-white p-3 shadow-sm">
                <QRCodeSVG value={walletMeta[activeWallet.currency]?.qrValue(activeWallet.address) || activeWallet.address} size={104} bgColor="transparent" fgColor="#0f172a" />
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Funding checklist</div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>Use the exact network shown for the selected wallet.</li>
                <li>Copy the address or scan the QR code from your phone wallet app.</li>
                <li>Wait for confirmations before expecting the balance to appear for investing.</li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(activeWallet.address)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  <Copy className="h-4 w-4" />
                  {copiedValue === activeWallet.address ? 'Copied' : 'Copy address'}
                </button>
                <a
                  href={`https://www.moonpay.com/buy/${activeWallet.currency.toLowerCase()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  Buy via MoonPay
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-[1.7rem] bg-[linear-gradient(135deg,#ecfeff_0%,#eff6ff_100%)] p-4">
            <div className="text-[11px] uppercase tracking-[0.22em] text-sky-700">Available balance after funding</div>
            <div className="mt-2 text-3xl font-semibold text-slate-950">{activeWallet.currency === 'ETH' ? formatAssetAmount(activeWallet.availableBalance, activeWallet.currency) : formatUsd(activeWallet.availableBalance)}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-[1.9rem] bg-[linear-gradient(135deg,#fff7fb_0%,#ffffff_45%,#f0fdf4_100%)] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Opportunity preview</div>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950">{demoProperty.name}</h3>
              <p className="mt-2 text-sm text-slate-500">{demoProperty.location}</p>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
              {demoProperty.occupancyRate}% occupancy
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Projected nightly</div>
              <div className="mt-2 text-lg font-semibold text-slate-950">{formatUsd(demoProperty.projectedNightly)}</div>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Slot price</div>
              <div className="mt-2 text-lg font-semibold text-slate-950">{formatUsd(demoProperty.monthlySlotPrice)}/mo</div>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Projected period</div>
              <div className="mt-2 text-lg font-semibold text-emerald-700">{formatUsd(projectedPerformance)}</div>
            </div>
          </div>
        </div>

        <div className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Choose duration</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[3, 6, 12].map((months) => (
              <button
                key={months}
                type="button"
                onClick={() => setSelectedMonths(months)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedMonths === months ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {months} months
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Reservation amount</div>
              <div className="mt-2 text-lg font-semibold text-slate-950">{formatUsd(estimatedReservation)}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Funding source</div>
              <div className="mt-2 text-sm font-semibold text-slate-950">Use available wallet balance after deposit confirmation</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden bg-rose-50 px-4 py-12 text-slate-950 sm:px-6 md:px-10 md:py-16">
      <div className="absolute inset-x-0 top-0 h-40 bg-rose-200" />

      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/70 bg-rose-950 p-6 text-white shadow-[0_40px_160px_rgba(15,23,42,0.16)] sm:p-8 lg:p-10">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-6 lg:pr-6">
            <div className="inline-flex rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-rose-200">
              Investor tutorial
            </div>

            <div>
              <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                From signup to wallet funding to your first property reservation, inside an iPhone-style walkthrough.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                This tutorial mirrors the actual InvestAir path: create your investor account, receive personal wallet rails, fund the correct network, then reserve a short-term rental income period from your dashboard balance.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <div className="text-[11px] uppercase tracking-[0.24em] text-rose-200">Data source</div>
                <div className="mt-2 text-lg font-semibold text-white">{loading ? 'Checking account state...' : dataMode === 'live' ? 'Live wallet preview' : 'Guided walkthrough preview'}</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {dataMode === 'live'
                    ? 'Signed-in users see real wallet addresses and balances when available.'
                    : 'Logged-out visitors see a polished instructional flow aligned to the actual platform.'}
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <div className="text-[11px] uppercase tracking-[0.24em] text-rose-200">Mobile ready</div>
                <div className="mt-2 text-lg font-semibold text-white">Installable experience</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Add InvestAir to your phone to keep wallet instructions, opportunities, and dashboard access one tap away.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setCurrentStep(step.id)}
                    className={`w-full rounded-[1.7rem] border px-5 py-4 text-left transition ${isActive ? 'border-white/20 bg-white text-slate-950 shadow-[0_18px_50px_rgba(255,255,255,0.08)]' : 'border-white/10 bg-white/5 text-white hover:bg-white/8'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${step.accent} text-white shadow-sm`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isActive ? 'text-rose-500' : 'text-slate-400'}`}>
                          Step {index + 1}
                        </div>
                        <div className="mt-1 text-lg font-semibold">{step.title}</div>
                        <p className={`mt-2 text-sm leading-6 ${isActive ? 'text-slate-600' : 'text-slate-300'}`}>{step.summary}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/investor/signup" className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-rose-600">
                Create account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/invest" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10">
                Browse opportunities
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[420px]">
              <div className="absolute inset-x-6 top-14 h-44 rounded-full bg-[radial-gradient(circle,rgba(244,114,182,0.32),transparent_65%)] blur-3xl" />
              <div className="relative rounded-[3.5rem] border border-white/15 bg-[linear-gradient(180deg,#111827_0%,#0f172a_100%)] p-2 shadow-[0_40px_140px_rgba(15,23,42,0.5)]">
                <div className="rounded-[3rem] border border-white/10 bg-[linear-gradient(180deg,#fef2f2_0%,#ffffff_32%,#f8fafc_100%)] p-3">
                  <div className="mx-auto mb-3 h-8 w-36 rounded-full bg-rose-950" />
                  <div className="overflow-hidden rounded-[2.55rem] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                    <div className="flex items-center justify-between px-5 pt-4 text-[12px] font-semibold text-slate-500">
                      <span>9:41</span>
                      <span>InvestAir</span>
                    </div>

                    <div className="px-5 pb-5 pt-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{steps.findIndex((step) => step.id === currentStep) + 1} of {steps.length}</div>
                          <div className="mt-2 text-xl font-semibold text-slate-950">{steps.find((step) => step.id === currentStep)?.title}</div>
                        </div>
                        <div className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
                          {dataMode === 'live' ? 'Live' : 'Demo'}
                        </div>
                      </div>

                      <div className="mt-4 flex gap-1.5">
                        {steps.map((step) => (
                          <div key={step.id} className={`h-1.5 flex-1 rounded-full ${step.id === currentStep ? 'bg-rose-500' : 'bg-slate-200'}`} />
                        ))}
                      </div>

                      <div className="mt-5 min-h-[520px]">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -24 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                          >
                            {renderPhoneScreen()}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      <div className="mt-5 rounded-[1.6rem] bg-slate-950 px-4 py-4 text-white">
                        <div className="flex items-start gap-3">
                          <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
                          <div>
                            <div className="text-sm font-semibold">Real-flow guidance, not disconnected demo copy</div>
                            <p className="mt-1 text-sm leading-6 text-slate-300">
                              Performance is projected and depends on booking demand, occupancy, pricing, and operating execution across each property period.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.8rem] border border-white/10 bg-white/8 p-5 text-white backdrop-blur">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-rose-200">Wallet preview</div>
                  <div className="mt-2 text-lg font-semibold">{activeWallet.currency} · {walletMeta[activeWallet.currency]?.label}</div>
                  <p className="mt-2 break-all text-sm text-slate-300">{formatAddress(activeWallet.address)}</p>
                  <button type="button" onClick={() => handleCopy(activeWallet.address)} className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                    <Copy className="h-4 w-4" />
                    {copiedValue === activeWallet.address ? 'Copied' : 'Copy wallet'}
                  </button>
                </div>

                <div className="rounded-[1.8rem] border border-white/10 bg-white/8 p-5 text-white backdrop-blur">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-rose-200">Install mobile app</div>
                  <div className="mt-2 text-lg font-semibold">Keep funding and investing one tap away</div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Install InvestAir on your phone after signup so your wallet rails and opportunity flow stay close at hand.</p>
                  <div className="mt-4">
                    <InstallAppButton
                      promptState={installPrompt}
                      label="Install InvestAir"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
                      helperClassName="flex items-center gap-2 text-sm text-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[1.8rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles className="h-4 w-4 text-rose-300" />
                  <span className="font-medium">Investor preview mode</span>
                </div>
                <p className="mt-2 leading-6">
                  {user?.email
                    ? `Signed in as ${user.email}. Wallet balances shown here use the active investor account when available.`
                    : 'Sign in or create an investor account to replace the guided preview with your real wallet addresses and balances.'}
                </p>
                <p className="mt-2 leading-6 text-slate-400">
                  Total available preview balance: {dataMode === 'live' ? formatUsd(totalBalance) : formatUsd(totalBalance)}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}