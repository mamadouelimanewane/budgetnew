const BASE = "/api";

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!data.success && res.status >= 400) throw new Error(data.error || "API Error");
  return data;
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
