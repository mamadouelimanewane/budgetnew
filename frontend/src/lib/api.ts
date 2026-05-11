export const apiBase = () => "/api";

export interface ApiOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T = any>(path: string, options?: ApiOptions): Promise<T> {
  const { token, headers, ...rest } = options || {};
  const authHeader = token ? { "Authorization": `Bearer ${token}` } : {};

  const res = await fetch(apiBase() + path, {
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...headers
    },
    ...rest,
  });

  const data = await res.json();

  if (!res.ok || (data && data.success === false)) {
    throw new Error(data?.error || data?.detail || `API Error (${res.status})`);
  }

  // If the response is wrapped in ApiResponse<T>, return the data part
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return data.data as T;
  }

  return data as T;
}

export const api = {
  budget: {
    list: () => apiFetch("/budget"),
    create: (body: object) => apiFetch("/budget", { method: "POST", body: JSON.stringify(body) }),
    update: (body: object) => apiFetch("/budget", { method: "PUT", body: JSON.stringify(body) }),
  },
  directions: {
    list: () => apiFetch("/directions"),
    update: (body: object) => apiFetch("/directions", { method: "PUT", body: JSON.stringify(body) }),
  },
  engagements: {
    list: (params?: Record<string,string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return apiFetch("/engagements" + qs);
    },
    create: (body: object) => apiFetch("/engagements", { method: "POST", body: JSON.stringify(body) }),
    update: (body: object) => apiFetch("/engagements", { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: number) => apiFetch("/engagements", { method: "DELETE", body: JSON.stringify({ id }) }),
  },
  marches: {
    list: () => apiFetch("/marches"),
    create: (body: object) => apiFetch("/marches", { method: "POST", body: JSON.stringify(body) }),
    update: (body: object) => apiFetch("/marches", { method: "PUT", body: JSON.stringify(body) }),
  },
  alerts: {
    list: () => apiFetch("/alerts"),
    markRead: (id: number | "all") => apiFetch("/alerts", { method: "PUT", body: JSON.stringify({ id }) }),
  },
  migrate: (secret: string) => apiFetch("/migrate", { method: "POST", body: JSON.stringify({ secret }) }),
};

export type ApiResponse<T> = { success: boolean; data: T; error?: string };
