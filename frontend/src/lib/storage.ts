const KEY = "budget1_auth";

export type StoredAuth = {
  token: string;
  email: string;
};

export function loadAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed?.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAuth(auth: StoredAuth) {
  localStorage.setItem(KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

