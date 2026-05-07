
const users = [
  {id:1,name:"Mamadou Diallo",email:"admin@budgetnew.sn",role:"Administrateur",active:true,last:"2026-05-07"},
  {id:2,name:"Aïssatou Ndiaye",email:"ordo@budgetnew.sn",role:"Ordonnateur",active:true,last:"2026-05-06"},
  {id:3,name:"Ibrahima Sow",email:"analyste@budgetnew.sn",role:"Analyste",active:true,last:"2026-05-05"},
  {id:4,name:"Fatou Diop",email:"cpt@budgetnew.sn",role:"Comptable",active:true,last:"2026-05-04"},
  {id:5,name:"Cheikh Gaye",email:"viewer@budgetnew.sn",role:"Lecteur",active:false,last:"2026-04-20"},
];
const ROLE_STYLE: Record<string,{bg:string,color:string}> = {
  "Administrateur":{bg:"#FEE2E2",color:"#991B1B"},
  "Ordonnateur":{bg:"#EBF4FF",color:"#1E40AF"},
  "Analyste":{bg:"#EDE9FE",color:"#4C1D95"},
  "Comptable":{bg:"#D1FAE5",color:"#065F46"},
  "Lecteur":{bg:"#F1F5F9",color:"#475569"},
};
export function AdminPage(){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <div><h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Administration RBAC</h1>
      <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Gestion des utilisateurs et des rôles — 4 profils</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {label:"Utilisateurs actifs",value:"4",color:"#10B981",bg:"#D1FAE5"},
          {label:"Administrateurs",value:"1",color:"#EF4444",bg:"#FEE2E2"},
          {label:"Ordonnateurs",value:"1",color:"#1A6FD4",bg:"#EBF4FF"},
          {label:"Délégations actives",value:"2",color:"#7C3AED",bg:"#EDE9FE"},
        ].map(m=>(
          <div key={m.label} style={{background:m.bg,borderRadius:12,padding:"14px 16px"}}>
            <p style={{fontSize:11,color:m.color,marginBottom:4}}>{m.label}</p>
            <p style={{fontSize:22,fontWeight:700,color:m.color}}>{m.value}</p>
          </div>
        ))}
      </div>
      <div style={{background:"white",borderRadius:16,padding:24,border:"1px solid var(--bn-border)"}}>
        <p style={{fontSize:15,fontWeight:600,marginBottom:16}}>Utilisateurs</p>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"#F8FAFC"}}>
            {["Nom","Email","Rôle","Statut","Dernière connexion"].map(h=>(
              <th key={h} style={{textAlign:"left",padding:"10px 12px",fontSize:11,fontWeight:600,color:"var(--bn-muted)",borderBottom:"1px solid var(--bn-border)",textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {users.map((u,i)=>{
              const rs=ROLE_STYLE[u.role]||{bg:"#F1F5F9",color:"#475569"};
              return(
              <tr key={u.id} style={{background:i%2===0?"white":"#FAFBFD",borderBottom:"1px solid #F1F5F9"}}>
                <td style={{padding:"12px",fontSize:13,fontWeight:600}}>{u.name}</td>
                <td style={{padding:"12px",fontSize:12,color:"#1A6FD4"}}>{u.email}</td>
                <td style={{padding:"12px"}}><span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:99,background:rs.bg,color:rs.color}}>{u.role}</span></td>
                <td style={{padding:"12px"}}><span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:99,background:u.active?"#D1FAE5":"#F1F5F9",color:u.active?"#065F46":"#94A3B8"}}>{u.active?"Actif":"Inactif"}</span></td>
                <td style={{padding:"12px",fontSize:11,color:"var(--bn-muted)"}}>{u.last}</td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
