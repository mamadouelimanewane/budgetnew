
import { useState } from "react";
const vendors=[
  {id:1,name:"SENELEC",ninea:"001001234-2026-A-1",type:"Énergie",score:92,status:"Vérifié",montant:45,retard:0},
  {id:2,name:"SONES",ninea:"001005678-2026-A-1",type:"Eau",score:88,status:"Vérifié",montant:28.5,retard:0},
  {id:3,name:"SONATEL",ninea:"001009012-2026-B-2",type:"Télécom",score:85,status:"Vérifié",montant:12.7,retard:5},
  {id:4,name:"GIE GAINDE 2000",ninea:"001003456-2024-A-1",type:"IT",score:71,status:"Vérifié",montant:95,retard:12},
  {id:5,name:"SAGAM Sécurité",ninea:"001007890-2025-B-1",type:"Sécurité",score:23,status:"⚠ Anomalie",montant:850,retard:0},
  {id:6,name:"Bureau Veritas",ninea:"001002345-2026-A-1",type:"Audit",score:94,status:"Vérifié",montant:22,retard:0},
];
export function PortailPage(){
  const [sel,setSel]=useState<typeof vendors[0]|null>(null);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Portail Fournisseurs</h1>
        <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Scoring risque · Validation NINEA · Historique paiements</p></div>
        <button style={{padding:"9px 16px",borderRadius:10,background:"linear-gradient(135deg,#1A6FD4,#0284C7)",color:"white",border:"none",cursor:"pointer",fontSize:13,fontWeight:600}}>+ Nouveau fournisseur</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[{l:"Vérifiés",v:vendors.filter(v=>v.status==="Vérifié").length,c:"#10B981",b:"#D1FAE5"},{l:"Score moyen",v:Math.round(vendors.reduce((s,v)=>s+v.score,0)/vendors.length),c:"#1A6FD4",b:"#EBF4FF"},{l:"Anomalies",v:vendors.filter(v=>v.status.includes("Anomalie")).length,c:"#EF4444",b:"#FEE2E2"},{l:"Retards",v:vendors.filter(v=>v.retard>0).length,c:"#F59E0B",b:"#FEF3C7"}].map(m=>(
          <div key={m.l} style={{background:m.b,borderRadius:12,padding:"12px 16px"}}><p style={{fontSize:11,color:m.c,marginBottom:4}}>{m.l}</p><p style={{fontSize:22,fontWeight:700,color:m.c}}>{m.v}</p></div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div style={{background:"white",borderRadius:16,padding:20,border:"1px solid var(--bn-border)"}}>
          <p style={{fontSize:14,fontWeight:600,marginBottom:12}}>Répertoire ({vendors.length})</p>
          {vendors.map(v=>{const sc=v.score>=80?"#10B981":v.score>=50?"#F59E0B":"#EF4444";const sb=v.score>=80?"#D1FAE5":v.score>=50?"#FEF3C7":"#FEE2E2";return(
            <div key={v.id} onClick={()=>setSel(sel?.id===v.id?null:v)} style={{display:"flex",gap:10,padding:"10px",borderRadius:10,cursor:"pointer",border:"1px solid",borderColor:sel?.id===v.id?"#1A6FD4":"transparent",background:sel?.id===v.id?"#EBF4FF":"transparent",marginBottom:4}}>
              <div style={{width:38,height:38,borderRadius:8,background:sb,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:sc,flexShrink:0}}>{v.score}</div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:12,fontWeight:600}}>{v.name}</p>
                <p style={{fontSize:10,color:"var(--bn-muted)"}}>{v.ninea} · {v.type}</p>
              </div>
              <span style={{fontSize:9,fontWeight:600,padding:"2px 7px",borderRadius:99,background:v.status.includes("Anomalie")?"#FEE2E2":"#D1FAE5",color:v.status.includes("Anomalie")?"#991B1B":"#065F46",flexShrink:0,alignSelf:"center"}}>
                {v.status.includes("Anomalie")?"⚠ Anomalie":"✓ Vérifié"}
              </span>
            </div>);})}
        </div>
        <div>
          {sel?(
            <div style={{background:"white",borderRadius:16,padding:20,border:"1px solid var(--bn-border)"}}>
              <p style={{fontSize:15,fontWeight:600,marginBottom:14}}>{sel.name}</p>
              {[{l:"NINEA",v:sel.ninea},{l:"Secteur",v:sel.type},{l:"Montant total",v:sel.montant+" M FCFA"},{l:"Retard paiement",v:sel.retard>0?sel.retard+"j":"Aucun"},{l:"Statut",v:sel.status}].map(r=>(
                <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"0.5px solid var(--bn-border)",fontSize:13}}>
                  <span style={{color:"var(--bn-muted)"}}>{r.l}</span><span style={{fontWeight:500}}>{r.v}</span>
                </div>))}
              <div style={{marginTop:12}}>
                <p style={{fontSize:11,fontWeight:600,color:"var(--bn-muted)",marginBottom:6}}>Score de risque</p>
                <div style={{height:8,background:"#F1F5F9",borderRadius:99}}><div style={{height:8,borderRadius:99,width:`${sel.score}%`,background:sel.score>=80?"#10B981":sel.score>=50?"#F59E0B":"#EF4444"}}/></div>
              </div>
            </div>
          ):(
            <div style={{background:"var(--bn-bg)",borderRadius:16,padding:40,border:"1px dashed var(--bn-border)",textAlign:"center"}}>
              <p style={{fontSize:13,color:"var(--bn-muted)"}}>Sélectionnez un fournisseur</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
