
const plans = [
  {id:1,year:2026,name:"Budget Général 2026",total:4500000000,status:"Actif"},
  {id:2,year:2025,name:"Budget Général 2025",total:4100000000,status:"Clôturé"},
  {id:3,year:2024,name:"Budget Général 2024",total:3800000000,status:"Clôturé"},
];
const lines = [
  {code:"21",label:"Personnel",level:"Chapitre",alloue:1800000000,consomme:1620000000},
  {code:"211",label:"Salaires permanents",level:"Article",alloue:1200000000,consomme:1100000000},
  {code:"2111",label:"Salaires — DGF",level:"Paragraphe",alloue:400000000,consomme:380000000},
  {code:"22",label:"Biens et services",level:"Chapitre",alloue:900000000,consomme:540000000},
  {code:"221",label:"Fournitures de bureau",level:"Article",alloue:120000000,consomme:85000000},
  {code:"23",label:"Transferts",level:"Chapitre",alloue:600000000,consomme:210000000},
  {code:"25",label:"Investissements",level:"Chapitre",alloue:1200000000,consomme:207000000},
];
function fmt(n:number){return(n/1000000).toLocaleString("fr-SN",{maximumFractionDigits:0})+" M";}
export function BudgetPage(){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <div><h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Plans Budgétaires</h1>
      <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Nomenclature UEMOA — Chapitre / Article / Paragraphe</p></div>
      <div style={{display:"flex",gap:12}}>
        {plans.map(p=>(
          <div key={p.id} style={{flex:1,background:p.status==="Actif"?"linear-gradient(135deg,#0D2B4B,#1A6FD4)":"white",borderRadius:14,padding:"16px 20px",border:"1px solid var(--bn-border)",cursor:"pointer"}}>
            <p style={{fontSize:11,fontWeight:600,color:p.status==="Actif"?"rgba(255,255,255,0.7)":"var(--bn-muted)",marginBottom:6}}>{p.year}</p>
            <p style={{fontSize:14,fontWeight:600,color:p.status==="Actif"?"white":"var(--bn-text)",marginBottom:8}}>{p.name}</p>
            <p style={{fontSize:18,fontWeight:700,color:p.status==="Actif"?"white":"var(--bn-text)"}}>{fmt(p.total)}</p>
            <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,marginTop:8,display:"inline-block",background:p.status==="Actif"?"rgba(16,185,129,0.2)":"#F1F5F9",color:p.status==="Actif"?"#10B981":"#94A3B8"}}>{p.status}</span>
          </div>
        ))}
      </div>
      <div style={{background:"white",borderRadius:16,padding:24,border:"1px solid var(--bn-border)"}}>
        <p style={{fontSize:15,fontWeight:600,color:"var(--bn-text)",marginBottom:16}}>Nomenclature budgétaire 2026</p>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:"#F8FAFC"}}>
            {["Code","Intitulé","Niveau","Alloué","Consommé","Taux","Barre"].map(h=>(
              <th key={h} style={{textAlign:"left",padding:"10px 12px",fontSize:11,fontWeight:600,color:"var(--bn-muted)",borderBottom:"1px solid var(--bn-border)",textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {lines.map((l,i)=>{
              const taux=Math.round(l.consomme/l.alloue*100);
              const indent=l.level==="Article"?16:l.level==="Paragraphe"?32:0;
              const color=taux>90?"#EF4444":taux>70?"#F59E0B":"#10B981";
              return(
              <tr key={l.code} style={{background:i%2===0?"white":"#FAFBFD",borderBottom:"1px solid #F1F5F9"}}>
                <td style={{padding:"10px 12px",fontSize:12,fontFamily:"monospace",fontWeight:600,color:"#1A6FD4"}}>{l.code}</td>
                <td style={{padding:"10px 12px",fontSize:13,paddingLeft:12+indent}}>{l.label}</td>
                <td style={{padding:"10px 12px"}}><span style={{fontSize:10,padding:"2px 8px",borderRadius:99,background:l.level==="Chapitre"?"#EBF4FF":l.level==="Article"?"#EDE9FE":"#F0FDF4",color:l.level==="Chapitre"?"#1E40AF":l.level==="Article"?"#4C1D95":"#065F46",fontWeight:600}}>{l.level}</span></td>
                <td style={{padding:"10px 12px",fontSize:12,color:"var(--bn-text)"}}>{fmt(l.alloue)}</td>
                <td style={{padding:"10px 12px",fontSize:12,color:"var(--bn-text)"}}>{fmt(l.consomme)}</td>
                <td style={{padding:"10px 12px",fontSize:12,fontWeight:700,color}}>{taux}%</td>
                <td style={{padding:"10px 12px",width:100}}><div style={{height:6,background:"#F1F5F9",borderRadius:99}}><div style={{height:6,borderRadius:99,width:`${taux}%`,background:color}}/></div></td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
