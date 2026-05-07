const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  bodyText: string;
  constructor(status: number, bodyText: string) {
    super(`API ${status}: ${bodyText}`);
    this.status = status;
    this.bodyText = bodyText;
  }
}

export async function apiFetch<T>(
  path: string,
  opts: RequestInit & { token?: string } = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers = new Headers(opts.headers ?? {});
  if (!headers.has("Content-Type") && opts.body) {
    headers.set("Content-Type", "application/json");
  }
  if (opts.token) headers.set("Authorization", `Bearer ${opts.token}`);

  const res = await fetch(url, { ...opts, headers });
  const text = await res.text();
  if (!res.ok) throw new ApiError(res.status, text);
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

export async function login(email: string, password: string): Promise<{ access_token: string }> {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);
  const res = await fetch(`${API_BASE}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const text = await res.text();
  if (!res.ok) throw new ApiError(res.status, text);
  return JSON.parse(text) as { access_token: string };
}

export async function loginMfa(
  email: string,
  password: string,
  code: string
): Promise<{ access_token: string }> {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);
  // backend: /auth/mfa/token uses OAuth2PasswordRequestForm + query param code
  const res = await fetch(`${API_BASE}/auth/mfa/token?code=${encodeURIComponent(code)}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const text = await res.text();
  if (!res.ok) throw new ApiError(res.status, text);
  return JSON.parse(text) as { access_token: string };
}

export function apiBase() {
  return API_BASE;
}

