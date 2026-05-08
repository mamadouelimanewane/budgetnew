import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

export function useBudget() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.budget.list();
      setPlans(res.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (data: object) => {
    const res = await api.budget.create(data);
    setPlans(p => [res.data, ...p]);
    return res.data;
  };

  return { plans, loading, error, refetch: load, create };
}

export function useDirections() {
  const [directions, setDirections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.directions.list();
      setDirections(res.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalAllocated = directions.reduce((s, d) => s + Number(d.allocated || 0), 0);
  const totalConsumed = directions.reduce((s, d) => s + Number(d.consumed || 0), 0);
  const tauxGlobal = totalAllocated > 0 ? (totalConsumed / totalAllocated * 100).toFixed(1) : "0";

  return { directions, loading, error, refetch: load, totalAllocated, totalConsumed, tauxGlobal };
}

export function useEngagements(params?: Record<string,string>) {
  const [engagements, setEngagements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.engagements.list(params);
      setEngagements(res.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [params ? JSON.stringify(params) : ""]);

  useEffect(() => { load(); }, [load]);

  const create = async (data: object) => {
    const res = await api.engagements.create(data);
    setEngagements(e => [res.data, ...e]);
    return res.data;
  };

  const updateStatus = async (id: number, status: string) => {
    await api.engagements.update({ id, status });
    setEngagements(e => e.map(x => x.id === id ? { ...x, status } : x));
  };

  const remove = async (id: number) => {
    await api.engagements.delete(id);
    setEngagements(e => e.filter(x => x.id !== id));
  };

  return { engagements, loading, error, refetch: load, create, updateStatus, remove };
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.alerts.list();
      setAlerts(res.data || []);
      setUnread(res.unread || 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: number | "all") => {
    await api.alerts.markRead(id);
    if (id === "all") {
      setAlerts(a => a.map(x => ({ ...x, read: true })));
      setUnread(0);
    } else {
      setAlerts(a => a.map(x => x.id === id ? { ...x, read: true } : x));
      setUnread(u => Math.max(0, u - 1));
    }
  };

  return { alerts, unread, loading, refetch: load, markRead };
}
