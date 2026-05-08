import { useState, useRef, useEffect } from "react";
type Msg = { role: "user" | "assistant"; content: string; time: string };
function now() { return new Date().toLocaleTimeString("fr-SN",{hour:"2-digit",minute:"2-digit"}); }
const SYS = "Tu es le copilote budgetaire de BudgetNew, expert en finances publiques senegalaises et normes UEMOA. Budget 2026: DGID 62% / DGCPT 94% alerte / DAGE 99.5% critique / DPEE 47% / Primature 51%. Anomalies: SAGAM 850M score 0.87. Marches: 12 actifs. Reponds en francais, sois concis et actionnable.";
export function CopilotePage() {
  const [msgs,setMsgs] = useState<Msg[]>([{role:"assistant",content:"Bonjour ! Je suis votre copilote budgetaire IA. Contexte 2026 charge. Posez votre question.",time:now()}]);
  const [input,setInput] = useState("");
  const [loading,setLoading] = useState(false);
  const [err,setErr] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"});},[msgs,loading]);
  async function send(text?: string) {
    const q = text||input.trim(); if(!q||loading) return;
    setInput(""); setErr("");
    const next: Msg[] = [...msgs,{role:"user",content:q,time:now()}];
    setMsgs(next); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:SYS, messages:next.map(m=>({role:m.role,content:m.content})) })
      });
      const d = await res.json();
      setMsgs(m=>[...m,{role:"assistant",content:d.content?.[0]?.text||"Erreur de reponse.",time:now()}]);
    } catch(e) { setErr("Erreur API."); }
    finally { setLoading(false); }
  }
  const SUGG = ["Analyse risque depassement DGCPT","Memo situation DAGE","Transferts credits possibles ?","Resume anomalies IA","Plan arbitrage budgetaire Q3"];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Copilote IA Budgetaire</h1>
        <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Claude Sonnet - Contexte budgetaire 2026 integre</p></div>
        <div style={{padding:"5px 14px",borderRadius:99,background:"linear-gradient(135deg,#1A6FD4,#7C3AED)",color:"white"}}>
          <span style={{fontSize:11,fontWeight:600}}>Claude Sonnet 4</span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {[{l:"Contexte charge",v:"Budget 2026",c:"#10B981",bg:"#D1FAE5"},{l:"Alertes actives",v:"2 critiques",c:"#EF4444",bg:"#FEE2E2"},{l:"Modele IA",v:"Claude Sonnet",c:"#7C3AED",bg:"#EDE9FE"}].map(m=>(
          <div key={m.l} style={{background:m.bg,borderRadius:10,padding:"10px 14px"}}>
            <p style={{fontSize:10,color:m.c,marginBottom:3}}>{m.l}</p>
            <p style={{fontSize:14,fontWeight:600,color:m.c}}>{m.v}</p>
          </div>
        ))}
      </div>
      <div style={{background:"white",borderRadius:16,border:"1px solid var(--bn-border)",display:"flex",flexDirection:"column"}}>
        <div style={{overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:12,maxHeight:380,minHeight:280}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",flexDirection:m.role==="user"?"row-reverse":"row"}}>
              <div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"white",background:m.role==="user"?"linear-gradient(135deg,#7C3AED,#6D28D9)":"linear-gradient(135deg,#1A6FD4,#0E9E8A)"}}>
                {m.role==="user"?"AD":"AI"}
              </div>
              <div style={{maxWidth:"78%"}}>
                <div style={{padding:"10px 14px",borderRadius:m.role==="user"?"16px 4px 16px 16px":"4px 16px 16px 16px",background:m.role==="user"?"linear-gradient(135deg,#1A6FD4,#0284C7)":"var(--bn-bg)",border:m.role==="assistant"?"1px solid var(--bn-border)":"none",color:m.role==="user"?"white":"var(--bn-text)",fontSize:13,lineHeight:1.6,whiteSpace:"pre-wrap"}}>
                  {m.content}
                </div>
                <p style={{fontSize:10,color:"var(--bn-muted)",marginTop:2,textAlign:m.role==="user"?"right":"left"}}>{m.time}</p>
              </div>
            </div>
          ))}
          {loading&&<div style={{display:"flex",gap:10}}><div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#1A6FD4,#0E9E8A)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:11,fontWeight:700}}>AI</div><div style={{padding:"10px 14px",borderRadius:"4px 16px 16px 16px",background:"var(--bn-bg)",border:"1px solid var(--bn-border)",fontSize:13,color:"var(--bn-muted)"}}>Analyse en cours...</div></div>}
          {err&&<p style={{color:"#EF4444",fontSize:12,padding:"8px 12px",background:"#FEE2E2",borderRadius:8}}>{err}</p>}
          <div ref={ref}/>
        </div>
        <div style={{padding:"10px 14px",borderTop:"1px solid var(--bn-border)"}}>
          <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap"}}>
            {SUGG.map(s=><button key={s} onClick={()=>send(s)} style={{fontSize:10,padding:"3px 9px",borderRadius:99,border:"1px solid var(--bn-border)",background:"transparent",cursor:"pointer",color:"var(--bn-muted)"}}>{s}</button>)}
          </div>
          <div style={{display:"flex",gap:8}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Posez votre question au copilote IA..." style={{flex:1,padding:"9px 12px",borderRadius:8,border:"1px solid var(--bn-border)",fontSize:13,color:"var(--bn-text)",background:"var(--bn-bg)"}}/>
            <button onClick={()=>send()} disabled={loading} style={{padding:"9px 20px",borderRadius:8,background:loading?"#94A3B8":"linear-gradient(135deg,#1A6FD4,#7C3AED)",color:"white",border:"none",cursor:loading?"not-allowed":"pointer",fontSize:13,fontWeight:600}}>{loading?"...":"Envoyer"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
