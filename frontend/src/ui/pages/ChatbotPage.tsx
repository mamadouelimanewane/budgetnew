import { useState, useRef, useEffect } from "react";
type Msg = { role: "user" | "bot"; text: string; time: string };
const SUGG = ["Solde de la DGID","Anomalies detectees","Prevision mai 2026","Marches en cours","Budget global 2026"];
function now() { return new Date().toLocaleTimeString("fr-SN",{hour:"2-digit",minute:"2-digit"}); }
function bot(q: string): string {
  const l = q.toLowerCase();
  if(l.includes("dgid")) return "DGID : 748 M consommes sur 1 200 M alloues (62,3%). Disponible : 452 M FCFA. Aucune anomalie.";
  if(l.includes("dgcpt")) return "Alerte : DGCPT a 94% (921/980 M FCFA). Risque depassement avant juin. Action requise.";
  if(l.includes("dage")) return "Critique : DAGE a 99,5% (418/420 M FCFA). Quasi epuisee — nouveaux engagements bloques.";
  if(l.includes("anomal") || l.includes("fraud")) return "3 anomalies detectees par IA :
1. SAGAM 850M — score 0,87 (Critique)
2. Prestataire X 420M — score 0,62 (Eleve)
3. GIE GAINDE 95M — score 0,31 (Modere)";
  if(l.includes("prev") || l.includes("mai")) return "Prevision mai 2026 : 241 M FCFA (+5,7% vs avril). Recommandation : provisionner 260 M FCFA.";
  if(l.includes("march") || l.includes("dcmp")) return "12 marches actifs : 5 AO ouverts, 4 DRM, 3 ententes directes. Total estime : 2,1 Mds FCFA.";
  if(l.includes("budget") || l.includes("solde")) return "Budget 2026 : 4 500 M alloues. Consomme : 2 577 M (57,3%). Disponible : 1 923 M FCFA.";
  if(l.includes("bonjour") || l.includes("salut") || l.includes("nanga")) return "Bonjour ! Assistant budgetaire BudgetNew. Questions sur : soldes, anomalies, previsions, marches DCMP.";
  return "Essayez : Solde DGID, Anomalies, Prevision mai, Budget global, Marches DCMP.";
}
export function ChatbotPage() {
  const [msgs,setMsgs] = useState<Msg[]>([{role:"bot",text:"Bonjour ! Posez une question sur le budget.",time:now()}]);
  const [input,setInput] = useState("");
  const [typing,setTyping] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"});},[msgs,typing]);
  function send(t?: string) {
    const q = t || input.trim(); if(!q) return;
    setInput(""); setMsgs(m=>[...m,{role:"user",text:q,time:now()}]); setTyping(true);
    setTimeout(()=>{setTyping(false);setMsgs(m=>[...m,{role:"bot",text:bot(q),time:now()}]);},800);
  }
  const bubble = (m: Msg, i: number) => (
    <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",gap:8,alignItems:"flex-end"}}>
      {m.role==="bot"&&<div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#1A6FD4,#0E9E8A)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,fontWeight:700,flexShrink:0}}>B</div>}
      <div style={{maxWidth:"75%"}}>
        <div style={{padding:"10px 14px",borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:m.role==="user"?"linear-gradient(135deg,#1A6FD4,#0284C7)":"var(--bn-bg)",border:m.role==="bot"?"1px solid var(--bn-border)":"none",color:m.role==="user"?"white":"var(--bn-text)",fontSize:13,lineHeight:1.5,whiteSpace:"pre-line"}}>{m.text}</div>
        <p style={{fontSize:10,color:"var(--bn-muted)",marginTop:2,textAlign:m.role==="user"?"right":"left"}}>{m.time}</p>
      </div>
      {m.role==="user"&&<div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#7C3AED,#6D28D9)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:11,fontWeight:700,flexShrink:0}}>AD</div>}
    </div>
  );
  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Assistant IA Budgetaire</h1>
        <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Questions en francais ou wolof</p></div>
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:99,background:"#D1FAE5",border:"1px solid #A7F3D0"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#10B981"}}/>
          <span style={{fontSize:11,fontWeight:600,color:"#065F46"}}>IA Active</span>
        </div>
      </div>
      <div style={{background:"white",borderRadius:16,border:"1px solid var(--bn-border)",display:"flex",flexDirection:"column"}}>
        <div style={{overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:10,maxHeight:360,minHeight:280}}>
          {msgs.map(bubble)}
          {typing&&<div style={{display:"flex",gap:8}}><div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#1A6FD4,#0E9E8A)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,fontWeight:700}}>B</div><div style={{padding:"10px 14px",borderRadius:"16px 16px 16px 4px",background:"var(--bn-bg)",border:"1px solid var(--bn-border)"}}><div style={{display:"flex",gap:3}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#94A3B8",animation:"b 1s infinite",animationDelay:`${i*0.2}s`}}/>)}</div></div></div>}
          <div ref={ref}/>
        </div>
        <div style={{padding:"10px 14px",borderTop:"1px solid var(--bn-border)"}}>
          <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap"}}>
            {SUGG.map(s=><button key={s} onClick={()=>send(s)} style={{fontSize:10,padding:"3px 9px",borderRadius:99,border:"1px solid var(--bn-border)",background:"transparent",cursor:"pointer",color:"var(--bn-muted)"}}>{s}</button>)}
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
