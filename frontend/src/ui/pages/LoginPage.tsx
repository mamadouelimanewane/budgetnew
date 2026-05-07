import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveAuth } from "../../lib/storage";

export function LoginPage() {
  const nav = useNavigate();

  useEffect(() => {
    // Mode démo : connexion automatique sans backend
    saveAuth({ token: "demo-token", email: "demo@budgetnew.sn" });
    nav("/dashboard", { replace: true });
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
                  justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 18, fontWeight: 500, color: "#0D2B4B" }}>BudgetNew</p>
        <p style={{ fontSize: 13, color: "#5F5E5A", marginTop: 8 }}>Chargement de la démo...</p>
      </div>
    </div>
  );
}
