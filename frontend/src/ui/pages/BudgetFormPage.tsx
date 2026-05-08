import { useState } from "react";

type BudgetLine = {
  id: number;
  code: string;
  label: string;
  level: "Chapitre" | "Article" | "Paragraphe";
  allocated: number;
  consumed: number;
  org_unit: string;
};

type BudgetPlan = {
  id: number;
  name: string;
  year: number;
  total: number;
  status: "Brouillon" | "Actif" | "Cloture";
  lines: BudgetLine[];
};

const ORGS = ["DGID","DGCPT","DPEE","DAGE","Primature","DSI","DAF","DRH","DCMP","DGTCP"];
const REGIONS = ["Dakar","Thies","Saint-Louis","Kaolack","Ziguinchor","Tambacounda","Kolda","Louga","Matam","Kedougou","Sedhiou","Kaffrine","Fatick","Diourbel"];

function fmt(n: number) { return n.toLocaleString("fr-SN") + " FCFA"; }

export function BudgetFormPage() {
  const [plans, setPlans] = useState<BudgetPlan[]>([
    {
      id: 1, name: "Budget General 2026", year: 2026, total: 4500000000, status: "Actif",
      lines: [
        {id:1,code:"21",label:"Personnel",level:"Chapitre",allocated:1800000000,consumed:1620000000,org_unit:"DGID"},
        {id:2,code:"22",label:"Biens et services",level:"Chapitre",allocated:900000000,consumed:540000000,org_unit:"DGCPT"},
        {id:3,code:"25",label:"Investissements",level:"Chapitre",allocated:1200000000,consumed:207000000,org_unit:"DPEE"},
      ]
    }
  ]);
  const [activePlan, setActivePlan] = useState<BudgetPlan>(plans[0]);
  const [tab, setTab] = useState<"plans"|"lines"|"engagement">("plans");
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showLineForm, setShowLineForm] = useState(false);
  const [showEngForm, setShowEngForm] = useState(false);
  const [toast, setToast] = useState("");
  const [editLine, setEditLine] = useState<BudgetLine|null>(null);

  // Plan form state
  const [planForm, setPlanForm] = useState({name:"",year:2026,total:0,status:"Brouillon" as BudgetPlan["status"]});

  // Line form state
  const [lineForm, setLineForm] = useState({
    code:"", label:"", level:"Chapitre" as BudgetLine["level"],
    allocated:0, consumed:0, org_unit:"DGID"
  });

  // Engagement form state
  const [engForm, setEngForm] = useState({
    ref:"", vendor:"", ninea:"", amount:0,
    description:"", org_unit:"DGID", region:"Dakar",
    type:"Bien" as "Bien"|"Service"|"Travaux"
  });

  const [engagements, setEngagements] = useState<any[]>([]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function savePlan() {
    if (!planForm.name || !planForm.total) return;
    const np: BudgetPlan = {
      id: Date.now(), name: planForm.name, year: planForm.year,
      total: planForm.total, status: planForm.status, lines: []
    };
    setPlans(p => [...p, np]);
    setActivePlan(np);
    setPlanForm({name:"",year:2026,total:0,status:"Brouillon"});
    setShowPlanForm(false);
    showToast("Plan budgetaire cree avec succes");
  }

  function saveLine() {
    if (!lineForm.code || !lineForm.label || !lineForm.allocated) return;
    if (editLine) {
      const updated = {...editLine, ...lineForm};
      setActivePlan(p => ({...p, lines: p.lines.map(l => l.id === editLine.id ? updated : l)}));
      setPlans(ps => ps.map(p => p.id === activePlan.id ? {...p, lines: p.lines.map(l => l.id === editLine.id ? updated : l)} : p));
      setEditLine(null);
      showToast("Ligne mise a jour");
    } else {
      const nl: BudgetLine = {id: Date.now(), ...lineForm};
      setActivePlan(p => ({...p, lines: [...p.lines, nl]}));
      setPlans(ps => ps.map(p => p.id === activePlan.id ? {...p, lines: [...p.lines, nl]} : p));
      showToast("Ligne budgetaire ajoutee");
    }
    setLineForm({code:"",label:"",level:"Chapitre",allocated:0,consumed:0,org_unit:"DGID"});
    setShowLineForm(false);
  }

  function deleteLine(id: number) {
    setActivePlan(p => ({...p, lines: p.lines.filter(l => l.id !== id)}));
    setPlans(ps => ps.map(p => p.id === activePlan.id ? {...p, lines: p.lines.filter(l => l.id !== id)} : p));
    showToast("Ligne supprimee");
  }

  function saveEngagement() {
    if (!engForm.vendor || !engForm.amount) return;
    const ref = "BC-" + activePlan.year + "-" + String(engagements.length + 1).padStart(3,"0");
    const ne = {...engForm, ref, id: Date.now(), status: "En attente", date: new Date().toLocaleDateString("fr-SN")};
    setEngagements(e => [ne, ...e]);
    // Update consumed on matching line
    setActivePlan(p => ({
      ...p,
      lines: p.lines.map(l => l.org_unit === engForm.org_unit ? {...l, consumed: l.consumed + engForm.amount} : l)
    }));
    setEngForm({ref:"",vendor:"",ninea:"",amount:0,description:"",org_unit:"DGID",region:"Dakar",type:"Bien"});
    setShowEngForm(false);
    showToast("Engagement enregistre : " + ref);
  }

  function openEditLine(line: BudgetLine) {
    setEditLine(line);
    setLineForm({code:line.code,label:line.label,level:line.level,allocated:line.allocated,consumed:line.consumed,org_unit:line.org_unit});
    setShowLineForm(true);
  }

  const totalAllocated = activePlan.lines.reduce((s,l) => s + l.allocated, 0);
  const totalConsumed = activePlan.lines.reduce((s,l) => s + l.consumed, 0);
  const taux = totalAllocated > 0 ? Math.round(totalConsumed / totalAllocated * 100) : 0;

  const inputStyle = {
    width:"100%", padding:"9px 12px", borderRadius:8,
    border:"1px solid var(--bn-border)", fontSize:13,
    color:"var(--bn-text)", background:"var(--bn-bg)"
  };
  const labelStyle = {fontSize:12,fontWeight:600 as const,color:"var(--bn-muted)" as const,display:"block" as const,marginBottom:5};

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {toast && (
        <div style={{position:"fixed",top:20,right:20,background:"#0D2B4B",color:"white",padding:"12px 20px",borderRadius:10,fontSize:13,fontWeight:500,zIndex:1000,boxShadow:"0 4px 12px rgba(0,0,0,0.2)"}}>
          {toast}
        </div>
      )}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Gestion Budgetaire</h1>
          <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Creer et saisir vos plans, lignes et engagements</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{setShowPlanForm(true);setTab("plans");}} style={{padding:"9px 16px",borderRadius:10,background:"linear-gradient(135deg,#1A6FD4,#0284C7)",color:"white",border:"none",cursor:"pointer",fontSize:13,fontWeight:600}}>
            + Nouveau plan
          </button>
          <button onClick={()=>{setShowLineForm(true);setTab("lines");}} style={{padding:"9px 16px",borderRadius:10,background:"linear-gradient(135deg,#7C3AED,#6D28D9)",color:"white",border:"none",cursor:"pointer",fontSize:13,fontWeight:600}}>
            + Ligne budgetaire
          </button>
          <button onClick={()=>{setShowEngForm(true);setTab("engagement");}} style={{padding:"9px 16px",borderRadius:10,background:"linear-gradient(135deg,#10B981,#059669)",color:"white",border:"none",cursor:"pointer",fontSize:13,fontWeight:600}}>
            + Engagement
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {l:"Plans budgetaires",v:plans.length,c:"#1A6FD4",bg:"#EBF4FF"},
          {l:"Total alloue",v:(totalAllocated/1000000).toFixed(0)+" M",c:"#7C3AED",bg:"#EDE9FE"},
          {l:"Consomme",v:(totalConsumed/1000000).toFixed(0)+" M",c:"#10B981",bg:"#D1FAE5"},
          {l:"Taux execution",v:taux+"%",c:taux>90?"#EF4444":taux>70?"#F59E0B":"#10B981",bg:taux>90?"#FEE2E2":taux>70?"#FEF3C7":"#D1FAE5"},
        ].map(m=>(
          <div key={m.l} style={{background:m.bg,borderRadius:12,padding:"14px 16px"}}>
            <p style={{fontSize:11,color:m.c,marginBottom:4}}>{m.l}</p>
            <p style={{fontSize:22,fontWeight:700,color:m.c}}>{m.v}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4}}>
        {(["plans","lines","engagement"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"7px 16px",borderRadius:8,fontSize:13,cursor:"pointer",border:"0.5px solid var(--bn-border)",background:tab===t?"#0D2B4B":"transparent",color:tab===t?"white":"var(--bn-muted)",fontWeight:tab===t?500:400}}>
            {t==="plans"?"Plans ("+plans.length+")":t==="lines"?"Lignes ("+activePlan.lines.length+")":"Engagements ("+engagements.length+")"}
          </button>
        ))}
      </div>

      {/* FORM: Nouveau plan */}
      {showPlanForm && (
        <div style={{background:"white",borderRadius:16,padding:24,border:"1px solid #1A6FD4",boxShadow:"0 4px 12px rgba(26,111,212,0.1)"}}>
          <p style={{fontSize:15,fontWeight:600,marginBottom:16,color:"#1A6FD4"}}>Nouveau plan budgetaire</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12}}>
            <div style={{gridColumn:"1/3"}}>
              <label style={labelStyle}>Nom du plan *</label>
              <input value={planForm.name} onChange={e=>setPlanForm(p=>({...p,name:e.target.value}))} placeholder="ex: Budget General 2027" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Exercice fiscal *</label>
              <input type="number" value={planForm.year} onChange={e=>setPlanForm(p=>({...p,year:parseInt(e.target.value)||2026}))} style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Statut</label>
              <select value={planForm.status} onChange={e=>setPlanForm(p=>({...p,status:e.target.value as any}))} style={inputStyle}>
                <option>Brouillon</option><option>Actif</option><option>Cloture</option>
              </select>
            </div>
            <div style={{gridColumn:"1/3"}}>
              <label style={labelStyle}>Enveloppe totale (FCFA) *</label>
              <input type="number" value={planForm.total||""} onChange={e=>setPlanForm(p=>({...p,total:parseInt(e.target.value)||0}))} placeholder="ex: 4500000000" style={inputStyle}/>
            </div>
            <div style={{gridColumn:"3/5",display:"flex",alignItems:"flex-end",gap:8}}>
              <button onClick={savePlan} style={{flex:2,padding:"9px",borderRadius:8,background:"linear-gradient(135deg,#1A6FD4,#0284C7)",color:"white",border:"none",cursor:"pointer",fontSize:13,fontWeight:600}}>Creer le plan</button>
              <button onClick={()=>setShowPlanForm(false)} style={{flex:1,padding:"9px",borderRadius:8,border:"1px solid var(--bn-border)",background:"transparent",cursor:"pointer",fontSize:13,color:"var(--bn-muted)"}}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* FORM: Nouvelle ligne */}
      {showLineForm && (
        <div style={{background:"white",borderRadius:16,padding:24,border:"1px solid #7C3AED",boxShadow:"0 4px 12px rgba(124,58,237,0.1)"}}>
          <p style={{fontSize:15,fontWeight:600,marginBottom:16,color:"#7C3AED"}}>{editLine?"Modifier la ligne":"Nouvelle ligne budgetaire"} - {activePlan.name}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12}}>
            <div>
              <label style={labelStyle}>Code *</label>
              <input value={lineForm.code} onChange={e=>setLineForm(p=>({...p,code:e.target.value}))} placeholder="ex: 21, 211, 2111" style={inputStyle}/>
            </div>
            <div style={{gridColumn:"2/4"}}>
              <label style={labelStyle}>Intitule *</label>
              <input value={lineForm.label} onChange={e=>setLineForm(p=>({...p,label:e.target.value}))} placeholder="ex: Personnel, Biens et services" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Niveau</label>
              <select value={lineForm.level} onChange={e=>setLineForm(p=>({...p,level:e.target.value as any}))} style={inputStyle}>
                <option>Chapitre</option><option>Article</option><option>Paragraphe</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Unite organisationnelle</label>
              <select value={lineForm.org_unit} onChange={e=>setLineForm(p=>({...p,org_unit:e.target.value}))} style={inputStyle}>
                {ORGS.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Montant alloue (FCFA) *</label>
              <input type="number" value={lineForm.allocated||""} onChange={e=>setLineForm(p=>({...p,allocated:parseInt(e.target.value)||0}))} placeholder="ex: 800000000" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Montant consomme (FCFA)</label>
              <input type="number" value={lineForm.consumed||""} onChange={e=>setLineForm(p=>({...p,consumed:parseInt(e.target.value)||0}))} placeholder="0" style={inputStyle}/>
            </div>
            <div style={{display:"flex",alignItems:"flex-end",gap:8}}>
              <button onClick={saveLine} style={{flex:2,padding:"9px",borderRadius:8,background:"linear-gradient(135deg,#7C3AED,#6D28D9)",color:"white",border:"none",cursor:"pointer",fontSize:13,fontWeight:600}}>
                {editLine?"Modifier":"Ajouter"}
              </button>
              <button onClick={()=>{setShowLineForm(false);setEditLine(null);}} style={{flex:1,padding:"9px",borderRadius:8,border:"1px solid var(--bn-border)",background:"transparent",cursor:"pointer",fontSize:13,color:"var(--bn-muted)"}}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* FORM: Nouveau engagement */}
      {showEngForm && (
        <div style={{background:"white",borderRadius:16,padding:24,border:"1px solid #10B981",boxShadow:"0 4px 12px rgba(16,185,129,0.1)"}}>
          <p style={{fontSize:15,fontWeight:600,marginBottom:16,color:"#10B981"}}>Nouvel engagement / Bon de commande</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <div>
              <label style={labelStyle}>Fournisseur *</label>
              <input value={engForm.vendor} onChange={e=>setEngForm(p=>({...p,vendor:e.target.value}))} placeholder="ex: SENELEC" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>NINEA (format APIX)</label>
              <input value={engForm.ninea} onChange={e=>setEngForm(p=>({...p,ninea:e.target.value}))} placeholder="001234567-2026-A-1" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Montant (FCFA) *</label>
              <input type="number" value={engForm.amount||""} onChange={e=>setEngForm(p=>({...p,amount:parseInt(e.target.value)||0}))} placeholder="ex: 45000000" style={inputStyle}/>
            </div>
            <div style={{gridColumn:"1/3"}}>
              <label style={labelStyle}>Description</label>
              <input value={engForm.description} onChange={e=>setEngForm(p=>({...p,description:e.target.value}))} placeholder="ex: Fourniture electricite bureaux" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={engForm.type} onChange={e=>setEngForm(p=>({...p,type:e.target.value as any}))} style={inputStyle}>
                <option>Bien</option><option>Service</option><option>Travaux</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Unite organisationnelle</label>
              <select value={engForm.org_unit} onChange={e=>setEngForm(p=>({...p,org_unit:e.target.value}))} style={inputStyle}>
                {ORGS.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Region</label>
              <select value={engForm.region} onChange={e=>setEngForm(p=>({...p,region:e.target.value}))} style={inputStyle}>
                {REGIONS.map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
            <div style={{display:"flex",alignItems:"flex-end",gap:8}}>
              <button onClick={saveEngagement} style={{flex:2,padding:"9px",borderRadius:8,background:"linear-gradient(135deg,#10B981,#059669)",color:"white",border:"none",cursor:"pointer",fontSize:13,fontWeight:600}}>Enregistrer</button>
              <button onClick={()=>setShowEngForm(false)} style={{flex:1,padding:"9px",borderRadius:8,border:"1px solid var(--bn-border)",background:"transparent",cursor:"pointer",fontSize:13,color:"var(--bn-muted)"}}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Plans */}
      {tab==="plans" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {plans.map(p=>(
            <div key={p.id} onClick={()=>setActivePlan(p)} style={{background:activePlan.id===p.id?"linear-gradient(135deg,#0D2B4B,#1A3352)":"white",borderRadius:14,padding:20,cursor:"pointer",border:"1px solid",borderColor:activePlan.id===p.id?"#1A6FD4":"var(--bn-border)"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <p style={{fontSize:14,fontWeight:600,color:activePlan.id===p.id?"white":"var(--bn-text)"}}>{p.name}</p>
                <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,background:p.status==="Actif"?"#D1FAE5":p.status==="Brouillon"?"#FEF3C7":"#F1F5F9",color:p.status==="Actif"?"#065F46":p.status==="Brouillon"?"#92400E":"#94A3B8"}}>{p.status}</span>
              </div>
              <p style={{fontSize:18,fontWeight:700,color:activePlan.id===p.id?"white":"var(--bn-text)"}}>{(p.total/1000000000).toFixed(1)} Mds FCFA</p>
              <p style={{fontSize:11,color:activePlan.id===p.id?"rgba(255,255,255,0.6)":"var(--bn-muted)",marginTop:4}}>Exercice {p.year} - {p.lines.length} lignes</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB: Lignes */}
      {tab==="lines" && (
        <div style={{background:"white",borderRadius:16,border:"1px solid var(--bn-border)",overflow:"hidden"}}>
          <div style={{padding:"14px 20px",borderBottom:"1px solid var(--bn-border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p style={{fontSize:14,fontWeight:600}}>Lignes budgetaires - {activePlan.name}</p>
            <button onClick={()=>{setEditLine(null);setLineForm({code:"",label:"",level:"Chapitre",allocated:0,consumed:0,org_unit:"DGID"});setShowLineForm(true);}} style={{fontSize:12,padding:"6px 12px",borderRadius:7,background:"#7C3AED",color:"white",border:"none",cursor:"pointer",fontWeight:500}}>+ Ajouter</button>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:"#F8FAFC"}}>
              {["Code","Intitule","Niveau","Unite","Alloue","Consomme","Taux","Actions"].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"9px 14px",fontSize:11,fontWeight:600,color:"var(--bn-muted)",borderBottom:"1px solid var(--bn-border)",textTransform:"uppercase"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {activePlan.lines.map((l,i)=>{
                const t = l.allocated>0?Math.round(l.consumed/l.allocated*100):0;
                const tc = t>90?"#EF4444":t>70?"#F59E0B":"#10B981";
                return(
                <tr key={l.id} style={{background:i%2===0?"white":"#FAFBFD",borderBottom:"1px solid #F1F5F9"}}>
                  <td style={{padding:"10px 14px",fontSize:12,fontWeight:700,color:"#1A6FD4",fontFamily:"monospace"}}>{l.code}</td>
                  <td style={{padding:"10px 14px",fontSize:13}}>{l.label}</td>
                  <td style={{padding:"10px 14px"}}><span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:99,background:l.level==="Chapitre"?"#EBF4FF":l.level==="Article"?"#EDE9FE":"#D1FAE5",color:l.level==="Chapitre"?"#1E40AF":l.level==="Article"?"#4C1D95":"#065F46"}}>{l.level}</span></td>
                  <td style={{padding:"10px 14px",fontSize:12,color:"var(--bn-muted)"}}>{l.org_unit}</td>
                  <td style={{padding:"10px 14px",fontSize:12,fontWeight:500}}>{(l.allocated/1000000).toFixed(0)} M</td>
                  <td style={{padding:"10px 14px",fontSize:12}}>{(l.consumed/1000000).toFixed(0)} M</td>
                  <td style={{padding:"10px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:50,height:5,background:"#F1F5F9",borderRadius:99,overflow:"hidden"}}>
                        <div style={{height:5,width:`${Math.min(t,100)}%`,background:tc,borderRadius:99}}/>
                      </div>
                      <span style={{fontSize:11,fontWeight:600,color:tc}}>{t}%</span>
                    </div>
                  </td>
                  <td style={{padding:"10px 14px"}}>
                    <div style={{display:"flex",gap:5}}>
                      <button onClick={()=>openEditLine(l)} style={{fontSize:11,padding:"3px 8px",borderRadius:5,border:"1px solid #1A6FD4",background:"#EBF4FF",color:"#1A6FD4",cursor:"pointer"}}>Editer</button>
                      <button onClick={()=>deleteLine(l.id)} style={{fontSize:11,padding:"3px 8px",borderRadius:5,border:"1px solid #EF4444",background:"#FEE2E2",color:"#991B1B",cursor:"pointer"}}>Sup.</button>
                    </div>
                  </td>
                </tr>);
              })}
              {activePlan.lines.length===0&&<tr><td colSpan={8} style={{padding:30,textAlign:"center",color:"var(--bn-muted)",fontSize:13}}>Aucune ligne. Cliquez "+ Ajouter" pour commencer.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: Engagements */}
      {tab==="engagement" && (
        <div style={{background:"white",borderRadius:16,border:"1px solid var(--bn-border)",overflow:"hidden"}}>
          <div style={{padding:"14px 20px",borderBottom:"1px solid var(--bn-border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p style={{fontSize:14,fontWeight:600}}>Engagements saisis</p>
            <button onClick={()=>setShowEngForm(true)} style={{fontSize:12,padding:"6px 12px",borderRadius:7,background:"#10B981",color:"white",border:"none",cursor:"pointer",fontWeight:500}}>+ Nouvel engagement</button>
          </div>
          {engagements.length===0?(
            <div style={{padding:40,textAlign:"center",color:"var(--bn-muted)",fontSize:13}}>
              Aucun engagement saisi. Utilisez le bouton ci-dessus.
            </div>
          ):(
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{background:"#F8FAFC"}}>
                {["Reference","Fournisseur","NINEA","Description","Montant","Unite","Region","Type","Statut"].map(h=>(
                  <th key={h} style={{textAlign:"left",padding:"9px 14px",fontSize:11,fontWeight:600,color:"var(--bn-muted)",borderBottom:"1px solid var(--bn-border)",textTransform:"uppercase"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {engagements.map((e,i)=>(
                  <tr key={e.id} style={{background:i%2===0?"white":"#FAFBFD",borderBottom:"1px solid #F1F5F9"}}>
                    <td style={{padding:"10px 14px",fontSize:12,fontWeight:700,color:"#1A6FD4"}}>{e.ref}</td>
                    <td style={{padding:"10px 14px",fontSize:13,fontWeight:500}}>{e.vendor}</td>
                    <td style={{padding:"10px 14px",fontSize:11,color:"var(--bn-muted)",fontFamily:"monospace"}}>{e.ninea||"--"}</td>
                    <td style={{padding:"10px 14px",fontSize:12,color:"var(--bn-muted)",maxWidth:150,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.description||"--"}</td>
                    <td style={{padding:"10px 14px",fontSize:13,fontWeight:600}}>{(e.amount/1000000).toFixed(1)} M</td>
                    <td style={{padding:"10px 14px",fontSize:12}}>{e.org_unit}</td>
                    <td style={{padding:"10px 14px",fontSize:12,color:"var(--bn-muted)"}}>{e.region}</td>
                    <td style={{padding:"10px 14px"}}><span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:99,background:"#EBF4FF",color:"#1E40AF"}}>{e.type}</span></td>
                    <td style={{padding:"10px 14px"}}><span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:99,background:"#FEF3C7",color:"#92400E"}}>En attente</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
