
const revenues = [
  {source:"Impôts sur revenus (IS/IR)",month:"Jan 2026",amount:185000000,type:"Fiscal"},
  {source:"TVA nette collectée",month:"Jan 2026",amount:320000000,type:"Fiscal"},
  {source:"Droits de douane",month:"Jan 2026",amount:95000000,type:"Douanier"},
  {source:"Impôts sur revenus (IS/IR)",month:"Fév 2026",amount:192000000,type:"Fiscal"},
  {source:"TVA nette collectée",month:"Fév 2026",amount:335000000,type:"Fiscal"},
  {source:"Recettes non fiscales",month:"Fév 2026",amount:42000000,type:"Non-fiscal"},
  {source:"Impôts sur revenus (IS/IR)",month:"Mar 2026",amount:201000000,type:"Fiscal"},
  {source:"TVA nette collectée",month:"Mar 2026",amount:348000000,type:"Fiscal"},
  {source:"Droits de douane",month:"Mar 2026",amount:108000000,type:"Douanier"},
];
const TYPE_STYLE: Record<string,{bg:string,color:string}> = {
  "Fiscal":{bg:"#EBF4FF",color:"#1E40AF"},
  "Douanier":{bg:"#EDE9FE",color:"#4C1D95"},
  "Non-fiscal":{bg:"#D1FAE5",color:"#065F46"},
};
function fmt(n:number){return(n/1000000).toFixed(0)+" M";}
export function RevenuePage(){
  const total=revenues.reduce((s,r)=>s+r.amount,0);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <div><h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Recettes</h1>
      <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Recettes fiscales, douanières et non-fiscales — Jan–Mar 2026</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[
          {label:"Total recettes Q1",value:fmt(total)+" M FCFA",color:"#1A6FD4",bg:"#EBF4FF"},
          {label:"Recettes fiscales",value:fmt(revenues.filter(r=>r.type==="Fiscal").reduce((s,r)=>s+r.amount,0))+" M",color:"#10B981",bg:"#D1FAE5"},
          {label:"Taux de recouvrement",value:"94,3%",color:"#7C3AED",bg:"#EDE9FE"},
        ].map(m=>(
          <div key={m.label} style={{background:m.bg,borderRadius:12,padding:"16px 18px"}}>
            <p style={{fontSize:11,color:m.color,marginBottom:6}}>{m.label}</p>
            <p style={{fontSize:20,fontWeight:700,color:m.color}}>{m.value}</p>
          </div>
        ))}
      </div>
      <div style={{background:"white",borderRadius:16,padding:24,border:"1px solid var(--bn-border)"}}>
        <p style={{fontSize:15,fontWeight:600,marginBottom:16}}>Détail des recettes</p>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"#F8FAFC"}}>
            {["Source","Période","Montant","Type"].map(h=>(
              <th key={h} style={{textAlign:"left",padding:"10px 12px",fontSize:11,fontWeight:600,color:"var(--bn-muted)",borderBottom:"1px solid var(--bn-border)",textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {revenues.map((r,i)=>{
              const s=TYPE_STYLE[r.type];
              return(
              <tr key={i} style={{background:i%2===0?"white":"#FAFBFD",borderBottom:"1px solid #F1F5F9"}}>
                <td style={{padding:"11px 12px",fontSize:13,fontWeight:500}}>{r.source}</td>
                <td style={{padding:"11px 12px",fontSize:12,color:"var(--bn-muted)"}}>{r.month}</td>
                <td style={{padding:"11px 12px",fontSize:13,fontWeight:600,color:"#1A6FD4"}}>{fmt(r.amount)} M FCFA</td>
                <td style={{padding:"11px 12px"}}><span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:99,background:s.bg,color:s.color}}>{r.type}</span></td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
