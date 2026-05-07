import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { loadAuth } from "../../lib/storage";

type Tender = {
  id: number;
  reference: string;
  title: string;
  org_unit: string;
  fiscal_year: number;
  estimated_amount_xof: number;
  procedure_type: string;
  procedure_label: string;
  status: string;
  dcmp_reference: string;
  created_at: string;
};

type Seuils = {
  entente_directe_max_xof: number;
  demande_renseignement_max_xof: number;
  appel_offres_min_xof: number;
};

type Stats = {
  total: number;
  total_estimated_xof: number;
  by_procedure: Record<string, { count: number; total_xof: number; label: string }>;
  by_status: Record<string, number>;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "#854F0B" },
  published: { label: "Publié", color: "#185FA5" },
  evaluation: { label: "Évaluation", color: "#533AB7" },
  awarded: { label: "Attribué", color: "#3B6D11" },
  cancelled: { label: "Annulé", color: "#A32D2D" },
};

const PROC_COLORS: Record<string, string> = {
  entente_directe: "#854F0B",
  demande_renseignement: "#185FA5",
  appel_offres_ouvert: "#3B6D11",
};

function fmt(n: number) {
  return n.toLocaleString("fr-SN") + " FCFA";
}

export function DcmpPage() {
  const auth = loadAuth();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [seuils, setSeuils] = useState<Seuils | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", org_unit: "", fiscal_year: 2026,
    budget_line_id: 1, estimated_amount_xof: 0,
    dcmp_reference: "", notes: "",
  });
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    if (!auth?.token) return;
    setLoading(true);
    try {
      const [t, s, st] = await Promise.all([
        apiFetch<Tender[]>("/premium/dcmp/tenders", { token: auth.token }),
        apiFetch<Seuils>("/premium/dcmp/seuils", { token: auth.token }),
        apiFetch<Stats>("/premium/dcmp/stats", { token: auth.token }),
      ]);
      setTenders(t);
      setSeuils(s);
      setStats(st);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!auth?.token) return;
    try {
      await apiFetch("/premium/dcmp/tenders", {
        token: auth.token, method: "POST",
        body: JSON.stringify(form),
      });
      setShowForm(false);
      load();
    } catch (e: any) { setErr(e.message); }
  }

  async function updateStatus(id: number, status: string) {
    if (!auth?.token) return;
    try {
      await apiFetch(`/premium/dcmp/tenders/${id}/status`, {
        token: auth.token, method: "PATCH",
        body: JSON.stringify({ status }),
      });
      load();
    } catch (e: any) { setErr(e.message); }
  }

  // Auto-calcul procédure
  const estimatedProc = form.estimated_amount_xof < 5_000_000
    ? "Entente directe" : form.estimated_amount_xof < 50_000_000
    ? "Demande de renseignement" : "Appel d'offres ouvert";

  const filtered = filterStatus ? tenders.filter(t => t.status === filterStatus) : tenders;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 18, fontWeight: 500 }}>Marchés Publics — DCMP</p>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>
            Gestion des appels d'offres avec seuils officiels sénégalais
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: "8px 16px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)",
                   background: showForm ? "var(--color-background-secondary)" : "var(--color-background-primary)",
                   cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
          {showForm ? "Annuler" : "+ Nouvel appel d'offres"}
        </button>
      </div>

      {err && <div style={{ background: "var(--color-background-danger)", color: "var(--color-text-danger)",
        padding: "10px 14px", borderRadius: 8, fontSize: 13 }}>{err}</div>}

      {/* Seuils DCMP */}
      {seuils && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            { label: "Entente directe", max: seuils.entente_directe_max_xof, color: "#FAEEDA", tc: "#854F0B" },
            { label: "Demande de renseignement", max: seuils.demande_renseignement_max_xof, color: "#E6F1FB", tc: "#185FA5" },
            { label: "Appel d'offres ouvert", max: null, color: "#EAF3DE", tc: "#3B6D11" },
          ].map(s => (
            <div key={s.label} style={{ background: s.color, borderRadius: 8, padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: s.tc, fontWeight: 500, marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontSize: 13, fontWeight: 500, color: s.tc }}>
                {s.max ? `< ${fmt(s.max)}` : `≥ ${fmt(50_000_000)}`}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "12px 16px" }}>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Total marchés</p>
            <p style={{ fontSize: 22, fontWeight: 500 }}>{stats.total}</p>
          </div>
          <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "12px 16px" }}>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Montant total estimé</p>
            <p style={{ fontSize: 16, fontWeight: 500 }}>{(stats.total_estimated_xof / 1_000_000).toFixed(0)} M FCFA</p>
          </div>
          {Object.entries(stats.by_status).slice(0, 2).map(([k, v]) => (
            <div key={k} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "12px 16px" }}>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{STATUS_LABELS[k]?.label || k}</p>
              <p style={{ fontSize: 22, fontWeight: 500 }}>{v}</p>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)",
                      borderRadius: 12, padding: "1.25rem" }}>
          <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>Créer un appel d'offres</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Titre *", key: "title", type: "text" },
              { label: "Unité organisationnelle *", key: "org_unit", type: "text" },
              { label: "Exercice fiscal", key: "fiscal_year", type: "number" },
              { label: "ID ligne budgétaire", key: "budget_line_id", type: "number" },
              { label: "Montant estimé (FCFA) *", key: "estimated_amount_xof", type: "number" },
              { label: "Réf. DCMP (optionnel)", key: "dcmp_reference", type: "text" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: f.type === "number" ? parseInt(e.target.value) || 0 : e.target.value }))}
                  style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)",
                           background: "var(--color-background-secondary)", fontSize: 13, color: "var(--color-text-primary)" }}
                />
              </div>
            ))}
          </div>
          {form.estimated_amount_xof > 0 && (
            <p style={{ marginTop: 10, fontSize: 12, color: "#185FA5" }}>
              Procédure automatique : <strong>{estimatedProc}</strong>
            </p>
          )}
          <button onClick={submit}
            style={{ marginTop: 14, padding: "8px 20px", borderRadius: 8,
                     background: "#0D2B4B", color: "white", border: "none", cursor: "pointer", fontSize: 13 }}>
            Créer le marché
          </button>
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)", alignSelf: "center" }}>Filtrer :</span>
        {["", "draft", "published", "evaluation", "awarded", "cancelled"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, cursor: "pointer",
                     border: "0.5px solid var(--color-border-secondary)",
                     background: filterStatus === s ? "#0D2B4B" : "transparent",
                     color: filterStatus === s ? "white" : "var(--color-text-secondary)" }}>
            {s ? (STATUS_LABELS[s]?.label || s) : "Tous"}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>Chargement...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                {["Référence", "Titre", "Unité", "Montant estimé", "Procédure", "Statut", "Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 11,
                                       fontWeight: 500, color: "var(--color-text-secondary)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                  <td style={{ padding: "9px 10px", fontWeight: 500, color: "#185FA5" }}>{t.reference}</td>
                  <td style={{ padding: "9px 10px", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</td>
                  <td style={{ padding: "9px 10px", color: "var(--color-text-secondary)" }}>{t.org_unit}</td>
                  <td style={{ padding: "9px 10px" }}>{(t.estimated_amount_xof / 1_000_000).toFixed(1)} M</td>
                  <td style={{ padding: "9px 10px" }}>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 99,
                                   background: "#E6F1FB", color: PROC_COLORS[t.procedure_type] || "#185FA5" }}>
                      {t.procedure_type === "entente_directe" ? "Entente directe"
                        : t.procedure_type === "demande_renseignement" ? "DRM" : "AO Ouvert"}
                    </span>
                  </td>
                  <td style={{ padding: "9px 10px" }}>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 99,
                                   background: STATUS_LABELS[t.status]?.color + "22",
                                   color: STATUS_LABELS[t.status]?.color }}>
                      {STATUS_LABELS[t.status]?.label || t.status}
                    </span>
                  </td>
                  <td style={{ padding: "9px 10px" }}>
                    <select
                      value={t.status}
                      onChange={e => updateStatus(t.id, e.target.value)}
                      style={{ fontSize: 12, padding: "3px 6px", borderRadius: 4,
                               border: "0.5px solid var(--color-border-secondary)",
                               background: "var(--color-background-secondary)", cursor: "pointer" }}>
                      {["draft","published","evaluation","awarded","cancelled"].map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]?.label || s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 20, textAlign: "center",
                  color: "var(--color-text-secondary)", fontSize: 13 }}>
                  Aucun appel d'offres. Créez-en un avec le bouton ci-dessus.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
