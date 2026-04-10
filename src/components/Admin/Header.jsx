"use client";

import React from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import { useLanguagePreference } from '@/context/LanguagePreferenceProvider';

export default function AdminHeader({ onLogout, user }) {
  const { openSelector } = useLanguagePreference();

  return (
    <header className="sticky top-0 z-20 mx-4 mt-4 flex items-center justify-between rounded-3xl border border-pink-100 bg-pink-50/80 p-4 shadow-[0_16px_50px_rgba(244,114,182,0.12)] backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-white/60">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">IA</span>
        <div>
          <div className="text-lg font-semibold text-slate-900">InvestAir Admin</div>
          <div className="text-xs text-slate-500">Operations and portfolio oversight</div>
        </div>
      </Link>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={openSelector}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-pink-100 bg-white text-slate-700 transition hover:bg-pink-50"
          aria-label="Change language and currency"
        >
          <Globe className="h-4.5 w-4.5" />
        </button>
        <div className="text-right text-sm text-slate-600">{user?.fullName || user?.email}</div>
        <button onClick={onLogout} className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-white transition hover:bg-slate-800">
          Logout
        </button>
      </div>
    </header>
  );
}
