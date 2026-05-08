import { useState } from "react";

const INDICATEURS = [
  {id:"IE-001",projet:"PROJ-001",libelle:"Nb menages ayant acces eau potable",type:"Effet",baseline:1200,cible:5000,realise:3847,unite:"Menages",statut:"En cours",tendance:"Bonne"},
  {id:"IE-002",projet:"PROJ-001",libelle:"Taux satisfaction beneficiaires",type:"Impact",baseline:0,cible:85,realise:91,unite:"%",statut:"Atteint",tendance:"Excellente"},
  {id:"IRS-001",projet:"PROJ-002",libelle:"Nb enseignants formes",type:"Realisation",baseline:0,cible:500,realise:387,unite:"Personnes",statut:"En cours",tendance:"Bonne"},
  {id:"IRS-002",projet:"PROJ-002",libelle:"Taux presence eleves classes formees",type:"Resultat",baseline:62,cible:80,realise:76,unite:"%",statut:"En cours",tendance:"Bonne"},
  {id:"IRS-003",projet:"PROJ-003",libelle:"Enfants traites malnutrition aigue",type:"Realisation",baseline:0,cible:2000,realise:2000,unite:"Enfants",statut:"Atteint",tendance:"Excellente"},
  {id:"IRS-004",projet:"PROJ-004",libelle:"Km routes construites ou rehabilitees",type:"Realisation",baseline:0,cible:120,realise:74,unite:"Km",statut:"En cours",tendance:"A surveiller"},
  {id:"IRS-005",projet:"PROJ-004",libelle:"Temps trajet moyen village vers marche",type:"Impact",baseline:180,cible:60,realise:95,unite:"Minutes",statut:"En cours",tendance:"Bonne"},
];

const RAPPORTS = [
  {type:"Rapport trimestriel Q1",projet:"Tous",bailleur:"AFD / USAID / BM",date:"2026-04-15",statut:"Soumis",note:"Valide"},
  {type:"Rapport mi-parcours",projet:"PROJ-001",bailleur:"AFD",date:"2026-03-30",statut:"Soumis",note:"Valide avec observations"},
  {type:"Rapport annuel 2025",projet:"Tous",bailleur:"Multi-bailleurs",date:"2026-02-28",statut:"Approuve",note:"Certifie"},
  {type:"Rapport trimestriel Q2",projet:"Tous",bailleur:"AFD / USAID",date:"2026-07-15",statut:"A soumettre",note:"--"},
  {type:"Evaluation finale",projet:"PROJ-003",bailleur:"UNICEF",date:"2026-06-30",statut:"A planifier",note:"--"},
];

const LECONS = [
  {projet:"PROJ-001",type:"Lecon positive",contenu:"L implication des comites villageois dans la gestion a reduit les pannes de 60%.",source:"Supervision mars 2026"},
  {projet:"PROJ-002",type:"Lecon positive",contenu:"La formation en groupe de 15 max est plus efficace qu en grand groupe.",source:"Evaluation mi-parcours"},
  {projet:"PROJ-004",type:"Lecon a corriger",contenu:"Les specs techniques routes n integrent pas la saison des pluies. Revision requise.",source:"Rapport Q1 2026"},
  {projet:"PROJ-001",type:"Bonne pratique",contenu:"Le partenariat avec les ASC locales reduit les couts de suivi de 30%.",source:"Revue annuelle 2025"},
];

const TREND_COLOR: Record<string,{bg:string,c:string}> = {
  "Excellente":{bg:"#D1FAE5",c:"#065F46"},
  "Bonne":{bg:"#EBF4FF",c:"#1E40AF"},
  "A surveiller":{bg:"#FEF3C7",c:"#92400E"},
  "Critique":{bg:"#FEE2E2",c:"#991B1B"},
};

const PROJETS_NOM: Record<string,string> = {
  "PROJ-001":"Eau potable zones rurales",
  "PROJ-002":"Formation enseignants",
  "PROJ-003":"Nutrition 0-5 ans",
  "PROJ-004":"Routes rurales",
  "PROJ-005":"Renforcement ONG",
};

