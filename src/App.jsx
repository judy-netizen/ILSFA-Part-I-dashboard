import { useState, useMemo } from "react";

const ITEMS = ["Site Control Doc","Single-Line Diagram","Interconnection Agreement","Environmental Assessment","Proof of Insurance","Executed PPA / Contract","Incentive Application","W-9 / Tax Forms"];

const STATUS = {
  pending: { label: "Pending Review", color: "#8B7355", bg: "#FDF6EC", border: "#E8D5B0" },
  in_review: { label: "In Review", color: "#1A5F9E", bg: "#EBF4FF", border: "#BDDAF5" },
  approved: { label: "Approved", color: "#1A7A4A", bg: "#EBF9F1", border: "#A8E4C2" },
  flagged: { label: "Flagged", color: "#B03A2E", bg: "#FEF0EF", border: "#F5C0BC" },
};

const DATA = [
  { id:"ILSFA-0001", name:"Southside Community Solar", customer:"Maria Reyes", agent:"D. Alvarez", pm:"M. Torres", status:"approved", docs:[1,1,1,1,1,1,1,1], comment:"All documents verified." },
  { id:"ILSFA-0002", name:"Pilsen Rooftop Array", customer:"Jorge Mendez", agent:"S. Lee", pm:"J. Kim", status:"flagged", docs:[1,0,1,1,0,1,1,1], comment:"Missing single-line and insurance." },
  { id:"ILSFA-0003", name:"Englewood Block 14", customer:"Tanya Brown", agent:"D. Alvarez", pm:"M. Torres", status:"in_review", docs:[1,1,0,1,1,0,1,0], comment:"" },
  { id:"ILSFA-0004", name:"Austin Neighborhood Solar", customer:"Kevin Park", agent:"R. Patel", pm:"", status:"pending", docs:[0,0,0,0,0,0,0,0], comment:"" },
  { id:"ILSFA-0005", name:"Bronzeville Commons", customer:"Lisa Chen", agent:"S. Lee", pm:"R. Patel", status:"approved", docs:[1,1,1,1,1,1,1,1], comment:"Approved. Fast turnaround." },
  { id:"ILSFA-0006", name:"Woodlawn Solar Hub", customer:"Andre Williams", agent:"D. Alvarez", pm:"J. Kim", status:"flagged", docs:[1,1,1,0,1,1,0,1], comment:"Assessment expired." },
  { id:"ILSFA-0007", name:"Hyde Park Carport", customer:"Nina Okonkwo", agent:"R. Patel", pm:"M. Torres", status:"in_review", docs:[1,1,1,1,1,1,1,0], comment:"Waiting on W-9." },
  { id:"ILSFA-0008", name:"Lawndale Block Grant", customer:"Sam Rivera", agent:"S. Lee", pm:"", status:"pending", docs:[1,0,0,0,1,0,0,0], comment:"" },
];

function Pill({ status }) {
  const s = STATUS[status];
  return <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:500, border:`1px solid ${s.border}`, background:s.bg, color:s.color, whiteSpace:"nowrap" }}><span style={{ width:5, height:5, borderRadius:"50%", background:s.color, display:"inline-block" }}></span>{s.label}</span>;
}

function DocsBar({ docs }) {
  const done = docs.filter(Boolean).length;
  const total = docs.length;
  const pct = (done/total)*100;
  const color = done===total ? "#3A8C58" : done>total/2 ? "#4A8FCC" : "#C8B89A";
  return <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:54, height:5, background:"#F0EDE6", borderRadius:3, overflow:"hidden" }}><div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:3 }}></div></div><span style={{ fontSize:11, color:"#8B8680" }}>{done}/{total}</span></div>;
}

