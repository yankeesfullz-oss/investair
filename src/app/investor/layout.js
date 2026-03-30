"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import InvestorAuthProvider, { useInvestorAuth } from '@/components/Investor/AuthProvider';
import InvestorSidebar from '@/components/Investor/Sidebar';

export default function InvestorLayout({ children }) {
  return (
    <InvestorAuthProvider>
      <InvestorShell>{children}</InvestorShell>
    </InvestorAuthProvider>
  );
}

function InvestorShell({ children }) {
  const pathname = usePathname();
  const { user, logout, loading } = useInvestorAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isAuthPage = pathname?.startsWith('/investor/login') || pathname?.startsWith('/investor/signup');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7fb_0%,#ffffff_42%,#f8fbff_100%)] text-slate-900">
      <div className="lg:flex">
        <InvestorSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={logout}
          user={user}
        />
        <div className="min-h-screen flex-1 lg:pl-0">
          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setIsSidebarOpen((open) => !open)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm"
                aria-label="Toggle navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link href="/" className="flex items-center gap-3 rounded-2xl bg-white/80 px-3 py-2 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">IA</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-pink-500">InvestAir</p>
                  <div className="text-sm font-semibold text-slate-900">Investor workspace</div>
                </div>
              </Link>
            </div>
            {loading ? (
              <div className="rounded-[2rem] border border-white/60 bg-white/80 p-8 text-sm text-slate-500 shadow-[0_20px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                Loading your investor workspace...
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </div>
  );
}