import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const nav = useNavigate();
  useEffect(() => {
    localStorage.setItem("budget1_auth", JSON.stringify({ token: "demo", email: "demo@budgetnew.sn" }));
    nav("/dashboard", { replace: true });
  }, []);
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ fontSize:16, color:"#5F5E5A" }}>Chargement démo...</p>
    </div>
  );
}
