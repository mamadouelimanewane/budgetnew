
import { useState, useRef, useEffect } from "react";
type Msg = { role:"user"|"bot"; text:string; time:string };
const SUGGESTIONS = ["Quel est le solde de la DGID ?","Y a-t-il des anomalies ?","Prévision mai 2026 ?","Marchés en cours ?","Budget disponible global"];
function now(){return new Date().toLocaleTimeString("fr-SN",{hour:"2-digit",minute:"2-digit"});}
function respond(q:string):string{
  const l=q.toLowerCase();
  if(l.includes("dgid"))return "La DGID a consommé 748 M / 1 200 M FCFA (62,3%). Solde disponible : 452 M FCFA. Aucune anomalie.";
  if(l.includes("dgcpt"))return "⚠️ DGCPT à 94,0% (921 M / 980 M). Risque de dépassement avant fin juin. Action recommandée.";
  if(l.includes("dage"))return "🔴 DAGE critique : 99,5% (418 M / 420 M). Quasi épuisée. Tout nouvel engagement sera bloqué.";
  if(l.includes("anomalie")||l.includes("fraude"))return "3 anomalies détectées :
• BC-2026-005 SAGAM — score 0,87 (Critique)
• BC-2025-089 Prestataire X — score 0,62 (Élevé)
• BC-2026-004 GIE GAINDE — score 0,31 (Modéré)";
  if(l.includes("prévi")||l.includes("prevision")||l.includes("mai"))return "Prévision mai 2026 : 241 M FCFA (+5,7% vs avril). Recommandation : provisionner 260 M pour sécuriser la trésorerie.";
  if(l.includes("marché")||l.includes("dcmp"))return "12 marchés en cours : 5 AO ouverts, 4 DRM, 3 ententes directes. Montant total : 2,1 Mds FCFA.";
  if(l.includes("budget")||l.includes("solde")||l.includes("global"))return "Budget 2026 : 4 500 M alloués. Consommé : 2 577 M (57,3%). Disponible : 1 923 M FCFA.

Directions sous tension : DAGE (99,5%) · DGCPT (94%)
Directions avec marge : DPEE (47,7%) · Primature (51,4%)";
  if(l.includes("bonjour")||l.includes("salut")||l.includes("nanga"))return "Bonjour ! Je suis votre assistant budgétaire BudgetNew 🤖

Je peux vous aider sur :
• Soldes & taux d'exécution
• Anomalies détectées par l'IA
• Prévisions de dépenses
• Marchés publics DCMP
• Génération de rapports";
  if(l.includes("wolof")||l.includes("wax"))return "Waaw ! BudgetNew dafa xam wolof. Jox ma sa laaj ci khalass bi — mu ne am ci baat bu cees !";
  return `Je cherche une réponse à "${q.slice(0,40)}...". Essayez : "Solde DGID", "Anomalies", "Prévision mai", "Marchés DCMP"`;
}
export function ChatbotPage(){
  const [msgs,setMsgs]=useState<Msg[]>([{role:"bot",text:"Bonjour ! Je suis votre assistant budgétaire. Posez-moi une question en français ou wolof.",time:now()}]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const endRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,typing]);
  function send(text?:string){
    const q=text||input.trim();if(!q)return;
    setInput("");setMsgs(m=>[...m,{role:"user",text:q,time:now()}]);setTyping(true);
    setTimeout(()=>{setTyping(false);setMsgs(m=>[...m,{role:"bot",text:respond(q),time:now()}]);},700+Math.random()*500);
  }
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Assistant IA Budgétaire</h1>
        <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Posez vos questions en français ou wolof</p></div>
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:99,background:"#D1FAE5",border:"1px solid #A7F3D0"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#10B981"}}/>
          <span style={{fontSize:11,fontWeight:600,color:"#065F46"}}>IA Active</span>
        </div>
      </div>
      <div style={{background:"white",borderRadius:16,border:"1px solid var(--bn-border)",display:"flex",flexDirection:"column"}}>
        <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:10,maxHeight:380,minHeight:300}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",gap:8,alignItems:"flex-end"}}>
              {m.role==="bot"&&<div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#1A6FD4,#0E9E8A)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,fontWeight:700,flexShrink:0}}>B</div>}
              <div style={{maxWidth:"75%"}}>
                <div style={{padding:"10px 14px",borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:m.role==="user"?"linear-gradient(135deg,#1A6FD4,#0284C7)":"var(--bn-bg)",border:m.role==="bot"?"1px solid var(--bn-border)":"none",color:m.role==="user"?"white":"var(--bn-text)",fontSize:13,lineHeight:1.5,whiteSpace:"pre-line"}}>
                  {m.text}
                </div>
                <p style={{fontSize:10,color:"var(--bn-muted)",marginTop:2,textAlign:m.role==="user"?"right":"left"}}>{m.time}</p>
              </div>
              {m.role==="user"&&<div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#7C3AED,#6D28D9)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:11,fontWeight:700,flexShrink:0}}>AD</div>}
            </div>
          ))}
          {typing&&<div style={{display:"flex",gap:8,alignItems:"flex-end"}}><div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#1A6FD4,#0E9E8A)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,fontWeight:700}}>B</div><div style={{padding:"10px 14px",borderRadius:"16px 16px 16px 4px",background:"var(--bn-bg)",border:"1px solid var(--bn-border)"}}><div style={{display:"flex",gap:3}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#94A3B8",animation:"b 1s infinite",animationDelay:`${i*0.2}s`}}/>)}</div></div></div>}
          <div ref={endRef}/>
        </div>
        <div style={{padding:"10px 14px",borderTop:"1px solid var(--bn-border)"}}>
          <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap"}}>
            {SUGGESTIONS.map(s=><button key={s} onClick={()=>send(s)} style={{fontSize:10,padding:"3px 9px",borderRadius:99,border:"1px solid var(--bn-border)",background:"transparent",cursor:"pointer",color:"var(--bn-muted)"}}>{s}</button>)}
          </div>
          <div style={{display:"flex",gap:8}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Votre question..." style={{flex:1,padding:"9px 12px",borderRadius:8,border:"1px solid var(--bn-border)",fontSize:13,color:"var(--bn-text)",background:"var(--bn-bg)"}}/>
            <button onClick={()=>send()} style={{padding:"9px 18px",borderRadius:8,background:"linear-gradient(135deg,#1A6FD4,#0284C7)",color:"white",border:"none",cursor:"pointer",fontSize:13,fontWeight:600}}>Envoyer</button>
          </div>
        </div>
      </div>
      <style>{"@keyframes b{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}"}</style>
    </div>
  );
}
