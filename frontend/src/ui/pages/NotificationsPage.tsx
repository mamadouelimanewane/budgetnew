
import { useState } from "react";
const NOTIFS=[
  {id:1,type:"critical",icon:"🔴",title:"DGCPT à 94% — risque dépassement",body:"La DGCPT risque un dépassement avant fin juin. Action requise.",time:"Il y a 2 min",read:false},
  {id:2,type:"warning",icon:"🟡",title:"Anomalie BC-2026-005 détectée",body:"SAGAM 850 M FCFA — score 0,87. Vérification recommandée.",time:"Il y a 15 min",read:false},
  {id:3,type:"info",icon:"🔵",title:"Rapport avril 2026 généré",body:"Disponible en PDF et XLSX dans la section Exports.",time:"Il y a 1h",read:true},
  {id:4,type:"success",icon:"🟢",title:"Paiement BC-002 liquidé",body:"SONES 28,5 M FCFA traité. Solde mis à jour.",time:"Il y a 2h",read:true},
  {id:5,type:"critical",icon:"🔴",title:"DAGE quasi épuisée — 99,5%",body:"Seulement 2 M FCFA restants. Nouveaux engagements bloqués.",time:"Hier",read:true},
  {id:6,type:"info",icon:"🔵",title:"AO-2026-0012 publié",body:"Maintenance informatique 45 M — délai 15 juin.",time:"Hier",read:true},
];
const TS:Record<string,{bg:string,border:string}>={critical:{bg:"#FFF5F5",border:"#FECACA"},warning:{bg:"#FFFBEB",border:"#FDE68A"},info:{bg:"#EFF6FF",border:"#BFDBFE"},success:{bg:"#F0FDF4",border:"#A7F3D0"}};
export function NotificationsPage(){
  const [notifs,setNotifs]=useState(NOTIFS);
  const unread=notifs.filter(n=>!n.read).length;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Notifications & Alertes</h1>
        <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Push · Email · SMS · WhatsApp — {unread} non lue{unread>1?"s":""}</p></div>
        {unread>0&&<button onClick={()=>setNotifs(n=>n.map(x=>({...x,read:true})))} style={{padding:"7px 14px",borderRadius:8,border:"1px solid var(--bn-border)",background:"transparent",cursor:"pointer",fontSize:12,color:"var(--bn-muted)"}}>Tout marquer lu</button>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[{l:"Non lues",v:unread,c:"#EF4444",b:"#FEE2E2"},{l:"Critiques",v:notifs.filter(n=>n.type==="critical").length,c:"#991B1B",b:"#FEE2E2"},{l:"Ce mois",v:notifs.length,c:"#1A6FD4",b:"#EBF4FF"},{l:"Canaux actifs",v:3,c:"#10B981",b:"#D1FAE5"}].map(m=>(
          <div key={m.l} style={{background:m.b,borderRadius:12,padding:"12px 16px"}}><p style={{fontSize:11,color:m.c,marginBottom:4}}>{m.l}</p><p style={{fontSize:22,fontWeight:700,color:m.c}}>{m.v}</p></div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {notifs.map(n=>{const s=TS[n.type];return(
          <div key={n.id} onClick={()=>setNotifs(ns=>ns.map(x=>x.id===n.id?{...x,read:true}:x))} style={{display:"flex",gap:12,padding:"14px 16px",borderRadius:12,border:`1px solid ${n.read?s.border:n.type==="critical"?"#EF4444":"#F59E0B"}`,background:n.read?s.bg:"white",cursor:"pointer",opacity:n.read?0.85:1}}>
            <span style={{fontSize:18,flexShrink:0}}>{n.icon}</span>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <p style={{fontSize:13,fontWeight:n.read?400:600,color:"var(--bn-text)"}}>{n.title}</p>
                <span style={{fontSize:10,color:"var(--bn-muted)",flexShrink:0,marginLeft:10}}>{n.time}</span>
              </div>
              <p style={{fontSize:12,color:"var(--bn-muted)",marginTop:2,lineHeight:1.4}}>{n.body}</p>
            </div>
            {!n.read&&<div style={{width:8,height:8,borderRadius:"50%",background:n.type==="critical"?"#EF4444":"#F59E0B",flexShrink:0,marginTop:4}}/>}
          </div>);})}
      </div>
    </div>
  );
}
