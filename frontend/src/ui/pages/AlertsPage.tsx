import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { loadAuth } from "../../lib/storage";

type AlertRule = {
  id: number; name: string; rule_type: string; org_unit: string;
  threshold_pct: number | null; threshold_xof: number | null;
  channels: string[]; is_active: boolean; created_at: string;
};
type AlertEvent = {
  id: number; rule_id: number; severity: string; title: string;
  body: string; entity: string; entity_id: string; acknowledged: boolean;
  created_at: string;
};

const SEV_STYLE: Record<string, { bg: string; color: string; icon: string }> = {
  info: { bg: "#E6F1FB", color: "#185FA5", icon: "ℹ" },
  warning: { bg: "#FAEEDA", color: "#854F0B", icon: "⚠" },
  critical: { bg: "#FCEBEB", color: "#A32D2D", icon: "🔴" },
};

const RULE_TYPE_LABELS: Record<string, string> = {
  budget_threshold: "Seuil budgétaire",
  commitment_spike: "Engagement élevé",
  anomaly_detected: "Anomalie IA",
  deadline_approaching: "Échéance proche",
  consumption_rate: "Taux de consommation",
};

export function AlertsPage() {
  const auth = loadAuth();
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"events" | "rules">("events");
  const [form, setForm] = useState({
    name: "", rule_type: "budget_threshold", org_unit: "*",
    threshold_pct: 80, channels: ["email"], recipients: [],
  });

  useEffect(() => { load(); }, []);

  async function load() {
    if (!auth?.token) return;
    setLoading(true);
    try {
      const [r, e] = await Promise.all([
        apiFetch<AlertRule[]>("/premium/alerts/rules", { token: auth.token }),
        apiFetch<AlertEvent[]>("/premium/alerts/events", { token: auth.token }),
      ]);
      setRules(r); setEvents(e);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  async function evaluate() {
    if (!auth?.token) return;
    try {
      const r = await apiFetch<any>("/premium/alerts/evaluate", { token: auth.token, method: "POST" });
      load();
      alert(`${r.alerts_triggered} alerte(s) déclenchée(s).`);
    } catch (e: any) { setErr(e.message); }
  }

  async function createRule() {
    if (!auth?.token) return;
    try {
      await apiFetch("/premium/alerts/rules", {
        token: auth.token, method: "POST", body: JSON.stringify(form),
      });
      setShowForm(false); load();
    } catch (e: any) { setErr(e.message); }
  }

  async function toggle(id: number) {
    if (!auth?.token) return;
    await apiFetch(`/premium/alerts/rules/${id}/toggle`, { token: auth.token, method: "PATCH" });
    load();
  }

  async function ack(id: number) {
    if (!auth?.token) return;
    await apiFetch(`/premium/alerts/events/${id}/acknowledge`, { token: auth.token, method: "POST" });
    load();
  }

  const unacked = events.filter(e => !e.acknowledged);
  const critical = events.filter(e => e.severity === "critical" && !e.acknowledged);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 18, fontWeight: 500 }}>Alertes Intelligentes</p>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>
            Surveillance automatique — budget, engagements, anomalies
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={evaluate}
            style={{ padding: "8px 14px", borderRadius: 8, border: "0.5px solid #185FA5",
                     background: "#E6F1FB", color: "#185FA5", cursor: "pointer", fontSize: 13 }}>
            Évaluer maintenant
          </button>
          <button onClick={() => setShowForm(!showForm)}
            style={{ padding: "8px 14px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)",
                     cursor: "pointer", fontSize: 13 }}>
            + Règle
          </button>
        </div>
      </div>

      {err && <div style={{ background: "var(--color-background-danger)", color: "var(--color-text-danger)",
        padding: "10px 14px", borderRadius: 8, fontSize: 13 }}>{err}</div>}

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {[
          { label: "Alertes actives", value: unacked.length, color: "#854F0B", bg: "#FAEEDA" },
          { label: "Critiques", value: critical.length, color: "#A32D2D", bg: "#FCEBEB" },
          { label: "Règles actives", value: rules.filter(r => r.is_active).length, color: "#185FA5", bg: "#E6F1FB" },
        ].map(m => (
          <div key={m.label} style={{ background: m.bg, borderRadius: 8, padding: "12px 16px" }}>
            <p style={{ fontSize: 11, color: m.color, marginBottom: 4 }}>{m.label}</p>
            <p style={{ fontSize: 24, fontWeight: 500, color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)",
                      borderRadius: 12, padding: "1.25rem", display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 500 }}>Nouvelle règle d'alerte</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Nom</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)",
                         background: "var(--color-background-secondary)", fontSize: 13, color: "var(--color-text-primary)" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Type</label>
              <select value={form.rule_type} onChange={e => setForm(p => ({ ...p, rule_type: e.target.value }))}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)",
                         background: "var(--color-background-secondary)", fontSize: 13, color: "var(--color-text-primary)" }}>
                {Object.entries(RULE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>
                Seuil % (consommation)
              </label>
              <input type="number" value={form.threshold_pct}
                onChange={e => setForm(p => ({ ...p, threshold_pct: parseInt(e.target.value) || 80 }))}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)",
                         background: "var(--color-background-secondary)", fontSize: 13, color: "var(--color-text-primary)" }} />
            </div>
          </div>
          <button onClick={createRule}
            style={{ alignSelf: "flex-start", padding: "8px 20px", borderRadius: 8, background: "#0D2B4B",
                     color: "white", border: "none", cursor: "pointer", fontSize: 13 }}>
            Créer la règle
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4 }}>
        {(["events", "rules"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer",
                     border: "0.5px solid var(--color-border-secondary)",
                     background: tab === t ? "var(--color-background-secondary)" : "transparent",
                     fontWeight: tab === t ? 500 : 400 }}>
            {t === "events" ? `Événements (${events.length})` : `Règles (${rules.length})`}
          </button>
        ))}
      </div>

      {tab === "events" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {events.length === 0 && <p style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>
            Aucune alerte. Cliquez "Évaluer maintenant" pour vérifier les règles.
          </p>}
          {events.map(ev => {
            const s = SEV_STYLE[ev.severity] || SEV_STYLE.info;
            return (
              <div key={ev.id} style={{ background: ev.acknowledged ? "var(--color-background-secondary)" : s.bg,
                                        border: `0.5px solid ${s.color}44`, borderRadius: 10, padding: "12px 16px",
                                        opacity: ev.acknowledged ? 0.6 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 16 }}>{s.icon}</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: s.color }}>{ev.title}</p>
                      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>{ev.body}</p>
                    </div>
                  </div>
                  {!ev.acknowledged && (
                    <button onClick={() => ack(ev.id)}
                      style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                               border: "0.5px solid var(--color-border-secondary)", background: "white", whiteSpace: "nowrap" }}>
                      Acquitter
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "rules" && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              {["Nom", "Type", "Unité", "Seuil", "Canaux", "Statut", "Action"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "7px 8px", fontSize: 11,
                                     fontWeight: 500, color: "var(--color-text-secondary)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                <td style={{ padding: "8px 8px", fontWeight: 500 }}>{r.name}</td>
                <td style={{ padding: "8px 8px", color: "var(--color-text-secondary)" }}>{RULE_TYPE_LABELS[r.rule_type]}</td>
                <td style={{ padding: "8px 8px" }}>{r.org_unit}</td>
                <td style={{ padding: "8px 8px" }}>{r.threshold_pct ? `${r.threshold_pct}%` : "—"}</td>
                <td style={{ padding: "8px 8px" }}>{r.channels.join(", ")}</td>
                <td style={{ padding: "8px 8px" }}>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 500,
                                 background: r.is_active ? "#EAF3DE" : "var(--color-background-secondary)",
                                 color: r.is_active ? "#3B6D11" : "var(--color-text-secondary)" }}>
                    {r.is_active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td style={{ padding: "8px 8px" }}>
                  <button onClick={() => toggle(r.id)}
                    style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, cursor: "pointer",
                             border: "0.5px solid var(--color-border-secondary)", background: "transparent" }}>
                    {r.is_active ? "Désactiver" : "Activer"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
