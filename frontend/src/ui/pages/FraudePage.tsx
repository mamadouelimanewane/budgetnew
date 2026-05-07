
import { useState } from "react";
const txs=[
  {id:"BC-2026-005",vendor:"SAGAM Sécurité",amount:850,score:87,risk:"Critique",flags:["Montant >10x médiane","Fournisseur récent <6 mois","NINEA non référencé DGI"],status:"Sous investigation"},
  {id:"BC-2025-089",vendor:"Prestataire X",amount:420,score:62,risk:"Élevé",flags:["Split artificiel probable","Adresse similaire blacklisté"],status:"En révision"},
  {id:"BC-2026-004",vendor:"GIE GAINDE",amount:95,score:31,risk:"Modéré",flags:["Retard livraison 12j","Facture non conforme"],status:"Surveillance"},
  {id:"BC-2026-003",vendor:"SONATEL",amount:12.7,score:8,risk:"Faible",flags:["Délai paiement +5j"],status:"Normal"},
  {id:"BC-2026-001",vendor:"SENELEC",amount:45,score:2,risk:"Faible",flags:[],status:"Approuvé"},
];
const RS:Record<string,{bg:string,color:string,bar:string}>={Critique:{bg:"#FEE2E2",color:"#991B1B",bar:"#EF4444"},Élevé:{bg:"#FEF3C7",color:"#92400E",bar:"#F59E0B"},Modéré:{bg:"#EDE9FE",color:"#4C1D95",bar:"#7C3AED"},Faible:{bg:"#D1FAE5",color:"#065F46",bar:"#10B981"}};
export function FraudePage(){
  const [sel,setSel]=useState(txs[0]);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <div><h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Détection de fraude & Scoring risque</h1>
      <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Isolation Forest + règles métier UEMOA</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[{l:"Analysées",v:5,c:"#1A6FD4",b:"#EBF4FF"},{l:"Critiques",v:1,c:"#EF4444",b:"#FEE2E2"},{l:"Investigation",v:2,c:"#F59E0B",b:"#FEF3C7"},{l:"Montant à risque",v:"1 270 M",c:"#7C3AED",b:"#EDE9FE"}].map(m=>(
          <div key={m.l} style={{background:m.b,borderRadius:12,padding:"12px 16px"}}><p style={{fontSize:11,color:m.c,marginBottom:4}}>{m.l}</p><p style={{fontSize:22,fontWeight:700,color:m.c}}>{m.v}</p></div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:20}}>
        <div style={{background:"white",borderRadius:16,padding:20,border:"1px solid var(--bn-border)"}}>
          <p style={{fontSize:14,fontWeight:600,marginBottom:14}}>Transactions scorées</p>
          {txs.map(t=>{const rs=RS[t.risk];const isSel=sel.id===t.id;return(
            <div key={t.id} onClick={()=>setSel(t)} style={{display:"flex",gap:12,padding:"11px",borderRadius:10,cursor:"pointer",border:"1px solid",borderColor:isSel?"#1A6FD4":"transparent",background:isSel?"#EBF4FF":"transparent",marginBottom:5}}>
              <div style={{width:48,height:48,borderRadius:10,background:rs.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <p style={{fontSize:15,fontWeight:700,color:rs.color,lineHeight:1}}>{t.score}</p>
                <p style={{fontSize:8,color:rs.color,fontWeight:600}}>SCORE</p>
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <p style={{fontSize:12,fontWeight:600}}>{t.id}</p>
                  <span style={{fontSize:10,fontWeight:600,padding:"1px 7px",borderRadius:99,background:rs.bg,color:rs.color}}>{t.risk}</span>
                </div>
                <p style={{fontSize:11,color:"var(--bn-muted)"}}>{t.vendor} · {t.amount} M FCFA</p>
                <div style={{height:4,background:"#F1F5F9",borderRadius:99,marginTop:5}}><div style={{height:4,borderRadius:99,width:`${t.score}%`,background:rs.bar}}/></div>
              </div>
            </div>);})}
        </div>
        <div style={{background:"white",borderRadius:16,padding:20,border:"1px solid var(--bn-border)"}}>
          <p style={{fontSize:14,fontWeight:600,marginBottom:14}}>Analyse — {sel.id}</p>
          {[{l:"Fournisseur",v:sel.vendor},{l:"Montant",v:sel.amount+" M FCFA"},{l:"Score",v:`${sel.score}/100`},{l:"Statut",v:sel.status}].map(r=>(
            <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"0.5px solid var(--bn-border)",fontSize:13}}>
              <span style={{color:"var(--bn-muted)"}}>{r.l}</span><span style={{fontWeight:500}}>{r.v}</span>
            </div>))}
          {sel.flags.length>0&&(<div style={{marginTop:14}}>
            <p style={{fontSize:11,fontWeight:600,color:"var(--bn-muted)",marginBottom:8}}>Signaux ({sel.flags.length})</p>
            {sel.flags.map((f,i)=>(
              <div key={i} style={{display:"flex",gap:8,padding:"7px 10px",borderRadius:8,background:"#FEF3C7",marginBottom:5}}>
                <span style={{color:"#F59E0B",fontWeight:700}}>⚠</span>
                <span style={{fontSize:12,color:"#92400E"}}>{f}</span>
              </div>))}
          </div>)}
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <button style={{flex:1,padding:"8px",borderRadius:8,background:"#FEE2E2",border:"1px solid #FECACA",color:"#991B1B",cursor:"pointer",fontSize:12,fontWeight:600}}>Bloquer</button>
            <button style={{flex:1,padding:"8px",borderRadius:8,background:"#D1FAE5",border:"1px solid #A7F3D0",color:"#065F46",cursor:"pointer",fontSize:12,fontWeight:600}}>Approuver</button>
          </div>
        </div>
      </div>
    </div>
  );
}
