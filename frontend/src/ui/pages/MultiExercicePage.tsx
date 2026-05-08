import { useState } from "react";
const DATA = [
  {year:2022,budget:3200,exec:3010,taux:94.1,recettes:2980,marches:180},
  {year:2023,budget:3600,exec:3350,taux:93.1,recettes:3280,marches:205},
  {year:2024,budget:4100,exec:3690,taux:90.0,recettes:3580,marches:220},
  {year:2025,budget:4300,exec:3870,taux:90.0,recettes:3820,marches:238},
  {year:2026,budget:4500,exec:2577,taux:57.3,recettes:2210,marches:247,current:true as const},
];
export function MultiExercicePage(){
  const [metric,setMetric] = useState<"budget"|"taux"|"recettes">("budget");
  const vals = DATA.map(d=>metric==="budget"?d.budget:metric==="taux"?d.taux:d.recettes);
  const maxV = Math.max(...vals);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div><h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Comparaison Multi-Exercices 2022-2026</h1>
      <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Evolution budgetaire sur 5 exercices - Analyse tendances</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
        {DATA.map(d=>(
          <div key={d.year} style={{background:(d as any).current?"linear-gradient(135deg,#1A6FD4,#0284C7)":"white",borderRadius:12,padding:"14px 16px",border:"1px solid var(--bn-border)"}}>
            <p style={{fontSize:10,color:(d as any).current?"rgba(255,255,255,0.7)":"var(--bn-muted)",marginBottom:4}}>{d.year}{(d as any).current?" (en cours)":""}</p>
            <p style={{fontSize:18,fontWeight:700,color:(d as any).current?"white":"var(--bn-text)"}}>{d.budget.toLocaleString("fr-SN")} M</p>
            <p style={{fontSize:11,color:(d as any).current?"rgba(255,255,255,0.8)":d.taux>88?"#10B981":"#F59E0B",marginTop:4}}>{d.taux}% exec</p>
          </div>))}
      </div>
      <div style={{display:"flex",gap:6}}>
        {(["budget","taux","recettes"] as const).map(m=>(
          <button key={m} onClick={()=>setMetric(m)} style={{padding:"6px 14px",borderRadius:8,border:"0.5px solid var(--bn-border)",background:metric===m?"#0D2B4B":"transparent",color:metric===m?"white":"var(--bn-muted)",cursor:"pointer",fontSize:12}}>
            {m==="budget"?"Budget vote":m==="taux"?"Taux execution":"Recettes"}
          </button>))}
      </div>
      <div style={{background:"white",borderRadius:16,padding:24,border:"1px solid var(--bn-border)"}}>
        <p style={{fontSize:14,fontWeight:600,marginBottom:16}}>Evolution {metric} 2022-2026</p>
        <div style={{display:"flex",alignItems:"flex-end",gap:16,height:180,padding:"0 10px"}}>
          {DATA.map((d,i)=>{
            const v = vals[i];
            const h = (v/maxV)*160;
            return(
              <div key={d.year} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <p style={{fontSize:9,color:"var(--bn-muted)",fontWeight:500}}>
                  {metric==="taux"?v+"%":(v/1000).toFixed(1)+"G"}
                </p>
                <div style={{width:"100%",height:h,background:(d as any).current?"#1A6FD4":"#C4B5FD",borderRadius:"4px 4px 0 0"}}/>
                <p style={{fontSize:9,color:"var(--bn-muted)"}}>{d.year}</p>
              </div>);})}
        </div>
        <div style={{marginTop:12,padding:"8px 12px",background:"#F0F4FA",borderRadius:8}}>
          <p style={{fontSize:11,color:"var(--bn-text)"}}>Croissance annuelle moyenne : <strong>+8,9%/an</strong>. Projection fin 2026 : <strong>4 320 M FCFA</strong> (96% taux execution prevu).</p>
        </div>
      </div>
      <div style={{background:"white",borderRadius:16,padding:20,border:"1px solid var(--bn-border)"}}>
        <p style={{fontSize:14,fontWeight:600,marginBottom:12}}>Tableau synthetique</p>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{background:"#F8FAFC"}}>
            {["Indicateur","2022","2023","2024","2025","2026 (ytd)","Tendance"].map(h=>(
              <th key={h} style={{textAlign:h==="Indicateur"?"left":"right",padding:"7px 10px",fontSize:11,fontWeight:600,color:"var(--bn-muted)",borderBottom:"1px solid var(--bn-border)",textTransform:"uppercase"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {[
              {ind:"Budget vote (M FCFA)",vals:DATA.map(d=>d.budget.toLocaleString("fr-SN")),trend:"+8,9%/an"},
              {ind:"Taux execution (%)",vals:DATA.map(d=>d.taux+"%"),trend:"Stable"},
              {ind:"Recettes (M FCFA)",vals:DATA.map(d=>d.recettes.toLocaleString("fr-SN")),trend:"+7,5%/an"},
              {ind:"Marches DCMP",vals:DATA.map(d=>d.marches.toString()),trend:"+8,2%/an"},
            ].map((row,i)=>(
              <tr key={i} style={{borderBottom:"0.5px solid #F1F5F9",background:i%2===0?"white":"#FAFBFD"}}>
                <td style={{padding:"7px 10px",fontWeight:500}}>{row.ind}</td>
                {row.vals.map((v,j)=>(
                  <td key={j} style={{padding:"7px 10px",textAlign:"right",color:(DATA[j] as any).current?"#1A6FD4":"var(--bn-text)",fontWeight:(DATA[j] as any).current?600:400}}>{v}</td>
                ))}
                <td style={{padding:"7px 10px",textAlign:"right",color:"#10B981",fontWeight:500}}>{row.trend}</td>
              </tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
