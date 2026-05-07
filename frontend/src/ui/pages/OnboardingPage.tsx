
import { useState } from "react";
const MODS=[
  {id:1,title:"Prise en main",desc:"Interface, navigation, premiers paramètres.",dur:"15 min",level:"Débutant",prog:100,color:"#10B981",bg:"#D1FAE5"},
  {id:2,title:"Budget UEMOA",desc:"Nomenclature Ch/Art/Par et allocations.",dur:"30 min",level:"Intermédiaire",prog:80,color:"#1A6FD4",bg:"#EBF4FF"},
  {id:3,title:"Marchés DCMP",desc:"Procédures, seuils, appels d'offres.",dur:"45 min",level:"Intermédiaire",prog:40,color:"#7C3AED",bg:"#EDE9FE"},
  {id:4,title:"IA & Prévisions",desc:"Forecasting, anomalies, chatbot.",dur:"20 min",level:"Avancé",prog:0,color:"#0E9E8A",bg:"#E6F8F6"},
  {id:5,title:"Reporting & TOFE",desc:"Rapports réglementaires BCEAO.",dur:"25 min",level:"Avancé",prog:0,color:"#F59E0B",bg:"#FEF3C7"},
];
const CERTIFS=[
  {title:"Gestionnaire certifié",modules:"1+2",obtained:true,date:"2026-04-15"},
  {title:"Expert DCMP",modules:"1+2+3",obtained:false,date:null},
  {title:"Analyste IA",modules:"1+2+4+5",obtained:false,date:null},
];
export function OnboardingPage(){
  const [active,setActive]=useState<number|null>(null);
  const total=Math.round(MODS.reduce((s,m)=>s+m.prog,0)/MODS.length);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Formation & Certification</h1>
        <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Modules certifiants en français et wolof</p></div>
        <div style={{background:"linear-gradient(135deg,#0D2B4B,#1A3352)",borderRadius:10,padding:"8px 18px",textAlign:"center"}}>
          <p style={{fontSize:10,color:"rgba(255,255,255,0.6)"}}>Progression</p>
          <p style={{fontSize:20,fontWeight:700,color:"white"}}>{total}%</p>
        </div>
      </div>
      <div style={{background:"white",borderRadius:14,padding:"14px 18px",border:"1px solid var(--bn-border)"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <p style={{fontSize:13,fontWeight:600}}>Votre parcours</p>
          <span style={{fontSize:11,color:"var(--bn-muted)"}}>{MODS.filter(m=>m.prog===100).length}/{MODS.length} complétés</span>
        </div>
        <div style={{height:10,background:"#F1F5F9",borderRadius:99,overflow:"hidden"}}>
          <div style={{height:10,borderRadius:99,width:`${total}%`,background:"linear-gradient(90deg,#1A6FD4,#0E9E8A)"}}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {MODS.map(m=>(
          <div key={m.id} onClick={()=>setActive(active===m.id?null:m.id)} style={{background:"white",borderRadius:14,padding:18,border:"1px solid",borderColor:active===m.id?m.color:"var(--bn-border)",cursor:"pointer"}}>
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
              <div style={{width:32,height:32,borderRadius:8,background:m.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:m.color}}>{m.id}</div>
              <div style={{flex:1}}>
                <p style={{fontSize:13,fontWeight:600,color:"var(--bn-text)"}}>{m.title}</p>
                <div style={{display:"flex",gap:6,marginTop:2}}>
                  <span style={{fontSize:9,fontWeight:600,padding:"1px 6px",borderRadius:99,background:m.bg,color:m.color}}>{m.level}</span>
                  <span style={{fontSize:10,color:"var(--bn-muted)"}}>{m.dur}</span>
                </div>
              </div>
              <span style={{fontSize:13,fontWeight:700,color:m.prog===100?"#10B981":m.color}}>{m.prog}%</span>
            </div>
            <p style={{fontSize:12,color:"var(--bn-muted)",marginBottom:8}}>{m.desc}</p>
            <div style={{height:5,background:"#F1F5F9",borderRadius:99,overflow:"hidden"}}>
              <div style={{height:5,borderRadius:99,width:`${m.prog}%`,background:m.prog===100?"#10B981":m.color}}/>
            </div>
            {active===m.id&&<button style={{marginTop:10,width:"100%",padding:"7px",borderRadius:7,background:`linear-gradient(135deg,${m.color},${m.color}dd)`,color:"white",border:"none",cursor:"pointer",fontSize:12,fontWeight:600}}>
              {m.prog===100?"Revoir":m.prog>0?"Continuer":"Commencer"}
            </button>}
          </div>
        ))}
      </div>
      <div style={{background:"white",borderRadius:14,padding:20,border:"1px solid var(--bn-border)"}}>
        <p style={{fontSize:14,fontWeight:600,marginBottom:14}}>Certifications</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {CERTIFS.map((c,i)=>(
            <div key={i} style={{borderRadius:12,padding:14,border:"1px solid",borderColor:c.obtained?"#10B981":"var(--bn-border)",background:c.obtained?"linear-gradient(135deg,#065F46,#0F6E56)":"white"}}>
              <p style={{fontSize:24,textAlign:"center",marginBottom:8}}>{c.obtained?"🏅":"🔒"}</p>
              <p style={{fontSize:12,fontWeight:600,color:c.obtained?"white":"var(--bn-text)",textAlign:"center"}}>{c.title}</p>
              <p style={{fontSize:10,color:c.obtained?"rgba(255,255,255,0.6)":"var(--bn-muted)",textAlign:"center",marginTop:4}}>
                {c.obtained?"Obtenu le "+c.date:"Modules : "+c.modules}
              </p>
            </div>))}
        </div>
      </div>
    </div>
  );
}