export default function App() {
  const [projects, setProjects] = useState(DATA);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sel, setSel] = useState(null);
  const [eDocs, setEDocs] = useState([]);
  const [eStatus, setEStatus] = useState("");
  const [eComment, setEComment] = useState("");
  const [saved, setSaved] = useState(false);

  const stats = useMemo(() => ({
    total: projects.length,
    approved: projects.filter(p=>p.status==="approved").length,
    in_review: projects.filter(p=>p.status==="in_review").length,
    flagged: projects.filter(p=>p.status==="flagged").length,
    pending: projects.filter(p=>p.status==="pending").length,
    complete: projects.filter(p=>p.docs.every(Boolean)).length,
  }), [projects]);

  const list = useMemo(() => projects.filter(p =>
    (filter==="all" || p.status===filter) &&
    (!search || [p.name,p.id,p.customer,p.agent,p.pm].some(v=>v.toLowerCase().includes(search.toLowerCase())))
  ), [projects, search, filter]);

  function open(p) { setSel(p); setEDocs([...p.docs]); setEStatus(p.status); setEComment(p.comment); setSaved(false); }

  function save() {
    setProjects(prev => prev.map(p => p.id===sel.id ? {...p, docs:eDocs, status:eStatus, comment:eComment} : p));
    setSaved(true);
  }

  const COLORS = ["#3A6EA8","#3A8C58","#8B5E3A","#6B4CA8","#A83A5E","#3A8B8C"];
  function Avatar({ name, size=24 }) {
    const ini = name ? name.split(" ").map(w=>w[0]).slice(0,2).join("") : "?";
    const c = name ? COLORS[name.charCodeAt(0)%COLORS.length] : "#ccc";
    return <div style={{ width:size, height:size, borderRadius:"50%", background:c, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.36, fontWeight:600, color:"#fff", flexShrink:0 }}>{ini}</div>;
  }

  return (
    <div style={{ fontFamily:"'Helvetica Neue',sans-serif", background:"#F7F5F0", minHeight:"100vh" }}>
      <div style={{ background:"#1C1A17", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ color:"#F7F5F0", fontSize:15, fontWeight:600 }}>ILSFA Part I — Submission Review Dashboard</div>
        <div style={{ background:"#2B2925", border:"1px solid #3A3830", borderRadius:8, padding:"4px 12px", display:"flex", alignItems:"center", gap:7 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:"#6FCF8A" }}></div>
          <span style={{ color:"#A8A49E", fontSize:12 }}>Sample Mode</span>
        </div>
      </div>

      <div style={{ padding:"20px 24px", maxWidth:1300, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10, marginBottom:18 }}>
          {[["Total",stats.total,"#4A4640"],["Approved",stats.approved,"#1A7A4A"],["In Review",stats.in_review,"#1A5F9E"],["Flagged",stats.flagged,"#B03A2E"],["Pending",stats.pending,"#8B7355"],["Docs Done",`${stats.complete}/${stats.total}`,"#6B4CA8"]].map(([l,v,a])=>(
            <div key={l} style={{ background:"#fff", border:"1px solid #E8E5DE", borderTop:`3px solid ${a}`, borderRadius:10, padding:"12px 16px" }}>
              <div style={{ fontSize:22, fontWeight:600, color:"#1C1A17" }}>{v}</div>
              <div style={{ fontSize:11, color:"#8B8680", marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ background:"#fff", border:"1px solid #E8E5DE", borderRadius:12, overflow:"hidden" }}>
          <div style={{ padding:"12px 18px", borderBottom:"1px solid #F0EDE6", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search project, customer, agent…" style={{ padding:"6px 12px", border:"1px solid #E0DDD6", borderRadius:7, fontSize:12, width:240, outline:"none" }} />
            <div style={{ display:"flex", background:"#F5F3EE", borderRadius:8, padding:3, gap:2 }}>
              {["all","pending","in_review","approved","flagged"].map(s=>(
                <button key={s} onClick={()=>setFilter(s)} style={{ padding:"5px 12px", borderRadius:6, border:"none", background:filter===s?"#fff":"transparent", fontFamily:"inherit", fontSize:12, fontWeight:500, cursor:"pointer", color:filter===s?"#1C1A17":"#8B8680", boxShadow:filter===s?"0 1px 3px rgba(0,0,0,0.08)":"none" }}>
                  {s==="all"?"All":s==="in_review"?"In Review":s.charAt(0).toUpperCase()+s.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ marginLeft:"auto", fontSize:12, color:"#8B8680" }}>{list.length} projects</div>
          </div>

          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:"#FAFAF7" }}>
                  {["Project ID","Project Name","Customer","Sales Agent","Project Manager","Docs","Status","Comment",""].map(h=>(
                    <th key={h} style={{ padding:"8px 14px", textAlign:"left", fontWeight:500, color:"#8B8680", fontSize:11, borderBottom:"1px solid #F0EDE6", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((p,i)=>(
                  <tr key={p.id} onClick={()=>open(p)} style={{ background:i%2===0?"#fff":"#FDFCFA", borderBottom:"1px solid #F5F3EE", cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#EFEDE7"}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"#FDFCFA"}>
                    <td style={{ padding:"10px 14px", fontFamily:"monospace", fontSize:11, color:"#8B8680" }}>{p.id}</td>
                    <td style={{ padding:"10px 14px", fontWeight:500, color:"#1C1A17", whiteSpace:"nowrap" }}>{p.name}</td>
                    <td style={{ padding:"10px 14px" }}><div style={{ display:"flex", alignItems:"center", gap:7 }}><Avatar name={p.customer} /><span style={{ color:"#5A5652", whiteSpace:"nowrap" }}>{p.customer}</span></div></td>
                    <td style={{ padding:"10px 14px" }}><div style={{ display:"flex", alignItems:"center", gap:7 }}><Avatar name={p.agent} /><span style={{ color:"#5A5652" }}>{p.agent}</span></div></td>
                    <td style={{ padding:"10px 14px" }}>{p.pm ? <div style={{ display:"flex", alignItems:"center", gap:7 }}><Avatar name={p.pm} /><span style={{ color:"#5A5652" }}>{p.pm}</span></div> : <span style={{ color:"#C8C4BA", fontSize:11 }}>Unassigned</span>}</td>
                    <td style={{ padding:"10px 14px" }}><DocsBar docs={p.docs} /></td>
                    <td style={{ padding:"10px 14px" }}><Pill status={p.status} /></td>
                    <td style={{ padding:"10px 14px", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"#8B8680", fontSize:11 }}>{p.comment || "—"}</td>
                    <td style={{ padding:"10px 14px" }}><div style={{ width:20, height:20, borderRadius:4, border:"1px solid #E0DDD6", display:"flex", alignItems:"center", justifyContent:"center", color:"#8B8680", fontSize:10 }}>›</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {sel && (
        <div style={{ position:"fixed", inset:0, background:"rgba(28,26,23,0.45)", display:"flex", justifyContent:"flex-end", zIndex:100 }} onClick={e=>{ if(e.target===e.currentTarget) setSel(null); }}>
          <div style={{ width:480, background:"#fff", height:"100%", overflowY:"auto", display:"flex", flexDirection:"column", boxShadow:"-4px 0 24px rgba(0,0,0,0.12)" }}>
            <div style={{ padding:"16px 22px", borderBottom:"1px solid #F0EDE6", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:11, fontFamily:"monospace", color:"#8B8680", marginBottom:3 }}>{sel.id}</div>
                <div style={{ fontSize:16, fontWeight:600, color:"#1C1A17" }}>{sel.name}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:12 }}>
                  {[["Customer",sel.customer],["Sales Agent",sel.agent],["Project Manager",sel.pm||"Unassigned"]].map(([l,v])=>(
                    <div key={l} style={{ background:"#FAFAF7", border:"1px solid #F0EDE6", borderRadius:8, padding:"8px 10px" }}>
                      <div style={{ fontSize:10, color:"#A8A49E", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:5 }}>{l}</div>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}><Avatar name={v!=="Unassigned"?v:""} size={20} /><span style={{ fontSize:12, fontWeight:500, color:v==="Unassigned"?"#C8C4BA":"#1C1A17" }}>{v}</span></div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={()=>setSel(null)} style={{ width:28, height:28, borderRadius:6, border:"1px solid #E0DDD6", background:"transparent", cursor:"pointer", fontSize:16, color:"#8B8680" }}>×</button>
            </div>

            <div style={{ padding:"18px 22px", display:"flex", flexDirection:"column", gap:18, flex:1 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:500, color:"#8B8680", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>Review Status</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {Object.entries(STATUS).map(([k,s])=>(
                    <button key={k} onClick={()=>setEStatus(k)} style={{ padding:"6px 14px", borderRadius:20, border:`1.5px solid ${eStatus===k?s.color:s.border}`, background:eStatus===k?s.bg:"#fff", color:s.color, fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5 }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:s.color }}></span>{s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize:11, fontWeight:500, color:"#8B8680", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8, display:"flex", justifyContent:"space-between" }}>
                  <span>Document Checklist</span>
                  <span style={{ color: eDocs.every(Boolean)?"#3A8C58":"#8B8680", textTransform:"none" }}>{eDocs.filter(Boolean).length}/{ITEMS.length}</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  {ITEMS.map((item,i)=>(
                    <div key={i} onClick={()=>setEDocs(d=>{ const n=[...d]; n[i]=n[i]?0:1; return n; })} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:8, border:"1px solid #E8E5DE", background:"#fff", cursor:"pointer" }}>
                      <div style={{ width:18, height:18, borderRadius:4, border:`1px solid ${eDocs[i]?"#3A8C58":"#E0DDD6"}`, background:eDocs[i]?"#EBF9F1":"#FAFAF7", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        {eDocs[i]?<span style={{ color:"#3A8C58", fontSize:12, fontWeight:700 }}>✓</span>:null}
                      </div>
                      <span style={{ fontSize:12, color:eDocs[i]?"#1C1A17":"#8B8680", fontWeight:eDocs[i]?500:400 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize:11, fontWeight:500, color:"#8B8680", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>Review Comment</div>
                <textarea value={eComment} onChange={e=>setEComment(e.target.value)} placeholder="Add a note or flag reason…" rows={4} style={{ width:"100%", padding:"10px 12px", border:"1px solid #E0DDD6", borderRadius:8, fontSize:13, color:"#1C1A17", resize:"vertical", background:"#FAFAF7", outline:"none", fontFamily:"inherit", lineHeight:1.6, boxSizing:"border-box" }} />
              </div>
            </div>

            <div style={{ padding:"14px 22px", borderTop:"1px solid #F0EDE6", display:"flex", alignItems:"center", gap:12 }}>
              <button onClick={save} style={{ padding:"8px 22px", borderRadius:8, border:"none", background:"#2B5E3B", color:"#fff", fontFamily:"inherit", fontSize:13, fontWeight:500, cursor:"pointer" }}>Save changes</button>
              {saved && <span style={{ fontSize:12, color:"#3A8C58" }}>✓ Saved</span>}
              <button onClick={()=>setSel(null)} style={{ marginLeft:"auto", background:"transparent", border:"none", fontSize:12, color:"#8B8680", cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
