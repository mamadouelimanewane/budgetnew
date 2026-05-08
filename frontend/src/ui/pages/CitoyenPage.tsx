export function CitoyenPage(){
  const mins=[
    {nom:"Economie et Finances",budget:4500,exec:57.3,color:"#1A6FD4"},
    {nom:"Education Nationale",budget:3200,exec:90.0,color:"#EF4444"},
    {nom:"Sante Publique",budget:2100,exec:70.0,color:"#10B981"},
    {nom:"Infrastructure",budget:2800,exec:70.0,color:"#F59E0B"},
    {nom:"Agriculture",budget:1800,exec:40.0,color:"#7C3AED"},
    {nom:"Securite Interieure",budget:1400,exec:70.0,color:"#0E9E8A"},
  ];
  const marches=[
    {ref:"AO-2026-001",objet:"Construction hopital regional Kaolack",montant:2800,statut:"Attribue",benef:"BTP Senegal SA"},
    {ref:"AO-2026-002",objet:"Fourniture manuels scolaires 2026-2027",montant:450,statut:"En cours",benef:"--"},
    {ref:"AO-2026-003",objet:"Maintenance parc informatique etat",montant:180,statut:"Evaluation",benef:"--"},
    {ref:"AO-2026-004",objet:"Renouvellement flotte vehicules officiels",montant:320,statut:"Publie",benef:"--"},
    {ref:"AO-2026-005",objet:"Extension reseau electrique zones rurales",montant:1200,statut:"Attribue",benef:"SENELEC"},
  ];
  const SS: Record<string,{bg:string,c:string}> = {
    "Attribue":{bg:"#D1FAE5",c:"#065F46"},
    "En cours":{bg:"#FEF3C7",c:"#92400E"},
    "Evaluation":{bg:"#EDE9FE",c:"#4C1D95"},
    "Publie":{bg:"#EBF4FF",c:"#1E40AF"},
  };
  return(
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <div style={{background:"linear-gradient(135deg,#0D2B4B,#1A3352)",borderRadius:16,padding:24,color:"white"}}>
        <p style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginBottom:4}}>REPUBLIQUE DU SENEGAL - BUDGET OPEN DATA</p>
        <h1 style={{fontSize:22,fontWeight:700,margin:0}}>Portail Citoyen - Transparence Budgetaire</h1>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginTop:4}}>Conformite ITIE - Open Government Partnership - 2026</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:20}}>
          {[{l:"Budget total vote",v:"15 800 M FCFA"},{l:"Taux execution",v:"57,3%"},{l:"Marches publics",v:"247 marches"},{l:"Derniere MAJ",v:"Aujourd hui"}].map(m=>(
            <div key={m.l} style={{background:"rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 14px"}}>
              <p style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginBottom:4}}>{m.l}</p>
              <p style={{fontSize:15,fontWeight:600,color:"white"}}>{m.v}</p>
            </div>))}
        </div>
      </div>
      <div style={{background:"white",borderRadius:16,padding:24,border:"1px solid var(--bn-border)"}}>
        <p style={{fontSize:15,fontWeight:600,marginBottom:16}}>Execution par ministere</p>
        {mins.map(m=>(
          <div key={m.nom} style={{marginBottom:14,padding:12,borderRadius:10,background:"var(--bn-bg)",border:"0.5px solid var(--bn-border)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <p style={{fontSize:13,fontWeight:600}}>{m.nom}</p>
              <div style={{textAlign:"right"}}>
                <p style={{fontSize:18,fontWeight:700,color:m.exec>85?"#EF4444":m.exec>70?"#F59E0B":"#10B981"}}>{m.exec}%</p>
                <p style={{fontSize:10,color:"var(--bn-muted)"}}>{m.budget.toLocaleString("fr-SN")} M FCFA</p>
              </div>
            </div>
            <div style={{height:7,background:"#E2E8F4",borderRadius:99,overflow:"hidden"}}>
              <div style={{height:7,width:m.exec+"%",background:m.exec>85?"#EF4444":m.exec>70?"#F59E0B":m.color,borderRadius:99}}/>
            </div>
          </div>))}
      </div>
      <div style={{background:"white",borderRadius:16,padding:24,border:"1px solid var(--bn-border)"}}>
        <p style={{fontSize:15,fontWeight:600,marginBottom:14}}>Marches publics - Registre ouvert</p>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"#F8FAFC"}}>
            {["Reference","Objet","Montant (M)","Statut","Beneficiaire"].map(h=>(
              <th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:11,fontWeight:600,color:"var(--bn-muted)",borderBottom:"1px solid var(--bn-border)",textTransform:"uppercase"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {marches.map((m,i)=>(
              <tr key={m.ref} style={{borderBottom:"0.5px solid #F1F5F9",background:i%2===0?"white":"#FAFBFD"}}>
                <td style={{padding:"9px 12px",fontSize:12,fontWeight:700,color:"#1A6FD4"}}>{m.ref}</td>
                <td style={{padding:"9px 12px",fontSize:12,maxWidth:180}}>{m.objet}</td>
                <td style={{padding:"9px 12px",fontSize:13,fontWeight:600}}>{m.montant.toLocaleString("fr-SN")}</td>
                <td style={{padding:"9px 12px"}}><span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,background:SS[m.statut]?.bg,color:SS[m.statut]?.c}}>{m.statut}</span></td>
                <td style={{padding:"9px 12px",fontSize:12,color:"var(--bn-muted)"}}>{m.benef}</td>
              </tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
