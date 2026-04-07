"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowDownToLine, Copy, CreditCard, LoaderCircle, WalletCards } from 'lucide-react';

import { useInvestorAuth } from '@/components/Investor/AuthProvider';
import { apiFetch } from '@/lib/apiClient';

const INVESTOR_TOKEN_KEY = 'investor_token';
const MOONPAY_LINKS = {
  BTC: 'https://www.moonpay.com/buy/btc',
  ETH: 'https://www.moonpay.com/buy/eth',
  USDT: 'https://www.moonpay.com/buy/usdt',
};
const WALLET_META = {
  BTC: { label: 'Bitcoin', network: 'Bitcoin Mainnet' },
  ETH: { label: 'Ethereum', network: 'Ethereum Mainnet' },
  USDT: { label: 'Tether USD', network: 'TRC20 / Tron' },
};

export default function InvestorDepositPage() {
  const { wallets, loading } = useInvestorAuth();
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      setSettingsLoading(true);
      setError('');

      try {
        const data = await apiFetch('/api/wallets/deposit-settings', { tokenStorageKey: INVESTOR_TOKEN_KEY });
        if (active) {
          setSettings(data);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || 'Unable to load deposit addresses.');
        }
      } finally {
        if (active) {
          setSettingsLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      active = false;
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

  const depositCards = useMemo(() => ['BTC', 'ETH', 'USDT'].map((currency) => {
    const userWallet = wallets.find((wallet) => wallet.currency === currency) || null;
    const sharedWallet = settings?.[currency] || WALLET_META[currency];
    const address = userWallet?.address || sharedWallet?.address || '';

    return {
      currency,
      label: sharedWallet?.label || WALLET_META[currency].label,
      network: sharedWallet?.network || WALLET_META[currency].network,
      address,
      availableBalance: Number(userWallet?.availableBalance || 0),
    };
  }), [settings, wallets]);

  if (loading) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,247,251,0.9))] p-6 shadow-[0_20px_80px_rgba(15,23,42,0.07)]">
        <div className="inline-flex rounded-full border border-pink-100 bg-pink-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-pink-600">Deposit center</div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Fund your wallet with BTC, ETH, or USDT.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">If you already have crypto, scan the QR code or copy the shared deposit address below. If you do not have crypto yet, use the MoonPay buy button for the currency you want and send it to the address shown here.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/investor/dashboard" className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">Back to dashboard</Link>
          <Link href="/investor/transactions" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800">Open transactions</Link>
        </div>
      </section>

      {settingsLoading ? (
        <div className="flex items-center justify-center rounded-[2rem] border border-white/70 bg-white/85 px-4 py-12 text-sm text-slate-500 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Loading deposit addresses...
        </div>
      ) : error ? (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-4 py-5 text-sm text-rose-700">{error}</div>
      ) : (
        <section className="grid gap-5 xl:grid-cols-3">
          {depositCards.map((card) => (
            <article key={card.currency} className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.07)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Deposit wallet</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">{card.currency}</div>
                  <div className="mt-1 text-sm text-slate-500">{card.label} · {card.network}</div>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700">Shared admin deposit address</span>
              </div>

              <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                  <ArrowDownToLine className="h-3.5 w-3.5" />
                  Scan to deposit
                </div>
                <div className="flex items-center justify-center rounded-2xl bg-white p-4 shadow-sm">
                  {card.address ? <QRCodeSVG value={card.address} size={132} bgColor="transparent" fgColor="#0f172a" includeMargin={false} /> : <div className="text-sm text-slate-400">Address not configured</div>}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Wallet address</div>
                <div className="mt-3 break-all font-mono text-sm text-slate-900">{card.address || 'No address configured yet'}</div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-white px-3 py-1">Available balance {card.availableBalance.toLocaleString('en-US', { maximumFractionDigits: 8 })} {card.currency}</span>
                  <span className="rounded-full bg-white px-3 py-1">{card.network}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleCopy(card.address)}
                  disabled={!card.address}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Copy className="h-4 w-4" />
                  {copiedAddress === card.address ? 'Copied' : 'Copy address'}
                </button>
                <Link
                  href={MOONPAY_LINKS[card.currency] || 'https://www.moonpay.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-600"
                >
                  <CreditCard className="h-4 w-4" />
                  Buy {card.currency}
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
            <WalletCards className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">How to deposit</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">If you already have bitcoin, ethereum, or USDT, scan the QR code above or copy the shared deposit address for that currency and send funds there. If you do not have crypto yet, use the MoonPay buy button beside the currency you want and complete the purchase to the address shown on this page.</p>
          </div>
        </div>
      </section>
    </div>
  );
}