"use client";

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Building2, DollarSign, Layers3, PencilLine, Plus, Trash2 } from 'lucide-react';
import PropertyEditor from '@/components/Admin/PropertyEditor';
import StatusBadge from '@/components/ui/StatusBadge';
import { apiFetch } from '@/lib/apiClient';
import { formatCurrency } from '@/lib/dashboardFormatting';
import { normalizeBackendProperty } from '@/lib/investmentPropertyUtils';

function getPropertyPreviewImage(property) {
  const normalized = normalizeBackendProperty(property) || property || {};

  if (normalized?.coverImage) {
    return normalized.coverImage;
  }

  if (Array.isArray(normalized?.images) && normalized.images.length > 0) {
    return normalized.images[0];
  }

  return '';
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeProperty, setActiveProperty] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [propertyData, investmentData] = await Promise.allSettled([
        apiFetch('/api/properties', { tokenStorageKey: 'admin_token' }),
        apiFetch('/api/investments', { tokenStorageKey: 'admin_token' }),
      ]);

      if (cancelled) {
        return;
      }

      setProperties(propertyData.status === 'fulfilled' && Array.isArray(propertyData.value) ? propertyData.value : []);
      setInvestments(investmentData.status === 'fulfilled' && Array.isArray(investmentData.value) ? investmentData.value : []);
      setError(propertyData.status === 'rejected' ? propertyData.reason?.message || 'Failed to load properties' : '');
      setLoading(false);
    }

    load();
    const interval = window.setInterval(load, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const activeCounts = useMemo(() => {
    return investments.reduce((map, investment) => {
      const propertyId = investment.property?._id || investment.property;
      map[propertyId] = (map[propertyId] || 0) + (['active', 'reserved'].includes(investment.status) ? 1 : 0);
      return map;
    }, {});
  }, [investments]);

  async function refreshProperties() {
    const data = await apiFetch('/api/properties', { tokenStorageKey: 'admin_token' });
    setProperties(Array.isArray(data) ? data : []);
  }

  async function handleCreate(payload) {
    setIsSaving(true);
    setError('');

    try {
      await apiFetch('/api/properties', {
        method: 'POST',
        tokenStorageKey: 'admin_token',
        body: JSON.stringify(payload),
      });
      setIsCreating(false);
      await refreshProperties();
    } catch (requestError) {
      setError(requestError.message || 'Failed to create property');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdate(payload) {
    if (!activeProperty?._id) {
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const updated = await apiFetch(`/api/properties/${activeProperty._id}`, {
        method: 'PATCH',
        tokenStorageKey: 'admin_token',
        body: JSON.stringify(payload),
      });
      setProperties((current) => current.map((property) => (property._id === updated._id ? updated : property)));
      setActiveProperty(null);
    } catch (requestError) {
      setError(requestError.message || 'Failed to update property');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(propertyId) {
    const confirmed = window.confirm('Delete this property from the admin inventory?');
    if (!confirmed) {
      return;
    }

    setError('');

    try {
      await apiFetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
        tokenStorageKey: 'admin_token',
      });
      setProperties((current) => current.filter((property) => property._id !== propertyId));
      if (activeProperty?._id === propertyId) {
        setActiveProperty(null);
      }
    } catch (requestError) {
      setError(requestError.message || 'Failed to delete property');
    }
  }

  async function handleAutofillDraft(payload) {
    // Quick client-side preflight: ensure an admin token exists to avoid 403s
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      if (!token) {
        throw new Error('Admin authentication required. Sign in to continue.');
      }
    } catch (err) {
      return Promise.reject(err);
    }

    return apiFetch('/api/properties/autofill', {
      method: 'POST',
      tokenStorageKey: 'admin_token',
      body: JSON.stringify(payload),
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-white/70 bg-white/85 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-pink-100 bg-pink-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-pink-600">Property management</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Manage inventory, payout rates, and active slot coverage.</h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveProperty(null);
              setIsCreating(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Add property
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.5rem] border border-rose-100 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div>
      ) : null}

      {isCreating ? (
        <PropertyEditor
          mode="create"
          busy={isSaving}
          onAutofill={handleAutofillDraft}
          onCancel={() => setIsCreating(false)}
          onSubmit={handleCreate}
        />
      ) : null}

      {activeProperty ? (
        <PropertyEditor
          property={activeProperty}
          busy={isSaving}
          onAutofill={handleAutofillDraft}
          onCancel={() => setActiveProperty(null)}
          onSubmit={handleUpdate}
        />
      ) : null}

      {loading ? (
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 text-sm text-slate-500 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">Loading properties…</div>
      ) : (
        <section className="grid gap-5 xl:grid-cols-2">
          {properties.map((property) => {
            const propertyId = property._id || property.id;
            const previewImage = getPropertyPreviewImage(property);

            return (
              <article key={propertyId} className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_20px_80px_rgba(15,23,42,0.07)]">
                <div className="relative aspect-2/1 w-full overflow-hidden bg-slate-100">
                  {previewImage ? (
                    <Image
                      src={previewImage}
                      alt={property.name}
                      fill
                      sizes="(max-width: 1280px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#f8fafc_0%,#e2e8f0_100%)] text-sm font-medium text-slate-500">
                      No property image
                    </div>
                  )}
                </div>

                <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-700">
                      <Building2 className="h-3.5 w-3.5" />
                      Property
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold text-slate-900">{property.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{property.location}</p>
                  </div>
                  <StatusBadge status={property.status} />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400"><DollarSign className="h-4 w-4" />Current Daily Payout</div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{formatCurrency(property.currentDailyPayoutAmount || 0)}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Slot Base Price</div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{formatCurrency(property.slotBasePriceMonthly || 0)}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400"><Layers3 className="h-4 w-4" />Active Slots</div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{activeCounts[propertyId] || 0}</div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setActiveProperty(property);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <PencilLine className="h-4 w-4" />
                    Edit details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(propertyId)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}