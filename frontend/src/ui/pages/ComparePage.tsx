import { useState } from "react";

type Feature = { label: string; b1: boolean|string; bn: boolean|string; category: string };

const FEATURES: Feature[] = [
  { label:"Plans budgétaires multi-exercices",      b1:true,   bn:true,   category:"Budget" },
  { label:"Nomenclature UEMOA Ch/Art/Par",          b1:true,   bn:true,   category:"Budget" },
  { label:"Allocations par direction",              b1:true,   bn:true,   category:"Budget" },
  { label:"Contrôle disponibilité crédit",          b1:true,   bn:true,   category:"Budget" },
  { label:"Simulation What-If budgétaire",          b1:false,  bn:true,   category:"Budget" },
  { label:"Cycle engagement → liquidation",         b1:true,   bn:true,   category:"Achats" },
  { label:"Gestion fournisseurs",                   b1:true,   bn:true,   category:"Achats" },
  { label:"Validation NINEA (APIX Sénégal)",        b1:true,   bn:true,   category:"Achats" },
  { label:"Marchés Publics DCMP",                   b1:false,  bn:true,   category:"Achats" },
  { label:"Seuils DCMP auto-calculés",              b1:false,  bn:true,   category:"Achats" },
  { label:"Audit immuable hash-chain",              b1:true,   bn:true,   category:"Sécurité" },
  { label:"RBAC 4 rôles",                           b1:true,   bn:true,   category:"Sécurité" },
  { label:"Délégations de pouvoir",                 b1:true,   bn:true,   category:"Sécurité" },
  { label:"Rate limiting anti-brute force",         b1:false,  bn:true,   category:"Sécurité" },
  { label:"Gestion utilisateurs avancée",           b1:false,  bn:true,   category:"Sécurité" },
  { label:"IA Forecasting (régression Ridge)",      b1:true,   bn:true,   category:"IA" },
  { label:"Détection anomalies (Isolation Forest)", b1:"Basique", bn:"Avancée", category:"IA" },
  { label:"Alertes intelligentes multi-canaux",     b1:false,  bn:true,   category:"IA" },
  { label:"Géo-dashboard 14 régions SN",            b1:false,  bn:true,   category:"IA" },
  { label:"Export XLSX",                            b1:true,   bn:true,   category:"Exports" },
  { label:"Export PDF réglementaire UEMOA",         b1:true,   bn:true,   category:"Exports" },
  { label:"Export TOFE BCEAO",                      b1:false,  bn:true,   category:"Exports" },
  { label:"Rapports automatisés planifiés",         b1:false,  bn:true,   category:"Exports" },
  { label:"Multilingue Fr / Wolof / Anglais",       b1:true,   bn:true,   category:"UX" },
  { label:"PWA (Progressive Web App)",              b1:true,   bn:true,   category:"UX" },
  { label:"Commentaires & collaboration",           b1:false,  bn:true,   category:"UX" },
  { label:"Thème UI moderne coloré",                b1:false,  bn:true,   category:"UX" },
  { label:"API REST + Swagger",                     b1:true,   bn:true,   category:"Tech" },
  { label:"Multi-entités & consolidation",          b1:false,  bn:true,   category:"Tech" },
  { label:"Webhooks & intégrations",                b1:false,  bn:true,   category:"Tech" },
  { label:"Gestion licences Standard/Premium",      b1:false,  bn:true,   category:"Tech" },
];

const CATS = ["Budget","Achats","Sécurité","IA","Exports","UX","Tech"];
const CAT_COLORS: Record<string,string> = {
  Budget:"#1A6FD4", Achats:"#7C3AED", Sécurité:"#EF4444",
  IA:"#0E9E8A", Exports:"#F59E0B", UX:"#10B981", Tech:"#6366F1"
};

function Cell({v}:{v:boolean|string}) {
  if (v === true)  return <span style={{color:"#10B981",fontSize:18}}>✓</span>;
  if (v === false) return <span style={{color:"#E2E8F0",fontSize:18}}>—</span>;
  return <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:99,background:"#EBF4FF",color:"#1E40AF"}}>{v}</span>;
}

