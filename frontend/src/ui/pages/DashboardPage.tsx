import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { loadAuth } from "../../lib/storage";

type Me = { id: number; email: string; full_name: string; is_admin: boolean };
type KpiExecution = {
  budget_plan_id: number;
  fiscal_year: number | null;
  totals: {
    allocated_xof: number;
    paid_xof: number;
    available_xof: number;
    consumption_rate: number;
    revenue_xof: number;
  };
  by_org: Array<{
    org_unit: string;
    allocated_xof: number;
    paid_xof: number;
    available_xof: number;
    consumption_rate: number;
    revenue_xof: number;
  }>;
};

export function DashboardPage() {
  const auth = loadAuth();
  const [me, setMe] = useState<Me | null>(null);
  const [budgetPlanId, setBudgetPlanId] = useState(1);
  const [kpi, setKpi] = useState<KpiExecution | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.token) return;
    apiFetch<Me>("/auth/me", { token: auth.token })
      .then(setMe)
      .catch((e) => setErr(e instanceof Error ? e.message : "Erreur"));
  }, [auth?.token]);

  async function loadKpi() {
    if (!auth?.token) return;
    setErr(null);
    const r = await apiFetch<KpiExecution>(`/kpi/execution?budget_plan_id=${budgetPlanId}`, { token: auth.token });
    setKpi(r);
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Dashboard</div>
        <div className="text-sm text-slate-500">Résumé technique (MVP) + profil connecté + KPIs d’exécution.</div>
      </div>
      {err ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border p-3">
          <div className="text-sm font-semibold">Profil</div>
          <pre className="mt-2 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">
            {JSON.stringify(me ?? { loading: true }, null, 2)}
          </pre>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-sm font-semibold">KPIs — Exécution</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              className="w-32 rounded border px-3 py-2 text-sm"
              type="number"
              value={budgetPlanId}
              onChange={(e) => setBudgetPlanId(parseInt(e.target.value || "1", 10))}
            />
            <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={loadKpi}>
              Charger
            </button>
          </div>
          <pre className="mt-3 max-h-72 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">
            {JSON.stringify(kpi ?? { hint: "Saisir budget_plan_id puis Charger" }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

