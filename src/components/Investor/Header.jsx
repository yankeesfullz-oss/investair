"use client";

import Link from 'next/link';
import { BellDot, Menu, WalletCards } from 'lucide-react';

export default function InvestorHeader({ onMenuToggle, user }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-white/70">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">IA</span>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-pink-500">InvestAir</p>
              <h1 className="text-lg font-semibold text-slate-900">Welcome back, {user?.fullName || 'Investor'}</h1>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:flex">
            <WalletCards className="h-4 w-4" />
            Wallets live
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-pink-100 bg-pink-50 text-pink-600">
            <BellDot className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}