let cachedBackendUrl = null;
const missingEndpointRetryAt = new Map();

function createApiError(message, status, body = null) {
  const err = new Error(message);
  err.status = status;
  err.body = body;
  return err;
}

export async function getBackendUrl() {
  if (cachedBackendUrl) return cachedBackendUrl;
  // Prefer build-time environment variable NEXT_PUBLIC_API_URL so backend URL
  // isn't hardcoded in source. Fallback to localhost for local dev.
  cachedBackendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return cachedBackendUrl;
}

export async function apiFetch(path, options = {}) {
  const base = await getBackendUrl();
  const { tokenStorageKey = 'token', headers: optionHeaders, ...restOptions } = options;
  const method = String(restOptions.method || 'GET').toUpperCase();
  const requestUrl = `${base}${path}`;
  const missingEndpointKey = `${method}:${requestUrl}`;

  if (method === 'GET') {
    const retryAt = missingEndpointRetryAt.get(missingEndpointKey);
    if (retryAt && retryAt > Date.now()) {
      throw createApiError('Endpoint temporarily unavailable', 404);
    }
  }

  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem(tokenStorageKey);
  }

  const isFormData = typeof FormData !== 'undefined' && restOptions.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(optionHeaders || {}),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(requestUrl, { ...restOptions, headers, credentials: 'include' });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    if (res.status === 404 && method === 'GET') {
      missingEndpointRetryAt.set(missingEndpointKey, Date.now() + 60_000);
    }

    const message = data && data.message ? data.message : res.statusText || 'API error';
    throw createApiError(message, res.status, data);
  }

  if (method === 'GET') {
    missingEndpointRetryAt.delete(missingEndpointKey);
  }

  return data;
}
