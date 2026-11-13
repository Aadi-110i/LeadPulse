const TOKEN_KEY = 'leadpulse.token';

let authToken = readStoredToken();

function readStoredToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY) ?? null;
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  authToken = token ?? null;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — the session simply will not persist across reloads */
  }
}

export function getAuthToken() {
  return authToken;
}

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors ?? [];
  }
}

/**
 * Single fetch wrapper for the whole app.
 * Unwraps the API envelope and turns failures into a typed ApiError.
 */
export async function apiRequest(path, { method = 'GET', body, signal } = {}) {
  let response;

  try {
    response = await fetch(path, {
      method,
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ApiError('Could not reach the LeadPulse API. Is the server running?', 0, []);
  }

  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    const message = payload?.message ?? `Request failed (${response.status})`;
    throw new ApiError(message, response.status, payload?.errors);
  }

  return payload?.data ?? payload;
}

export function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export default { apiRequest, buildQuery, setAuthToken, getAuthToken, ApiError };
