export function DashboardPage() {
  const kpis = [
    { label: "Budget total 2026", value: "4 500 000 000", unit: "FCFA", color: "#185FA5", bg: "#E6F1FB" },
    { label: "Consommé", value: "2 577 000 000", unit: "FCFA", color: "#3B6D11", bg: "#EAF3DE" },
    { label: "Disponible", value: "1 923 000 000", unit: "FCFA", color: "#854F0B", bg: "#FAEEDA" },
    { label: "Taux exécution", value: "57,3%", unit: "", color: "#534AB7", bg: "#EEEDFE" },
  ];

  const directions = [
    { name: "DGID", alloue: 1200, consomme: 748, taux: 62.3 },
    { name: "DGCPT", alloue: 980, consomme: 921, taux: 94.0 },
    { name: "DPEE", alloue: 650, consomme: 310, taux: 47.7 },
    { name: "DAGE", alloue: 420, consomme: 418, taux: 99.5 },
    { name: "Primature", alloue: 350, consomme: 180, taux: 51.4 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 18, fontWeight: 500 }}>Dashboard — Exercice 2026</p>
        <p style={{ fontSize: 13, color: "#5F5E5A", marginTop: 4 }}>
          Données de démonstration — République du Sénégal
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: k.bg, borderRadius: 10, padding: "14px 16px" }}>
            <p style={{ fontSize: 11, color: k.color, marginBottom: 6 }}>{k.label}</p>
            <p style={{ fontSize: 20, fontWeight: 500, color: k.color }}>{k.value}</p>
            {k.unit && <p style={{ fontSize: 11, color: k.color }}>{k.unit}</p>}
          </div>
        ))}
      </div>

      <div>
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Exécution par direction</p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "0.5px solid #D3D1C7" }}>
              {["Direction","Alloué (M FCFA)","Consommé (M FCFA)","Taux","Progression"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"8px 10px", fontSize:11,
                                     fontWeight:500, color:"#5F5E5A" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {directions.map(d => (
              <tr key={d.name} style={{ borderBottom: "0.5px solid #F1EFE8" }}>
                <td style={{ padding:"10px", fontWeight:500 }}>{d.name}</td>
                <td style={{ padding:"10px" }}>{d.alloue.toLocaleString("fr-SN")}</td>
                <td style={{ padding:"10px" }}>{d.consomme.toLocaleString("fr-SN")}</td>
                <td style={{ padding:"10px", fontWeight:500,
                             color: d.taux > 90 ? "#A32D2D" : d.taux > 70 ? "#854F0B" : "#3B6D11" }}>
                  {d.taux.toFixed(1)}%
                </td>
                <td style={{ padding:"10px", width:160 }}>
                  <div style={{ height:8, background:"#F1EFE8", borderRadius:99 }}>
                    <div style={{ height:8, borderRadius:99, width:`${Math.min(d.taux,100)}%`,
                                  background: d.taux > 90 ? "#A32D2D" : d.taux > 70 ? "#854F0B" : "#3B6D11" }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={{ background:"#F1EFE8", borderRadius:10, padding:"16px" }}>
          <p style={{ fontSize:13, fontWeight:500, marginBottom:10 }}>Engagements récents</p>
          {[
            { ref:"BC-2026-001", fournisseur:"SENELEC", montant:"45 000 000", statut:"Liquidé", color:"#3B6D11" },
            { ref:"BC-2026-002", fournisseur:"SONES", montant:"28 500 000", statut:"Liquidé", color:"#3B6D11" },
            { ref:"BC-2026-003", fournisseur:"SONATEL", montant:"12 750 000", statut:"En cours", color:"#854F0B" },
            { ref:"BC-2026-004", fournisseur:"GIE GAINDE", montant:"95 000 000", statut:"Validation", color:"#854F0B" },
            { ref:"BC-2026-005", fournisseur:"SAGAM", montant:"850 000 000", statut:"Anomalie IA", color:"#A32D2D" },
          ].map(e => (
            <div key={e.ref} style={{ display:"flex", justifyContent:"space-between",
                                       padding:"6px 0", borderBottom:"0.5px solid #D3D1C7",
                                       fontSize:12 }}>
              <span style={{ color:"#185FA5", fontWeight:500 }}>{e.ref}</span>
              <span style={{ flex:1, marginLeft:10 }}>{e.fournisseur}</span>
              <span style={{ color:e.color, fontWeight:500 }}>{e.statut}</span>
            </div>
          ))}
        </div>
        <div style={{ background:"#EEEDFE", borderRadius:10, padding:"16px" }}>
          <p style={{ fontSize:13, fontWeight:500, marginBottom:10 }}>Fonctionnalités Premium actives</p>
          {[
            "Marchés Publics DCMP",
            "Simulation What-If budgétaire",
            "Alertes intelligentes",
            "Géo-dashboard 14 régions SN",
            "Multi-entités & consolidation",
            "Audit immuable hash-chain",
          ].map(f => (
            <div key={f} style={{ display:"flex", alignItems:"center", gap:8,
                                   padding:"5px 0", fontSize:12 }}>
              <span style={{ color:"#3B6D11", fontWeight:500 }}>✓</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
