"use client";

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';

export default function InvestorsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await apiFetch('/api/users');
        if (!mounted) return;
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
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
