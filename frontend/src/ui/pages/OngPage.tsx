import { useState } from "react";

type OrgType = "prive" | "public" | "ong";

const ORG_CONFIG = {
  prive: {
    label: "Entreprise Privee",
    color: "#1A6FD4",
    bg: "#EBF4FF",
    budgetTypes: ["Charges exploitation","Budget investissement","Plan tresorerie","Budget commercial"],
    comptes: [
      {code:"70",label:"Chiffre affaires",type:"Produit",montant:850000000},
      {code:"60",label:"Achats et variations stocks",type:"Charge",montant:320000000},
      {code:"61",label:"Services exterieurs",type:"Charge",montant:95000000},
      {code:"62",label:"Autres services ext.",type:"Charge",montant:45000000},
      {code:"63",label:"Impots et taxes",type:"Charge",montant:28000000},
      {code:"64",label:"Charges de personnel",type:"Charge",montant:180000000},
      {code:"65",label:"Autres charges gestion",type:"Charge",montant:22000000},
      {code:"66",label:"Charges financieres",type:"Charge",montant:15000000},
      {code:"68",label:"Dotations amortissements",type:"Charge",montant:35000000},
      {code:"75",label:"Autres produits gestion",type:"Produit",montant:12000000},
      {code:"76",label:"Produits financiers",type:"Produit",montant:8000000},
    ],
    kpis: [
      {label:"Chiffre affaires",value:"850 M FCFA",trend:"+12%",up:true},
      {label:"Resultat net",value:"130 M FCFA",trend:"+8%",up:true},
      {label:"Marge nette",value:"15,3%",trend:"+0,8pt",up:true},
      {label:"Tresorerie nette",value:"245 M FCFA",trend:"+22%",up:true},
    ],
    ratios: [
      {label:"Liquidite generale",formula:"Actif circulant / Passif CT",value:"2,4",seuil:"Ideal > 2,0",ok:true},
      {label:"Liquidite immediate",formula:"(AC - Stocks) / Passif CT",value:"1,8",seuil:"Ideal > 1,0",ok:true},
      {label:"Taux marge brute",formula:"(CA - Cout ventes) / CA",value:"62,4%",seuil:"Secteur: 58-65%",ok:true},
      {label:"Ratio endettement",formula:"Dettes totales / Capitaux propres",value:"0,65",seuil:"Acceptable < 1,0",ok:true},
    ],
    specs: [
      "Objectif : maximiser le profit pour les actionnaires",
      "Plan comptable SYSCOHADA obligatoire",
      "Audit externe selon le chiffre affaires",
      "Declaration IS, TVA, Retenues a la source",
      "Etats financiers : Bilan + CR + Tableau flux",
    ]
  },
  public: {
    label: "Etablissement Public",
    color: "#0D2B4B",
    bg: "#F0F4FA",
    budgetTypes: ["Budget general","Budget annexe","Compte special tresor","TOFE BCEAO"],
    comptes: [
      {code:"70",label:"Recettes fiscales DGI",type:"Recette",montant:892000000},
      {code:"71",label:"Recettes douanieres DGDDI",type:"Recette",montant:160000000},
      {code:"72",label:"Recettes non fiscales",type:"Recette",montant:120000000},
      {code:"73",label:"Dons et aides exterieures",type:"Recette",montant:91000000},
      {code:"21",label:"Personnel et charges",type:"Depense",montant:520000000},
      {code:"22",label:"Biens et services",type:"Depense",montant:210000000},
      {code:"23",label:"Transferts et subventions",type:"Depense",montant:160000000},
      {code:"24",label:"Investissements publics",type:"Depense",montant:380000000},
      {code:"25",label:"Remboursement dette",type:"Depense",montant:75000000},
    ],
    kpis: [
      {label:"Recettes totales Q1",value:"1 263 M FCFA",trend:"+8,1%",up:true},
      {label:"Depenses totales",value:"1 345 M FCFA",trend:"+5,2%",up:true},
      {label:"Solde budgetaire",value:"-82 M FCFA",trend:"Deficit",up:false},
      {label:"Taux execution",value:"57,3%",trend:"+3,2pts",up:true},
    ],
    ratios: [
      {label:"Taux execution budgetaire",formula:"Depenses reelles / Budget vote",value:"57,3%",seuil:"Cible > 85%",ok:false},
      {label:"Pression fiscale",formula:"Recettes fiscales / PIB",value:"18,2%",seuil:"Norme UEMOA > 20%",ok:false},
      {label:"Ratio recettes propres",formula:"Rec. fiscales / Rec. totales",value:"70,6%",seuil:"Ideal > 75%",ok:false},
      {label:"Ratio investissement",formula:"Invest. / Depenses totales",value:"28,3%",seuil:"Norme CEDEAO > 25%",ok:true},
    ],
    specs: [
      "Objectif : service public, pas de profit",
      "Budget vote par loi de finances",
      "Comptabilite publique obligatoire (ordonnateur/comptable)",
      "Controle a priori par Controleur Financier",
      "TOFE BCEAO trimestriel obligatoire",
      "Rapport Cour des Comptes annuel",
    ]
  },
  ong: {
    label: "ONG / Association",
    color: "#10B981",
    bg: "#D1FAE5",
    budgetTypes: ["Budget projet","Budget fonctionnement","Plan tresorerie","Rapport donateur"],
    comptes: [
      {code:"A1",label:"Subvention AFD - Projet Sante",type:"Don conditionnel",montant:450000000},
      {code:"A2",label:"Subvention USAID - Education",type:"Don conditionnel",montant:280000000},
      {code:"A3",label:"Financement BM - Infrastructure",type:"Don conditionnel",montant:320000000},
      {code:"A4",label:"Dons non affectes divers",type:"Don non affecte",montant:45000000},
      {code:"A5",label:"Honoraires formation",type:"Recette propre",montant:22000000},
      {code:"D1",label:"Personnel projets",type:"Cout direct",montant:380000000},
      {code:"D2",label:"Activites projets terrain",type:"Cout direct",montant:420000000},
      {code:"D3",label:"Frais generaux coordination",type:"Cout indirect",montant:95000000},
      {code:"D4",label:"Audit et conformite",type:"Cout indirect",montant:28000000},
      {code:"D5",label:"Communication et plaidoyer",type:"Cout indirect",montant:35000000},
    ],
    kpis: [
      {label:"Total financements",value:"1 117 M FCFA",trend:"+15%",up:true},
      {label:"Taux execution projets",value:"84,2%",trend:"+6%",up:true},
      {label:"Frais admin sur total",value:"8,7%",trend:"-0,5pt",up:true},
      {label:"Projets actifs",value:"12 projets",trend:"+3",up:true},
    ],
    ratios: [
      {label:"Taux dependance donateurs",formula:"Subventions / Total produits",value:"93,5%",seuil:"Ideal < 70%",ok:false},
      {label:"Frais admin sur total",formula:"Frais indirects / Total produits",value:"8,7%",seuil:"Ideal < 15%",ok:true},
      {label:"Ratio de survie",formula:"Reserves / Depenses x 365 jours",value:"42 jours",seuil:"Ideal > 90 jours",ok:false},
      {label:"Taux realisation projets",formula:"Activites realisees / Planifiees",value:"84,2%",seuil:"Cible > 80%",ok:true},
    ],
    specs: [
      "Objectif : impact social, pas de profit",
      "Fonds conditionnels par donateur - comptabilite par fonds",
      "Rapport financier par projet obligatoire",
      "Ratio frais admin < 15% exige par donateurs",
      "Plan de tresorerie mensuel indispensable",
      "Audit externe selon exigences bailleur",
    ]
  }
};

