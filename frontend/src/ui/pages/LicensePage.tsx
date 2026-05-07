import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import { loadAuth } from "../../lib/storage";

type PlanData = {
  name: string; price_label: string; target: string;
  features: string[]; limits: Record<string, any>;
  premium_only?: string[];
};
type Comparison = { standard: PlanData; premium: PlanData };

type LicenseInfo = {
  plan: string; org_name: string; max_users: number;
  features: string[]; limits: Record<string, any>;
  is_active: boolean; days_remaining: number | null;
};

const FEATURE_LABELS: Record<string, string> = {
  budget_plans: "Plans budgétaires multi-exercices",
  budget_allocations: "Allocations par direction",
  commitments: "Engagements & bons de commande",
  payments: "Paiements & liquidations",
  vendors: "Gestion fournisseurs (NINEA validé)",
  audit_trail: "Audit immuable (hash-chain)",
  rbac_4_roles: "RBAC — 4 rôles",
  export_xlsx: "Export Excel",
  export_pdf: "Export PDF UEMOA",
  i18n_fr_wo_en: "Multilingue Fr / Wolof / En",
  ai_forecast_basic: "IA Forecasting basique",
  delegation: "Délégations de pouvoir",
  api_rest: "API REST + Swagger",
  dcmp_marches_publics: "Marchés Publics DCMP",
  simulation_whatif: "Simulation What-If budgétaire",
  smart_alerts: "Alertes intelligentes multi-canaux",
  collaboration_comments: "Commentaires & collaboration",
  geo_dashboard_senegal: "Géo-tableau de bord (14 régions SN)",
  multi_entity_consolidation: "Multi-entités & consolidation",
  ai_anomaly_advanced: "IA Anomalies avancée",
  ai_chatbot_nl: "Chatbot IA en langage naturel",
  tofe_export_bceao: "Export TOFE BCEAO",
  webhooks: "Webhooks & intégrations API",
  rate_limiting_advanced: "Rate limiting avancé",
  sla_support: "Support SLA 24/7",
};

