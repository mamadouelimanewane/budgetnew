export function DashboardPage() {
  const kpis = [
    { label:"Budget total 2026", value:"4 500", unit:"M FCFA", icon:"◈",
      gradient:"linear-gradient(135deg,#1A6FD4,#0284C7)", text:"white" },
    { label:"Consommé", value:"2 577", unit:"M FCFA", icon:"◎",
      gradient:"linear-gradient(135deg,#10B981,#059669)", text:"white" },
    { label:"Disponible", value:"1 923", unit:"M FCFA", icon:"◉",
      gradient:"linear-gradient(135deg,#F59E0B,#D97706)", text:"white" },
    { label:"Taux exécution", value:"57,3", unit:"%", icon:"◭",
      gradient:"linear-gradient(135deg,#7C3AED,#6D28D9)", text:"white" },
  ];

  const directions = [
    { name:"DGID",      alloue:1200, consomme:748,  taux:62.3, color:"#1A6FD4" },
    { name:"DGCPT",     alloue:980,  consomme:921,  taux:94.0, color:"#EF4444" },
    { name:"DPEE",      alloue:650,  consomme:310,  taux:47.7, color:"#10B981" },
    { name:"DAGE",      alloue:420,  consomme:418,  taux:99.5, color:"#EF4444" },
    { name:"Primature", alloue:350,  consomme:180,  taux:51.4, color:"#7C3AED" },
  ];

  const engagements = [
    { ref:"BC-2026-001", fournisseur:"SENELEC",    montant:"45 M",  statut:"Liquidé",    sc:"#D1FAE5", tc:"#065F46" },
    { ref:"BC-2026-002", fournisseur:"SONES",       montant:"28,5 M",statut:"Liquidé",    sc:"#D1FAE5", tc:"#065F46" },
    { ref:"BC-2026-003", fournisseur:"SONATEL",     montant:"12,7 M",statut:"En cours",   sc:"#FEF3C7", tc:"#92400E" },
    { ref:"BC-2026-004", fournisseur:"GIE GAINDE",  montant:"95 M",  statut:"Validation", sc:"#EDE9FE", tc:"#4C1D95" },
    { ref:"BC-2026-005", fournisseur:"SAGAM",       montant:"850 M", statut:"Anomalie IA",sc:"#FEE2E2", tc:"#991B1B" },
  ];

  const premFeats = [
    { label:"Marchés Publics DCMP",       color:"#1A6FD4", bg:"#EBF4FF" },
    { label:"Simulation What-If",          color:"#7C3AED", bg:"#EDE9FE" },
    { label:"Alertes intelligentes",       color:"#F59E0B", bg:"#FEF3C7" },
    { label:"Géo-dashboard 14 régions SN", color:"#0E9E8A", bg:"#E6F8F6" },
    { label:"Multi-entités consolidation", color:"#10B981", bg:"#D1FAE5" },
    { label:"Audit immuable hash-chain",   color:"#6366F1", bg:"#EEF2FF" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

      {/* Page title */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:"var(--bn-text)", margin:0 }}>
            Tableau de bord
          </h1>
          <p style={{ fontSize:13, color:"var(--bn-muted)", marginTop:4 }}>
            Vue d'ensemble — Exercice 2026 · République du Sénégal
          </p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <span style={{ fontSize:11, fontWeight:600, padding:"5px 12px", borderRadius:99,
                          background:"#EBF4FF", color:"#1A6FD4", border:"1px solid #BFDBFE" }}>
            Données de démonstration
          </span>
          <span style={{ fontSize:11, fontWeight:600, padding:"5px 12px", borderRadius:99,
                          background:"#D1FAE5", color:"#065F46", border:"1px solid #A7F3D0" }}>
            ✓ Certifié UEMOA
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
        {kpis.map(k => (
          <div key={k.label} style={{
            background:k.gradient, borderRadius:16, padding:"20px",
            boxShadow:"0 4px 15px rgba(0,0,0,0.12)", position:"relative", overflow:"hidden",
          }}>
            <div style={{ position:"absolute", top:-10, right:-10, fontSize:60,
                           opacity:0.1, color:"white" }}>{k.icon}</div>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.8)", marginBottom:8, fontWeight:500 }}>
              {k.label}
            </p>
            <p style={{ fontSize:28, fontWeight:700, color:"white", lineHeight:1 }}>{k.value}</p>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:4 }}>{k.unit}</p>
          </div>
        ))}
      </div>

      {/* 2-col section */}
      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:20 }}>

        {/* Exécution par direction */}
        <div style={{ background:"white", borderRadius:16, padding:24,
                       boxShadow:"var(--bn-shadow)", border:"1px solid var(--bn-border)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <p style={{ fontSize:15, fontWeight:600, color:"var(--bn-text)" }}>Exécution par direction</p>
            <span style={{ fontSize:11, color:"var(--bn-muted)" }}>Jan – Mai 2026</span>
          </div>
          {directions.map(d => (
            <div key={d.name} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:13, fontWeight:600, color:"var(--bn-text)" }}>{d.name}</span>
                <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <span style={{ fontSize:11, color:"var(--bn-muted)" }}>
                    {d.consomme.toLocaleString("fr-SN")} / {d.alloue.toLocaleString("fr-SN")} M
                  </span>
                  <span style={{ fontSize:12, fontWeight:700, color:d.color, minWidth:42, textAlign:"right" }}>
                    {d.taux.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div style={{ height:8, background:"#F1F5F9", borderRadius:99, overflow:"hidden" }}>
                <div style={{
                  height:8, borderRadius:99,
                  width:`${Math.min(d.taux,100)}%`,
                  background:d.color,
                  transition:"width 0.6s ease",
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Fonctionnalités Premium */}
        <div style={{ background:"white", borderRadius:16, padding:24,
                       boxShadow:"var(--bn-shadow)", border:"1px solid var(--bn-border)" }}>
          <p style={{ fontSize:15, fontWeight:600, color:"var(--bn-text)", marginBottom:16 }}>
            Modules Premium actifs
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {premFeats.map(f => (
              <div key={f.label} style={{
                display:"flex", alignItems:"center", gap:10,
                background:f.bg, borderRadius:10, padding:"10px 14px",
              }}>
                <span style={{ fontSize:14, color:f.color, fontWeight:700 }}>✓</span>
                <span style={{ fontSize:12, fontWeight:500, color:f.color }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engagements récents */}
      <div style={{ background:"white", borderRadius:16, padding:24,
                     boxShadow:"var(--bn-shadow)", border:"1px solid var(--bn-border)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <p style={{ fontSize:15, fontWeight:600, color:"var(--bn-text)" }}>Engagements récents</p>
          <span style={{ fontSize:11, color:"#1A6FD4", fontWeight:600, cursor:"pointer" }}>
            Voir tous →
          </span>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#F8FAFC" }}>
              {["Référence","Fournisseur","Montant","Statut"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"10px 14px", fontSize:11,
                                      fontWeight:600, color:"var(--bn-muted)",
                                      borderBottom:"1px solid var(--bn-border)",
                                      textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {engagements.map((e,i) => (
              <tr key={e.ref} style={{ background: i%2===0 ? "white" : "#FAFBFD" }}>
                <td style={{ padding:"12px 14px", fontSize:13, fontWeight:600, color:"#1A6FD4" }}>{e.ref}</td>
                <td style={{ padding:"12px 14px", fontSize:13, color:"var(--bn-text)" }}>{e.fournisseur}</td>
                <td style={{ padding:"12px 14px", fontSize:13, fontWeight:600, color:"var(--bn-text)" }}>{e.montant}</td>
                <td style={{ padding:"12px 14px" }}>
                  <span style={{ fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:99,
                                  background:e.sc, color:e.tc }}>{e.statut}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {[
          { label:"Marchés DCMP ouverts", value:"12", sub:"dont 3 en évaluation", color:"#1A6FD4", bg:"#EBF4FF" },
          { label:"Alertes actives", value:"2", sub:"dont 1 critique", color:"#EF4444", bg:"#FEE2E2" },
          { label:"Taux d'anomalie IA", value:"4,2%", sub:"Isolation Forest — Normal", color:"#10B981", bg:"#D1FAE5" },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, borderRadius:14, padding:"18px 20px",
                                       border:`1px solid ${s.color}22` }}>
            <p style={{ fontSize:12, color:s.color, fontWeight:600, marginBottom:6 }}>{s.label}</p>
            <p style={{ fontSize:28, fontWeight:700, color:s.color, lineHeight:1 }}>{s.value}</p>
            <p style={{ fontSize:11, color:s.color, opacity:0.7, marginTop:4 }}>{s.sub}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
