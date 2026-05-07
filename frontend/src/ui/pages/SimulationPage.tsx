import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { loadAuth } from "../../lib/storage";

type Adjustment = { org_unit: string; delta_pct: number | null; delta_xof: number | null };
type SimResult = {
  baseline_total_xof: number;
  simulated_total_xof: number;
  total_delta_xof: number;
  total_delta_pct: number;
  lines: Array<{
    org_unit: string;
    baseline_xof: number;
    simulated_xof: number;
    delta_xof: number;
    delta_pct: number;
    paid_xof: number;
    simulated_available_xof: number;
    simulated_consumption_rate: number;
    risk: "ok" | "warning" | "critical";
  }>;
  summary: { units_at_risk: number; units_constrained: number; units_safe: number };
};

type Simulation = {
  id: number;
  name: string;
  description: string;
  base_budget_plan_id: number;
  adjustments: Adjustment[];
  results: SimResult;
  created_at: string;
};

const RISK_STYLE = {
  ok: { bg: "#EAF3DE", color: "#3B6D11", label: "Sûr" },
  warning: { bg: "#FAEEDA", color: "#854F0B", label: "Attention" },
  critical: { bg: "#FCEBEB", color: "#A32D2D", label: "Critique" },
};

function fmt(n: number) { return (n / 1_000_000).toFixed(1) + " M"; }

