function normalizeBackendUrl(value) {
  return value ? value.replace(/\/$/, '') : '';
}

function getConfiguredBackendUrl() {
  return normalizeBackendUrl(
    process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || ''
  );
}

function getDevelopmentFallbackUrl() {
  return process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';
}

export function getBackendUrl() {
  const configuredUrl = getConfiguredBackendUrl();
  if (configuredUrl) return configuredUrl;

  const fallbackUrl = getDevelopmentFallbackUrl();
  if (fallbackUrl) return fallbackUrl;

  throw new Error('Backend API URL is not configured. Set BACKEND_URL or NEXT_PUBLIC_API_URL.');
}

export function getPublicBackendUrl() {
  const configuredUrl = normalizeBackendUrl(process.env.NEXT_PUBLIC_API_URL || '');
  if (configuredUrl) return configuredUrl;

  const fallbackUrl = getDevelopmentFallbackUrl();
  if (fallbackUrl) return fallbackUrl;

  throw new Error('Public backend API URL is not configured. Set NEXT_PUBLIC_API_URL.');
}