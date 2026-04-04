"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ArrowUpRight,
  Copy,
  CreditCard,
  LoaderCircle,
  ShieldCheck,
  WalletCards,
  X,
} from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';

const INVESTOR_TOKEN_KEY = 'investor_token';

const MOONPAY_LINKS = {
  BTC: 'https://www.moonpay.com/buy/btc',
  ETH: 'https://www.moonpay.com/buy/eth',
  USDT: 'https://www.moonpay.com/buy/usdt',
};
const MIN_ALLOWED_DURATION_MONTHS = 1;
const MAX_ALLOWED_DURATION_MONTHS = 24;
const DEFAULT_ALLOWED_DURATIONS = [1, 3, 6, 12];

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

function normalizeSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildAvailableDurations(property) {
  const sourceDurations = Array.isArray(property.allowedDurations) && property.allowedDurations.length > 0
    ? property.allowedDurations.map(Number)
    : [Number(property.minimumInvestmentMonths || DEFAULT_ALLOWED_DURATIONS[0])];

  const deduped = [...new Set(
    sourceDurations.filter(
      (duration) => Number.isInteger(duration)
        && duration >= MIN_ALLOWED_DURATION_MONTHS
        && duration <= MAX_ALLOWED_DURATION_MONTHS
    )
  )].sort((left, right) => left - right);
  return deduped.length > 0 ? deduped : DEFAULT_ALLOWED_DURATIONS;
}

function getMatchingBackendProperty(properties, property) {
  const localId = String(property.id || '');
  const localSlug = normalizeSlug(localId || property.slug || property.name);
  const localName = normalizeSlug(property.name);

  return properties.find((candidate) => {
    const candidateSlug = normalizeSlug(candidate.slug || candidate.name || candidate._id);
    const candidateName = normalizeSlug(candidate.name);
    const candidateSourceId = normalizeSlug(candidate.sourceListingId);

    return (
      String(candidate._id || '') === localId
      || candidateSlug === localSlug
      || candidateName === localName
      || candidateSourceId === localId
    );
  }) || null;
}

function getInvestmentCurrency(backendProperty) {
  return String(backendProperty?.payoutCurrency || 'USDT').toUpperCase();
}

function getPreviewImage(property) {
  if (Array.isArray(property.images) && property.images.length > 0) {
    return property.images[0];
  }

  return property.image || property.coverImage || '';
}

function getNextStartDate(backendProperty) {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);

  const candidate = backendProperty?.nextAvailableStartDate ? new Date(backendProperty.nextAvailableStartDate) : now;
  if (Number.isNaN(candidate.getTime()) || candidate < now) {
    return now.toISOString();
  }

  candidate.setUTCHours(0, 0, 0, 0);
  return candidate.toISOString();
}

