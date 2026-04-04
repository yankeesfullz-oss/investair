let cachedBackendUrl = null;

async function getAuth0AccessToken() {
  if (typeof window === 'undefined') return null;

  try {
    const res = await fetch('/auth/access-token', { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.token || null;
  } catch {
    return null;
  }
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
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem(tokenStorageKey);
    if (!token) {
      token = await getAuth0AccessToken();
      if (token && tokenStorageKey) {
        localStorage.setItem(tokenStorageKey, token);
      }
    }
  }

  const isFormData = typeof FormData !== 'undefined' && restOptions.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(optionHeaders || {}),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, { ...restOptions, headers, credentials: 'include' });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    const message = data && data.message ? data.message : res.statusText || 'API error';
    const err = new Error(message);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}
