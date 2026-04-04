let cachedBackendUrl = null;

export async function getBackendUrl() {
  if (cachedBackendUrl) return cachedBackendUrl;
  try {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error('Failed to read config');
    const data = await res.json();
    cachedBackendUrl = data.backendUrl;
    return cachedBackendUrl;
  } catch (e) {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }
}

export async function apiFetch(path, options = {}) {
  const base = await getBackendUrl();
  const { tokenStorageKey = 'token', headers: optionHeaders, ...restOptions } = options;
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
