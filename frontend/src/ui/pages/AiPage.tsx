
const forecast = [
  {month:"Jan 2026",actual:185,predicted:null},
  {month:"Fév 2026",actual:210,predicted:null},
  {month:"Mar 2026",actual:195,predicted:null},
  {month:"Avr 2026",actual:228,predicted:null},
  {month:"Mai 2026",actual:null,predicted:241},
  {month:"Jun 2026",actual:null,predicted:255},
  {month:"Jul 2026",actual:null,predicted:248},
];
const anomalies = [
  {id:"BC-2026-005",vendor:"SAGAM Sécurité",amount:"850 M FCFA",score:0.87,risk:"Critique"},
  {id:"BC-2025-089",vendor:"Prestataire X",amount:"420 M FCFA",score:0.62,risk:"Élevé"},
  {id:"BC-2026-004",vendor:"GIE GAINDE",amount:"95 M FCFA",score:0.31,risk:"Modéré"},
];
const maxVal=255;
export function AiPage(){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <div><h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Intelligence Artificielle</h1>
      <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Forecasting (régression Ridge) + Détection d'anomalies (Isolation Forest)</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[
          {label:"MAE Forecasting",value:"8,3%",sub:"Erreur absolue moyenne",color:"#1A6FD4",bg:"#EBF4FF"},
          {label:"Prévision Mai 2026",value:"241 M",sub:"FCFA dépenses estimées",color:"#10B981",bg:"#D1FAE5"},
          {label:"Anomalies détectées",value:"3",sub:"dont 1 critique",color:"#EF4444",bg:"#FEE2E2"},
        ].map(m=>(
          <div key={m.label} style={{background:m.bg,borderRadius:12,padding:"14px 16px"}}>
            <p style={{fontSize:11,color:m.color,marginBottom:4}}>{m.label}</p>
            <p style={{fontSize:22,fontWeight:700,color:m.color}}>{m.value}</p>
            <p style={{fontSize:10,color:m.color,opacity:0.7,marginTop:2}}>{m.sub}</p>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div style={{background:"white",borderRadius:16,padding:24,border:"1px solid var(--bn-border)"}}>
          <p style={{fontSize:15,fontWeight:600,marginBottom:16}}>Forecasting dépenses mensuelles</p>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {forecast.map(f=>{
              const val=f.actual||f.predicted||0;
              const isPred=f.predicted!==null;
              return(
              <div key={f.month} style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:11,color:"var(--bn-muted)",width:70,flexShrink:0}}>{f.month}</span>
                <div style={{flex:1,height:20,background:"#F1F5F9",borderRadius:6,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${val/maxVal*100}%`,background:isPred?"linear-gradient(90deg,#7C3AED,#A78BFA)":"linear-gradient(90deg,#1A6FD4,#0E9E8A)",borderRadius:6,display:"flex",alignItems:"center",paddingLeft:6}}>
                  </div>
                </div>
                <span style={{fontSize:11,fontWeight:600,width:50,textAlign:"right",color:isPred?"#7C3AED":"#1A6FD4"}}>{val} M{isPred?" *":""}</span>
              </div>);
            })}
            <p style={{fontSize:10,color:"var(--bn-muted)",marginTop:4}}>* Prévision modèle Ridge — Données DGID</p>
          </div>
        </div>
        <div style={{background:"white",borderRadius:16,padding:24,border:"1px solid var(--bn-border)"}}>
          <p style={{fontSize:15,fontWeight:600,marginBottom:16}}>Anomalies détectées — Isolation Forest</p>
          {anomalies.map(a=>{
            const rc=a.risk==="Critique"?"#EF4444":a.risk==="Élevé"?"#F59E0B":"#10B981";
            const rb=a.risk==="Critique"?"#FEE2E2":a.risk==="Élevé"?"#FEF3C7":"#D1FAE5";
            return(
            <div key={a.id} style={{padding:"14px",borderRadius:12,border:`1px solid ${rc}44`,background:rb,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <p style={{fontSize:12,fontWeight:600,color:"var(--bn-text)"}}>{a.id} — {a.vendor}</p>
                  <p style={{fontSize:11,color:"var(--bn-muted)",marginTop:2}}>{a.amount} · Score: {a.score}</p>
                </div>
                <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:99,background:rb,color:rc,border:`1px solid ${rc}`}}>{a.risk}</span>
              </div>
            </div>);
          })}
        </div>
      </div>
    </div>
  );
}