export default function InvestmentCheckoutCard({ property, monthlyPrice, initialMonths = null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(false);
  const [session, setSession] = useState({ user: null, wallets: [] });
  const [backendProperty, setBackendProperty] = useState(null);
  const [backendError, setBackendError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copied, setCopied] = useState('');

  const allowedDurations = useMemo(() => buildAvailableDurations(property), [property]);
  const [selectedMonths, setSelectedMonths] = useState(() => {
    const normalizedInitial = Number(initialMonths);
    return allowedDurations.includes(normalizedInitial) ? normalizedInitial : allowedDurations[0];
  });

  useEffect(() => {
    const normalizedInitial = Number(initialMonths);
    if (allowedDurations.includes(normalizedInitial)) {
      setSelectedMonths(normalizedInitial);
      return;
    }

    setSelectedMonths(allowedDurations[0]);
  }, [allowedDurations, initialMonths]);

  async function loadCheckoutData() {
    setCheckingSession(true);
    setBackendError('');

    try {
      const properties = await apiFetch('/api/properties');
      const matchedProperty = getMatchingBackendProperty(Array.isArray(properties) ? properties : [], property);
      setBackendProperty(matchedProperty);

      if (!matchedProperty) {
        setBackendError('This listing is visible publicly, but checkout is not connected to a live backend property yet.');
      }

      if (typeof window !== 'undefined') {
        const token = localStorage.getItem(INVESTOR_TOKEN_KEY);
        if (token) {
          const [user, wallets] = await Promise.all([
            apiFetch('/api/users/me', { tokenStorageKey: INVESTOR_TOKEN_KEY }),
            apiFetch('/api/wallets', { tokenStorageKey: INVESTOR_TOKEN_KEY }),
          ]);

          setSession({
            user,
            wallets: Array.isArray(wallets) ? wallets : [],
          });
        } else {
          setSession({ user: null, wallets: [] });
        }
      }
    } catch (error) {
      setBackendError(error.message || 'Unable to load live checkout details right now.');
    } finally {
      setCheckingSession(false);
    }
  }

  function handleOpen() {
    setIsOpen(true);
    setSubmitError('');
    setSuccessMessage('');
    void loadCheckoutData();
  }

  function handleClose() {
    setIsOpen(false);
    setSubmitError('');
    setSuccessMessage('');
  }

  async function refreshWallets() {
    const wallets = await apiFetch('/api/wallets', { tokenStorageKey: INVESTOR_TOKEN_KEY });
    setSession((current) => ({ ...current, wallets: Array.isArray(wallets) ? wallets : [] }));
  }

  async function handleCopy(value) {
    if (!value || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopied(value);
    window.setTimeout(() => setCopied(''), 1600);
  }

  async function handleConfirmInvestment() {
    if (!backendProperty) {
      return;
    }

    setLoading(true);
    setSubmitError('');
    setSuccessMessage('');

    try {
      await apiFetch('/api/investments', {
        method: 'POST',
        tokenStorageKey: INVESTOR_TOKEN_KEY,
        body: JSON.stringify({
          property: backendProperty._id,
          startDate: getNextStartDate(backendProperty),
          durationMonths: selectedMonths,
          slotPrice: investmentTotal,
          currency: investmentCurrency,
        }),
      });

      await refreshWallets();
      setSuccessMessage('Investment confirmed. Your balance has been debited and the rental slot has been reserved.');
    } catch (error) {
      setSubmitError(error.message || 'Unable to complete this investment right now.');
    } finally {
      setLoading(false);
    }
  }

  const occupancyRate = Number(property.occupancyScore || backendProperty?.occupancyScore || 0) / 100;
  const dailyPayout = Number(property.currentDailyPayoutAmount || backendProperty?.currentDailyPayoutAmount || 0);
  const investmentCurrency = getInvestmentCurrency(backendProperty);
  const investmentTotal = Number(monthlyPrice || 0) * Number(selectedMonths || 0);
  const estimatedGrossRent = dailyPayout * 30 * Number(selectedMonths || 0);
  const estimatedProfit = estimatedGrossRent * occupancyRate;
  const activeWallet = session.wallets.find((wallet) => wallet.currency === investmentCurrency);
  const availableBalance = Number(activeWallet?.availableBalance || 0);
  const hasEnoughBalance = availableBalance >= investmentTotal && investmentTotal > 0;
  const redirectTo = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
  const previewImage = getPreviewImage(property);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-rose-500 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-rose-600"
      >
        Invest now
        <ArrowUpRight size={16} />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 sm:p-6 backdrop-blur-sm">
          {/* Scrollable Modal Container */}
          <div className="relative w-full max-w-4xl max-h-[95dvh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-white/70 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.22)]">
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 shadow-sm"
              aria-label="Close invest card"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Main Grid: Stacks on mobile, Side-by-side on large screens */}
            <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="border-b border-slate-100 bg-[linear-gradient(180deg,#fff7fb_0%,#ffffff_100%)] p-5 sm:p-6 lg:border-b-0 lg:border-r lg:p-8">
                <p className="inline-flex rounded-full border border-pink-100 bg-pink-50 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-pink-600">Investment checkout</p>
                <div className="mt-4 sm:mt-5 overflow-hidden rounded-2xl sm:rounded-[1.5rem] border border-slate-100 bg-white">
                  {previewImage ? (
                    <img src={previewImage} alt={property.name} className="h-40 sm:h-52 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 sm:h-52 items-center justify-center bg-slate-100 text-sm text-slate-500">Preview image unavailable</div>
                  )}
                </div>
                <h3 className="mt-4 sm:mt-5 text-xl sm:text-2xl font-semibold text-slate-950 pr-8 lg:pr-0">{property.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Choose your duration, preview the occupancy-adjusted earnings, and invest directly from your funded wallet balance.</p>

                <div className="mt-5 sm:mt-6 grid gap-3 grid-cols-2">
                  <div className="rounded-2xl sm:rounded-[1.5rem] bg-slate-50 p-4">
                    <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-slate-400">Daily payout</div>
                    <div className="mt-1 sm:mt-2 text-xl sm:text-2xl font-semibold text-slate-950">{formatUsd(dailyPayout)}</div>
                    <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500">Daily rent charged</div>
                  </div>
                  <div className="rounded-2xl sm:rounded-[1.5rem] bg-slate-50 p-4">
                    <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-slate-400">Occupancy rate</div>
                    <div className="mt-1 sm:mt-2 text-xl sm:text-2xl font-semibold text-slate-950">{Math.round(occupancyRate * 100)}%</div>
                    <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500">Earned rent estimate</div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 rounded-2xl sm:rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-slate-400">Estimated formula</div>
                  <div className="mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-700">
                    Estimated profit = daily payout × 30 days × occupancy % × selected months
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
                {checkingSession ? (
                  <div className="flex min-h-75 items-center justify-center text-slate-500">
                    <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
                    Loading checkout...
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 sm:space-y-5">
                      <div>
                        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Select duration</p>
                        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2 sm:gap-3">
                          {allowedDurations.map((duration) => (
                            <button
                              key={duration}
                              type="button"
                              onClick={() => setSelectedMonths(duration)}
                              className={`rounded-xl sm:rounded-2xl border px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium transition ${selectedMonths === duration ? 'border-rose-500 bg-rose-500 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                              {duration} mo
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                        <div className="flex sm:block justify-between items-center sm:items-start rounded-2xl sm:rounded-[1.5rem] bg-slate-50 p-4">
                          <div>
                            <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-slate-400">Investment</div>
                            <div className="mt-1 sm:mt-2 text-lg sm:text-2xl font-semibold text-slate-950">{formatUsd(investmentTotal)}</div>
                          </div>
                          <div className="text-right sm:text-left text-xs sm:text-sm text-slate-500 sm:mt-2">{formatUsd(monthlyPrice)}/mo × {selectedMonths}</div>
                        </div>
                        <div className="flex sm:block justify-between items-center sm:items-start rounded-2xl sm:rounded-[1.5rem] bg-slate-50 p-4">
                          <div>
                            <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-slate-400">Est. profit</div>
                            <div className="mt-1 sm:mt-2 text-lg sm:text-2xl font-semibold text-emerald-700">{formatUsd(estimatedProfit)}</div>
                          </div>
                          <div className="text-right sm:text-left text-xs sm:text-sm text-slate-500 sm:mt-2">Gross: {formatUsd(estimatedGrossRent)}</div>
                        </div>
                      </div>

                      {session.user ? (
                        <div className="rounded-2xl sm:rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-slate-400">Investor session</div>
                              <div className="mt-1 sm:mt-2 max-w-45 truncate text-base font-semibold text-slate-950 sm:max-w-xs sm:text-lg">{session.user.fullName || session.user.email}</div>
                              <div className="mt-1 text-xs sm:text-sm text-slate-500">Currency required: {investmentCurrency}</div>
                            </div>
                            <div className="inline-flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium text-emerald-700">
                              <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              Signed in
                            </div>
                          </div>

                          <div className="mt-4 grid gap-2 sm:gap-3 grid-cols-2">
                            <div className="rounded-xl sm:rounded-2xl bg-slate-50 p-3">
                              <div className="text-[9px] sm:text-[11px] uppercase tracking-[0.2em] text-slate-400">Available</div>
                              <div className="mt-1 text-xs sm:text-sm font-semibold text-slate-950 truncate">{formatAssetAmount(availableBalance, investmentCurrency)}</div>
                            </div>
                            <div className="rounded-xl sm:rounded-2xl bg-slate-50 p-3">
                              <div className="text-[9px] sm:text-[11px] uppercase tracking-[0.2em] text-slate-400">Remaining</div>
                              <div className="mt-1 text-xs sm:text-sm font-semibold text-slate-950 truncate">{formatAssetAmount(Math.max(availableBalance - investmentTotal, 0), investmentCurrency)}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl sm:rounded-[1.5rem] border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
                          <div className="text-base sm:text-lg font-semibold text-slate-950">Sign in to invest</div>
                          <p className="mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600">You need an investor session before you can confirm a duration or debit funds.</p>
                          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Link href={`/investor/login?redirectTo=${encodeURIComponent(redirectTo)}&months=${selectedMonths}`} className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">
                              Sign in
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                            <Link href={`/investor/signup?redirectTo=${encodeURIComponent(redirectTo)}&months=${selectedMonths}`} className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                              Sign up
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      )}

                      {backendError && (
                        <div className="rounded-xl sm:rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs sm:text-sm text-amber-700">{backendError}</div>
                      )}

                      {successMessage && (
                        <div className="rounded-xl sm:rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm text-emerald-700">{successMessage}</div>
                      )}

                      {submitError && (
                        <div className="rounded-xl sm:rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs sm:text-sm text-rose-700">{submitError}</div>
                      )}

                      {session.user && !hasEnoughBalance ? (
                        <div className="rounded-2xl sm:rounded-[1.5rem] border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
                          <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-slate-950">
                            <WalletCards className="h-5 w-5 text-rose-500 shrink-0" />
                            Fund your account
                          </div>
                          <p className="mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600">Your {investmentCurrency} balance is too low. Use your wallet address below to add funds, then confirm the investment.</p>

                          <div className="mt-4 space-y-3">
                            {session.wallets.map((wallet) => (
                              <div key={wallet._id} className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                                  <div className="w-full">
                                    <div className="text-xs sm:text-sm font-semibold text-slate-950">{wallet.currency} wallet</div>
                                    <div className="mt-1 break-all text-xs text-slate-600 font-mono bg-white p-2 rounded-lg border border-slate-100">{wallet.address}</div>
                                  </div>
                                  <div className="flex flex-row w-full sm:w-auto gap-2 shrink-0">
                                    <button type="button" onClick={() => handleCopy(wallet.address)} className="inline-flex flex-1 sm:flex-none justify-center items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                                      <Copy className="h-3.5 w-3.5" />
                                      {copied === wallet.address ? 'Copied' : 'Copy'}
                                    </button>
                                    <Link href={MOONPAY_LINKS[wallet.currency] || 'https://www.moonpay.com'} target="_blank" rel="noreferrer" className="inline-flex flex-1 sm:flex-none justify-center items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl bg-rose-500 px-3 py-2 text-xs sm:text-sm font-medium text-white transition hover:bg-rose-600">
                                      <CreditCard className="h-3.5 w-3.5" />
                                      Fund
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 sm:mt-8">
                      <button
                        type="button"
                        onClick={handleConfirmInvestment}
                        disabled={!session.user || !backendProperty || !hasEnoughBalance || loading}
                        className="inline-flex w-full sm:flex-1 items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-rose-500 px-5 py-3.5 sm:py-3 text-sm font-medium text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Confirm investment
                      </button>
                      <button
                        type="button"
                        onClick={handleClose}
                        className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-5 py-3.5 sm:py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}