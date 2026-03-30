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
        {showLayoutExtras && <AdminHeaderWrapper />}
        <div className="flex flex-1">
          {showLayoutExtras && <AdminSidebar />}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}

function AdminHeaderWrapper() {
  const { user, logout } = useAuth();
  return <AdminHeader onLogout={logout} user={user} />;
}
