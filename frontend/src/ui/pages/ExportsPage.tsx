import { useState } from "react";
import { apiFetch } from "../../lib/api";
import { loadAuth } from "../../lib/storage";
import { downloadWithAuth } from "../../lib/download";

type Schedule = { id: number; name: string; report_type: string; params: any; frequency: string; is_active: boolean };
type Run = { id: number; schedule_id: number; status: string; output_format: string; file_path: string };

export function ExportsPage() {
  const token = loadAuth()?.token ?? "";
  const [budgetPlanId, setBudgetPlanId] = useState(1);
  const [schedName, setSchedName] = useState("Exec Budget");
  const [scheduleId, setScheduleId] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function refreshSchedules() {
    setErr(null);
    const s = await apiFetch<Schedule[]>("/exports/schedules", { token });
    setSchedules(s);
  }

  async function refreshRuns(id: number) {
    setErr(null);
    const r = await apiFetch<Run[]>(`/exports/runs?schedule_id=${id}`, { token });
    setRuns(r);
  }

  async function createSchedule() {
    setErr(null);
    const s = await apiFetch<Schedule>("/exports/schedules", {
      method: "POST",
      token,
      body: JSON.stringify({
        name: schedName,
        report_type: "budget_execution",
        params: { budget_plan_id: budgetPlanId },
        frequency: "manual",
      }),
    });
    setScheduleId(s.id);
    await refreshSchedules();
    await refreshRuns(s.id);
  }

  async function runSchedule(fmt: "xlsx" | "pdf") {
    if (!scheduleId) return;
    setErr(null);
    await apiFetch(`/exports/schedules/${scheduleId}/run?output_format=${fmt}`, { method: "POST", token });
    await refreshRuns(scheduleId);
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Exports & Rapports</div>
        <div className="text-sm text-slate-500">Export exécution budgétaire + planificateur (baseline).</div>
      </div>
      {err ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border p-3">
          <div className="text-sm font-semibold">Export direct</div>
          <div className="mt-2 grid gap-2">
            <input className="rounded border px-3 py-2 text-sm" type="number" value={budgetPlanId} onChange={(e) => setBudgetPlanId(parseInt(e.target.value || "1", 10))} />
            <button
              className="rounded border px-3 py-2 text-left text-sm hover:bg-slate-50"
              onClick={() =>
                downloadWithAuth({
                  path: `/exports/budget/execution.xlsx?budget_plan_id=${budgetPlanId}`,
                  token,
                  filename: `budget-execution-${budgetPlanId}.xlsx`,
                }).catch((e) => setErr(e instanceof Error ? e.message : "Erreur"))
              }
            >
              Télécharger XLSX
            </button>
            <button
              className="rounded border px-3 py-2 text-left text-sm hover:bg-slate-50"
              onClick={() =>
                downloadWithAuth({
                  path: `/exports/budget/execution.pdf?budget_plan_id=${budgetPlanId}`,
                  token,
                  filename: `budget-execution-${budgetPlanId}.pdf`,
                }).catch((e) => setErr(e instanceof Error ? e.message : "Erreur"))
              }
            >
              Télécharger PDF
            </button>
          </div>
        </div>

        <div className="rounded-lg border p-3 lg:col-span-2">
          <div className="text-sm font-semibold">Planificateur (manual)</div>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <input className="rounded border px-3 py-2 text-sm md:col-span-2" value={schedName} onChange={(e) => setSchedName(e.target.value)} />
            <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={createSchedule}>
              Créer planning
            </button>
            <button className="rounded border px-3 py-2 text-sm" onClick={refreshSchedules}>
              Lister plannings
            </button>
            <input
              className="rounded border px-3 py-2 text-sm"
              type="number"
              value={scheduleId ?? ""}
              onChange={(e) => setScheduleId(e.target.value ? parseInt(e.target.value, 10) : null)}
              placeholder="schedule_id"
            />
            <button className="rounded border px-3 py-2 text-sm" onClick={() => scheduleId && refreshRuns(scheduleId)}>
              Historique runs
            </button>
            <button className="rounded border px-3 py-2 text-sm" onClick={() => runSchedule("xlsx")} disabled={!scheduleId}>
              Run XLSX
            </button>
            <button className="rounded border px-3 py-2 text-sm" onClick={() => runSchedule("pdf")} disabled={!scheduleId}>
              Run PDF
            </button>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded border p-3">
              <div className="text-sm font-semibold">Plannings</div>
              <pre className="mt-2 max-h-56 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">
                {JSON.stringify(schedules, null, 2)}
              </pre>
            </div>
            <div className="rounded border p-3">
              <div className="text-sm font-semibold">Runs</div>
              <pre className="mt-2 max-h-56 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">
                {JSON.stringify(runs, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

