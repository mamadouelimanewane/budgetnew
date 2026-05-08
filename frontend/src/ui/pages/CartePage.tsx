import { useState } from "react";
const REGIONS = [
  {name:"Dakar",lat:14.72,lng:-17.47,amount:1450,pop:3700000},
  {name:"Thies",lat:14.79,lng:-16.93,amount:620,pop:1900000},
  {name:"Diourbel",lat:14.65,lng:-16.23,amount:180,pop:1650000},
  {name:"Saint-Louis",lat:16.02,lng:-16.49,amount:290,pop:1000000},
  {name:"Fatick",lat:14.34,lng:-16.41,amount:140,pop:900000},
  {name:"Kaolack",lat:14.15,lng:-16.07,amount:210,pop:1100000},
  {name:"Kaffrine",lat:14.10,lng:-15.55,amount:95,pop:600000},
  {name:"Louga",lat:15.62,lng:-16.22,amount:160,pop:900000},
  {name:"Matam",lat:15.66,lng:-13.26,amount:110,pop:600000},
  {name:"Tambacounda",lat:13.77,lng:-13.67,amount:130,pop:700000},
  {name:"Kedougou",lat:12.56,lng:-12.17,amount:75,pop:250000},
  {name:"Kolda",lat:12.90,lng:-14.94,amount:100,pop:750000},
  {name:"Ziguinchor",lat:12.57,lng:-16.27,amount:145,pop:600000},
  {name:"Sedhiou",lat:12.71,lng:-15.56,amount:80,pop:450000},
];
const W=500,H=420,lngMin=-17.8,lngMax=-11.8,latMin=12.0,latMax=16.8;
function proj(lat:number,lng:number){return{x:((lng-lngMin)/(lngMax-lngMin))*(W-60)+30,y:((latMax-lat)/(latMax-latMin))*(H-60)+30};}
function col(v:number){if(v>800)return"#0D2B4B";if(v>400)return"#185FA5";if(v>200)return"#1A6FD4";if(v>100)return"#378ADD";return"#85B7EB";}
export function CartePage(){
  const [sel,setSel]=useState<typeof REGIONS[0]|null>(null);
  const total=REGIONS.reduce((s,r)=>s+r.amount,0);
  const maxA=Math.max(...REGIONS.map(r=>r.amount));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div><h1 style={{fontSize:22,fontWeight:700,color:"var(--bn-text)",margin:0}}>Geo-Dashboard - 14 Regions du Senegal</h1>
      <p style={{fontSize:13,color:"var(--bn-muted)",marginTop:4}}>Repartition des depenses par region - Exercice 2026</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[{l:"Total regions",v:total+" M FCFA",c:"#1A6FD4",bg:"#EBF4FF"},{l:"Plus dotee",v:"Dakar",c:"#0D2B4B",bg:"#F0F4FA"},{l:"Sous-dotee",v:"Kedougou",c:"#EF4444",bg:"#FEE2E2"},{l:"Indice equite",v:"0,64/1,0",c:"#F59E0B",bg:"#FEF3C7"}].map(m=>(
          <div key={m.l} style={{background:m.bg,borderRadius:10,padding:"10px 14px"}}><p style={{fontSize:10,color:m.c,marginBottom:3}}>{m.l}</p><p style={{fontSize:14,fontWeight:600,color:m.c}}>{m.v}</p></div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:16}}>
        <div style={{background:"white",borderRadius:16,padding:16,border:"1px solid var(--bn-border)"}}>
          <p style={{fontSize:13,fontWeight:600,marginBottom:10}}>Carte des depenses - Cliquez une region</p>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{background:"#EBF4FF",borderRadius:10,border:"1px solid #BFDBFE"}}>
            <rect width={W} height={H} fill="#EBF4FF" rx="10"/>
            {REGIONS.map(r=>{const p=proj(r.lat,r.lng);const rad=Math.max(10,Math.sqrt(r.amount)*1.3);const isSel=sel?.name===r.name;return(
              <g key={r.name} onClick={()=>setSel(sel?.name===r.name?null:r)} style={{cursor:"pointer"}}>
                <circle cx={p.x} cy={p.y} r={isSel?rad+5:rad} fill={col(r.amount)} opacity={0.75} stroke={isSel?"#0D2B4B":"white"} strokeWidth={isSel?2.5:1}/>
                <text x={p.x} y={p.y+1} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="white" fontWeight="600">{r.name.slice(0,3)}</text>
              </g>);})}
          </svg>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {sel?(
            <div style={{background:"white",borderRadius:14,padding:18,border:"1px solid #1A6FD4",flex:1}}>
              <p style={{fontSize:15,fontWeight:600,marginBottom:14,color:"#0D2B4B"}}>{sel.name}</p>
              {[{l:"Budget alloue",v:sel.amount+" M FCFA"},{l:"Part nationale",v:((sel.amount/total)*100).toFixed(1)+"%"},{l:"Population",v:sel.pop.toLocaleString("fr-SN")+" hab."},{l:"Budget/habitant",v:Math.round(sel.amount*1000000/sel.pop).toLocaleString("fr-SN")+" FCFA"}].map(r=>(
                <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"0.5px solid var(--bn-border)",fontSize:12}}>
                  <span style={{color:"var(--bn-muted)"}}>{r.l}</span><span style={{fontWeight:600}}>{r.v}</span>
                </div>))}
            </div>
          ):(
            <div style={{background:"var(--bn-bg)",borderRadius:14,padding:30,border:"1px dashed var(--bn-border)",textAlign:"center",flex:1}}>
              <p style={{fontSize:12,color:"var(--bn-muted)"}}>Cliquez une bulle pour les details</p>
            </div>
          )}
          <div style={{background:"white",borderRadius:14,padding:14,border:"1px solid var(--bn-border)"}}>
            <p style={{fontSize:12,fontWeight:600,marginBottom:8}}>Top 5 regions</p>
            {[...REGIONS].sort((a,b)=>b.amount-a.amount).slice(0,5).map((r,i)=>(
              <div key={r.name} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:"0.5px solid var(--bn-border)"}}>
                <span style={{fontSize:10,fontWeight:700,color:"#1A6FD4",width:14}}>{i+1}</span>
                <span style={{fontSize:11,flex:1}}>{r.name}</span>
                <div style={{width:40,height:4,background:"#F1F5F9",borderRadius:99}}><div style={{height:4,width:(r.amount/maxA*100)+"%",background:col(r.amount),borderRadius:99}}/></div>
                <span style={{fontSize:10,fontWeight:600,minWidth:44,textAlign:"right"}}>{r.amount} M</span>
              </div>))}
          </div>
        </div>
      </div>
    </div>
  );
}
