
import { useState } from "react";

type User = {
  id: number; name: string; email: string; role: string;
  status: "Actif" | "Inactif" | "En attente";
  region: string; lastLogin: string; permissions: string[];
};

const INITIAL_USERS: User[] = [
  { id:1, name:"Mamadou Diallo",    email:"admin@budgetnew.sn",    role:"Administrateur", status:"Actif",       region:"Dakar",       lastLogin:"2026-05-07 09:14", permissions:["budget","engagement","paiement","audit","admin","export","ia"] },
  { id:2, name:"Aïssatou Ndiaye",  email:"ordo@budgetnew.sn",     role:"Ordonnateur",    status:"Actif",       region:"Dakar",       lastLogin:"2026-05-06 14:32", permissions:["budget","engagement","export"] },
  { id:3, name:"Ibrahima Sow",      email:"analyste@budgetnew.sn", role:"Analyste",       status:"Actif",       region:"Thiès",       lastLogin:"2026-05-05 11:20", permissions:["budget","audit","export","ia"] },
  { id:4, name:"Fatou Diop",        email:"cpt@budgetnew.sn",      role:"Comptable",      status:"Actif",       region:"Saint-Louis", lastLogin:"2026-05-04 08:45", permissions:["paiement","export"] },
  { id:5, name:"Cheikh Gaye",       email:"viewer@budgetnew.sn",   role:"Lecteur",        status:"Inactif",     region:"Kaolack",     lastLogin:"2026-04-20 16:00", permissions:["budget"] },
  { id:6, name:"Rokhaya Fall",      email:"rokhaya@budgetnew.sn",  role:"Analyste",       status:"En attente",  region:"Ziguinchor",  lastLogin:"—",                permissions:["budget","ia"] },
  { id:7, name:"Modou Mbaye",       email:"modou@budgetnew.sn",    role:"Ordonnateur",    status:"Actif",       region:"Tambacounda", lastLogin:"2026-05-03 10:11", permissions:["budget","engagement","export"] },
];

const ROLES = ["Administrateur","Ordonnateur","Analyste","Comptable","Lecteur"];
const REGIONS = ["Dakar","Thiès","Diourbel","Fatick","Kaolack","Kaffrine","Louga","Saint-Louis","Matam","Tambacounda","Kédougou","Kolda","Ziguinchor","Sédhiou"];
const ALL_PERMS = [
  {key:"budget",     label:"Budget",     color:"#1A6FD4"},
  {key:"engagement", label:"Engagement", color:"#7C3AED"},
  {key:"paiement",   label:"Paiement",   color:"#10B981"},
  {key:"audit",      label:"Audit",      color:"#F59E0B"},
  {key:"admin",      label:"Admin",      color:"#EF4444"},
  {key:"export",     label:"Export",     color:"#0E9E8A"},
  {key:"ia",         label:"IA",         color:"#6366F1"},
];
const ROLE_STYLE: Record<string,{bg:string,color:string}> = {
  "Administrateur":{bg:"#FEE2E2",color:"#991B1B"},
  "Ordonnateur":   {bg:"#EBF4FF",color:"#1E40AF"},
  "Analyste":      {bg:"#EDE9FE",color:"#4C1D95"},
  "Comptable":     {bg:"#D1FAE5",color:"#065F46"},
  "Lecteur":       {bg:"#F1F5F9",color:"#475569"},
};
const STATUS_STYLE: Record<string,{bg:string,color:string,dot:string}> = {
  "Actif":       {bg:"#D1FAE5",color:"#065F46",dot:"#10B981"},
  "Inactif":     {bg:"#F1F5F9",color:"#475569",dot:"#94A3B8"},
  "En attente":  {bg:"#FEF3C7",color:"#92400E",dot:"#F59E0B"},
};

type ModalMode = "add" | "edit" | "view" | null;