export function SimulationPage() {
  const auth = loadAuth();
  const [sims, setSims] = useState<Simulation[]>([]);
  const [preview, setPreview] = useState<SimResult | null>(null);
  const [selected, setSelected] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "", description: "", base_budget_plan_id: 1,
  });
  const [adjustments, setAdjustments] = useState<Array<{ org_unit: string; delta_pct: string }>>([
    { org_unit: "DGID", delta_pct: "-10" },
    { org_unit: "DGCPT", delta_pct: "-5" },
  ]);

  useEffect(() => { loadSims(); }, []);

  async function loadSims() {
    if (!auth?.token) return;
    setLoading(true);
    try {
      const s = await apiFetch<Simulation[]>("/premium/simulations", { token: auth.token });
      setSims(s);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  function buildPayload() {
    return {
      ...form,
      adjustments: adjustments
        .filter(a => a.org_unit && a.delta_pct !== "")
        .map(a => ({ org_unit: a.org_unit, delta_pct: parseFloat(a.delta_pct) || 0, delta_xof: null })),
    };
  }

  async function runPreview() {
    if (!auth?.token) return;
    setErr(null);
    try {
      const r = await apiFetch<SimResult>("/premium/simulations/preview", {
        token: auth.token, method: "POST", body: JSON.stringify(buildPayload()),
      });
      setPreview(r);
    } catch (e: any) { setErr(e.message); }
  }

  async function saveSimulation() {
    if (!auth?.token) return;
    try {
      await apiFetch("/premium/simulations", {
        token: auth.token, method: "POST", body: JSON.stringify(buildPayload()),
      });
      setShowForm(false);
      setPreview(null);
      loadSims();
    } catch (e: any) { setErr(e.message); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 18, fontWeight: 500 }}>Simulation What-If</p>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>
            Testez l'impact d'ajustements budgétaires sans modifier les données réelles
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ padding: "8px 16px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)",
                   cursor: "pointer", fontSize: 13, fontWeight: 500,
                   background: showForm ? "var(--color-background-secondary)" : "var(--color-background-primary)" }}>
          {showForm ? "Fermer" : "+ Nouvelle simulation"}
        </button>
      </div>

      {err && <div style={{ background: "var(--color-background-danger)", color: "var(--color-text-danger)",
        padding: "10px 14px", borderRadius: 8, fontSize: 13 }}>{err}</div>}

      {/* Formulaire simulation */}
      {showForm && (
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)",
                      borderRadius: 12, padding: "1.25rem", display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 500 }}>Configurer la simulation</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "Nom du scénario", key: "name", type: "text" },
              { label: "Plan de base (ID)", key: "base_budget_plan_id", type: "number" },
              { label: "Description", key: "description", type: "text" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: f.type === "number" ? parseInt(e.target.value) || 1 : e.target.value }))}
                  style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)",
                           background: "var(--color-background-secondary)", fontSize: 13, color: "var(--color-text-primary)" }} />
              </div>
            ))}
          </div>

          <div>
            <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Ajustements par unité organisationnelle</p>
            {adjustments.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <input placeholder="DGID / DGCPT…" value={a.org_unit}
                  onChange={e => setAdjustments(prev => prev.map((x, j) => j === i ? { ...x, org_unit: e.target.value } : x))}
                  style={{ flex: 2, padding: "7px 10px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)",
                           background: "var(--color-background-secondary)", fontSize: 13, color: "var(--color-text-primary)" }} />
                <input placeholder="Delta % (ex: -15)" value={a.delta_pct}
                  onChange={e => setAdjustments(prev => prev.map((x, j) => j === i ? { ...x, delta_pct: e.target.value } : x))}
                  style={{ flex: 1, padding: "7px 10px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)",
                           background: "var(--color-background-secondary)", fontSize: 13, color: "var(--color-text-primary)" }} />
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>%</span>
                <button onClick={() => setAdjustments(prev => prev.filter((_, j) => j !== i))}
                  style={{ padding: "5px 10px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)",
                           background: "transparent", color: "#A32D2D", cursor: "pointer", fontSize: 13 }}>×</button>
              </div>
            ))}
            <button onClick={() => setAdjustments(prev => [...prev, { org_unit: "", delta_pct: "0" }])}
              style={{ fontSize: 12, color: "#185FA5", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              + Ajouter une ligne
            </button>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={runPreview}
              style={{ padding: "8px 20px", borderRadius: 8, border: "0.5px solid #185FA5",
                       background: "#E6F1FB", color: "#185FA5", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
              Aperçu de l'impact ↗
            </button>
            <button onClick={saveSimulation}
              style={{ padding: "8px 20px", borderRadius: 8, background: "#0D2B4B",
                       color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
              Enregistrer le scénario
            </button>
          </div>
        </div>
      )}

      {/* Résultats aperçu */}
      {preview && (
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)",
                      borderRadius: 12, padding: "1.25rem" }}>
          <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Impact simulé</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Budget de base", value: fmt(preview.baseline_total_xof), color: "#185FA5" },
              { label: "Budget simulé", value: fmt(preview.simulated_total_xof), color: "#3B6D11" },
              { label: "Delta total", value: `${preview.total_delta_pct > 0 ? "+" : ""}${preview.total_delta_pct.toFixed(1)}%`,
                color: preview.total_delta_pct < 0 ? "#A32D2D" : "#3B6D11" },
              { label: "Unités à risque", value: preview.summary.units_at_risk.toString(), color: "#A32D2D" },
            ].map(m => (
              <div key={m.label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px 14px" }}>
                <p style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>{m.label}</p>
                <p style={{ fontSize: 18, fontWeight: 500, color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                {["Unité", "Base", "Simulé", "Delta", "Consommé", "Dispo simulé", "Taux sim.", "Risque"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "7px 8px", fontSize: 11,
                                       fontWeight: 500, color: "var(--color-text-secondary)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.lines.map(l => (
                <tr key={l.org_unit} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                  <td style={{ padding: "7px 8px", fontWeight: 500 }}>{l.org_unit}</td>
                  <td style={{ padding: "7px 8px" }}>{fmt(l.baseline_xof)}</td>
                  <td style={{ padding: "7px 8px" }}>{fmt(l.simulated_xof)}</td>
                  <td style={{ padding: "7px 8px", color: l.delta_pct < 0 ? "#A32D2D" : "#3B6D11" }}>
                    {l.delta_pct > 0 ? "+" : ""}{l.delta_pct.toFixed(1)}%
                  </td>
                  <td style={{ padding: "7px 8px" }}>{fmt(l.paid_xof)}</td>
                  <td style={{ padding: "7px 8px", color: l.simulated_available_xof < 0 ? "#A32D2D" : "inherit" }}>
                    {fmt(l.simulated_available_xof)}
                  </td>
                  <td style={{ padding: "7px 8px" }}>{l.simulated_consumption_rate.toFixed(1)}%</td>
                  <td style={{ padding: "7px 8px" }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99,
                                   background: RISK_STYLE[l.risk].bg, color: RISK_STYLE[l.risk].color,
                                   fontWeight: 500 }}>
                      {RISK_STYLE[l.risk].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Historique scénarios */}
      <div>
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>Scénarios enregistrés</p>
        {loading ? <p style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>Chargement...</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sims.map(s => (
              <div key={s.id} onClick={() => setSelected(selected?.id === s.id ? null : s)}
                style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)",
                         borderRadius: 10, padding: "12px 16px", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</p>
                    <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{s.description}</p>
                  </div>
                  {s.results?.total_delta_pct != null && (
                    <span style={{ fontSize: 13, fontWeight: 500,
                                   color: s.results.total_delta_pct < 0 ? "#A32D2D" : "#3B6D11" }}>
                      {s.results.total_delta_pct > 0 ? "+" : ""}{s.results.total_delta_pct.toFixed(1)}%
                    </span>
                  )}
                </div>
                {selected?.id === s.id && s.results?.lines && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "0.5px solid var(--color-border-tertiary)" }}>
                    {s.results.lines.map(l => (
                      <div key={l.org_unit} style={{ display: "flex", justifyContent: "space-between",
                                                     fontSize: 12, padding: "4px 0", color: "var(--color-text-secondary)" }}>
                        <span>{l.org_unit}</span>
                        <span style={{ color: l.delta_pct < 0 ? "#A32D2D" : "#3B6D11" }}>
                          {l.delta_pct > 0 ? "+" : ""}{l.delta_pct.toFixed(1)}% → {fmt(l.simulated_xof)} FCFA
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {sims.length === 0 && <p style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>
              Aucun scénario enregistré.
            </p>}
          </div>
        )}
      </div>
    </div>
  );
}
