"use client";

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { formatDateTime } from '@/lib/dashboardFormatting';

const ADMIN_TOKEN_KEY = 'admin_token';

export default function InvestorsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch('/api/users', { tokenStorageKey: ADMIN_TOKEN_KEY });
        if (!mounted) return;
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!mounted) return;
        setError(err.status === 401 ? 'Your admin session expired. Please sign in again.' : (err.message || 'Failed to load users'));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Investors</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : users.length === 0 ? (
        <p>No investors found.</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u._id || u.id} className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="font-medium text-slate-900">{u.fullName || u.name || 'Investor'}</div>
                  <div className="text-sm text-slate-500">{u.email}</div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-50 px-3 py-1">Joined {u.createdAt ? formatDateTime(u.createdAt) : 'Unknown'}</span>
                    <span className="rounded-full bg-slate-50 px-3 py-1">Last login {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'Not synced yet'}</span>
                    <span className={`rounded-full px-3 py-1 ${u.auth0Sub ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{u.auth0Sub ? 'Auth0 synced' : 'No Auth0 subject yet'}</span>
                  </div>
                </div>
                <div className="text-sm text-slate-500">Role: {u.role}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
