"use client";

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';

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
            <div key={u._id || u.id} className="p-3 bg-white rounded shadow flex justify-between">
              <div>
                <div className="font-medium">{u.fullName || u.name}</div>
                <div className="text-sm text-gray-500">{u.email}</div>
              </div>
              <div className="text-sm text-gray-500">Role: {u.role}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
