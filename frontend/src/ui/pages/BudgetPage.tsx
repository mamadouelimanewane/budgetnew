import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { loadAuth } from "../../lib/storage";

type Line = { id: number; code: string; label: string; level: number };
type Plan = { id: number; fiscal_year: number; name: string };
type Allocation = {
  id: number;
  budget_plan_id: number;
  budget_line_id: number;
  org_unit: string;
  amount_xof: number;
  period: string;
};

export function BudgetPage() {
  const auth = loadAuth();
  const token = auth?.token ?? "";

  const [lines, setLines] = useState<Line[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [allocs, setAllocs] = useState<Allocation[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // create forms
  const [lineCode, setLineCode] = useState("0101");
  const [lineLabel, setLineLabel] = useState("Chapitre 01");
  const [lineLevel, setLineLevel] = useState(1);

  const [planYear, setPlanYear] = useState(new Date().getFullYear());
  const [planName, setPlanName] = useState("Budget");

  const [allocOrg, setAllocOrg] = useState("DAF");
  const [allocAmount, setAllocAmount] = useState(1000000);
  const [allocPeriod, setAllocPeriod] = useState("annual");
  const [allocLineId, setAllocLineId] = useState<number | null>(null);

  async function refresh() {
    setErr(null);
    const [l, p] = await Promise.all([
      apiFetch<Line[]>("/budget/lines", { token }),
      apiFetch<Plan[]>("/budget/plans", { token }),
    ]);
    setLines(l);
    setPlans(p);
    if (p.length && selectedPlanId == null) setSelectedPlanId(p[0].id);
  }

  useEffect(() => {
    if (!token) return;
    refresh().catch((e) => setErr(e instanceof Error ? e.message : "Erreur"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token || !selectedPlanId) return;
    apiFetch<Allocation[]>(`/budget/allocations?budget_plan_id=${selectedPlanId}`, { token })
      .then(setAllocs)
      .catch((e) => setErr(e instanceof Error ? e.message : "Erreur"));
  }, [token, selectedPlanId]);

  async function createLine() {
    setErr(null);
    await apiFetch<Line>("/budget/lines", {
      method: "POST",
      token,
      body: JSON.stringify({ code: lineCode, label: lineLabel, level: lineLevel }),
    });
    await refresh();
  }

  async function createPlan() {
    setErr(null);
    await apiFetch<Plan>("/budget/plans", {
      method: "POST",
      token,
      body: JSON.stringify({ fiscal_year: planYear, name: planName }),
    });
    await refresh();
  }

  async function createAlloc() {
    if (!selectedPlanId) return;
    if (!allocLineId) {
      setErr("Choisir une ligne");
      return;
    }
    setErr(null);
    await apiFetch<Allocation>("/budget/allocations", {
      method: "POST",
      token,
      body: JSON.stringify({
        budget_plan_id: selectedPlanId,
        budget_line_id: allocLineId,
        org_unit: allocOrg,
        amount_xof: allocAmount,
        period: allocPeriod,
      }),
    });
    const a = await apiFetch<Allocation[]>(`/budget/allocations?budget_plan_id=${selectedPlanId}`, { token });
    setAllocs(a);
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Budget</div>
        <div className="text-sm text-slate-500">Nomenclature (lignes), plans, allocations.</div>
      </div>
      {err ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border p-3">
          <div className="text-sm font-semibold">Créer une ligne</div>
          <div className="mt-2 grid gap-2">
            <input className="rounded border px-3 py-2 text-sm" value={lineCode} onChange={(e) => setLineCode(e.target.value)} placeholder="Code" />
            <input className="rounded border px-3 py-2 text-sm" value={lineLabel} onChange={(e) => setLineLabel(e.target.value)} placeholder="Libellé" />
            <input className="rounded border px-3 py-2 text-sm" type="number" value={lineLevel} onChange={(e) => setLineLevel(parseInt(e.target.value || "1", 10))} />
            <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={createLine}>
              Ajouter
            </button>
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="text-sm font-semibold">Créer un plan</div>
          <div className="mt-2 grid gap-2">
            <input className="rounded border px-3 py-2 text-sm" type="number" value={planYear} onChange={(e) => setPlanYear(parseInt(e.target.value || "2026", 10))} />
            <input className="rounded border px-3 py-2 text-sm" value={planName} onChange={(e) => setPlanName(e.target.value)} />
            <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={createPlan}>
              Créer
            </button>
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="text-sm font-semibold">Allocation</div>
          <div className="mt-2 grid gap-2">
            <select
              className="rounded border px-3 py-2 text-sm"
              value={selectedPlanId ?? ""}
              onChange={(e) => setSelectedPlanId(parseInt(e.target.value, 10))}
            >
              <option value="" disabled>
                Choisir un plan
              </option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fiscal_year} — {p.name}
                </option>
              ))}
            </select>
            <select
              className="rounded border px-3 py-2 text-sm"
              value={allocLineId ?? ""}
              onChange={(e) => setAllocLineId(parseInt(e.target.value, 10))}
            >
              <option value="" disabled>
                Choisir une ligne
              </option>
              {lines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.code} — {l.label}
                </option>
              ))}
            </select>
            <input className="rounded border px-3 py-2 text-sm" value={allocOrg} onChange={(e) => setAllocOrg(e.target.value)} />
            <input className="rounded border px-3 py-2 text-sm" type="number" value={allocAmount} onChange={(e) => setAllocAmount(parseInt(e.target.value || "0", 10))} />
            <select className="rounded border px-3 py-2 text-sm" value={allocPeriod} onChange={(e) => setAllocPeriod(e.target.value)}>
              <option value="annual">Annuel</option>
              <option value="monthly">Mensuel</option>
              <option value="quarterly">Trimestriel</option>
            </select>
            <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={createAlloc}>
              Allouer
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-3">
        <div className="text-sm font-semibold">Allocations du plan</div>
        <div className="mt-2 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2 pr-3">Org</th>
                <th className="py-2 pr-3">Ligne</th>
                <th className="py-2 pr-3">Montant</th>
                <th className="py-2 pr-3">Période</th>
              </tr>
            </thead>
            <tbody>
              {allocs.map((a) => {
                const line = lines.find((l) => l.id === a.budget_line_id);
                return (
                  <tr key={a.id} className="border-t">
                    <td className="py-2 pr-3">{a.org_unit}</td>
                    <td className="py-2 pr-3">{line ? `${line.code} — ${line.label}` : a.budget_line_id}</td>
                    <td className="py-2 pr-3">{a.amount_xof.toLocaleString("fr-FR")} XOF</td>
                    <td className="py-2 pr-3">{a.period}</td>
                  </tr>
                );
              })}
              {!allocs.length ? (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={4}>
                    Aucune allocation
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

