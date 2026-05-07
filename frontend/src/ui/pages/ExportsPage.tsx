
const reports = [
  {name:"Rapport d'exécution budgétaire Q1 2026",type:"PDF",size:"2.4 MB",date:"2026-04-05",status:"Disponible"},
  {name:"Tableau de bord mensuel — Avril 2026",type:"XLSX",size:"1.1 MB",date:"2026-05-02",status:"Disponible"},
  {name:"Export TOFE BCEAO — Mars 2026",type:"PDF",size:"3.8 MB",date:"2026-04-01",status:"Disponible"},
  {name:"Détail engagements Jan–Avr 2026",type:"XLSX",size:"856 KB",date:"2026-05-01",status:"Disponible"},
  {name:"Rapport de trésorerie prévisionnelle",type:"PDF",size:"1.7 MB",date:"2026-04-28",status:"Disponible"},
  {name:"Rapport anomalies IA — Mai 2026",type:"PDF",size:"512 KB",date:"2026-05-07",status:"Nouveau"},
];
const TYPE_COLORS: Record<string,{bg:string,color:string}> = {
  PDF:{bg:"#FEE2E2",color:"#991B1B"},
  XLSX:{bg:"#D1FAE5",color:"#065F46"},
};
export function ExportsPage(){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <div><h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Exports & Rapports</h1>
      <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Rapports réglementaires UEMOA — formats XLSX et PDF</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[
          {label:"Rapports disponibles",value:"6",color:"#1A6FD4",bg:"#EBF4FF"},
          {label:"Exports PDF",value:"4",color:"#EF4444",bg:"#FEE2E2"},
          {label:"Exports XLSX",value:"2",color:"#10B981",bg:"#D1FAE5"},
        ].map(m=>(
          <div key={m.label} style={{background:m.bg,borderRadius:12,padding:"14px 16px"}}>
            <p style={{fontSize:11,color:m.color,marginBottom:4}}>{m.label}</p>
            <p style={{fontSize:22,fontWeight:700,color:m.color}}>{m.value}</p>
          </div>
        ))}
      </div>
      <div style={{background:"white",borderRadius:16,padding:24,border:"1px solid var(--bn-border)"}}>
        <p style={{fontSize:15,fontWeight:600,marginBottom:16}}>Rapports générés</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {reports.map((r,i)=>{
            const tc=TYPE_COLORS[r.type]||{bg:"#F1F5F9",color:"#475569"};
            return(
            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderRadius:12,border:"1px solid var(--bn-border)",background:r.status==="Nouveau"?"#FFFBEB":"white"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:40,borderRadius:10,background:tc.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:tc.color}}>{r.type}</div>
                <div>
                  <p style={{fontSize:13,fontWeight:600,color:"var(--bn-text)"}}>{r.name}</p>
                  <p style={{fontSize:11,color:"var(--bn-muted)",marginTop:2}}>{r.date} · {r.size}</p>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {r.status==="Nouveau"&&<span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,background:"#FEF3C7",color:"#92400E"}}>Nouveau</span>}
                <button style={{fontSize:12,fontWeight:600,padding:"7px 16px",borderRadius:8,background:"linear-gradient(135deg,#1A6FD4,#0284C7)",color:"white",border:"none",cursor:"pointer"}}>
                  Télécharger
                </button>
              </div>
            </div>);
          })}
        </div>
      </div>
    </div>
  );
}
