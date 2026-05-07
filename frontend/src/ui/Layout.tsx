import { Link, NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

type NavItem = { to: string; label: string; icon: string; premium?: boolean };

const NAV_STANDARD: NavItem[] = [
  { to: "/dashboard",   label: "Tableau de bord",    icon: "◩" },
  { to: "/budget",      label: "Budget",              icon: "◈" },
  { to: "/procurement", label: "Achats & Paiements",  icon: "◎" },
  { to: "/revenue",     label: "Recettes",            icon: "◉" },
  { to: "/exports",     label: "Exports & Rapports",  icon: "◫" },
  { to: "/audit",       label: "Audit",               icon: "◬" },
  { to: "/ai",          label: "IA Forecasting",      icon: "◭" },
  { to: "/admin",       label: "Admin RBAC",          icon: "◮" },
];

const NAV_PREMIUM: NavItem[] = [
  { to: "/dcmp",       label: "Marchés DCMP",         icon: "✦", premium: true },
  { to: "/simulation", label: "Simulation What-If",   icon: "✦", premium: true },
  { to: "/alerts",     label: "Alertes Intelligentes",icon: "✦", premium: true },
  { to: "/license",    label: "Plans & Licence",      icon: "✦", premium: true },
];

export function Layout() {
  const { i18n } = useTranslation();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bn-bg)" }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, minHeight: "100vh", background: "var(--bn-sidebar)",
        display: "flex", flexDirection: "column", flexShrink: 0,
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg,#1A6FD4,#0E9E8A)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 700, color: "white",
            }}>B</div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "white", lineHeight: 1 }}>BudgetNew</p>
              <p style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>Sénégal & UEMOA</p>
            </div>
          </div>
          <div style={{
            marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(16,185,129,0.15)", borderRadius: 99,
            padding: "3px 10px",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }}></span>
            <span style={{ fontSize: 10, color: "#10B981", fontWeight: 600 }}>MODE DÉMO</span>
          </div>
        </div>

        {/* Nav Standard */}
        <nav style={{ padding: "12px 10px 0", flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#475569", padding: "0 10px 6px",
                       textTransform: "uppercase", letterSpacing: "0.08em" }}>Standard</p>
          {NAV_STANDARD.map(item => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 8, marginBottom: 2,
              textDecoration: "none", fontSize: 13, fontWeight: 500, transition: "all 0.15s",
              background: isActive ? "rgba(26,111,212,0.25)" : "transparent",
              color: isActive ? "#7BC8FF" : "#94A3B8",
              borderLeft: isActive ? "3px solid #1A6FD4" : "3px solid transparent",
            })}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <p style={{ fontSize: 10, fontWeight: 600, color: "#475569", padding: "12px 10px 6px",
                       textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Premium ✦
          </p>
          {NAV_PREMIUM.map(item => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 8, marginBottom: 2,
              textDecoration: "none", fontSize: 13, fontWeight: 500, transition: "all 0.15s",
              background: isActive ? "rgba(124,58,237,0.25)" : "transparent",
              color: isActive ? "#C4B5FD" : "#94A3B8",
              borderLeft: isActive ? "3px solid #7C3AED" : "3px solid transparent",
            })}>
              <span style={{ fontSize: 11, color: "#F59E0B" }}>✦</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Language switcher at bottom */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <select value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)}
            style={{ width: "100%", padding: "6px 10px", borderRadius: 8, fontSize: 12,
                     background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                     color: "#94A3B8", cursor: "pointer" }}>
            <option value="fr">🇸🇳 Français</option>
            <option value="wo">🇸🇳 Wolof</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          background: "white", borderBottom: "1px solid var(--bn-border)",
          padding: "0 28px", height: 60, display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10,
          boxShadow: "var(--bn-shadow)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--bn-text)", lineHeight: 1 }}>
                Suivi Budgétaire Intelligent
              </p>
              <p style={{ fontSize: 11, color: "var(--bn-muted)", marginTop: 2 }}>
                Exercice fiscal 2026 — République du Sénégal
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--bn-text)" }}>Admin Démo</p>
              <p style={{ fontSize: 11, color: "var(--bn-muted)" }}>admin@budgetnew.sn</p>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg,#1A6FD4,#0E9E8A)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: 13, fontWeight: 700,
            }}>A</div>
          </div>
        </header>

        <main style={{ flex: 1, padding: "28px", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
