const API = String(window.FLORA_CONFIG?.apiUrl ?? '').replace(/\/$/, '');
const KEY = 'flora.token';

export const apiConfigured = () => /^https?:\/\//.test(API) && !API.includes('YOUR-BOT-SERVER');

const store = {
  get: () => { try { return localStorage.getItem(KEY); } catch { return null; } },
  set: (v) => { try { localStorage.setItem(KEY, v); } catch { /* private mode: stay signed in for this tab only */ } },
  del: () => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } },
};
let memoryToken = null;

export const hasToken = () => Boolean(memoryToken || store.get());
export const logout = () => { memoryToken = null; store.del(); };

/** Reads the result Discord login leaves in the address (#token=… or #error=…) and removes it from view. */
export function captureLogin() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  const token = params.get('token');
  const error = params.get('error');
  if (token || error) history.replaceState(null, '', location.pathname + location.search + '#/');
  if (token) { memoryToken = token; store.set(token); }
  return error;
}

export const loginUrl = () => `${API}/auth/login?return=${encodeURIComponent(location.origin + location.pathname)}`;

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

export async function api(path, { method = 'GET', body, raw } = {}) {
  const token = memoryToken || store.get();
  let res;
  try {
    res = await fetch(API + path, {
      method,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the bot server. Check that the bot is running and the address in config.js is right.', 0);
  }
  if (res.status === 401 || res.status === 403) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 || /no longer/.test(data.error ?? '')) { logout(); window.dispatchEvent(new CustomEvent('flora:signedout', { detail: data.error })); }
    throw new ApiError(data.error ?? 'Not allowed.', res.status);
  }
  if (!res.ok) throw new ApiError((await res.json().catch(() => ({}))).error ?? `Request failed (${res.status}).`, res.status);
  return raw ? res : res.json();
}
