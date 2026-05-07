import { useState } from "react";
import { apiFetch } from "../../lib/api";
import { loadAuth } from "../../lib/storage";

export function AiPage() {
  const token = loadAuth()?.token ?? "";
  const [err, setErr] = useState<string | null>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [scores, setScores] = useState<any>(null);
  const [nextMonths, setNextMonths] = useState(6);

  async function trainForecast() {
    setErr(null);
    await apiFetch("/ai/forecast/train", { method: "POST", token, body: JSON.stringify({ months_back: 24 }) });
  }

  async function queryForecast() {
    setErr(null);
    const r = await apiFetch("/ai/forecast/query", { method: "POST", token, body: JSON.stringify({ next_months: nextMonths }) });
    setForecast(r);
  }

  async function trainAnomaly() {
    setErr(null);
    await apiFetch("/ai/anomaly/train", { method: "POST", token, body: JSON.stringify({ contamination: 0.1 }) });
  }

  async function loadScores() {
    setErr(null);
    const r = await apiFetch("/ai/anomaly/score/payments?limit=20", { token });
    setScores(r);
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">IA</div>
        <div className="text-sm text-slate-500">Prévision (paiements) + anomalies (paiements) — baseline.</div>
      </div>
      {err ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border p-3">
          <div className="text-sm font-semibold">Prévision</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={trainForecast}>
              Train
            </button>
            <input className="w-24 rounded border px-3 py-2 text-sm" type="number" value={nextMonths} onChange={(e) => setNextMonths(parseInt(e.target.value || "6", 10))} />
            <button className="rounded border px-3 py-2 text-sm" onClick={queryForecast}>
              Query
            </button>
          </div>
          <pre className="mt-3 max-h-80 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">
            {JSON.stringify(forecast ?? { hint: "Train puis Query" }, null, 2)}
          </pre>
        </div>

        <div className="rounded-lg border p-3">
          <div className="text-sm font-semibold">Anomalies</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={trainAnomaly}>
              Train
            </button>
            <button className="rounded border px-3 py-2 text-sm" onClick={loadScores}>
              Scores
            </button>
          </div>
          <pre className="mt-3 max-h-80 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">
            {JSON.stringify(scores ?? { hint: "Train puis Scores" }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

