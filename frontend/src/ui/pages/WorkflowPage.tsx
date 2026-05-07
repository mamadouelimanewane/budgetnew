
import { useState } from "react";
const WFS=[
  {id:1,name:"Engagement standard",trigger:"BC < 50 M FCFA",steps:[
    {o:1,role:"Ordonnateur",action:"Créer l'engagement",status:"Complété",user:"ordo@budgetnew.sn"},
    {o:2,role:"Contrôleur financier",action:"Viser la disponibilité",status:"Complété",user:"ctrl@budgetnew.sn"},
    {o:3,role:"Comptable",action:"Liquider le paiement",status:"En attente",user:"—"},
  ]},
  {id:2,name:"Marché public >50M",trigger:"AO ≥ 50 M FCFA",steps:[
    {o:1,role:"Ordonnateur",action:"Créer l'appel d'offres",status:"Complété",user:"ordo@budgetnew.sn"},
    {o:2,role:"Commission DCMP",action:"Évaluer les offres",status:"Complété",user:"dcmp@gouv.sn"},
    {o:3,role:"Contrôleur d'État",action:"Viser le marché",status:"En cours",user:"ctrl@budgetnew.sn"},
    {o:4,role:"Ministre",action:"Approuver",status:"En attente",user:"—"},
    {o:5,role:"Comptable",action:"Premier paiement",status:"En attente",user:"—"},
  ]},
  {id:3,name:"Virement inter-direction",trigger:"Transfert de crédits",steps:[
    {o:1,role:"Analyste",action:"Soumettre la demande",status:"Complété",user:"analyste@budgetnew.sn"},
    {o:2,role:"Ordonnateur cédant",action:"Approuver",status:"En attente",user:"—"},
    {o:3,role:"Administrateur",action:"Mettre à jour les enveloppes",status:"En attente",user:"—"},
  ]},
];
const SS:Record<string,{bg:string,color:string,dot:string}>={
  "Complété":{bg:"#D1FAE5",color:"#065F46",dot:"#10B981"},
  "En cours":{bg:"#FEF3C7",color:"#92400E",dot:"#F59E0B"},
  "En attente":{bg:"#F1F5F9",color:"#94A3B8",dot:"#CBD5E1"}};
export function WorkflowPage(){
  const [sel,setSel]=useState(WFS[0]);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div><h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Workflows de validation</h1>
      <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Circuits d'approbation — de l'engagement à la liquidation</p></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:20}}>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {WFS.map(w=>(
            <div key={w.id} onClick={()=>setSel(w)} style={{background:"white",borderRadius:12,padding:"14px",cursor:"pointer",border:"1px solid",borderColor:sel.id===w.id?"#1A6FD4":"var(--bn-border)",background:sel.id===w.id?"#EBF4FF":"white"}}>
              <p style={{fontSize:13,fontWeight:600,color:"var(--bn-text)"}}>{w.name}</p>
              <p style={{fontSize:11,color:"var(--bn-muted)",marginTop:2}}>{w.trigger}</p>
              <div style={{display:"flex",gap:4,marginTop:8}}>
                {w.steps.map(s=><div key={s.o} style={{width:9,height:9,borderRadius:"50%",background:SS[s.status].dot}} title={s.status}/>)}
                <span style={{fontSize:10,color:"var(--bn-muted)",marginLeft:3}}>{w.steps.length} étapes</span>
              </div>
            </div>))}
        </div>
        <div style={{background:"white",borderRadius:16,padding:24,border:"1px solid var(--bn-border)"}}>
          <p style={{fontSize:15,fontWeight:600,marginBottom:4}}>{sel.name}</p>
          <p style={{fontSize:12,color:"var(--bn-muted)",marginBottom:20}}>Déclencheur : {sel.trigger}</p>
          <div style={{position:"relative",paddingLeft:24}}>
            <div style={{position:"absolute",left:8,top:0,bottom:0,width:2,background:"var(--bn-border)",borderRadius:99}}/>
            {sel.steps.map((step,i)=>{const s=SS[step.status];return(
              <div key={i} style={{position:"relative",marginBottom:16,paddingLeft:14}}>
                <div style={{position:"absolute",left:-16,top:2,width:10,height:10,borderRadius:"50%",background:s.dot,border:"2px solid white",zIndex:1}}/>
                <div style={{background:step.status==="Complété"?"var(--bn-bg)":step.status==="En cours"?"#FFFBEB":"white",borderRadius:10,padding:"10px 14px",border:`1px solid ${step.status==="En cours"?"#FDE68A":"var(--bn-border)"}`,opacity:step.status==="En attente"?0.6:1}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <div>
                      <p style={{fontSize:10,color:s.color,fontWeight:600,marginBottom:3}}>Étape {step.o} · {step.role}</p>
                      <p style={{fontSize:13,fontWeight:500,color:"var(--bn-text)"}}>{step.action}</p>
                    </div>
                    <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,background:s.bg,color:s.color,flexShrink:0,alignSelf:"flex-start"}}>{step.status}</span>
                  </div>
                  {step.user!=="—"&&<p style={{fontSize:11,color:"var(--bn-muted)",marginTop:4}}>👤 {step.user}</p>}
                </div>
              </div>);})}
          </div>
        </div>
      </div>
    </div>
  );
}