const FINANCEURS = [
  {nom:"Agence Francaise Developpement (AFD)",pays:"France",type:"Bilaterale",montant:450,secteur:"Sante",statut:"Actif",taux:89},
  {nom:"USAID",pays:"USA",type:"Bilaterale",montant:280,secteur:"Education",statut:"Actif",taux:76},
  {nom:"Banque Mondiale",pays:"International",type:"Multilaterale",montant:320,secteur:"Infrastructure",statut:"Actif",taux:62},
  {nom:"UNICEF",pays:"ONU",type:"ONU",montant:85,secteur:"Enfance",statut:"Actif",taux:91},
  {nom:"Union Europeenne",pays:"Europe",type:"Regionale",montant:120,secteur:"Gouvernance",statut:"En negociation",taux:0},
  {nom:"Fondation Bill Gates",pays:"USA",type:"Privee",montant:65,secteur:"Sante",statut:"Actif",taux:100},
];

const PROJETS = [
  {ref:"PROJ-001",titre:"Acces eau potable zones rurales",donateur:"AFD",budget:180,consomme:160,region:"Matam",echeance:"Dec 2026",statut:"En cours"},
  {ref:"PROJ-002",titre:"Formation enseignants primaire",donateur:"USAID",budget:95,consomme:72,region:"Kaolack",echeance:"Juin 2027",statut:"En cours"},
  {ref:"PROJ-003",titre:"Nutrition enfants 0-5 ans",donateur:"UNICEF",budget:85,consomme:85,region:"Ziguinchor",echeance:"Mars 2026",statut:"Complete"},
  {ref:"PROJ-004",titre:"Infrastructure routes rurales",donateur:"BM",budget:320,consomme:198,region:"Tambacounda",echeance:"Dec 2027",statut:"En cours"},
  {ref:"PROJ-005",titre:"Renforcement capacites ONG",donateur:"AFD",budget:55,consomme:48,region:"Dakar",echeance:"Sept 2026",statut:"En cours"},
];

