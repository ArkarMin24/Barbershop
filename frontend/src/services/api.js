import { API_BASE_URL } from '../config';

function getCookie(name) {
  const prefix = `${name}=`;
  return document.cookie.split(';').map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(prefix))?.slice(prefix.length);
}

async function ensureCsrfToken() {
  if (getCookie('csrftoken')) return;

  await fetch(`${API_BASE_URL}/auth/csrf/`, {
    credentials: 'include',
  });
}

async function request(path, options = {}) {
  const { headers: optionHeaders = {}, method = 'GET', ...rest } = options;
  const requiresCsrfToken = !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());

  if (requiresCsrfToken) {
    await ensureCsrfToken();
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(requiresCsrfToken && getCookie('csrftoken') ? { 'X-CSRFToken': getCookie('csrftoken') } : {}),
      ...optionHeaders,
    },
    method,
    ...rest,
  });

  if (!response.ok) {
    const text = await response.text();
    let payload = {};
    try {
      payload = JSON.parse(text);
    } catch (error) {
      payload = { message: text || 'Unexpected error' };
    }

    const fieldError = Object.entries(payload)
      .filter(([, value]) => Array.isArray(value))
      .map(([field, messages]) => `${field}: ${messages.join(' ')}`)
      .join(' ');

    throw new Error(payload.detail || payload.message || fieldError || 'Request failed');
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
};