export function LicensePage() {
  const auth = loadAuth();
  const [cmp, setCmp] = useState<Comparison | null>(null);
  const [lic, setLic] = useState<LicenseInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth?.token) return;
    Promise.all([
      apiFetch<Comparison>("/premium/license/plans", { token: auth.token }),
      apiFetch<LicenseInfo>("/premium/license/current", { token: auth.token }),
    ]).then(([c, l]) => { setCmp(c); setLic(l); }).finally(() => setLoading(false));
  }, []);

  async function activate(plan: string) {
    if (!auth?.token) return;
    const orgName = prompt("Nom de votre organisation ?") || "Organisation";
    await apiFetch(`/premium/license/activate?plan=${plan}&org_name=${encodeURIComponent(orgName)}`, {
      token: auth.token, method: "POST",
    });
    window.location.reload();
  }

  if (loading) return <p style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>Chargement...</p>;

  const allFeatures = Object.keys(FEATURE_LABELS);
  const stdFeatures = new Set(cmp?.standard.features || []);
  const premFeatures = new Set(cmp?.premium.features || []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: 18, fontWeight: 500 }}>Plans & Licence</p>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>
          Comparez les plans Standard et Premium — BudgetNew
        </p>
      </div>

      {/* Licence active */}
      {lic && (
        <div style={{ background: lic.plan === "premium" ? "#EAF3DE" : "#E6F1FB",
                      border: `0.5px solid ${lic.plan === "premium" ? "#3B6D11" : "#185FA5"}44`,
                      borderRadius: 12, padding: "1rem 1.25rem",
                      display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500,
                        color: lic.plan === "premium" ? "#3B6D11" : "#185FA5" }}>
              Plan actif : {lic.plan === "premium" ? "Premium" : "Standard"}
            </p>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
              {lic.org_name} · {lic.features.length} fonctionnalités ·{" "}
              {lic.max_users === -1 ? "Utilisateurs illimités" : `${lic.max_users} utilisateurs max`}
            </p>
          </div>
          {lic.plan === "standard" && (
            <button onClick={() => activate("premium")}
              style={{ padding: "8px 18px", borderRadius: 8, background: "#0D2B4B",
                       color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
              Passer au Premium ↗
            </button>
          )}
        </div>
      )}

      {/* Comparison table */}
      {cmp && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 13,
                             borderBottom: "0.5px solid var(--color-border-tertiary)", width: "50%" }}>
                  Fonctionnalité
                </th>
                {/* Standard */}
                <th style={{ padding: "10px 14px", textAlign: "center", width: "25%",
                             borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#185FA5" }}>Budget1 Standard</p>
                    <p style={{ fontSize: 18, fontWeight: 500, marginTop: 4 }}>150 000 FCFA</p>
                    <p style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>/ mois</p>
                    <button onClick={() => activate("standard")}
                      style={{ marginTop: 8, padding: "5px 14px", borderRadius: 6, fontSize: 12,
                               border: "0.5px solid #185FA5", background: "#E6F1FB", color: "#185FA5", cursor: "pointer" }}>
                      Choisir
                    </button>
                  </div>
                </th>
                {/* Premium */}
                <th style={{ padding: "10px 14px", textAlign: "center", width: "25%",
                             borderBottom: "0.5px solid var(--color-border-tertiary)",
                             background: "#EAF3DE" }}>
                  <div>
                    <span style={{ fontSize: 10, background: "#3B6D11", color: "white", padding: "2px 8px",
                                   borderRadius: 99, fontWeight: 500 }}>RECOMMANDÉ</span>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#3B6D11", marginTop: 4 }}>BudgetNew Premium</p>
                    <p style={{ fontSize: 18, fontWeight: 500, marginTop: 4 }}>500 000 FCFA</p>
                    <p style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>/ mois</p>
                    <button onClick={() => activate("premium")}
                      style={{ marginTop: 8, padding: "5px 14px", borderRadius: 6, fontSize: 12,
                               border: "none", background: "#0D2B4B", color: "white", cursor: "pointer", fontWeight: 500 }}>
                      Choisir
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {allFeatures.map((f, i) => {
                const inStd = stdFeatures.has(f);
                const inPrem = premFeatures.has(f);
                const isPremOnly = inPrem && !inStd;
                return (
                  <tr key={f} style={{
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
                    background: i % 2 === 0 ? "transparent" : "var(--color-background-secondary)",
                  }}>
                    <td style={{ padding: "8px 14px", fontSize: 13 }}>
                      {isPremOnly && (
                        <span style={{ fontSize: 10, background: "#EEEDFE", color: "#534AB7",
                                       padding: "1px 6px", borderRadius: 99, marginRight: 6, fontWeight: 500 }}>
                          Premium
                        </span>
                      )}
                      {FEATURE_LABELS[f] || f}
                    </td>
                    <td style={{ padding: "8px 14px", textAlign: "center", fontSize: 16 }}>
                      {inStd ? <span style={{ color: "#3B6D11" }}>✓</span> : <span style={{ color: "var(--color-text-tertiary)" }}>—</span>}
                    </td>
                    <td style={{ padding: "8px 14px", textAlign: "center", fontSize: 16, background: "#EAF3DE44" }}>
                      {inPrem ? <span style={{ color: "#3B6D11", fontWeight: 500 }}>✓</span> : <span style={{ color: "var(--color-text-tertiary)" }}>—</span>}
                    </td>
                  </tr>
                );
              })}
              {/* Limits */}
              <tr style={{ background: "var(--color-background-secondary)" }}>
                <td style={{ padding: "8px 14px", fontSize: 13, fontWeight: 500 }}>Utilisateurs max</td>
                <td style={{ padding: "8px 14px", textAlign: "center", fontSize: 13 }}>{cmp.standard.limits.max_users}</td>
                <td style={{ padding: "8px 14px", textAlign: "center", fontSize: 13, background: "#EAF3DE44", color: "#3B6D11", fontWeight: 500 }}>Illimité</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 14px", fontSize: 13, fontWeight: 500 }}>Support</td>
                <td style={{ padding: "8px 14px", textAlign: "center", fontSize: 12, color: "var(--color-text-secondary)" }}>Email</td>
                <td style={{ padding: "8px 14px", textAlign: "center", fontSize: 12, background: "#EAF3DE44", color: "#3B6D11", fontWeight: 500 }}>24/7 Tél + Email</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
        Tarifs en FCFA HT. Facturation mensuelle. Devis personnalisé disponible pour les marchés publics.
        Contact : support@budgetnew.sn
      </p>
    </div>
  );
}
