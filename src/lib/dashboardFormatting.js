export function formatCurrency(value, currency = 'USD') {
  const numericValue = Number(value || 0);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

export function formatDate(value) {
  if (!value) {
    return 'Pending';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Pending';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) {
    return 'Pending';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Pending';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function getStatusBadgeClasses(status) {
  const normalized = String(status || '').toLowerCase();

  if (['paid', 'sent', 'completed', 'credited', 'active', 'reserved', 'confirmed'].includes(normalized)) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (['processing', 'confirming', 'pending', 'detected'].includes(normalized)) {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  if (['rejected', 'failed', 'cancelled'].includes(normalized)) {
    return 'border-rose-200 bg-rose-50 text-rose-700';
  }

  return 'border-slate-200 bg-slate-100 text-slate-600';
}

export function formatStatusLabel(status) {
  return String(status || 'unknown')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function summarizeWallets(wallets = []) {
  return wallets.reduce(
    (summary, wallet) => {
      summary.available += Number(wallet.availableBalance || 0);
      summary.locked += Number(wallet.lockedBalance || 0);
      return summary;
    },
    { available: 0, locked: 0 }
  );
}