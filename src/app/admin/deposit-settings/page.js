"use client";

import { useEffect, useState } from 'react';
import { LoaderCircle, Save, WalletCards } from 'lucide-react';

import { apiFetch } from '@/lib/apiClient';

const ADMIN_TOKEN_KEY = 'admin_token';
const CURRENCIES = ['BTC', 'ETH', 'USDT'];

function createEmptyForm() {
  return {
    BTC: { address: '', network: 'Bitcoin Mainnet', label: 'Bitcoin' },
    ETH: { address: '', network: 'Ethereum Mainnet', label: 'Ethereum' },
    USDT: { address: '', network: 'TRC20 / Tron', label: 'Tether USD' },
  };
}

export default function AdminDepositSettingsPage() {
  const [form, setForm] = useState(createEmptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setMessage('');
      try {
        const data = await apiFetch('/api/wallets/admin/deposit-settings', { tokenStorageKey: ADMIN_TOKEN_KEY });
        if (!active) {
          return;
        }

        setForm({
          BTC: data?.BTC || createEmptyForm().BTC,
          ETH: data?.ETH || createEmptyForm().ETH,
          USDT: data?.USDT || createEmptyForm().USDT,
        });
      } catch (error) {
        if (active) {
          setMessage(error.message || 'Unable to load deposit settings.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const data = await apiFetch('/api/wallets/admin/deposit-settings', {
        method: 'PUT',
        tokenStorageKey: ADMIN_TOKEN_KEY,
        body: JSON.stringify(form),
      });

      setForm({
        BTC: data?.BTC || form.BTC,
        ETH: data?.ETH || form.ETH,
        USDT: data?.USDT || form.USDT,
      });
      setMessage(`Shared deposit addresses saved. ${Number(data?.syncedWallets || 0)} wallet records updated.`);
    } catch (error) {
      setMessage(error.message || 'Unable to save deposit settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,247,251,0.9))] p-6 shadow-[0_20px_80px_rgba(15,23,42,0.07)]">
        <div className="inline-flex rounded-full border border-pink-100 bg-pink-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-pink-600">Deposit wallet control</div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Manage the BTC, ETH, and USDT deposit addresses assigned to all users.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Saving here immediately syncs every investor wallet record for that currency to the admin-managed shared deposit address. Admin login and admin auth remain unchanged.</p>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl bg-slate-50 px-4 py-10 text-sm text-slate-500">
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Loading deposit wallet settings...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {CURRENCIES.map((currency) => (
              <div key={currency} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                    <WalletCards className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900">{currency}</div>
                    <div className="text-sm text-slate-500">{form[currency]?.network || ''}</div>
                  </div>
                </div>
                <label className="block text-sm font-medium text-slate-700">Shared deposit address</label>
                <textarea
                  value={form[currency]?.address || ''}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    [currency]: {
                      ...current[currency],
                      address: event.target.value,
                    },
                  }))}
                  className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-mono text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder={`Enter the shared ${currency} deposit address`}
                />
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className={`text-sm ${message.includes('saved') ? 'text-emerald-700' : 'text-slate-500'}`}>{message || 'Changes apply immediately to all investor wallet records and deposit pages.'}</div>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save shared deposit wallets'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}