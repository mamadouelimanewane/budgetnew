
export function TofePage(){
  const rows=[
    {title:"I. RECETTES TOTALES",total:1103,prev:1020,bold:true,items:[
      {label:"Recettes fiscales",v:892,p:820},{label:"  Impôts directs",v:412,p:380},
      {label:"  TVA nette",v:320,p:295},{label:"  Droits douane",v:160,p:145},
      {label:"Recettes non fiscales",v:120,p:110},{label:"Dons extérieurs",v:91,p:90}]},
    {title:"II. DÉPENSES TOTALES",total:1415,prev:1350,bold:true,items:[
      {label:"Dépenses courantes",v:890,p:850},{label:"  Personnel",v:520,p:500},
      {label:"  Biens & services",v:210,p:200},{label:"  Transferts",v:160,p:150},
      {label:"Dépenses en capital",v:525,p:500},{label:"  Investissements",v:380,p:360}]},
    {title:"III. SOLDE GLOBAL (I-II)",total:-312,prev:-330,bold:true,items:[]},
    {title:"IV. FINANCEMENT",total:312,prev:330,bold:true,items:[
      {label:"Financement intérieur",v:180,p:190},{label:"Financement extérieur",v:132,p:140}]},
  ];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>TOFE — Tableau des Opérations Financières</h1>
        <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Format officiel BCEAO · Q1 2026 · Montants en millions FCFA</p></div>
        <div style={{display:"flex",gap:8}}>
          <button style={{padding:"8px 16px",borderRadius:8,border:"1px solid #EF4444",background:"#FEE2E2",color:"#991B1B",cursor:"pointer",fontSize:12,fontWeight:600}}>PDF</button>
          <button style={{padding:"8px 16px",borderRadius:8,border:"1px solid #10B981",background:"#D1FAE5",color:"#065F46",cursor:"pointer",fontSize:12,fontWeight:600}}>XLSX</button>
        </div>
      </div>
      <div style={{background:"white",borderRadius:16,border:"1px solid var(--bn-border)",overflow:"hidden"}}>
        <div style={{background:"#0D2B4B",padding:"12px 20px",display:"flex",justifyContent:"space-between"}}>
          <div><p style={{fontSize:13,fontWeight:700,color:"white"}}>RÉPUBLIQUE DU SÉNÉGAL — Ministère des Finances</p>
          <p style={{fontSize:10,color:"rgba(255,255,255,0.5)"}}>DGTCP · Format BCEAO/UEMOA</p></div>
          <div style={{textAlign:"right"}}><p style={{fontSize:10,color:"rgba(255,255,255,0.5)"}}>Référence</p>
          <p style={{fontSize:11,fontWeight:600,color:"white"}}>TOFE-SN-2026-Q1</p></div>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"#F8FAFC"}}>
            {["Libellé","Réalisé Q1","Prévision","Écart","Taux"].map((h,i)=>(
              <th key={h} style={{textAlign:i===0?"left":"right",padding:"9px 14px",fontSize:10,fontWeight:600,color:"var(--bn-muted)",borderBottom:"1px solid var(--bn-border)",textTransform:"uppercase"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {rows.map(s=>(
              <>
              <tr key={s.title} style={{background:"#F0F4FA",borderTop:"2px solid #1A6FD4"}}>
                <td style={{padding:"10px 14px",fontSize:13,fontWeight:700,color:"#0D2B4B"}}>{s.title}</td>
                <td style={{padding:"10px 14px",fontSize:13,fontWeight:700,textAlign:"right",color:s.total<0?"#EF4444":"#0D2B4B"}}>{s.total<0?"-":""}{Math.abs(s.total).toLocaleString("fr-SN")}</td>
                <td style={{padding:"10px 14px",fontSize:12,textAlign:"right",color:"var(--bn-muted)"}}>{Math.abs(s.prev).toLocaleString("fr-SN")}</td>
                <td style={{padding:"10px 14px",fontSize:12,fontWeight:600,textAlign:"right",color:(s.total-s.prev)>=0?"#065F46":"#991B1B"}}>{(s.total-s.prev)>=0?"+":""}{(s.total-s.prev).toLocaleString("fr-SN")}</td>
                <td style={{padding:"10px 14px",fontSize:12,fontWeight:600,textAlign:"right",color:Math.abs(s.total/s.prev*100)>=100?"#065F46":"#92400E"}}>{s.prev!==0?Math.abs((s.total/s.prev)*100).toFixed(1)+"%":"—"}</td>
              </tr>
              {s.items.map((item,j)=>{
                const taux=(item.v/item.p*100);
                const indent=item.label.startsWith("  ");
                return(
                <tr key={j} style={{borderBottom:"0.5px solid #F1F5F9",background:j%2===0?"white":"#FAFBFD"}}>
                  <td style={{padding:"8px 14px",fontSize:12,paddingLeft:indent?"28px":"14px",color:"var(--bn-text)"}}>{item.label.trim()}</td>
                  <td style={{padding:"8px 14px",fontSize:12,textAlign:"right",fontWeight:500}}>{item.v.toLocaleString("fr-SN")}</td>
                  <td style={{padding:"8px 14px",fontSize:12,textAlign:"right",color:"var(--bn-muted)"}}>{item.p.toLocaleString("fr-SN")}</td>
                  <td style={{padding:"8px 14px",fontSize:12,textAlign:"right",color:(item.v-item.p)>=0?"#065F46":"#991B1B"}}>{(item.v-item.p)>=0?"+"+(item.v-item.p).toLocaleString("fr-SN"):"-"+(Math.abs(item.v-item.p)).toLocaleString("fr-SN")}</td>
                  <td style={{padding:"8px 14px",fontSize:12,textAlign:"right",color:taux>=100?"#065F46":taux<95?"#991B1B":"#92400E"}}>{taux.toFixed(1)}%</td>
                </tr>);})}
              </>))}
          </tbody>
        </table>
        <div style={{padding:"10px 14px",background:"#F8FAFC",borderTop:"1px solid var(--bn-border)",display:"flex",justifyContent:"space-between"}}>
          <p style={{fontSize:10,color:"var(--bn-muted)"}}>Généré par BudgetNew v2.0 · Format BCEAO/UEMOA</p>
          <p style={{fontSize:10,color:"var(--bn-muted)"}}>Visa ordonnateur requis avant transmission</p>
        </div>
      </div>
    </div>
  );
}
