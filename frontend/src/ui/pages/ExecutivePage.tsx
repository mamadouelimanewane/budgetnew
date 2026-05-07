
export function ExecutivePage(){
  const ministeres=[
    {name:"Économie & Finances",budget:4500,consomme:2577,taux:57.3,status:"ok"},
    {name:"Infrastructure",budget:2800,consomme:1960,taux:70.0,status:"warn"},
    {name:"Éducation nationale",budget:3200,consomme:2880,taux:90.0,status:"danger"},
    {name:"Santé publique",budget:2100,consomme:1470,taux:70.0,status:"warn"},
    {name:"Agriculture",budget:1800,consomme:720,taux:40.0,status:"ok"},
    {name:"Sécurité intérieure",budget:1400,consomme:980,taux:70.0,status:"ok"},
  ];
  const ss:Record<string,{color:string,bg:string,label:string}>={ok:{color:"#065F46",bg:"#D1FAE5",label:"Normal"},warn:{color:"#92400E",bg:"#FEF3C7",label:"Attention"},danger:{color:"#991B1B",bg:"#FEE2E2",label:"Alerte"}};
  const macro=[
    {label:"Recettes fiscales Q1",value:"1 103 M",trend:"+8%",up:true},
    {label:"Dépenses totales",value:"2 577 M",trend:"+5%",up:true},
    {label:"Solde budgétaire",value:"-312 M",trend:"-2%",up:false},
    {label:"Trésorerie nette",value:"4 218 M",trend:"+12%",up:true},
    {label:"Taux exécution",value:"57,3%",trend:"+3,2pts",up:true},
    {label:"Anomalies IA",value:"3",trend:"Critique×1",up:false},
  ];
  return(
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Dashboard Exécutif</h1>
        <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Vue Ministre des Finances · Mai 2026</p></div>
        <span style={{fontSize:11,fontWeight:600,padding:"5px 14px",borderRadius:99,background:"#FEE2E2",color:"#991B1B",border:"1px solid #FECACA"}}>2 alertes critiques</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {macro.map(m=>(
          <div key={m.label} style={{background:"white",borderRadius:14,padding:"14px 18px",border:"1px solid var(--bn-border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <p style={{fontSize:11,color:"var(--bn-muted)",marginBottom:4}}>{m.label}</p>
              <p style={{fontSize:18,fontWeight:700,color:"var(--bn-text)"}}>{m.value} <span style={{fontSize:10,color:"var(--bn-muted)"}}>FCFA</span></p>
            </div>
            <span style={{fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:99,background:m.up?"#D1FAE5":"#FEE2E2",color:m.up?"#065F46":"#991B1B"}}>{m.up?"↑":"↓"} {m.trend}</span>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:20}}>
        <div style={{background:"white",borderRadius:16,padding:24,border:"1px solid var(--bn-border)"}}>
          <p style={{fontSize:15,fontWeight:600,marginBottom:16}}>Exécution par ministère</p>
          {ministeres.map(m=>{const s=ss[m.status];return(
            <div key={m.name} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:9,fontWeight:600,padding:"1px 6px",borderRadius:99,background:s.bg,color:s.color}}>{s.label}</span>
                  <span style={{fontSize:12,fontWeight:500}}>{m.name}</span>
                </div>
                <span style={{fontSize:12,fontWeight:700,color:s.color}}>{m.taux.toFixed(1)}%</span>
              </div>
              <div style={{height:7,background:"#F1F5F9",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:7,borderRadius:99,width:`${m.taux}%`,background:m.status==="danger"?"#EF4444":m.status==="warn"?"#F59E0B":"#10B981"}}/>
              </div>
            </div>);})}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:"linear-gradient(135deg,#0D2B4B,#1A3352)",borderRadius:16,padding:18,flex:1}}>
            <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.7)",marginBottom:10}}>Signaux d'alerte IA</p>
            {[{icon:"🔴",text:"Éducation à 90% — dépassement probable"},
              {icon:"🟡",text:"SAGAM — anomalie fraude (score 0,87)"},
              {icon:"🟡",text:"Infrastructure — accélération +8%/mois"}].map((a,i)=>(
              <div key={i} style={{padding:"9px 12px",borderRadius:8,background:"rgba(255,255,255,0.07)",marginBottom:6,display:"flex",gap:8,alignItems:"flex-start"}}>
                <span>{a.icon}</span><p style={{fontSize:12,color:"white",lineHeight:1.4}}>{a.text}</p>
              </div>))}
          </div>
          <div style={{background:"white",borderRadius:16,padding:18,border:"1px solid var(--bn-border)"}}>
            <p style={{fontSize:13,fontWeight:600,marginBottom:10}}>Actions requises</p>
            {["Valider budget supplémentaire Éducation","Auditer BC-2026-005 SAGAM","Signer rapport TOFE mai 2026"].map((a,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 0",borderBottom:"0.5px solid var(--bn-border)"}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:i===0?"#EF4444":"#F59E0B"}}/>
                <span style={{fontSize:12,color:"var(--bn-text)"}}>{a}</span>
              </div>))}
          </div>
        </div>
      </div>
    </div>
  );
}
