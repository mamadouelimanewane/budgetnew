import { Link, NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

type NavItem = { to: string; label: string; tag?: string };

const NAV: { section: string; color?: string; items: NavItem[] }[] = [
  { section: "Standard", items: [
    { to: "/dashboard",    label: "Tableau de bord" },
    { to: "/saisie",       label: "Saisie et Formulaires", tag: "NEW" },
    { to: "/budget",       label: "Budget" },
    { to: "/procurement",  label: "Achats et Paiements" },
    { to: "/revenue",      label: "Recettes" },
    { to: "/exports",      label: "Exports et Rapports" },
    { to: "/audit",        label: "Audit" },
    { to: "/ai",           label: "IA Forecasting" },
    { to: "/admin",        label: "Admin RBAC" },
    { to: "/users",        label: "Utilisateurs" },
  ]},
  { section: "Premium", color: "#7C3AED", items: [
    { to: "/executive",    label: "Dashboard Executif",    tag: "P1" },
    { to: "/chatbot",      label: "Assistant IA",          tag: "P1" },
    { to: "/fraude",       label: "Anti-fraude IA",        tag: "P1" },
    { to: "/tofe",         label: "TOFE BCEAO",            tag: "P1" },
    { to: "/notifications",label: "Notifications",         tag: "P1" },
    { to: "/dcmp",         label: "Marches DCMP" },
    { to: "/simulation",   label: "Simulation What-If" },
    { to: "/workflow",     label: "Workflows" },
    { to: "/portail",      label: "Portail Fournisseurs" },
    { to: "/alerts",       label: "Alertes" },
    { to: "/onboarding",   label: "Formation LMS" },
    { to: "/compare",      label: "Comparer produits" },
    { to: "/license",      label: "Plans et Licence" },
  ]},
];

export function Layout() {
  const { i18n } = useTranslation();
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bn-bg)" }}>
      <aside style={{ width: 220, minHeight: "100vh", background: "var(--bn-sidebar)", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#1A6FD4,#0E9E8A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "white" }}>B</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1 }}>BudgetNew</p>
              <p style={{ fontSize: 9, color: "#94A3B8", marginTop: 1 }}>Senegal et UEMOA v2.0</p>
            </div>
          </div>
          <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(16,185,129,0.15)", borderRadius: 99, padding: "2px 8px" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
            <span style={{ fontSize: 9, color: "#10B981", fontWeight: 600 }}>MODE DEMO - 24 modules</span>
          </div>
        </div>
        <nav style={{ padding: "8px 8px 0", flex: 1 }}>
          {NAV.map(section => (
            <div key={section.section}>
              <p style={{ fontSize: 9, fontWeight: 600, color: section.color || "#475569", padding: "10px 10px 5px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {section.section}
              </p>
              {section.items.map(item => (
                <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "7px 10px", borderRadius: 6, marginBottom: 1,
                  textDecoration: "none", fontSize: 12, fontWeight: 500, transition: "all 0.12s",
                  background: isActive ? (section.color ? "rgba(124,58,237,0.25)" : "rgba(26,111,212,0.25)") : "transparent",
                  color: isActive ? (section.color ? "#C4B5FD" : "#7BC8FF") : "#94A3B8",
                  borderLeft: isActive ? ("2px solid " + (section.color || "#1A6FD4")) : "2px solid transparent",
                })}>
                  <span>{item.label}</span>
                  {item.tag && (
                    <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 99, background: item.tag === "P1" ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)", color: item.tag === "P1" ? "#FCA5A5" : "#6EE7B7", flexShrink: 0 }}>
                      {item.tag}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <select value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)}
            style={{ width: "100%", padding: "5px 8px", borderRadius: 6, fontSize: 11, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#94A3B8", cursor: "pointer" }}>
            <option value="fr">Francais</option>
            <option value="wo">Wolof</option>
            <option value="en">English</option>
          </select>
        </div>
      </aside>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ background: "white", borderBottom: "1px solid var(--bn-border)", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10, boxShadow: "var(--bn-shadow)" }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--bn-text)", lineHeight: 1 }}>Suivi Budgetaire Intelligent</p>
            <p style={{ fontSize: 10, color: "var(--bn-muted)", marginTop: 1 }}>Exercice fiscal 2026 - Republique du Senegal</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--bn-text)" }}>Admin Demo</p>
              <p style={{ fontSize: 10, color: "var(--bn-muted)" }}>admin@budgetnew.sn</p>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#1A6FD4,#0E9E8A)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700 }}>AD</div>
          </div>
        </header>
        <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