export function ComparePage() {
  const [activeFilter, setActiveFilter] = useState("Tout");
  const [showOnlyDiff, setShowOnlyDiff] = useState(false);

  const filtered = FEATURES.filter(f =>
    (activeFilter === "Tout" || f.category === activeFilter) &&
    (!showOnlyDiff || f.b1 !== f.bn)
  );

  const b1Count = FEATURES.filter(f=>f.b1===true||typeof f.b1==="string").length;
  const bnCount = FEATURES.filter(f=>f.bn===true||typeof f.bn==="string").length;
  const diffCount = FEATURES.filter(f=>f.b1!==f.bn).length;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <div>
        <h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Comparaison des produits</h1>
        <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Budget1 Standard vs BudgetNew Premium — {FEATURES.length} critères</p>
      </div>

      {/* Product cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{background:"white",borderRadius:16,padding:24,border:"1px solid var(--bn-border)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#475569,#94A3B8)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:16}}>B1</div>
            <div>
              <p style={{fontSize:16,fontWeight:700,color:"var(--bn-text)"}}>Budget1 Standard</p>
              <p style={{fontSize:12,color:"var(--bn-muted)"}}>Application de base — v3.0</p>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {[
              {label:"Fonctionnalités",value:b1Count,color:"#475569"},
              {label:"Utilisateurs max",value:"10",color:"#475569"},
              {label:"Support",value:"Email",color:"#475569"},
              {label:"Prix/mois",value:"150k FCFA",color:"#475569"},
            ].map(m=>(
              <div key={m.label} style={{background:"#F8FAFC",borderRadius:10,padding:"10px 12px"}}>
                <p style={{fontSize:10,color:"#94A3B8",marginBottom:3}}>{m.label}</p>
                <p style={{fontSize:15,fontWeight:700,color:m.color}}>{m.value}</p>
              </div>
            ))}
          </div>
          <p style={{fontSize:12,color:"var(--bn-muted)"}}>Idéal pour les petites entités publiques et services déconcentrés.</p>
          <a href="https://budget-a-pink.vercel.app" target="_blank" rel="noreferrer"
            style={{display:"inline-block",marginTop:12,padding:"8px 16px",borderRadius:8,border:"1px solid #E2E8F0",background:"transparent",fontSize:12,color:"#475569",textDecoration:"none",fontWeight:500}}>
            Voir Budget1 →
          </a>
        </div>

        <div style={{background:"linear-gradient(135deg,#0D2B4B,#1A3352)",borderRadius:16,padding:24,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,borderRadius:"50%",background:"rgba(26,111,212,0.15)"}}/>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#1A6FD4,#0E9E8A)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:14}}>BN</div>
            <div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <p style={{fontSize:16,fontWeight:700,color:"white"}}>BudgetNew Premium</p>
                <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:99,background:"#F59E0B",color:"#92400E"}}>PREMIUM</span>
              </div>
              <p style={{fontSize:12,color:"rgba(255,255,255,0.6)"}}>Application enrichie — v2.0</p>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {[
              {label:"Fonctionnalités",value:bnCount,color:"#7BC8FF"},
              {label:"Utilisateurs max",value:"Illimité",color:"#7BC8FF"},
              {label:"Support",value:"24/7",color:"#7BC8FF"},
              {label:"Prix/mois",value:"500k FCFA",color:"#7BC8FF"},
            ].map(m=>(
              <div key={m.label} style={{background:"rgba(255,255,255,0.07)",borderRadius:10,padding:"10px 12px"}}>
                <p style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:3}}>{m.label}</p>
                <p style={{fontSize:15,fontWeight:700,color:m.color}}>{m.value}</p>
              </div>
            ))}
          </div>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.6)"}}>Pour les ministères, directions générales et agences UEMOA.</p>
          <a href="https://budgetnew.vercel.app" target="_blank" rel="noreferrer"
            style={{display:"inline-block",marginTop:12,padding:"8px 16px",borderRadius:8,border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.1)",fontSize:12,color:"white",textDecoration:"none",fontWeight:500}}>
            Voir BudgetNew →
          </a>
        </div>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        {["Tout",...CATS].map(c=>(
          <button key={c} onClick={()=>setActiveFilter(c)}
            style={{padding:"6px 14px",borderRadius:99,fontSize:12,fontWeight:500,cursor:"pointer",border:"1px solid",
                    borderColor:activeFilter===c?(CAT_COLORS[c]||"#0D2B4B"):"var(--bn-border)",
                    background:activeFilter===c?`${CAT_COLORS[c]||"#0D2B4B"}18`:"transparent",
                    color:activeFilter===c?(CAT_COLORS[c]||"#0D2B4B"):"var(--bn-muted)"}}>
            {c}
          </button>
        ))}
        <label style={{display:"flex",alignItems:"center",gap:6,marginLeft:8,fontSize:12,color:"var(--bn-muted)",cursor:"pointer"}}>
          <input type="checkbox" checked={showOnlyDiff} onChange={e=>setShowOnlyDiff(e.target.checked)}/>
          Différences uniquement ({diffCount})
        </label>
      </div>

      {/* Comparison table */}
      <div style={{background:"white",borderRadius:16,border:"1px solid var(--bn-border)",overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:"#F8FAFC"}}>
              <th style={{textAlign:"left",padding:"14px 20px",fontSize:11,fontWeight:600,color:"var(--bn-muted)",borderBottom:"1px solid var(--bn-border)",textTransform:"uppercase",letterSpacing:"0.05em",width:"50%"}}>Fonctionnalité</th>
              <th style={{textAlign:"center",padding:"14px 20px",fontSize:13,fontWeight:700,color:"#475569",borderBottom:"1px solid var(--bn-border)",width:"25%"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <span>Budget1</span>
                  <span style={{fontSize:10,fontWeight:400,color:"var(--bn-muted)"}}>Standard</span>
                </div>
              </th>
              <th style={{textAlign:"center",padding:"14px 20px",fontSize:13,fontWeight:700,color:"#1A6FD4",borderBottom:"1px solid var(--bn-border)",width:"25%",background:"#EBF4FF44"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <span>BudgetNew</span>
                  <span style={{fontSize:10,fontWeight:400,color:"#1A6FD4",opacity:0.7}}>Premium ✦</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f,i)=>{
              const isDiff = f.b1 !== f.bn;
              const catColor = CAT_COLORS[f.category]||"#94A3B8";
              return(
              <tr key={f.label} style={{background:isDiff?"#FFFBEB":i%2===0?"white":"#FAFBFD",borderBottom:"1px solid #F1F5F9"}}>
                <td style={{padding:"12px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:99,background:`${catColor}18`,color:catColor,flexShrink:0}}>{f.category}</span>
                    <span style={{fontSize:13,color:"var(--bn-text)",fontWeight:isDiff?500:400}}>{f.label}</span>
                    {isDiff&&<span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:99,background:"#FEF3C7",color:"#92400E",flexShrink:0}}>NOUVEAU</span>}
                  </div>
                </td>
                <td style={{padding:"12px 20px",textAlign:"center"}}><Cell v={f.b1}/></td>
                <td style={{padding:"12px 20px",textAlign:"center",background:"#EBF4FF22"}}><Cell v={f.bn}/></td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {[
          {label:"Fonctionnalités communes",value:FEATURES.filter(f=>f.b1===f.bn&&f.b1===true).length,desc:"Les deux produits",color:"#10B981",bg:"#D1FAE5"},
          {label:"Exclusivités Premium",value:diffCount,desc:"BudgetNew uniquement",color:"#1A6FD4",bg:"#EBF4FF"},
          {label:"Rapport valeur/prix",value:"3,3x",desc:"Plus de fonctionnalités pour 3,3x le prix",color:"#7C3AED",bg:"#EDE9FE"},
        ].map(s=>(
          <div key={s.label} style={{background:s.bg,borderRadius:14,padding:"18px 20px",border:`1px solid ${s.color}22`}}>
            <p style={{fontSize:12,fontWeight:600,color:s.color,marginBottom:6}}>{s.label}</p>
            <p style={{fontSize:28,fontWeight:700,color:s.color,lineHeight:1}}>{s.value}</p>
            <p style={{fontSize:11,color:s.color,opacity:0.7,marginTop:4}}>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
