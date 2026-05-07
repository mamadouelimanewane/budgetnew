
const events = [
  { id:1, ts:"2026-05-07 09:14:32", actor:"admin@budgetnew.sn", action:"create", entity:"BudgetPlan", detail:"Plan 2026 — DGF créé", hash:"a3f9c2...e7b1" },
  { id:2, ts:"2026-05-07 09:32:11", actor:"ordo@budgetnew.sn",  action:"create", entity:"Commitment", detail:"BC-2026-001 SENELEC 45M FCFA", hash:"b81d4e...f3a2" },
  { id:3, ts:"2026-05-07 10:05:44", actor:"cpt@budgetnew.sn",   action:"approve",entity:"Payment",    detail:"Paiement BC-001 liquidé", hash:"c92f1a...d4b5" },
  { id:4, ts:"2026-05-07 11:22:08", actor:"admin@budgetnew.sn", action:"create", entity:"Commitment", detail:"BC-2026-002 SONES 28.5M FCFA", hash:"d74e3b...a9c1" },
  { id:5, ts:"2026-05-07 13:45:19", actor:"ordo@budgetnew.sn",  action:"update", entity:"BudgetAlloc",detail:"DGCPT — enveloppe +50M FCFA", hash:"e56a8c...b2d7" },
  { id:6, ts:"2026-05-07 14:30:55", actor:"ia@budgetnew.sn",    action:"anomaly",entity:"Payment",    detail:"SAGAM 850M — score anomalie 0.87", hash:"f18b2d...c6e3" },
  { id:7, ts:"2026-05-07 15:12:03", actor:"admin@budgetnew.sn", action:"create", entity:"Delegation", detail:"Délégation ordo→adjoint 7j 50M", hash:"g29c5f...d1a8" },
  { id:8, ts:"2026-05-07 16:00:21", actor:"analyste@budgetnew.sn",action:"export",entity:"Report",   detail:"Export XLSX Q1 2026 généré", hash:"h47d9e...e5b4" },
];
const ACTION_STYLE: Record<string,{bg:string,color:string}> = {
  create:  {bg:"#D1FAE5",color:"#065F46"},
  approve: {bg:"#EBF4FF",color:"#1E40AF"},
  update:  {bg:"#FEF3C7",color:"#92400E"},
  anomaly: {bg:"#FEE2E2",color:"#991B1B"},
  export:  {bg:"#EDE9FE",color:"#4C1D95"},
};
export function AuditPage() {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Journal d'audit</h1>
          <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Chaîne immuable hash-chain — chaque entrée lie la précédente</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <span style={{fontSize:11,fontWeight:600,padding:"5px 12px",borderRadius:99,background:"#D1FAE5",color:"#065F46",border:"1px solid #A7F3D0"}}>✓ Intégrité vérifiée</span>
          <span style={{fontSize:11,fontWeight:600,padding:"5px 12px",borderRadius:99,background:"#EBF4FF",color:"#1E40AF"}}>{events.length} événements</span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {label:"Total événements",value:"8",color:"#1A6FD4",bg:"#EBF4FF"},
          {label:"Anomalies IA",value:"1",color:"#EF4444",bg:"#FEE2E2"},
          {label:"Hash intègres",value:"8/8",color:"#10B981",bg:"#D1FAE5"},
          {label:"Acteurs uniques",value:"5",color:"#7C3AED",bg:"#EDE9FE"},
        ].map(m=>(
          <div key={m.label} style={{background:m.bg,borderRadius:12,padding:"14px 16px"}}>
            <p style={{fontSize:11,color:m.color,marginBottom:6}}>{m.label}</p>
            <p style={{fontSize:24,fontWeight:700,color:m.color}}>{m.value}</p>
          </div>
        ))}
      </div>
      <div style={{background:"white",borderRadius:16,padding:24,border:"1px solid var(--bn-border)"}}>
        <p style={{fontSize:15,fontWeight:600,color:"var(--bn-text)",marginBottom:16}}>Événements récents</p>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"#F8FAFC"}}>
            {["#","Horodatage","Acteur","Action","Entité","Détail","Hash"].map(h=>(
              <th key={h} style={{textAlign:"left",padding:"10px 12px",fontSize:11,fontWeight:600,color:"var(--bn-muted)",borderBottom:"1px solid var(--bn-border)",textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {events.map((e,i)=>{
              const s=ACTION_STYLE[e.action]||{bg:"#F1F5F9",color:"#475569"};
              return(
              <tr key={e.id} style={{background:i%2===0?"white":"#FAFBFD",borderBottom:"1px solid #F1F5F9"}}>
                <td style={{padding:"11px 12px",fontSize:12,color:"var(--bn-muted)"}}>{e.id}</td>
                <td style={{padding:"11px 12px",fontSize:11,color:"var(--bn-muted)",whiteSpace:"nowrap"}}>{e.ts}</td>
                <td style={{padding:"11px 12px",fontSize:11,fontWeight:500,color:"var(--bn-text)"}}>{e.actor.split("@")[0]}</td>
                <td style={{padding:"11px 12px"}}><span style={{fontSize:10,fontWeight:600,padding:"3px 8px",borderRadius:99,background:s.bg,color:s.color}}>{e.action}</span></td>
                <td style={{padding:"11px 12px",fontSize:11,color:"var(--bn-text)"}}>{e.entity}</td>
                <td style={{padding:"11px 12px",fontSize:11,color:"var(--bn-muted)",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.detail}</td>
                <td style={{padding:"11px 12px",fontSize:10,fontFamily:"monospace",color:"#10B981"}}>{e.hash}</td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
