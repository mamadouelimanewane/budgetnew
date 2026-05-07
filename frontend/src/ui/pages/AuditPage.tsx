import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { loadAuth } from "../../lib/storage";
import { downloadWithAuth } from "../../lib/download";

type Verify = { ok: boolean; checked: number; broken_at_id: number | null; message: string };
type AuditEvent = {
  id: number;
  ts: string;
  actor_user_id: number | null;
  action: string;
  entity: string;
  entity_id: string;
  entry_hash: string;
  prev_hash: string;
  details_json: string;
};

export function AuditPage() {
  const token = loadAuth()?.token ?? "";
  const [verify, setVerify] = useState<Verify | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    setErr(null);
    const [v, e] = await Promise.all([
      apiFetch<Verify>("/audit/verify", { token }),
      apiFetch<AuditEvent[]>("/audit/events?limit=50", { token }),
    ]);
    setVerify(v);
    setEvents(e);
  }

  useEffect(() => {
    if (!token) return;
    refresh().catch((e) => setErr(e instanceof Error ? e.message : "Erreur"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Audit</div>
        <div className="text-sm text-slate-500">Vérification chaîne + exports + derniers événements (admin requis).</div>
      </div>
      {err ? <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div> : null}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border p-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Vérification</div>
            <button className="rounded border px-3 py-2 text-sm" onClick={refresh}>
              Rafraîchir
            </button>
          </div>
          <pre className="mt-2 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">
            {JSON.stringify(verify ?? { loading: true }, null, 2)}
          </pre>
        </div>

        <div className="rounded-lg border p-3">
          <div className="text-sm font-semibold">Exports</div>
          <div className="mt-2 space-y-2 text-sm">
            <button
              className="block w-full rounded border px-3 py-2 text-left hover:bg-slate-50"
              onClick={() =>
                downloadWithAuth({ path: "/audit/export.csv", token, filename: "audit-events.csv" }).catch((e) =>
                  setErr(e instanceof Error ? e.message : "Erreur")
                )
              }
            >
              Télécharger CSV
            </button>
            <button
              className="block w-full rounded border px-3 py-2 text-left hover:bg-slate-50"
              onClick={() =>
                downloadWithAuth({ path: "/audit/export.pdf", token, filename: "audit-events.pdf" }).catch((e) =>
                  setErr(e instanceof Error ? e.message : "Erreur")
                )
              }
            >
              Télécharger PDF
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-3">
        <div className="text-sm font-semibold">Derniers événements</div>
        <div className="mt-2 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">ts</th>
                <th className="py-2 pr-3">action</th>
                <th className="py-2 pr-3">entity</th>
                <th className="py-2 pr-3">entity_id</th>
                <th className="py-2 pr-3">hash</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} className="border-t">
                  <td className="py-2 pr-3">#{ev.id}</td>
                  <td className="py-2 pr-3">{ev.ts}</td>
                  <td className="py-2 pr-3">{ev.action}</td>
                  <td className="py-2 pr-3">{ev.entity}</td>
                  <td className="py-2 pr-3">{ev.entity_id}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{ev.entry_hash.slice(0, 12)}…</td>
                </tr>
              ))}
              {!events.length ? (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={6}>
                    Aucun événement
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

