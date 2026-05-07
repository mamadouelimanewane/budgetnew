
const commitments = [
  {ref:"BC-2026-001",vendor:"SENELEC",desc:"Fourniture électricité bureaux",amount:45000000,status:"Liquidé",date:"2026-01-15"},
  {ref:"BC-2026-002",vendor:"SONES",desc:"Eau potable immeubles administratifs",amount:28500000,status:"Liquidé",date:"2026-01-22"},
  {ref:"BC-2026-003",vendor:"SONATEL",desc:"Abonnements téléphonie & internet",amount:12750000,status:"En cours",date:"2026-02-03"},
  {ref:"BC-2026-004",vendor:"GIE GAINDE 2000",desc:"Maintenance informatique parc",amount:95000000,status:"En attente",date:"2026-02-18"},
  {ref:"BC-2026-005",vendor:"SAGAM Sécurité",desc:"Gardiennage annuel complexe admin",amount:850000000,status:"Anomalie IA",date:"2026-03-01"},
  {ref:"BC-2026-006",vendor:"Imprimerie SN",desc:"Documents administratifs officiels",amount:8200000,status:"Liquidé",date:"2026-03-14"},
  {ref:"BC-2026-007",vendor:"Bureau Veritas",desc:"Audit technique équipements",amount:22000000,status:"En cours",date:"2026-04-02"},
];
const ST: Record<string,{bg:string,color:string}> = {
  "Liquidé":{bg:"#D1FAE5",color:"#065F46"},
  "En cours":{bg:"#FEF3C7",color:"#92400E"},
  "En attente":{bg:"#EDE9FE",color:"#4C1D95"},
  "Anomalie IA":{bg:"#FEE2E2",color:"#991B1B"},
};
function fmt(n:number){return(n/1000000).toLocaleString("fr-SN",{maximumFractionDigits:1})+" M FCFA";}
export function ProcurementPage(){
  const total=commitments.reduce((s,c)=>s+c.amount,0);
  const liquide=commitments.filter(c=>c.status==="Liquidé").reduce((s,c)=>s+c.amount,0);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <div><h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Achats & Paiements</h1>
      <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Cycle complet : Engagement → Bon de commande → Liquidation</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {label:"Total engagé",value:fmt(total),color:"#1A6FD4",bg:"#EBF4FF"},
          {label:"Liquidé",value:fmt(liquide),color:"#10B981",bg:"#D1FAE5"},
          {label:"En cours",value:fmt(total-liquide),color:"#F59E0B",bg:"#FEF3C7"},
          {label:"Anomalies IA",value:"1",color:"#EF4444",bg:"#FEE2E2"},
        ].map(m=>(
          <div key={m.label} style={{background:m.bg,borderRadius:12,padding:"14px 16px"}}>
            <p style={{fontSize:11,color:m.color,marginBottom:4}}>{m.label}</p>
            <p style={{fontSize:16,fontWeight:700,color:m.color}}>{m.value}</p>
          </div>
        ))}
      </div>
      <div style={{background:"white",borderRadius:16,padding:24,border:"1px solid var(--bn-border)"}}>
        <p style={{fontSize:15,fontWeight:600,marginBottom:16}}>Bons de commande 2026</p>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"#F8FAFC"}}>
            {["Référence","Fournisseur","Description","Montant","Date","Statut"].map(h=>(
              <th key={h} style={{textAlign:"left",padding:"10px 12px",fontSize:11,fontWeight:600,color:"var(--bn-muted)",borderBottom:"1px solid var(--bn-border)",textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {commitments.map((c,i)=>{
              const s=ST[c.status]||{bg:"#F1F5F9",color:"#475569"};
              return(
              <tr key={c.ref} style={{background:i%2===0?"white":"#FAFBFD",borderBottom:"1px solid #F1F5F9"}}>
                <td style={{padding:"11px 12px",fontSize:12,fontWeight:600,color:"#1A6FD4"}}>{c.ref}</td>
                <td style={{padding:"11px 12px",fontSize:13,fontWeight:500}}>{c.vendor}</td>
                <td style={{padding:"11px 12px",fontSize:12,color:"var(--bn-muted)",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.desc}</td>
                <td style={{padding:"11px 12px",fontSize:13,fontWeight:600}}>{fmt(c.amount)}</td>
                <td style={{padding:"11px 12px",fontSize:11,color:"var(--bn-muted)"}}>{c.date}</td>
                <td style={{padding:"11px 12px"}}><span style={{fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:99,background:s.bg,color:s.color}}>{c.status}</span></td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