export function UsersPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<User | null>(null);
  const [toast, setToast] = useState<string|null>(null);
  const [form, setForm] = useState({ name:"", email:"", role:"Lecteur", region:"Dakar", status:"Actif" as User["status"], permissions:["budget"] as string[] });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function openAdd() {
    setForm({ name:"", email:"", role:"Lecteur", region:"Dakar", status:"Actif", permissions:["budget"] });
    setModalMode("add");
  }
  function openEdit(u: User) {
    setForm({ name:u.name, email:u.email, role:u.role, region:u.region, status:u.status, permissions:[...u.permissions] });
    setSelected(u);
    setModalMode("edit");
  }
  function openView(u: User) { setSelected(u); setModalMode("view"); }

  function saveUser() {
    if (!form.name || !form.email) return;
    if (modalMode === "add") {
      const nu: User = { id: Date.now(), ...form, lastLogin:"—" };
      setUsers(prev => [nu, ...prev]);
      showToast("Utilisateur créé avec succès");
    } else if (modalMode === "edit" && selected) {
      setUsers(prev => prev.map(u => u.id === selected.id ? { ...u, ...form } : u));
      showToast("Utilisateur mis à jour");
    }
    setModalMode(null);
  }

  function deleteUser(id: number) {
    setUsers(prev => prev.filter(u => u.id !== id));
    showToast("Utilisateur supprimé");
  }

  function toggleStatus(id: number) {
    setUsers(prev => prev.map(u => u.id === id
      ? { ...u, status: u.status === "Actif" ? "Inactif" : "Actif" }
      : u));
  }

  function togglePerm(p: string) {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(p) ? f.permissions.filter(x=>x!==p) : [...f.permissions, p]
    }));
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      && (!filterRole || u.role === filterRole)
      && (!filterStatus || u.status === filterStatus);
  });

  const actif = users.filter(u=>u.status==="Actif").length;
  const pending = users.filter(u=>u.status==="En attente").length;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24,position:"relative"}}>
      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",top:20,right:20,background:"#0D2B4B",color:"white",padding:"12px 20px",borderRadius:10,fontSize:13,fontWeight:500,zIndex:1000,boxShadow:"0 4px 12px rgba(0,0,0,0.2)"}}>
          ✓ {toast}
        </div>
      )}

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Gestion des utilisateurs</h1>
          <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>RBAC — 5 rôles · {users.length} comptes · {actif} actifs</p>
        </div>
        <button onClick={openAdd} style={{padding:"10px 20px",borderRadius:10,background:"linear-gradient(135deg,#1A6FD4,#0284C7)",color:"white",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,boxShadow:"0 2px 8px rgba(26,111,212,0.3)"}}>
          + Nouvel utilisateur
        </button>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {label:"Total utilisateurs", value:users.length, color:"#1A6FD4",bg:"#EBF4FF"},
          {label:"Actifs",             value:actif,         color:"#10B981",bg:"#D1FAE5"},
          {label:"En attente",         value:pending,       color:"#F59E0B",bg:"#FEF3C7"},
          {label:"Régions couvertes",  value:new Set(users.map(u=>u.region)).size, color:"#7C3AED",bg:"#EDE9FE"},
        ].map(m=>(
          <div key={m.label} style={{background:m.bg,borderRadius:12,padding:"14px 16px"}}>
            <p style={{fontSize:11,color:m.color,marginBottom:4}}>{m.label}</p>
            <p style={{fontSize:26,fontWeight:700,color:m.color}}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Rechercher nom ou email..."
          style={{flex:1,minWidth:200,padding:"9px 14px",borderRadius:10,border:"1px solid var(--bn-border)",fontSize:13,color:"var(--bn-text)",background:"white"}}/>
        <select value={filterRole} onChange={e=>setFilterRole(e.target.value)}
          style={{padding:"9px 12px",borderRadius:10,border:"1px solid var(--bn-border)",fontSize:13,color:"var(--bn-text)",background:"white",cursor:"pointer"}}>
          <option value="">Tous les rôles</option>
          {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
          style={{padding:"9px 12px",borderRadius:10,border:"1px solid var(--bn-border)",fontSize:13,color:"var(--bn-text)",background:"white",cursor:"pointer"}}>
          <option value="">Tous statuts</option>
          <option value="Actif">Actif</option>
          <option value="Inactif">Inactif</option>
          <option value="En attente">En attente</option>
        </select>
        {(search||filterRole||filterStatus) && (
          <button onClick={()=>{setSearch("");setFilterRole("");setFilterStatus("");}}
            style={{padding:"9px 14px",borderRadius:10,border:"1px solid var(--bn-border)",background:"transparent",fontSize:13,cursor:"pointer",color:"var(--bn-muted)"}}>
            Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{background:"white",borderRadius:16,border:"1px solid var(--bn-border)",overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",borderBottom:"1px solid var(--bn-border)"}}>
          <p style={{fontSize:15,fontWeight:600,color:"var(--bn-text)"}}>{filtered.length} utilisateur{filtered.length>1?"s":""}</p>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"#F8FAFC"}}>
            {["Utilisateur","Rôle","Région","Statut","Permissions","Dernière connexion","Actions"].map(h=>(
              <th key={h} style={{textAlign:"left",padding:"10px 16px",fontSize:11,fontWeight:600,color:"var(--bn-muted)",borderBottom:"1px solid var(--bn-border)",textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map((u,i)=>{
              const rs=ROLE_STYLE[u.role]||{bg:"#F1F5F9",color:"#475569"};
              const ss=STATUS_STYLE[u.status];
              return(
              <tr key={u.id} style={{background:i%2===0?"white":"#FAFBFD",borderBottom:"1px solid #F1F5F9"}}>
                <td style={{padding:"13px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${rs.color}33,${rs.color}66)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:rs.color,flexShrink:0}}>
                      {u.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                    </div>
                    <div>
                      <p style={{fontSize:13,fontWeight:600,color:"var(--bn-text)",lineHeight:1}}>{u.name}</p>
                      <p style={{fontSize:11,color:"var(--bn-muted)",marginTop:2}}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{padding:"13px 16px"}}><span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:99,background:rs.bg,color:rs.color}}>{u.role}</span></td>
                <td style={{padding:"13px 16px",fontSize:12,color:"var(--bn-muted)"}}>{u.region}</td>
                <td style={{padding:"13px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:ss.dot}}/>
                    <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:99,background:ss.bg,color:ss.color}}>{u.status}</span>
                  </div>
                </td>
                <td style={{padding:"13px 16px"}}>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {u.permissions.slice(0,4).map(p=>{
                      const pm=ALL_PERMS.find(x=>x.key===p);
                      return pm?<span key={p} style={{fontSize:9,fontWeight:600,padding:"2px 6px",borderRadius:99,background:`${pm.color}18`,color:pm.color}}>{pm.label}</span>:null;
                    })}
                    {u.permissions.length>4&&<span style={{fontSize:9,color:"var(--bn-muted)"}}>+{u.permissions.length-4}</span>}
                  </div>
                </td>
                <td style={{padding:"13px 16px",fontSize:11,color:"var(--bn-muted)",whiteSpace:"nowrap"}}>{u.lastLogin}</td>
                <td style={{padding:"13px 16px"}}>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>openView(u)} style={{padding:"5px 10px",borderRadius:7,border:"1px solid var(--bn-border)",background:"transparent",cursor:"pointer",fontSize:11,color:"var(--bn-muted)"}}>Voir</button>
                    <button onClick={()=>openEdit(u)} style={{padding:"5px 10px",borderRadius:7,border:"1px solid #1A6FD4",background:"#EBF4FF",cursor:"pointer",fontSize:11,color:"#1A6FD4",fontWeight:600}}>Éditer</button>
                    <button onClick={()=>toggleStatus(u.id)} style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${u.status==="Actif"?"#F59E0B":"#10B981"}`,background:u.status==="Actif"?"#FEF3C7":"#D1FAE5",cursor:"pointer",fontSize:11,color:u.status==="Actif"?"#92400E":"#065F46",fontWeight:600}}>
                      {u.status==="Actif"?"Désactiver":"Activer"}
                    </button>
                    {u.role!=="Administrateur"&&<button onClick={()=>deleteUser(u.id)} style={{padding:"5px 10px",borderRadius:7,border:"1px solid #EF4444",background:"#FEE2E2",cursor:"pointer",fontSize:11,color:"#991B1B",fontWeight:600}}>✕</button>}
                  </div>
                </td>
              </tr>);
            })}
          </tbody>
        </table>
        {filtered.length===0&&<div style={{padding:40,textAlign:"center",color:"var(--bn-muted)",fontSize:13}}>Aucun utilisateur trouvé.</div>}
      </div>

      {/* Modal */}
      {(modalMode==="add"||modalMode==="edit")&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:20}} onClick={e=>{if(e.target===e.currentTarget)setModalMode(null)}}>
          <div style={{background:"white",borderRadius:20,padding:32,width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <p style={{fontSize:18,fontWeight:700,color:"var(--bn-text)"}}>{modalMode==="add"?"Nouvel utilisateur":"Modifier l'utilisateur"}</p>
              <button onClick={()=>setModalMode(null)} style={{width:32,height:32,borderRadius:"50%",border:"1px solid var(--bn-border)",background:"transparent",cursor:"pointer",fontSize:16,color:"var(--bn-muted)"}}>×</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {[{label:"Nom complet *",key:"name",type:"text"},{label:"Email *",key:"email",type:"email"}].map(f=>(
                <div key={f.key}>
                  <label style={{fontSize:12,fontWeight:600,color:"var(--bn-muted)",display:"block",marginBottom:6}}>{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                    style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid var(--bn-border)",fontSize:13,color:"var(--bn-text)"}}/>
                </div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:"var(--bn-muted)",display:"block",marginBottom:6}}>Rôle</label>
                  <select value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}
                    style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid var(--bn-border)",fontSize:13,color:"var(--bn-text)",cursor:"pointer"}}>
                    {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:"var(--bn-muted)",display:"block",marginBottom:6}}>Région</label>
                  <select value={form.region} onChange={e=>setForm(p=>({...p,region:e.target.value}))}
                    style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid var(--bn-border)",fontSize:13,color:"var(--bn-text)",cursor:"pointer"}}>
                    {REGIONS.map(r=><option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:600,color:"var(--bn-muted)",display:"block",marginBottom:8}}>Permissions</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {ALL_PERMS.map(p=>{
                    const active=form.permissions.includes(p.key);
                    return(
                    <button key={p.key} onClick={()=>togglePerm(p.key)}
                      style={{padding:"6px 14px",borderRadius:99,border:`1px solid ${active?p.color:p.color+"44"}`,background:active?`${p.color}18`:"transparent",color:active?p.color:"#94A3B8",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}>
                      {active?"✓ ":""}{p.label}
                    </button>);
                  })}
                </div>
              </div>
              <div style={{display:"flex",gap:10,marginTop:8}}>
                <button onClick={()=>setModalMode(null)} style={{flex:1,padding:"11px",borderRadius:10,border:"1px solid var(--bn-border)",background:"transparent",cursor:"pointer",fontSize:13,color:"var(--bn-muted)"}}>Annuler</button>
                <button onClick={saveUser} style={{flex:2,padding:"11px",borderRadius:10,background:"linear-gradient(135deg,#1A6FD4,#0284C7)",color:"white",border:"none",cursor:"pointer",fontSize:13,fontWeight:600}}>
                  {modalMode==="add"?"Créer l'utilisateur":"Enregistrer les modifications"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View modal */}
      {modalMode==="view"&&selected&&(()=>{
        const rs=ROLE_STYLE[selected.role]||{bg:"#F1F5F9",color:"#475569"};
        const ss=STATUS_STYLE[selected.status];
        return(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:20}} onClick={e=>{if(e.target===e.currentTarget)setModalMode(null)}}>
          <div style={{background:"white",borderRadius:20,padding:32,width:"100%",maxWidth:440,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
              <p style={{fontSize:18,fontWeight:700}}>Profil utilisateur</p>
              <button onClick={()=>setModalMode(null)} style={{width:32,height:32,borderRadius:"50%",border:"1px solid var(--bn-border)",background:"transparent",cursor:"pointer",fontSize:16,color:"var(--bn-muted)"}}>×</button>
            </div>
            <div style={{textAlign:"center",padding:"0 0 20px",borderBottom:"1px solid var(--bn-border)"}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:`linear-gradient(135deg,${rs.color}33,${rs.color}88)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:rs.color,margin:"0 auto 12px"}}>
                {selected.name.split(" ").map((n:string)=>n[0]).join("").slice(0,2)}
              </div>
              <p style={{fontSize:16,fontWeight:700,color:"var(--bn-text)"}}>{selected.name}</p>
              <p style={{fontSize:12,color:"var(--bn-muted)",marginTop:4}}>{selected.email}</p>
              <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:10}}>
                <span style={{fontSize:11,fontWeight:600,padding:"4px 12px",borderRadius:99,background:rs.bg,color:rs.color}}>{selected.role}</span>
                <span style={{fontSize:11,fontWeight:600,padding:"4px 12px",borderRadius:99,background:ss.bg,color:ss.color}}>{selected.status}</span>
              </div>
            </div>
            <div style={{padding:"16px 0",display:"flex",flexDirection:"column",gap:10}}>
              {[{label:"Région",value:selected.region},{label:"Dernière connexion",value:selected.lastLogin}].map(r=>(
                <div key={r.label} style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
                  <span style={{color:"var(--bn-muted)"}}>{r.label}</span>
                  <span style={{fontWeight:500,color:"var(--bn-text)"}}>{r.value}</span>
                </div>
              ))}
              <div>
                <p style={{fontSize:12,color:"var(--bn-muted)",marginBottom:8}}>Permissions ({selected.permissions.length})</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {selected.permissions.map((p:string)=>{
                    const pm=ALL_PERMS.find(x=>x.key===p);
                    return pm?<span key={p} style={{fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:99,background:`${pm.color}18`,color:pm.color}}>{pm.label}</span>:null;
                  })}
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:4}}>
              <button onClick={()=>openEdit(selected)} style={{flex:1,padding:"10px",borderRadius:10,background:"linear-gradient(135deg,#1A6FD4,#0284C7)",color:"white",border:"none",cursor:"pointer",fontSize:13,fontWeight:600}}>Modifier</button>
            </div>
          </div>
        </div>);
      })()}
    </div>
  );
}