export function SuiviEvalPage() {
  const [tab, setTab] = useState<"tableau"|"indicateurs"|"rapports"|"lecons">("tableau");
  const [filtreProjet, setFiltreProjet] = useState("Tous");
  const projets = ["Tous","PROJ-001","PROJ-002","PROJ-003","PROJ-004","PROJ-005"];
  const filtered = filtreProjet==="Tous" ? INDICATEURS : INDICATEURS.filter(i=>i.projet===filtreProjet);

  function getTaux(ind: typeof INDICATEURS[0]) {
    const inv = ind.type==="Impact" && ind.baseline > ind.cible;
    const t = inv ? Math.round((ind.baseline-ind.realise)/(ind.baseline-ind.cible)*100) : Math.round(ind.realise/ind.cible*100);
    return Math.min(t, 100);
  }

  const totalAtteints = INDICATEURS.filter(i=>i.statut==="Atteint").length;
  const avgReal = Math.round(INDICATEURS.reduce((s,i)=>s+getTaux(i),0)/INDICATEURS.length);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Suivi et Evaluation (S&E)</h1>
          <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Cadre logique - Indicateurs SMART - Rapports bailleurs - Lecons apprises</p>
        </div>
        <select value={filtreProjet} onChange={e=>setFiltreProjet(e.target.value)} style={{padding:"7px 12px",borderRadius:8,border:"1px solid var(--bn-border)",fontSize:12,color:"var(--bn-text)",background:"var(--bn-bg)",cursor:"pointer"}}>
          {projets.map(p=><option key={p}>{p}</option>)}
        </select>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[
          {l:"Indicateurs suivis",v:INDICATEURS.length,c:"#1A6FD4",bg:"#EBF4FF"},
          {l:"Cibles atteintes",v:totalAtteints,c:"#10B981",bg:"#D1FAE5"},
          {l:"En cours",v:INDICATEURS.length-totalAtteints,c:"#F59E0B",bg:"#FEF3C7"},
          {l:"Taux realisation moyen",v:avgReal+"%",c:"#7C3AED",bg:"#EDE9FE"},
        ].map(m=>(
          <div key={m.l} style={{background:m.bg,borderRadius:10,padding:"12px 14px"}}>
            <p style={{fontSize:10,color:m.c,marginBottom:3}}>{m.l}</p>
            <p style={{fontSize:22,fontWeight:700,color:m.c}}>{m.v}</p>
          </div>
        ))}
      </div>

      <div style={{display:"flex",gap:4}}>
        {(["tableau","indicateurs","rapports","lecons"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 16px",borderRadius:8,border:"0.5px solid var(--bn-border)",background:tab===t?"#10B981":"transparent",color:tab===t?"white":"var(--bn-muted)",cursor:"pointer",fontSize:12,fontWeight:tab===t?500:400}}>
            {t==="tableau"?"Tableau de bord S&E":t==="indicateurs"?"Indicateurs SMART":t==="rapports"?"Rapports bailleurs":"Lecons apprises"}
          </button>
        ))}
      </div>

      {tab==="tableau" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={{background:"white",borderRadius:16,padding:20,border:"1px solid var(--bn-border)"}}>
            <p style={{fontSize:14,fontWeight:600,marginBottom:14}}>Performance par projet</p>
            {Object.keys(PROJETS_NOM).map(proj => {
              const pInd = INDICATEURS.filter(i=>i.projet===proj);
              const moy = pInd.length>0 ? Math.round(pInd.reduce((s,i)=>s+getTaux(i),0)/pInd.length) : 0;
              return (
                <div key={proj} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <div>
                      <span style={{fontSize:11,fontWeight:700,color:"#10B981",marginRight:6}}>{proj}</span>
                      <span style={{fontSize:12,color:"var(--bn-text)"}}>{PROJETS_NOM[proj]}</span>
                    </div>
                    <span style={{fontSize:13,fontWeight:700,color:moy>=90?"#10B981":moy>=70?"#1A6FD4":"#F59E0B"}}>{moy}%</span>
                  </div>
                  <div style={{height:7,background:"#F1F5F9",borderRadius:99}}>
                    <div style={{height:7,width:moy+"%",background:moy>=90?"#10B981":moy>=70?"#1A6FD4":"#F59E0B",borderRadius:99}}/>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:"linear-gradient(135deg,#0D2B4B,#1A3352)",borderRadius:14,padding:18,flex:1}}>
              <p style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.7)",marginBottom:12}}>Cadre Logique MANGO</p>
              {[
                {n:"Intrants",d:"Budget, personnel, materiels",e:"1 117 M FCFA, 45 agents"},
                {n:"Activites",d:"Actions terrain",e:"Forages, formation, construction"},
                {n:"Realisations",d:"Produits directs mesurables",e:"87 forages, 387 enseignants formes"},
                {n:"Resultats",d:"Changements court terme",e:"Taux acces eau +42%"},
                {n:"Impact",d:"Changements long terme",e:"Reduction mortalite infantile"},
              ].map((l,i,arr)=>(
                <div key={l.n} style={{display:"flex",gap:10,marginBottom:i<arr.length-1?8:0}}>
                  <span style={{fontSize:10,fontWeight:700,color:"white",background:"rgba(255,255,255,0.15)",padding:"2px 8px",borderRadius:4,height:"fit-content",flexShrink:0,minWidth:72,textAlign:"center"}}>{l.n}</span>
                  <div style={{borderLeft:"2px solid rgba(255,255,255,0.15)",paddingLeft:10}}>
                    <p style={{fontSize:11,color:"rgba(255,255,255,0.8)"}}>{l.d}</p>
                    <p style={{fontSize:10,color:"rgba(255,255,255,0.5)"}}>{l.e}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"white",borderRadius:14,padding:16,border:"1px solid var(--bn-border)"}}>
              <p style={{fontSize:13,fontWeight:600,marginBottom:10}}>Prochains jalons</p>
              {[
                {date:"15 Jul 2026",action:"Rapport Q2 a soumettre - AFD/USAID",urgent:true},
                {date:"30 Jun 2026",action:"Evaluation finale PROJ-003 - UNICEF",urgent:true},
                {date:"01 Aug 2026",action:"Supervision terrain PROJ-004 - BM",urgent:false},
                {date:"30 Sep 2026",action:"Revision cadre logique PROJ-002",urgent:false},
              ].map((j,i)=>(
                <div key={i} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:"0.5px solid var(--bn-border)",alignItems:"center"}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:j.urgent?"#EF4444":"#F59E0B",flexShrink:0}}/>
                  <span style={{fontSize:11,color:"var(--bn-muted)",minWidth:90}}>{j.date}</span>
                  <span style={{fontSize:12,color:"var(--bn-text)"}}>{j.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="indicateurs" && (
        <div style={{background:"white",borderRadius:16,border:"1px solid var(--bn-border)",overflow:"hidden"}}>
          <div style={{background:"#10B981",padding:"12px 20px"}}>
            <p style={{fontSize:13,fontWeight:700,color:"white"}}>Tableau de bord indicateurs SMART - {filtered.length} indicateurs</p>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:"#F8FAFC"}}>
              {["ID","Indicateur","Type","Baseline","Cible","Realise","Unite","Taux","Tendance","Statut"].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:10,fontWeight:600,color:"var(--bn-muted)",borderBottom:"1px solid var(--bn-border)",textTransform:"uppercase"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((ind,i)=>{
                const taux = getTaux(ind);
                const tc = taux>=90?"#10B981":taux>=70?"#1A6FD4":"#F59E0B";
                const trend = TREND_COLOR[ind.tendance]||{bg:"#F1F5F9",c:"#94A3B8"};
                return(
                  <tr key={i} style={{borderBottom:"0.5px solid #F1F5F9",background:i%2===0?"white":"#FAFBFD"}}>
                    <td style={{padding:"9px 12px",fontSize:11,fontWeight:700,color:"#10B981",fontFamily:"monospace"}}>{ind.id}</td>
                    <td style={{padding:"9px 12px",fontSize:12,fontWeight:500,maxWidth:160}}>{ind.libelle}</td>
                    <td style={{padding:"9px 12px"}}><span style={{fontSize:9,fontWeight:600,padding:"1px 6px",borderRadius:99,background:"#EDE9FE",color:"#4C1D95"}}>{ind.type}</span></td>
                    <td style={{padding:"9px 12px",fontSize:12,color:"var(--bn-muted)"}}>{ind.baseline.toLocaleString("fr-SN")}</td>
                    <td style={{padding:"9px 12px",fontSize:12,fontWeight:600}}>{ind.cible.toLocaleString("fr-SN")}</td>
                    <td style={{padding:"9px 12px",fontSize:13,fontWeight:700,color:tc}}>{ind.realise.toLocaleString("fr-SN")}</td>
                    <td style={{padding:"9px 12px",fontSize:11,color:"var(--bn-muted)"}}>{ind.unite}</td>
                    <td style={{padding:"9px 12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <div style={{width:40,height:5,background:"#F1F5F9",borderRadius:99}}><div style={{height:5,width:taux+"%",background:tc,borderRadius:99}}/></div>
                        <span style={{fontSize:11,fontWeight:700,color:tc}}>{taux}%</span>
                      </div>
                    </td>
                    <td style={{padding:"9px 12px"}}><span style={{fontSize:9,fontWeight:600,padding:"1px 7px",borderRadius:99,background:trend.bg,color:trend.c}}>{ind.tendance}</span></td>
                    <td style={{padding:"9px 12px"}}><span style={{fontSize:9,fontWeight:600,padding:"1px 7px",borderRadius:99,background:ind.statut==="Atteint"?"#D1FAE5":"#FEF3C7",color:ind.statut==="Atteint"?"#065F46":"#92400E"}}>{ind.statut}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab==="rapports" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:"white",borderRadius:16,border:"1px solid var(--bn-border)",overflow:"hidden"}}>
            <div style={{background:"#7C3AED",padding:"12px 20px"}}>
              <p style={{fontSize:13,fontWeight:700,color:"white"}}>Calendrier des rapports aux bailleurs</p>
            </div>
            {RAPPORTS.map((r,i)=>(
              <div key={i} style={{display:"flex",gap:14,padding:"14px 20px",borderBottom:"1px solid var(--bn-border)",alignItems:"center"}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:r.statut==="Approuve"?"#10B981":r.statut==="Soumis"?"#1A6FD4":r.statut==="A soumettre"?"#F59E0B":"#94A3B8",flexShrink:0}}/>
                <div style={{flex:1}}>
                  <p style={{fontSize:13,fontWeight:600}}>{r.type}</p>
                  <p style={{fontSize:11,color:"var(--bn-muted)",marginTop:2}}>Bailleur: {r.bailleur} - {r.projet}</p>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontSize:12,color:"var(--bn-muted)",marginBottom:4}}>{r.date}</p>
                  <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,background:r.statut==="Approuve"?"#D1FAE5":r.statut==="Soumis"?"#EBF4FF":r.statut==="A soumettre"?"#FEF3C7":"#F1F5F9",color:r.statut==="Approuve"?"#065F46":r.statut==="Soumis"?"#1E40AF":r.statut==="A soumettre"?"#92400E":"#94A3B8"}}>{r.statut}</span>
                </div>
                <span style={{fontSize:11,color:"var(--bn-muted)",minWidth:80,textAlign:"right"}}>{r.note}</span>
              </div>
            ))}
          </div>
          <div style={{background:"white",borderRadius:14,padding:18,border:"1px solid var(--bn-border)"}}>
            <p style={{fontSize:14,fontWeight:600,marginBottom:12}}>Regles MANGO - Rapportage aux donateurs</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                "Respecter les dates limites - demander un delai si impossible",
                "Produire des chiffres exacts et verifiables (piste audit)",
                "Ne pas cacher les depassements ou sous-executions budgetaires",
                "Ajouter des notes explicatives pour chaque ecart > 10%",
                "Tenir le bailleur au courant de tout probleme potentiel",
                "Joindre l etat comparatif budget / realise a chaque rapport",
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",gap:8,padding:"8px 10px",borderRadius:8,background:"#EDE9FE",border:"0.5px solid #C4B5FD"}}>
                  <span style={{color:"#7C3AED",fontWeight:700}}>*</span>
                  <span style={{fontSize:11,color:"var(--bn-text)"}}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="lecons" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:"white",borderRadius:14,padding:20,border:"1px solid var(--bn-border)"}}>
            <p style={{fontSize:14,fontWeight:600,marginBottom:14}}>Registre des lecons apprises</p>
            {LECONS.map((l,i)=>(
              <div key={i} style={{padding:"12px 14px",borderRadius:10,border:"1px solid var(--bn-border)",marginBottom:8,background:l.type.includes("positive")||l.type.includes("pratique")?"#F0FDF4":"#FFFBEB"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <div style={{display:"flex",gap:8}}>
                    <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,background:l.type.includes("positive")||l.type.includes("pratique")?"#D1FAE5":"#FEF3C7",color:l.type.includes("positive")||l.type.includes("pratique")?"#065F46":"#92400E"}}>{l.type}</span>
                    <span style={{fontSize:11,fontWeight:600,color:"#10B981"}}>{l.projet}</span>
                  </div>
                  <span style={{fontSize:10,color:"var(--bn-muted)"}}>{l.source}</span>
                </div>
                <p style={{fontSize:13,color:"var(--bn-text)",lineHeight:1.5}}>{l.contenu}</p>
              </div>
            ))}
          </div>
          <div style={{background:"linear-gradient(135deg,#0D2B4B,#1A3352)",borderRadius:14,padding:20}}>
            <p style={{fontSize:14,fontWeight:600,color:"white",marginBottom:12}}>Cycle MANGO : Planifier - Faire - Reviser</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {[
                {phase:"PLANIFIER",items:["Definir indicateurs SMART","Etablir la baseline","Fixer les cibles par periode","Elaborer le plan de collecte"]},
                {phase:"FAIRE",items:["Collecter les donnees terrain","Mettre a jour les indicateurs","Soumettre les rapports bailleurs","Corriger les ecarts detectes"]},
                {phase:"REVISER",items:["Analyser les ecarts budget/reel","Documenter les lecons apprises","Reviser le cadre logique","Alimenter la prochaine planification"]},
              ].map(p=>(
                <div key={p.phase} style={{background:"rgba(255,255,255,0.08)",borderRadius:10,padding:14}}>
                  <p style={{fontSize:12,fontWeight:700,color:"white",marginBottom:8}}>{p.phase}</p>
                  {p.items.map((item,i)=>(
                    <p key={i} style={{fontSize:11,color:"rgba(255,255,255,0.7)",padding:"3px 0",borderBottom:"0.5px solid rgba(255,255,255,0.1)"}}>{item}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
