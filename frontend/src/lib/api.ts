const BASE = "/api";

async function request(path: string, options?: RequestInit) {
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
    list: () => request("/budget"),
    create: (body: object) => request("/budget", { method: "POST", body: JSON.stringify(body) }),
    update: (body: object) => request("/budget", { method: "PUT", body: JSON.stringify(body) }),
  },
  directions: {
    list: () => request("/directions"),
    update: (body: object) => request("/directions", { method: "PUT", body: JSON.stringify(body) }),
  },
  engagements: {
    list: (params?: Record<string,string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request("/engagements" + qs);
    },
    create: (body: object) => request("/engagements", { method: "POST", body: JSON.stringify(body) }),
    update: (body: object) => request("/engagements", { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: number) => request("/engagements", { method: "DELETE", body: JSON.stringify({ id }) }),
  },
  marches: {
    list: () => request("/marches"),
    create: (body: object) => request("/marches", { method: "POST", body: JSON.stringify(body) }),
    update: (body: object) => request("/marches", { method: "PUT", body: JSON.stringify(body) }),
  },
  alerts: {
    list: () => request("/alerts"),
    markRead: (id: number | "all") => request("/alerts", { method: "PUT", body: JSON.stringify({ id }) }),
  },
  migrate: (secret: string) => request("/migrate", { method: "POST", body: JSON.stringify({ secret }) }),
};

export type ApiResponse<T> = { success: boolean; data: T; error?: string };
