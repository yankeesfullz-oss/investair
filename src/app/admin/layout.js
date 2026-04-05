"use client";

import { usePathname } from 'next/navigation';
import AuthProvider, { useAuth } from '@/components/Admin/AuthProvider';
import AdminHeader from '@/components/Admin/Header';
import AdminSidebar from '@/components/Admin/Sidebar';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const showLayoutExtras = !pathname?.startsWith('/admin/login');

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <AdminShellContent showLayoutExtras={showLayoutExtras}>{children}</AdminShellContent>
      </div>
    </AuthProvider>
  );
}

function AdminHeaderWrapper() {
  const { user, logout, loading } = useAuth();

  if (loading || !user) {
    return null;
  }

  return <AdminHeader onLogout={logout} user={user} />;
}

function AdminShellContent({ children, showLayoutExtras }) {
  const { user, loading } = useAuth();

  if (!showLayoutExtras) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-slate-500">
        Loading admin workspace...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-slate-500">
        Redirecting to admin login...
      </div>
    );
  }

  return (
    <>
      <AdminHeaderWrapper />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </>
  );
}
