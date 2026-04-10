"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowDownToLine, Building2, CreditCard, Globe, LayoutDashboard, LogOut, ReceiptText, ShieldCheck, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguagePreference } from '@/context/LanguagePreferenceProvider';

const items = [
  { href: '/investor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/investor/deposit', label: 'Deposit', icon: ArrowDownToLine },
  { href: '/investor/properties', label: 'Property Management', icon: Building2 },
  { href: '/investor/referrals', label: 'Referrals', icon: Users },
  { href: '/investor/withdrawals', label: 'Withdrawals', icon: CreditCard },
  { href: '/investor/transactions', label: 'Transactions', icon: ReceiptText },
];

export default function InvestorSidebar({ isOpen, onClose, onLogout, user }) {
  const pathname = usePathname();
  const { openSelector } = useLanguagePreference();

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-30 bg-slate-950/35 transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-74 flex-col border-r border-white/50 bg-[linear-gradient(180deg,rgba(255,247,251,0.97),rgba(255,255,255,0.96))] px-5 py-6 shadow-[0_30px_80px_rgba(15,23,42,0.15)] backdrop-blur-2xl transition-transform lg:sticky lg:top-0 lg:z-10 lg:h-screen lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="mb-8 flex items-center gap-3">
        
        </div>

        <div className="mb-6 rounded-3xl border border-pink-100 bg-white/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-pink-500">Verified investor</p>
          <div className="mt-2 break-all text-base font-semibold text-slate-900">{user?.email}</div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Deposits and profit tracking live
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const baseHref = item.href.split('#')[0];
            const isActive = pathname === baseHref;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={openSelector}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <Globe className="h-4 w-4" />
          Language
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </aside>
    </>
  );
}