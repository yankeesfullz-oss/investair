"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, CircleDollarSign, Landmark, LayoutDashboard, MessagesSquare, Settings2, Users, WalletCards } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminSidebar() {
  const pathname = usePathname();
  const items = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/properties', label: 'Property Management', icon: Building2 },
    { href: '/admin/deposits', label: 'Deposits', icon: Landmark },
    { href: '/admin/withdrawals', label: 'Withdrawals', icon: CircleDollarSign },
    { href: '/admin/investors', label: 'Investors', icon: Users },
    { href: '/admin/chatbots', label: 'Chatbots', icon: MessagesSquare },
    { href: '/admin/deposit-settings', label: 'Deposit Wallets', icon: Settings2 },
  ];

  return (
    <aside className="w-72 border-r border-white/50 bg-[linear-gradient(180deg,_rgba(255,247,251,0.96),_rgba(255,255,255,0.96))] px-5 py-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
      <div className="mb-8 flex items-center gap-3">
       
      </div>
      <div className="mb-6 rounded-3xl border border-rose-100 bg-white/85 p-4 shadow-sm">
        <div className="text-xs uppercase tracking-[0.24em] text-rose-500">Live oversight</div>
        <p className="mt-3 text-sm leading-6 text-slate-600">Monitor deposits, approve withdrawals, and manage property inventory from one place.</p>
      </div>
      <nav className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                isActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-white hover:text-slate-900'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/admin/manage-investments"
          className={cn(
            'mt-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
            pathname === '/admin/manage-investments' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-white hover:text-slate-900'
          )}
        >
          <WalletCards className="h-4 w-4" />
          Rental Slots
        </Link>
      </nav>
    </aside>
  );
}
