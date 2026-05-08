import { useState } from "react";
import { api } from "../../lib/api";
import { useDirections, useEngagements, useAlerts } from "../../hooks/useBudget";

export function DatabasePage() {
  const [migrateStatus, setMigrateStatus] = useState<"idle"|"loading"|"ok"|"error">("idle");
  const [migrateMsg, setMigrateMsg] = useState("");
  const [secret, setSecret] = useState("");
  const { directions, loading: dLoading, refetch: refetchDirs } = useDirections();
  const { engagements, loading: eLoading, refetch: refetchEngs } = useEngagements({ limit: "10" });
  const { alerts, unread, loading: aLoading } = useAlerts();

  async function runMigrate() {
    setMigrateStatus("loading");
    try {
      const res = await api.migrate(secret);
      setMigrateStatus("ok");
      setMigrateMsg(JSON.stringify(res, null, 2));
      setTimeout(() => { refetchDirs(); refetchEngs(); }, 1000);
    } catch (e: any) {
      setMigrateStatus("error");
      setMigrateMsg(e.message);
    }
  }

  const statCards = [
    { l: "Directions en BDD", v: directions.length, c: "#1A6FD4", bg: "#EBF4FF" },
    { l: "Engagements reels", v: engagements.length, c: "#10B981", bg: "#D1FAE5" },
    { l: "Alertes non lues", v: unread, c: "#EF4444", bg: "#FEE2E2" },
    { l: "Source donnees", v: "PostgreSQL", c: "#7C3AED", bg: "#EDE9FE" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--bn-text)", margin: 0 }}>Administration Base de Donnees</h1>
          <p style={{ fontSize: 13, color: "var(--bn-muted)", marginTop: 4 }}>Vercel Postgres (Neon) - connexion temps reel</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 99, background: "#D1FAE5", border: "1px solid #A7F3D0" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#065F46" }}>Neon PostgreSQL</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {statCards.map(m => (
          <div key={m.l} style={{ background: m.bg, borderRadius: 12, padding: "14px 16px" }}>
            <p style={{ fontSize: 11, color: m.c, marginBottom: 4 }}>{m.l}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: m.c }}>{dLoading || eLoading ? "..." : m.v}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid var(--bn-border)" }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Migration et initialisation</p>
          <p style={{ fontSize: 12, color: "var(--bn-muted)", marginBottom: 12, lineHeight: 1.5 }}>
            Lance la creation des tables PostgreSQL et insere les donnees de demo. A executer une seule fois apres avoir configure Vercel Postgres.
          </p>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--bn-muted)", display: "block", marginBottom: 5 }}>Cle secrete (MIGRATE_SECRET)</label>
            <input type="password" value={secret} onChange={e => setSecret(e.target.value)} placeholder="Variable env MIGRATE_SECRET" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--bn-border)", fontSize: 13 }} />
          </div>
          <button onClick={runMigrate} disabled={migrateStatus === "loading" || !secret} style={{ width: "100%", padding: 10, borderRadius: 8, background: migrateStatus === "loading" ? "#94A3B8" : "linear-gradient(135deg,#10B981,#059669)", color: "white", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {migrateStatus === "loading" ? "Migration en cours..." : "Lancer CREATE TABLE + SEED"}
          </button>
          {migrateMsg && (
            <pre style={{ marginTop: 10, padding: 10, background: migrateStatus === "ok" ? "#D1FAE5" : "#FEE2E2", borderRadius: 8, fontSize: 11, color: migrateStatus === "ok" ? "#065F46" : "#991B1B", overflow: "auto", maxHeight: 120 }}>
              {migrateMsg}
            </pre>
          )}
        </div>

        <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid var(--bn-border)" }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Configuration requise</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { step: "1", label: "Sur vercel.com", desc: "Storage > Create Database > Postgres", done: false },
              { step: "2", label: "Variables env", desc: "POSTGRES_URL auto-injectee par Vercel", done: false },
              { step: "3", label: "MIGRATE_SECRET", desc: "Ajouter dans Vercel Environment Variables", done: false },
              { step: "4", label: "npm install", desc: "@vercel/postgres @vercel/node", done: false },
              { step: "5", label: "Lancer migration", desc: "Bouton ci-contre avec la cle secrete", done: false },
            ].map(s => (
              <div key={s.step} style={{ display: "flex", gap: 10, padding: "8px 10px", borderRadius: 8, background: s.done ? "#D1FAE5" : "var(--bn-bg)", border: "0.5px solid var(--bn-border)" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: s.done ? "#10B981" : "#1A6FD4", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600 }}>{s.label}</p>
                  <p style={{ fontSize: 11, color: "var(--bn-muted)" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {directions.length > 0 && (
        <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--bn-border)", overflow: "hidden" }}>
          <div style={{ background: "#0D2B4B", padding: "12px 20px" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Donnees en temps reel depuis PostgreSQL</p>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#F8FAFC" }}>
              {["Code","Direction","Alloue","Consomme","Taux","Statut"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "9px 14px", fontSize: 11, fontWeight: 600, color: "var(--bn-muted)", borderBottom: "1px solid var(--bn-border)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {directions.map((d: any, i: number) => {
                const taux = Number(d.taux) || 0;
                const color = taux >= 95 ? "#EF4444" : taux >= 85 ? "#F59E0B" : "#10B981";
                return (
                  <tr key={d.code} style={{ borderBottom: "0.5px solid #F1F5F9", background: i % 2 === 0 ? "white" : "#FAFBFD" }}>
                    <td style={{ padding: "9px 14px", fontSize: 12, fontWeight: 700, color: "#1A6FD4", fontFamily: "monospace" }}>{d.code}</td>
                    <td style={{ padding: "9px 14px", fontSize: 13 }}>{d.name}</td>
                    <td style={{ padding: "9px 14px", fontSize: 12 }}>{(Number(d.allocated) / 1000000000).toFixed(0)} M</td>
                    <td style={{ padding: "9px 14px", fontSize: 12 }}>{(Number(d.consumed) / 1000000000).toFixed(0)} M</td>
                    <td style={{ padding: "9px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 50, height: 5, background: "#F1F5F9", borderRadius: 99 }}>
                          <div style={{ height: 5, width: Math.min(taux, 100) + "%", background: color, borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color }}>{taux.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "9px 14px" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: d.status === "Critique" ? "#FEE2E2" : d.status === "Alerte" ? "#FEF3C7" : "#D1FAE5", color: d.status === "Critique" ? "#991B1B" : d.status === "Alerte" ? "#92400E" : "#065F46" }}>{d.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