export function OngPage() {
  const [orgType, setOrgType] = useState<OrgType>("ong");
  const [tab, setTab] = useState<"plan"|"kpis"|"financeurs"|"projets">("plan");
  const config = ORG_CONFIG[orgType];

  const isIncome = (type: string) => ["Produit","Recette","Don conditionnel","Don non affecte","Recette propre"].includes(type);
  const totalProduits = config.comptes.filter(c => isIncome(c.type)).reduce((s,c) => s + c.montant, 0);
  const totalCharges = config.comptes.filter(c => !isIncome(c.type)).reduce((s,c) => s + c.montant, 0);
  const solde = totalProduits - totalCharges;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Gestion Budgetaire Multi-Organisation</h1>
          <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Entreprise Privee - Etablissement Public - ONG - Methodologie MANGO et SYSCOHADA</p>
        </div>
        <div style={{display:"flex",gap:6}}>
          {(["prive","public","ong"] as OrgType[]).map(t => {
            const c = ORG_CONFIG[t];
            return (
              <button key={t} onClick={() => setOrgType(t)} style={{padding:"8px 16px",borderRadius:10,border:"2px solid",borderColor:orgType===t?c.color:"var(--bn-border)",background:orgType===t?c.bg:"transparent",color:orgType===t?c.color:"var(--bn-muted)",cursor:"pointer",fontSize:12,fontWeight:orgType===t?700:400}}>
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{background:`linear-gradient(135deg,${config.color},${config.color}dd)`,borderRadius:16,padding:20,color:"white"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <p style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginBottom:4}}>TYPE D'ORGANISATION</p>
            <p style={{fontSize:20,fontWeight:700}}>{config.label}</p>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:4}}>Referentiel : {orgType==="prive"?"SYSCOHADA / IFRS":orgType==="public"?"UEMOA / BCEAO":"Manuel MANGO / PCOP ONG"}</p>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",maxWidth:280,justifyContent:"flex-end"}}>
            {config.budgetTypes.map(b => (
              <span key={b} style={{fontSize:10,padding:"3px 10px",borderRadius:99,background:"rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.9)"}}>{b}</span>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {config.kpis.map(k => (
            <div key={k.label} style={{background:"rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 14px"}}>
              <p style={{fontSize:10,color:"rgba(255,255,255,0.6)",marginBottom:4}}>{k.label}</p>
              <p style={{fontSize:16,fontWeight:700}}>{k.value}</p>
              <p style={{fontSize:10,color:k.up?"#6EE7B7":"#FCA5A5",marginTop:2}}>{k.trend}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"flex",gap:4}}>
        {(["plan","kpis","financeurs","projets"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{padding:"7px 16px",borderRadius:8,border:"0.5px solid var(--bn-border)",background:tab===t?config.color:"transparent",color:tab===t?"white":"var(--bn-muted)",cursor:"pointer",fontSize:12,fontWeight:tab===t?500:400}}>
            {t==="plan"?"Plan Comptable":t==="kpis"?"Ratios Financiers":t==="financeurs"?"Sources Financement":"Suivi Projets"}
          </button>
        ))}
      </div>

      {tab==="plan" && (
        <div style={{background:"white",borderRadius:16,border:"1px solid var(--bn-border)",overflow:"hidden"}}>
          <div style={{background:config.color,padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p style={{fontSize:13,fontWeight:700,color:"white"}}>Plan Comptable - {config.label}</p>
            <div style={{display:"flex",gap:16}}>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.8)"}}>Produits: {(totalProduits/1000000).toFixed(0)} M FCFA</span>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.8)"}}>Charges: {(totalCharges/1000000).toFixed(0)} M FCFA</span>
              <span style={{fontSize:12,fontWeight:700,color:solde>=0?"#6EE7B7":"#FCA5A5"}}>{solde>=0?"Excedent":"Deficit"}: {(Math.abs(solde)/1000000).toFixed(0)} M</span>
            </div>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:"#F8FAFC"}}>
              {["Code","Libelle","Type","Montant (M FCFA)","%","Repartition"].map(h => (
                <th key={h} style={{textAlign:"left",padding:"9px 14px",fontSize:11,fontWeight:600,color:"var(--bn-muted)",borderBottom:"1px solid var(--bn-border)",textTransform:"uppercase"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {config.comptes.map((c,i) => {
                const inc = isIncome(c.type);
                const total = inc ? totalProduits : totalCharges;
                const pct = total > 0 ? (c.montant/total*100) : 0;
                return (
                  <tr key={i} style={{borderBottom:"0.5px solid #F1F5F9",background:i%2===0?"white":"#FAFBFD"}}>
                    <td style={{padding:"9px 14px",fontSize:12,fontWeight:700,color:config.color,fontFamily:"monospace"}}>{c.code}</td>
                    <td style={{padding:"9px 14px",fontSize:13,fontWeight:500}}>{c.label}</td>
                    <td style={{padding:"9px 14px"}}>
                      <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,background:inc?"#D1FAE5":"#FEE2E2",color:inc?"#065F46":"#991B1B"}}>{c.type}</span>
                    </td>
                    <td style={{padding:"9px 14px",fontSize:13,fontWeight:600,textAlign:"right"}}>{(c.montant/1000000).toFixed(1)}</td>
                    <td style={{padding:"9px 14px",fontSize:12,textAlign:"right",color:"var(--bn-muted)"}}>{pct.toFixed(1)}%</td>
                    <td style={{padding:"9px 14px",width:120}}>
                      <div style={{height:5,background:"#F1F5F9",borderRadius:99}}>
                        <div style={{height:5,width:Math.min(pct,100)+"%",background:inc?config.color:"#EF4444",borderRadius:99}}/>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab==="kpis" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:15,fontWeight:600}}>Ratios financiers cles</p>
            {config.ratios.map((r,i) => (
              <div key={i} style={{background:"white",borderRadius:12,padding:16,border:"1px solid var(--bn-border)"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <div>
                    <p style={{fontSize:13,fontWeight:600}}>{r.label}</p>
                    <p style={{fontSize:11,color:"var(--bn-muted)",marginTop:2}}>{r.formula}</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{fontSize:22,fontWeight:700,color:r.ok?config.color:"#EF4444"}}>{r.value}</p>
                    <span style={{fontSize:10,fontWeight:600,padding:"1px 8px",borderRadius:99,background:r.ok?"#D1FAE5":"#FEE2E2",color:r.ok?"#065F46":"#991B1B"}}>{r.ok?"Conforme":"Non conforme"}</span>
                  </div>
                </div>
                <p style={{fontSize:10,color:"var(--bn-muted)",background:"var(--bn-bg)",padding:"4px 8px",borderRadius:6}}>{r.seuil}</p>
              </div>
            ))}
          </div>
          <div style={{background:"white",borderRadius:16,padding:20,border:"1px solid var(--bn-border)"}}>
            <p style={{fontSize:15,fontWeight:600,marginBottom:12}}>Specificites {config.label}</p>
            <div style={{background:config.bg,borderRadius:10,padding:14,marginBottom:14}}>
              {config.specs.map((s,i) => (
                <div key={i} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:"0.5px solid var(--bn-border)"}}>
                  <span style={{color:config.color,fontWeight:700}}>*</span>
                  <span style={{fontSize:12,color:"var(--bn-text)"}}>{s}</span>
                </div>
              ))}
            </div>
            <p style={{fontSize:12,fontWeight:600,marginBottom:6,color:"var(--bn-muted)"}}>Equilibre produits / charges</p>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:10,color:"#065F46",minWidth:80}}>Produits</span>
              <div style={{flex:1,height:14,background:"#D1FAE5",borderRadius:4,display:"flex",alignItems:"center",paddingLeft:8}}>
                <span style={{fontSize:10,fontWeight:700,color:"#065F46"}}>{(totalProduits/1000000).toFixed(0)} M</span>
              </div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:10,color:"#991B1B",minWidth:80}}>Charges</span>
              <div style={{width:(totalCharges/totalProduits*100)+"%",height:14,background:"#FEE2E2",borderRadius:4,display:"flex",alignItems:"center",paddingLeft:8,minWidth:"30%"}}>
                <span style={{fontSize:10,fontWeight:700,color:"#991B1B"}}>{(totalCharges/1000000).toFixed(0)} M</span>
              </div>
            </div>
            <p style={{fontSize:13,fontWeight:700,color:solde>=0?config.color:"#EF4444"}}>
              {solde>=0?"Excedent":"Deficit"} : {(Math.abs(solde)/1000000).toFixed(0)} M FCFA ({(Math.abs(solde)/totalProduits*100).toFixed(1)}%)
            </p>
          </div>
        </div>
      )}

      {tab==="financeurs" && orgType!=="ong" && (
        <div style={{background:"var(--bn-bg)",borderRadius:16,padding:40,textAlign:"center",border:"1px dashed var(--bn-border)"}}>
          <p style={{fontSize:14,fontWeight:600,marginBottom:8}}>Module Sources de Financement</p>
          <p style={{fontSize:13,color:"var(--bn-muted)"}}>Ce module est specifique aux ONG. Selectionnez "ONG / Association" pour acceder au suivi des bailleurs.</p>
        </div>
      )}

      {tab==="financeurs" && orgType==="ong" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {[
              {l:"Total financements",v:"1 117 M FCFA",c:"#10B981",bg:"#D1FAE5"},
              {l:"Bailleurs actifs",v:FINANCEURS.filter(f=>f.statut==="Actif").length,c:"#1A6FD4",bg:"#EBF4FF"},
              {l:"En negociation",v:FINANCEURS.filter(f=>f.statut==="En negociation").length,c:"#F59E0B",bg:"#FEF3C7"},
              {l:"Secteurs couverts",v:"5 secteurs",c:"#7C3AED",bg:"#EDE9FE"},
            ].map(m => (
              <div key={m.l} style={{background:m.bg,borderRadius:10,padding:"12px 14px"}}>
                <p style={{fontSize:10,color:m.c,marginBottom:3}}>{m.l}</p>
                <p style={{fontSize:20,fontWeight:700,color:m.c}}>{m.v}</p>
              </div>
            ))}
          </div>
          <div style={{background:"white",borderRadius:16,border:"1px solid var(--bn-border)",overflow:"hidden"}}>
            <div style={{background:"#10B981",padding:"12px 20px"}}>
              <p style={{fontSize:13,fontWeight:700,color:"white"}}>Matrice des Bailleurs de Fonds</p>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{background:"#F8FAFC"}}>
                {["Bailleur","Origine","Type","Secteur","Montant (M)","Statut","Taux exec."].map(h => (
                  <th key={h} style={{textAlign:"left",padding:"9px 14px",fontSize:11,fontWeight:600,color:"var(--bn-muted)",borderBottom:"1px solid var(--bn-border)",textTransform:"uppercase"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {FINANCEURS.map((f,i) => (
                  <tr key={i} style={{borderBottom:"0.5px solid #F1F5F9",background:i%2===0?"white":"#FAFBFD"}}>
                    <td style={{padding:"10px 14px",fontSize:13,fontWeight:600}}>{f.nom}</td>
                    <td style={{padding:"10px 14px",fontSize:12,color:"var(--bn-muted)"}}>{f.pays}</td>
                    <td style={{padding:"10px 14px"}}><span style={{fontSize:10,padding:"2px 7px",borderRadius:99,background:"#EBF4FF",color:"#1E40AF",fontWeight:600}}>{f.type}</span></td>
                    <td style={{padding:"10px 14px",fontSize:12}}>{f.secteur}</td>
                    <td style={{padding:"10px 14px",fontSize:13,fontWeight:600}}>{f.montant} M</td>
                    <td style={{padding:"10px 14px"}}><span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,background:f.statut==="Actif"?"#D1FAE5":"#FEF3C7",color:f.statut==="Actif"?"#065F46":"#92400E"}}>{f.statut}</span></td>
                    <td style={{padding:"10px 14px"}}>
                      {f.taux>0?(
                        <div style={{display:"flex",gap:5,alignItems:"center"}}>
                          <div style={{width:50,height:5,background:"#F1F5F9",borderRadius:99}}><div style={{height:5,width:f.taux+"%",background:f.taux>=90?"#10B981":f.taux>=70?"#F59E0B":"#EF4444",borderRadius:99}}/></div>
                          <span style={{fontSize:11,fontWeight:600}}>{f.taux}%</span>
                        </div>
                      ):<span style={{fontSize:10,color:"var(--bn-muted)"}}>--</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{background:"white",borderRadius:12,padding:16,border:"1px solid var(--bn-border)"}}>
            <p style={{fontSize:13,fontWeight:600,marginBottom:10}}>Regles MANGO - Transparence et conformite donateurs</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                "Comptabilite par fonds : chaque subvention tracee separement",
                "Ratio frais admin < 15% du total produits (actuel: 8,7%)",
                "Rapport financier trimestriel obligatoire par bailleur",
                "Audit externe annuel exige par AFD, BM et USAID",
                "Plan tresorerie mensuel pour anticiper les deficits",
                "Fonds non affectes = reserves de survie (cible: 90 jours)",
              ].map((r,i) => (
                <div key={i} style={{display:"flex",gap:8,padding:"7px 10px",borderRadius:8,background:"#F0FDF4",border:"0.5px solid #A7F3D0"}}>
                  <span style={{color:"#10B981",fontWeight:700}}>v</span>
                  <span style={{fontSize:11,color:"var(--bn-text)"}}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="projets" && orgType!=="ong" && (
        <div style={{background:"var(--bn-bg)",borderRadius:16,padding:40,textAlign:"center",border:"1px dashed var(--bn-border)"}}>
          <p style={{fontSize:14,fontWeight:600,marginBottom:8}}>Module Suivi Projets ONG</p>
          <p style={{fontSize:13,color:"var(--bn-muted)"}}>Ce module est specifique aux ONG. Selectionnez "ONG / Association" pour acceder au portefeuille projets.</p>
        </div>
      )}

      {tab==="projets" && orgType==="ong" && (
        <div style={{background:"white",borderRadius:16,border:"1px solid var(--bn-border)",overflow:"hidden"}}>
          <div style={{background:"#10B981",padding:"12px 20px"}}>
            <p style={{fontSize:13,fontWeight:700,color:"white"}}>Portefeuille Projets ONG</p>
          </div>
          {PROJETS.map((p,i) => {
            const taux = Math.round(p.consomme/p.budget*100);
            return (
              <div key={i} style={{padding:"14px 20px",borderBottom:"1px solid var(--bn-border)",display:"flex",gap:14,alignItems:"center"}}>
                <div style={{width:48,height:48,borderRadius:10,background:taux===100?"#D1FAE5":taux>=80?"#EBF4FF":"#FEF3C7",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <p style={{fontSize:13,fontWeight:700,color:taux===100?"#10B981":taux>=80?"#1A6FD4":"#F59E0B"}}>{taux}%</p>
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <div>
                      <p style={{fontSize:13,fontWeight:600}}>{p.titre}</p>
                      <div style={{display:"flex",gap:8,marginTop:3}}>
                        <span style={{fontSize:10,padding:"1px 6px",borderRadius:99,background:"#EBF4FF",color:"#1E40AF",fontWeight:600}}>{p.ref}</span>
                        <span style={{fontSize:10,color:"var(--bn-muted)"}}>Bailleur: {p.donateur}</span>
                        <span style={{fontSize:10,color:"var(--bn-muted)"}}>Region: {p.region}</span>
                        <span style={{fontSize:10,color:"var(--bn-muted)"}}>Echeance: {p.echeance}</span>
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <p style={{fontSize:13,fontWeight:600}}>{p.consomme} / {p.budget} M FCFA</p>
                      <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,background:p.statut==="Complete"?"#D1FAE5":"#EBF4FF",color:p.statut==="Complete"?"#065F46":"#1E40AF"}}>{p.statut}</span>
                    </div>
                  </div>
                  <div style={{height:6,background:"#F1F5F9",borderRadius:99}}>
                    <div style={{height:6,width:taux+"%",background:taux===100?"#10B981":taux>=80?"#1A6FD4":"#F59E0B",borderRadius:99}}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
