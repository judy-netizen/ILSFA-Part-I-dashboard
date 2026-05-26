import { useState, useMemo } from "react";

const ITEMS = ["IPA","PPA","Shading Study","Planset","Array","SS","SSR","POO","UB","ES Box","ES Date","ILSFA Verified","IPA Linked"];

const ROLES = {
  admin: { label: "Admin", color: "#1C1A17", bg: "#F0EDE6" },
  manager: { label: "Manager / Reviewer", color: "#1A5F9E", bg: "#EBF4FF" },
  pm: { label: "Project Manager", color: "#6B4CA8", bg: "#F3EEFF" },
};

const STATUS = {
  pending: { label: "Pending", color: "#8B7355", bg: "#FDF6EC", border: "#E8D5B0" },
  initial_review: { label: "Initial Review", color: "#1A5F9E", bg: "#EBF4FF", border: "#BDDAF5" },
  final_review: { label: "Final Review", color: "#6B4CA8", bg: "#F3EEFF", border: "#C9B3F5" },
  approved: { label: "Approved", color: "#1A7A4A", bg: "#EBF9F1", border: "#A8E4C2" },
  flagged: { label: "Flagged", color: "#B03A2E", bg: "#FEF0EF", border: "#F5C0BC" },
};

const EMPTY_DOCS = [0,0,0,0,0,0,0,0,0,0,0,0,0];

const DATA = [
  { id:"ILSFA-0001", name:"Southside Community Solar", customer:"Maria Reyes", agent:"D. Alvarez", pm:"M. Torres", recValue:48250, dcSize:99.9, ejc:true, ec:true, iec:false, status:"approved", initialDocs:[1,1,1,1,1,1,1,1,1,1,1,1,1], finalDocs:[1,1,1,1,1,1,1,1,1,1,1,1,1], initialComment:"All docs received.", finalComment:"Final check passed.", initialReviewer:"J. Kim", finalReviewer:"J. Kim" },
  { id:"ILSFA-0002", name:"Pilsen Rooftop Array", customer:"Jorge Mendez", agent:"S. Lee", pm:"J. Kim", recValue:36100, dcSize:75.0, ejc:false, ec:false, iec:false, status:"flagged", initialDocs:[1,1,0,1,0,0,0,0,0,0,0,0,0], finalDocs:[...EMPTY_DOCS], initialComment:"Missing Shading Study and Array.", finalComment:"", initialReviewer:"M. Torres", finalReviewer:"" },
  { id:"ILSFA-0003", name:"Englewood Block 14", customer:"Tanya Brown", agent:"D. Alvarez", pm:"M. Torres", recValue:24150, dcSize:50.0, ejc:false, ec:false, iec:false, status:"final_review", initialDocs:[1,1,1,1,1,1,1,1,1,1,1,1,0], finalDocs:[1,1,1,0,1,1,1,1,1,1,1,1,0], initialComment:"IPA Linked missing, rest OK.", finalComment:"Planset still needs update.", initialReviewer:"J. Kim", finalReviewer:"J. Kim" },
  { id:"ILSFA-0004", name:"Austin Neighborhood Solar", customer:"Kevin Park", agent:"R. Patel", pm:"", recValue:48250, dcSize:99.9, ejc:true, ec:true, iec:false, status:"pending", initialDocs:[...EMPTY_DOCS], finalDocs:[...EMPTY_DOCS], initialComment:"", finalComment:"", initialReviewer:"", finalReviewer:"" },
  { id:"ILSFA-0005", name:"Bronzeville Commons", customer:"Lisa Chen", agent:"S. Lee", pm:"R. Patel", recValue:42720, dcSize:88.5, ejc:false, ec:false, iec:false, status:"approved", initialDocs:[1,1,1,1,1,1,1,1,1,1,1,1,1], finalDocs:[1,1,1,1,1,1,1,1,1,1,1,1,1], initialComment:"All complete.", finalComment:"Approved after final check.", initialReviewer:"M. Torres", finalReviewer:"M. Torres" },
  { id:"ILSFA-0006", name:"Woodlawn Solar Hub", customer:"Andre Williams", agent:"D. Alvarez", pm:"J. Kim", recValue:29940, dcSize:62.0, ejc:false, ec:false, iec:false, status:"initial_review", initialDocs:[1,1,1,1,0,0,0,0,0,0,0,0,0], finalDocs:[...EMPTY_DOCS], initialComment:"", finalComment:"", initialReviewer:"", finalReviewer:"" },
  { id:"ILSFA-0007", name:"Hyde Park Carport", customer:"Nina Okonkwo", agent:"R. Patel", pm:"M. Torres", recValue:48250, dcSize:99.9, ejc:true, ec:true, iec:false, status:"initial_review", initialDocs:[1,1,1,1,1,1,1,1,1,1,1,1,0], finalDocs:[...EMPTY_DOCS], initialComment:"Waiting on IPA Linked.", finalComment:"", initialReviewer:"J. Kim", finalReviewer:"" },
  { id:"ILSFA-0008", name:"Lawndale Block Grant", customer:"Sam Rivera", agent:"S. Lee", pm:"", recValue:21240, dcSize:44.0, ejc:false, ec:false, iec:false, status:"pending", initialDocs:[...EMPTY_DOCS], finalDocs:[...EMPTY_DOCS], initialComment:"", finalComment:"", initialReviewer:"", finalReviewer:"" },
];

const EMPTY_FORM = { name:"", customer:"", agent:"", pm:"", recValue:"", dcSize:"", ejc:false, ec:false, iec:false };

function fmt(n) { return "$" + Number(n).toLocaleString(); }
function fmtKw(n) { return Number(n).toFixed(1) + " kW"; }

function Pill({ status }) {
  const s = STATUS[status];
  if (!s) return null;
  return <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:500, border:`1px solid ${s.border}`, background:s.bg, color:s.color, whiteSpace:"nowrap" }}><span style={{ width:5, height:5, borderRadius:"50%", background:s.color, display:"inline-block" }}></span>{s.label}</span>;
}

function DocsBar({ docs }) {
  const done = docs.filter(Boolean).length;
  const total = docs.length;
  const color = done===total ? "#3A8C58" : done>total/2 ? "#4A8FCC" : "#C8B89A";
  return <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:54, height:5, background:"#F0EDE6", borderRadius:3, overflow:"hidden" }}><div style={{ width:`${(done/total)*100}%`, height:"100%", background:color, borderRadius:3 }}></div></div><span style={{ fontSize:11, color:"#8B8680" }}>{done}/{total}</span></div>;
}

const COLORS = ["#3A6EA8","#3A8C58","#8B5E3A","#6B4CA8","#A83A5E","#3A8B8C"];
function Avatar({ name, size=24 }) {
  const ini = name ? name.split(" ").map(w=>w[0]).slice(0,2).join("") : "?";
  const c = name ? COLORS[name.charCodeAt(0)%COLORS.length] : "#ccc";
  return <div style={{ width:size, height:size, borderRadius:"50%", background:c, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.36, fontWeight:600, color:"#fff", flexShrink:0 }}>{ini}</div>;
}

function Field({ label, children }) {
  return <div><div style={{ fontSize:11, fontWeight:500, color:"#8B8680", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>{label}</div>{children}</div>;
}

function SelectFilter({ value, onChange, options, placeholder }) {
  const isEmpty = !value;
  return (
    <select value={value} onChange={e=>onChange(e.target.value)} style={{ padding:"6px 10px", border:"1px solid #E0DDD6", borderRadius:7, fontSize:12, background:"#fff", color:isEmpty?"#A8A49E":"#1C1A17", outline:"none", cursor:"pointer", fontFamily:"inherit" }}>
      <option value="">{placeholder}</option>
      {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
    </select>
  );
}

function DocChecklist({ docs, onChange, readOnly=false }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 }}>
      {ITEMS.map((item,i)=>(
        <div key={i} onClick={()=>!readOnly && onChange(i)} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:8, border:`1px solid ${docs[i]?"#A8E4C2":"#E8E5DE"}`, background:docs[i]?"#F0FBF4":"#fff", cursor:readOnly?"default":"pointer", transition:"all 0.1s" }}>
          <div style={{ width:18, height:18, borderRadius:4, border:`1px solid ${docs[i]?"#3A8C58":"#E0DDD6"}`, background:docs[i]?"#3A8C58":"#FAFAF7", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {docs[i]?<span style={{ color:"#fff", fontSize:11, fontWeight:700 }}>✓</span>:null}
          </div>
          <span style={{ fontSize:12, color:docs[i]?"#1A7A4A":"#8B8680", fontWeight:docs[i]?600:400 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

const inputStyle = { width:"100%", padding:"8px 12px", border:"1px solid #E0DDD6", borderRadius:8, fontSize:13, color:"#1C1A17", background:"#FAFAF7", outline:"none", fontFamily:"inherit", boxSizing:"border-box" };

export default function App() {
  const [role, setRole] = useState(null);
  const [projects, setProjects] = useState(DATA);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterAgent, setFilterAgent] = useState("");
  const [filterPM, setFilterPM] = useState("");
  const [filterDoc, setFilterDoc] = useState("");
  const [sel, setSel] = useState(null);
  const [activeTab, setActiveTab] = useState("initial");
  const [iDocs, setIDocs] = useState([...EMPTY_DOCS]);
  const [iComment, setIComment] = useState("");
  const [iReviewer, setIReviewer] = useState("");
  const [fDocs, setFDocs] = useState([...EMPTY_DOCS]);
  const [fComment, setFComment] = useState("");
  const [fReviewer, setFReviewer] = useState("");
  const [eStatus, setEStatus] = useState("");
  const [saved, setSaved] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const agents = useMemo(()=>[...new Set(projects.map(p=>p.agent).filter(Boolean))].sort(),[projects]);
  const pms = useMemo(()=>[...new Set(projects.map(p=>p.pm).filter(Boolean))].sort(),[projects]);

  const list = useMemo(()=>projects.filter(p=>{
    if (filterStatus && p.status!==filterStatus) return false;
    if (filterAgent && p.agent!==filterAgent) return false;
    if (filterPM && p.pm!==filterPM) return false;
    if (filterDoc) { const idx=ITEMS.indexOf(filterDoc); if(idx>=0 && !p.initialDocs[idx]) return false; }
    if (search && ![p.name,p.id,p.customer,p.agent,p.pm].some(v=>v.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  }),[projects,filterStatus,filterAgent,filterPM,filterDoc,search]);

  const totals = useMemo(()=>({
    rec: list.reduce((s,p)=>s+(p.recValue||0),0),
    dc: list.reduce((s,p)=>s+(p.dcSize||0),0),
    approved: list.filter(p=>p.status==="approved").length,
    flagged: list.filter(p=>p.status==="flagged").length,
    initial_review: list.filter(p=>p.status==="initial_review").length,
    final_review: list.filter(p=>p.status==="final_review").length,
    pending: list.filter(p=>p.status==="pending").length,
  }),[list]);

  const anyFilter = filterAgent||filterPM||filterDoc||filterStatus||search;

  function open(p) {
    setSel(p);
    setIDocs([...p.initialDocs]);
    setIComment(p.initialComment||"");
    setIReviewer(p.initialReviewer||"");
    setFDocs([...p.finalDocs]);
    setFComment(p.finalComment||"");
    setFReviewer(p.finalReviewer||"");
    setEStatus(p.status);
    setActiveTab("initial");
    setSaved(false);
  }

  function save() {
    setProjects(prev=>prev.map(p=>p.id===sel.id?{...p,status:eStatus,initialDocs:iDocs,initialComment:iComment,initialReviewer:iReviewer,finalDocs:fDocs,finalComment:fComment,finalReviewer:fReviewer}:p));
    setSaved(true);
  }

  function addProject() {
    if (!form.name.trim()) return;
    const nextNum = String(projects.length+1).padStart(4,"0");
    setProjects(prev=>[{...form,id:`ILSFA-${nextNum}`,recValue:parseFloat(form.recValue)||0,dcSize:parseFloat(form.dcSize)||0,ejc:form.ejc||false,ec:form.ec||false,iec:form.iec||false,status:"pending",initialDocs:[...EMPTY_DOCS],finalDocs:[...EMPTY_DOCS],initialComment:"",finalComment:"",initialReviewer:"",finalReviewer:""},...prev]);
    setForm(EMPTY_FORM);
    setShowAdd(false);
  }

  function toggleDoc(arr, setArr, i) { const n=[...arr]; n[i]=n[i]?0:1; setArr(n); }

  // Role selector screen
  if (!role) return (
    <div style={{ fontFamily:"'Helvetica Neue',sans-serif", background:"#F7F5F0", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
      <div style={{ marginBottom:32, textAlign:"center" }}>
        <div style={{ width:48, height:48, background:"#1C1A17", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 4h16v3H3zm0 5h11v3H3zm0 5h13v3H3z" fill="#fff" opacity="0.9"/><circle cx="18" cy="16" r="3" fill="#6FCF8A"/></svg>
        </div>
        <div style={{ fontSize:20, fontWeight:700, color:"#1C1A17", letterSpacing:"-0.02em" }}>ILSFA Part I Dashboard</div>
        <div style={{ fontSize:13, color:"#8B8680", marginTop:6 }}>Select your role to continue</div>
      </div>
      <div style={{ display:"flex", gap:16 }}>
        {Object.entries(ROLES).map(([key,r])=>(
          <button key={key} onClick={()=>setRole(key)} style={{ width:200, padding:"24px 20px", borderRadius:14, border:`2px solid ${r.color}20`, background:"#fff", cursor:"pointer", fontFamily:"inherit", textAlign:"left", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", transition:"all 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 4px 20px ${r.color}25`; e.currentTarget.style.borderColor=r.color;}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor=`${r.color}20`;}}>
            <div style={{ width:36, height:36, borderRadius:10, background:r.bg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
              {key==="admin" ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" fill={r.color} opacity="0.85"/></svg>
              : key==="pm" ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3" fill={r.color}/><path d="M3 15c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={r.color} strokeWidth="1.5" strokeLinecap="round"/></svg>
              : <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 4h14v2H2zm0 4h9v2H2zm0 4h11v2H2z" fill={r.color}/><circle cx="14" cy="13" r="2.5" fill={r.color} opacity="0.7"/></svg>}
            </div>
            <div style={{ fontSize:14, fontWeight:600, color:"#1C1A17", marginBottom:4 }}>{r.label}</div>
            <div style={{ fontSize:12, color:"#8B8680", lineHeight:1.5 }}>
              {key==="admin" ? "Full access: all data, analytics & export" : key==="pm" ? "Add & track your projects" : "Review documents & approve submissions"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const isAdmin = role === "admin";
  const isManager = role === "manager" || isAdmin;

  return (
    <div style={{ fontFamily:"'Helvetica Neue',sans-serif", background:"#F7F5F0", minHeight:"100vh" }}>
      <div style={{ background:"#1C1A17", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ color:"#F7F5F0", fontSize:15, fontWeight:600 }}>ILSFA Part I — Submission Review Dashboard</div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={()=>setShowAdd(true)} style={{ padding:"7px 16px", borderRadius:8, border:"none", background:"#3A8C58", color:"#fff", fontFamily:"inherit", fontSize:12, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:16, lineHeight:1 }}>+</span> Add Project
          </button>
          <div style={{ background:ROLES[role].bg, border:`1px solid ${ROLES[role].color}40`, borderRadius:8, padding:"4px 12px", display:"flex", alignItems:"center", gap:7, cursor:"pointer" }} onClick={()=>setRole(null)}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:ROLES[role].color }}></div>
            <span style={{ color:ROLES[role].color, fontSize:12, fontWeight:500 }}>{ROLES[role].label}</span>
            <span style={{ color:ROLES[role].color, fontSize:10, opacity:0.6 }}>▾</span>
          </div>
        </div>
      </div>

      <div style={{ padding:"20px 24px", maxWidth:1400, margin:"0 auto" }}>
        {/* Summary Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr repeat(5,auto)", gap:10, marginBottom:14 }}>
          <div style={{ background:"#F0FBF4", border:"1px solid #A8E4C2", borderTop:"3px solid #1A7A4A", borderRadius:10, padding:"14px 18px" }}>
            <div style={{ fontSize:11, color:"#1A7A4A", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>Total REC Value</div>
            <div style={{ fontSize:24, fontWeight:700, color:"#1A7A4A" }}>{fmt(totals.rec)}</div>
            {anyFilter && <div style={{ fontSize:11, color:"#3A8C58", marginTop:2 }}>{list.length} of {projects.length} projects</div>}
          </div>
          <div style={{ background:"#EBF4FF", border:"1px solid #BDDAF5", borderTop:"3px solid #1A5F9E", borderRadius:10, padding:"14px 18px" }}>
            <div style={{ fontSize:11, color:"#1A5F9E", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>Total DC Size</div>
            <div style={{ fontSize:24, fontWeight:700, color:"#1A5F9E" }}>{fmtKw(totals.dc)}</div>
            {anyFilter && <div style={{ fontSize:11, color:"#4A8FCC", marginTop:2 }}>{list.length} of {projects.length} projects</div>}
          </div>
          {[["Approved",totals.approved,"#1A7A4A","#EBF9F1","#A8E4C2"],["Initial Review",totals.initial_review,"#1A5F9E","#EBF4FF","#BDDAF5"],["Final Review",totals.final_review,"#6B4CA8","#F3EEFF","#C9B3F5"],["Flagged",totals.flagged,"#B03A2E","#FEF0EF","#F5C0BC"],["Pending",totals.pending,"#8B7355","#FDF6EC","#E8D5B0"]].map(([l,v,c,bg,br])=>(
            <div key={l} style={{ background:bg, border:`1px solid ${br}`, borderTop:`3px solid ${c}`, borderRadius:10, padding:"14px 18px", minWidth:100 }}>
              <div style={{ fontSize:11, color:c, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:4, whiteSpace:"nowrap" }}>{l}</div>
              <div style={{ fontSize:24, fontWeight:700, color:c }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background:"#fff", border:"1px solid #E8E5DE", borderRadius:10, padding:"12px 16px", marginBottom:14, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search project, customer…" style={{ padding:"6px 12px", border:"1px solid #E0DDD6", borderRadius:7, fontSize:12, width:210, outline:"none" }} />
          <div style={{ width:1, height:24, background:"#E8E5DE" }}></div>
          <SelectFilter value={filterStatus} onChange={setFilterStatus} placeholder="All Statuses" options={[{value:"pending",label:"Pending"},{value:"initial_review",label:"Initial Review"},{value:"final_review",label:"Final Review"},{value:"approved",label:"Approved"},{value:"flagged",label:"Flagged"}]} />
          <SelectFilter value={filterAgent} onChange={setFilterAgent} placeholder="Sales Agent" options={agents} />
          <SelectFilter value={filterPM} onChange={setFilterPM} placeholder="Project Manager" options={pms} />
          <SelectFilter value={filterDoc} onChange={setFilterDoc} placeholder="Has Document" options={ITEMS} />
          {anyFilter && <button onClick={()=>{setFilterStatus("");setFilterAgent("");setFilterPM("");setFilterDoc("");setSearch("");}} style={{ padding:"5px 12px", borderRadius:6, border:"1px solid #E0DDD6", background:"#fff", fontFamily:"inherit", fontSize:11, color:"#B03A2E", cursor:"pointer", fontWeight:500 }}>✕ Clear</button>}
          <div style={{ marginLeft:"auto", fontSize:12, color:"#8B8680", fontWeight:500 }}>{list.length} project{list.length!==1?"s":""}</div>
        </div>

        {/* Table */}
        <div style={{ background:"#fff", border:"1px solid #E8E5DE", borderRadius:12, overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:"#FAFAF7" }}>
                  {["Project ID","Project Name","Customer","Sales Agent","Project Manager","REC Value","DC Size","Initial Docs","Final Docs","Status",""].map(h=>(
                    <th key={h} style={{ padding:"8px 14px", textAlign:"left", fontWeight:500, color:"#8B8680", fontSize:11, borderBottom:"1px solid #F0EDE6", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.length===0 ? (
                  <tr><td colSpan={11} style={{ padding:"40px", textAlign:"center", color:"#A8A49E", fontSize:13 }}>No projects match your filters.</td></tr>
                ) : list.map((p,i)=>(
                  <tr key={p.id} onClick={()=>open(p)} style={{ background:i%2===0?"#fff":"#FDFCFA", borderBottom:"1px solid #F5F3EE", cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#EFEDE7"}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"#FDFCFA"}>
                    <td style={{ padding:"10px 14px", fontFamily:"monospace", fontSize:11, color:"#8B8680" }}>{p.id}</td>
                    <td style={{ padding:"10px 14px", fontWeight:500, color:"#1C1A17", whiteSpace:"nowrap" }}>{p.name}</td>
                    <td style={{ padding:"10px 14px" }}><div style={{ display:"flex", alignItems:"center", gap:7 }}><Avatar name={p.customer} /><span style={{ color:"#5A5652", whiteSpace:"nowrap" }}>{p.customer}</span></div></td>
                    <td style={{ padding:"10px 14px" }}><div style={{ display:"flex", alignItems:"center", gap:7 }}><Avatar name={p.agent} /><span style={{ color:"#5A5652" }}>{p.agent}</span></div></td>
                    <td style={{ padding:"10px 14px" }}>{p.pm?<div style={{ display:"flex", alignItems:"center", gap:7 }}><Avatar name={p.pm} /><span style={{ color:"#5A5652" }}>{p.pm}</span></div>:<span style={{ color:"#C8C4BA", fontSize:11 }}>Unassigned</span>}</td>
                    <td style={{ padding:"10px 14px", fontFamily:"monospace", fontSize:11, color:"#1A7A4A", fontWeight:600 }}>{p.recValue?fmt(p.recValue):"—"}</td>
                    <td style={{ padding:"10px 14px", fontFamily:"monospace", fontSize:11, color:"#1A5F9E" }}>{p.dcSize?fmtKw(p.dcSize):"—"}</td>
                    <td style={{ padding:"10px 14px" }}><DocsBar docs={p.initialDocs} /></td>
                    <td style={{ padding:"10px 14px" }}><DocsBar docs={p.finalDocs} /></td>
                    <td style={{ padding:"10px 14px" }}><Pill status={p.status} /></td>
                    <td style={{ padding:"10px 14px" }}><div style={{ width:20, height:20, borderRadius:4, border:"1px solid #E0DDD6", display:"flex", alignItems:"center", justifyContent:"center", color:"#8B8680", fontSize:10 }}>›</div></td>
                  </tr>
                ))}
              </tbody>
              {list.length>1 && (
                <tfoot>
                  <tr style={{ background:"#FAFAF7", borderTop:"2px solid #E8E5DE" }}>
                    <td colSpan={5} style={{ padding:"10px 14px", fontSize:11, fontWeight:600, color:"#8B8680" }}>TOTALS ({list.length} projects)</td>
                    <td style={{ padding:"10px 14px", fontFamily:"monospace", fontSize:12, color:"#1A7A4A", fontWeight:700 }}>{fmt(totals.rec)}</td>
                    <td style={{ padding:"10px 14px", fontFamily:"monospace", fontSize:12, color:"#1A5F9E", fontWeight:700 }}>{fmtKw(totals.dc)}</td>
                    <td colSpan={4}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>


      {/* Admin Analytics Panel */}
      {isAdmin && (
        <div style={{ padding:"0 24px 24px", maxWidth:1400, margin:"0 auto" }}>
          <div style={{ background:"#1C1A17", borderRadius:12, padding:"20px 24px", marginBottom:0 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#F7F5F0", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 3h3l-2.5 2 1 3L7 7.5 4 9l1-3L2.5 4h3z" fill="#F7F5F0" opacity="0.8"/></svg>
              Admin Overview
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
              {/* By Agent */}
              <div style={{ background:"#2B2925", borderRadius:10, padding:"14px 16px" }}>
                <div style={{ fontSize:11, color:"#6B6760", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:10 }}>By Sales Agent</div>
                {agents.map(agent=>{
                  const agentProjects = projects.filter(p=>p.agent===agent);
                  const agentRec = agentProjects.reduce((s,p)=>s+(p.recValue||0),0);
                  const approved = agentProjects.filter(p=>p.status==="approved").length;
                  return (
                    <div key={agent} style={{ marginBottom:10, paddingBottom:10, borderBottom:"1px solid #3A3830" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:7 }}><Avatar name={agent} size={20} /><span style={{ fontSize:12, fontWeight:500, color:"#F7F5F0" }}>{agent}</span></div>
                        <span style={{ fontSize:11, color:"#6FCF8A", fontFamily:"monospace" }}>{fmt(agentRec)}</span>
                      </div>
                      <div style={{ display:"flex", gap:6, fontSize:10, color:"#6B6760" }}>
                        <span>{agentProjects.length} projects</span>
                        <span>·</span>
                        <span style={{ color:"#6FCF8A" }}>{approved} approved</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* By PM */}
              <div style={{ background:"#2B2925", borderRadius:10, padding:"14px 16px" }}>
                <div style={{ fontSize:11, color:"#6B6760", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:10 }}>By Project Manager</div>
                {pms.length > 0 ? pms.map(pm=>{
                  const pmProjects = projects.filter(p=>p.pm===pm);
                  const pmRec = pmProjects.reduce((s,p)=>s+(p.recValue||0),0);
                  const approved = pmProjects.filter(p=>p.status==="approved").length;
                  return (
                    <div key={pm} style={{ marginBottom:10, paddingBottom:10, borderBottom:"1px solid #3A3830" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:7 }}><Avatar name={pm} size={20} /><span style={{ fontSize:12, fontWeight:500, color:"#F7F5F0" }}>{pm}</span></div>
                        <span style={{ fontSize:11, color:"#6FCF8A", fontFamily:"monospace" }}>{fmt(pmRec)}</span>
                      </div>
                      <div style={{ display:"flex", gap:6, fontSize:10, color:"#6B6760" }}>
                        <span>{pmProjects.length} projects</span>
                        <span>·</span>
                        <span style={{ color:"#6FCF8A" }}>{approved} approved</span>
                      </div>
                    </div>
                  );
                }) : <div style={{ fontSize:12, color:"#6B6760" }}>No PMs assigned yet.</div>}
              </div>
              {/* Doc completion */}
              <div style={{ background:"#2B2925", borderRadius:10, padding:"14px 16px" }}>
                <div style={{ fontSize:11, color:"#6B6760", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:10 }}>Document Completion Rate</div>
                {ITEMS.map((item,idx)=>{
                  const checked = projects.filter(p=>p.initialDocs[idx]).length;
                  const pct = Math.round((checked/projects.length)*100);
                  return (
                    <div key={item} style={{ marginBottom:8 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                        <span style={{ fontSize:11, color:"#A8A49E" }}>{item}</span>
                        <span style={{ fontSize:11, color:pct===100?"#6FCF8A":pct>=50?"#4A8FCC":"#D4614F", fontFamily:"monospace" }}>{pct}%</span>
                      </div>
                      <div style={{ height:4, background:"#3A3830", borderRadius:2, overflow:"hidden" }}>
                        <div style={{ width:`${pct}%`, height:"100%", background:pct===100?"#3A8C58":pct>=50?"#4A8FCC":"#D4614F", borderRadius:2 }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Pipeline summary */}
              <div style={{ background:"#2B2925", borderRadius:10, padding:"14px 16px" }}>
                <div style={{ fontSize:11, color:"#6B6760", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:10 }}>Pipeline Summary</div>
                {Object.entries(STATUS).map(([k,s])=>{
                  const count = projects.filter(p=>p.status===k).length;
                  const rec = projects.filter(p=>p.status===k).reduce((sum,p)=>sum+(p.recValue||0),0);
                  const pct = Math.round((count/projects.length)*100);
                  return (
                    <div key={k} style={{ marginBottom:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                        <span style={{ fontSize:12, fontWeight:500, color:s.color }}>{s.label}</span>
                        <span style={{ fontSize:11, color:"#A8A49E" }}>{count} · {fmt(rec)}</span>
                      </div>
                      <div style={{ height:5, background:"#3A3830", borderRadius:3, overflow:"hidden" }}>
                        <div style={{ width:`${pct}%`, height:"100%", background:s.color, borderRadius:3, opacity:0.8 }}></div>
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop:16, paddingTop:12, borderTop:"1px solid #3A3830" }}>
                  <div style={{ fontSize:11, color:"#6B6760", marginBottom:6 }}>Total Portfolio</div>
                  <div style={{ fontSize:18, fontWeight:700, color:"#6FCF8A" }}>{fmt(projects.reduce((s,p)=>s+(p.recValue||0),0))}</div>
                  <div style={{ fontSize:12, color:"#4A8FCC", marginTop:2 }}>{fmtKw(projects.reduce((s,p)=>s+(p.dcSize||0),0))}</div>
                </div>
              </div>
            </div>
            {/* Export button */}
            <div style={{ display:"flex", justifyContent:"flex-end" }}>
              <button onClick={()=>{
                const header = ["Project ID","Name","Customer","Agent","PM","REC Value","DC Size","Status","Initial Docs","Final Docs","Initial Comment","Final Comment"].join(",");
                const rowData = projects.map(p=>[p.id,'"'+p.name+'"','"'+p.customer+'"',p.agent,p.pm,p.recValue,p.dcSize,p.status,p.initialDocs.filter(Boolean).length+"/"+ITEMS.length,p.finalDocs.filter(Boolean).length+"/"+ITEMS.length,'"'+p.initialComment+'"','"'+p.finalComment+'"'].join(","));
                const rows = [header,...rowData].join("\n");
                const blob = new Blob([rows],{type:"text/csv"});
                const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="ILSFA_projects.csv"; a.click();
              }} style={{ padding:"8px 20px", borderRadius:8, border:"1px solid #3A3830", background:"transparent", color:"#A8A49E", fontFamily:"inherit", fontSize:12, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v8M3.5 6l3 3 3-3M1 10h11v2H1z" stroke="#A8A49E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {sel && (
        <div style={{ position:"fixed", inset:0, background:"rgba(28,26,23,0.45)", display:"flex", justifyContent:"flex-end", zIndex:100 }} onClick={e=>{ if(e.target===e.currentTarget) setSel(null); }}>
          <div style={{ width:540, background:"#fff", height:"100%", overflowY:"auto", display:"flex", flexDirection:"column", boxShadow:"-4px 0 24px rgba(0,0,0,0.12)" }}>
            {/* Drawer Header */}
            <div style={{ padding:"16px 22px", borderBottom:"1px solid #F0EDE6", flexShrink:0 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:11, fontFamily:"monospace", color:"#8B8680", marginBottom:3 }}>{sel.id}</div>
                  <div style={{ fontSize:16, fontWeight:600, color:"#1C1A17" }}>{sel.name}</div>
                </div>
                <button onClick={()=>setSel(null)} style={{ width:28, height:28, borderRadius:6, border:"1px solid #E0DDD6", background:"transparent", cursor:"pointer", fontSize:16, color:"#8B8680" }}>×</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:10 }}>
                {[["Customer",sel.customer],["Sales Agent",sel.agent],["Project Manager",sel.pm||"Unassigned"]].map(([l,v])=>(
                  <div key={l} style={{ background:"#FAFAF7", border:"1px solid #F0EDE6", borderRadius:8, padding:"8px 10px" }}>
                    <div style={{ fontSize:10, color:"#A8A49E", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:5 }}>{l}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}><Avatar name={v!=="Unassigned"?v:""} size={20} /><span style={{ fontSize:12, fontWeight:500, color:v==="Unassigned"?"#C8C4BA":"#1C1A17" }}>{v}</span></div>
                  </div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <div style={{ background:"#F0FBF4", border:"1px solid #A8E4C2", borderRadius:8, padding:"10px 14px" }}>
                  <div style={{ fontSize:10, color:"#1A7A4A", textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:500, marginBottom:4 }}>Total REC Value</div>
                  <div style={{ fontSize:18, fontWeight:700, color:"#1A7A4A" }}>{sel.recValue?fmt(sel.recValue):"—"}</div>
                </div>
                <div style={{ background:"#EBF4FF", border:"1px solid #BDDAF5", borderRadius:8, padding:"10px 14px" }}>
                  <div style={{ fontSize:10, color:"#1A5F9E", textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:500, marginBottom:4 }}>DC Size</div>
                  <div style={{ fontSize:18, fontWeight:700, color:"#1A5F9E" }}>{sel.dcSize?fmtKw(sel.dcSize):"—"}</div>
                </div>
              </div>
            </div>

            {/* PM view: read-only info */}
            {!isManager ? (
              <div style={{ padding:"20px 22px", flex:1 }}>
                <div style={{ background:"#F3EEFF", border:"1px solid #C9B3F5", borderRadius:10, padding:"14px 16px", marginBottom:18 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"#6B4CA8", marginBottom:4 }}>Project Manager View</div>
                  <div style={{ fontSize:12, color:"#8B8680", lineHeight:1.6 }}>You can view your project details here. Document review and status changes are handled by the Manager.</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:500, color:"#8B8680", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>Current Status</div>
                    <Pill status={sel.status} />
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:500, color:"#8B8680", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>Initial Review — Documents ({sel.initialDocs.filter(Boolean).length}/{ITEMS.length})</div>
                    <DocChecklist docs={sel.initialDocs} onChange={()=>{}} readOnly={true} />
                  </div>
                  {sel.initialComment && (
                    <div style={{ background:"#FAFAF7", border:"1px solid #F0EDE6", borderRadius:8, padding:"12px 14px" }}>
                      <div style={{ fontSize:10, color:"#A8A49E", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>Initial Review Comment</div>
                      <div style={{ fontSize:13, color:"#1C1A17", lineHeight:1.6 }}>{sel.initialComment}</div>
                    </div>
                  )}
                  {(sel.status==="final_review"||sel.status==="approved") && (
                    <div>
                      <div style={{ fontSize:11, fontWeight:500, color:"#8B8680", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>Final Review — Documents ({sel.finalDocs.filter(Boolean).length}/{ITEMS.length})</div>
                      <DocChecklist docs={sel.finalDocs} onChange={()=>{}} readOnly={true} />
                    </div>
                  )}
                  {sel.finalComment && (
                    <div style={{ background:"#FAFAF7", border:"1px solid #F0EDE6", borderRadius:8, padding:"12px 14px" }}>
                      <div style={{ fontSize:10, color:"#A8A49E", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>Final Review Comment</div>
                      <div style={{ fontSize:13, color:"#1C1A17", lineHeight:1.6 }}>{sel.finalComment}</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Manager view: full edit */
              <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
                {/* Status */}
                <div style={{ padding:"14px 22px", borderBottom:"1px solid #F0EDE6" }}>
                  <Field label="Review Status">
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:6 }}>
                      {Object.entries(STATUS).map(([k,s])=>(
                        <button key={k} onClick={()=>setEStatus(k)} style={{ padding:"6px 14px", borderRadius:20, border:`1.5px solid ${eStatus===k?s.color:s.border}`, background:eStatus===k?s.bg:"#fff", color:s.color, fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5 }}>
                          <span style={{ width:6, height:6, borderRadius:"50%", background:s.color }}></span>{s.label}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>

                {/* Review tabs */}
                <div style={{ display:"flex", borderBottom:"1px solid #F0EDE6" }}>
                  {[["initial","Initial Review","#1A5F9E"],["final","Final Review","#6B4CA8"]].map(([tab,label,color])=>(
                    <button key={tab} onClick={()=>setActiveTab(tab)} style={{ flex:1, padding:"12px", border:"none", background:"transparent", fontFamily:"inherit", fontSize:13, fontWeight:500, cursor:"pointer", color:activeTab===tab?color:"#8B8680", borderBottom:`2px solid ${activeTab===tab?color:"transparent"}`, transition:"all 0.15s" }}>
                      {label}
                      <span style={{ marginLeft:8, fontSize:11, background:activeTab===tab?`${color}15`:"#F0EDE6", color:activeTab===tab?color:"#8B8680", padding:"2px 7px", borderRadius:10 }}>
                        {tab==="initial"?`${iDocs.filter(Boolean).length}/${ITEMS.length}`:`${fDocs.filter(Boolean).length}/${ITEMS.length}`}
                      </span>
                    </button>
                  ))}
                </div>

                <div style={{ padding:"18px 22px", display:"flex", flexDirection:"column", gap:16, flex:1 }}>
                  {activeTab==="initial" ? <>
                    <Field label={`Documents — Initial Review (${iDocs.filter(Boolean).length}/${ITEMS.length})`}>
                      <div style={{ marginTop:6 }}><DocChecklist docs={iDocs} onChange={i=>toggleDoc(iDocs,setIDocs,i)} /></div>
                    </Field>
                    <Field label="Reviewer Name">
                      <input value={iReviewer} onChange={e=>setIReviewer(e.target.value)} placeholder="Your name" style={inputStyle} />
                    </Field>
                    <Field label="Initial Review Comment">
                      <textarea value={iComment} onChange={e=>setIComment(e.target.value)} placeholder="Notes from initial review…" rows={4} style={{ ...inputStyle, resize:"vertical", lineHeight:1.6 }} />
                    </Field>
                  </> : <>
                    <div style={{ background:"#F3EEFF", border:"1px solid #C9B3F5", borderRadius:8, padding:"10px 14px", fontSize:12, color:"#6B4CA8" }}>
                      Final Review re-checks all documents independently from the initial review.
                    </div>
                    <Field label={`Documents — Final Review (${fDocs.filter(Boolean).length}/${ITEMS.length})`}>
                      <div style={{ marginTop:6 }}><DocChecklist docs={fDocs} onChange={i=>toggleDoc(fDocs,setFDocs,i)} /></div>
                    </Field>
                    <Field label="Reviewer Name">
                      <input value={fReviewer} onChange={e=>setFReviewer(e.target.value)} placeholder="Your name" style={inputStyle} />
                    </Field>
                    <Field label="Final Review Comment">
                      <textarea value={fComment} onChange={e=>setFComment(e.target.value)} placeholder="Notes from final review…" rows={4} style={{ ...inputStyle, resize:"vertical", lineHeight:1.6 }} />
                    </Field>
                  </>}
                </div>

                <div style={{ padding:"14px 22px", borderTop:"1px solid #F0EDE6", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
                  <button onClick={save} style={{ padding:"8px 22px", borderRadius:8, border:"none", background:"#2B5E3B", color:"#fff", fontFamily:"inherit", fontSize:13, fontWeight:500, cursor:"pointer" }}>Save changes</button>
                  {saved && <span style={{ fontSize:12, color:"#3A8C58" }}>✓ Saved</span>}
                  <button onClick={()=>setSel(null)} style={{ marginLeft:"auto", background:"transparent", border:"none", fontSize:12, color:"#8B8680", cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAdd && (
        <div style={{ position:"fixed", inset:0, background:"rgba(28,26,23,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }} onClick={e=>{ if(e.target===e.currentTarget) setShowAdd(false); }}>
          <div style={{ width:520, background:"#fff", borderRadius:14, boxShadow:"0 8px 40px rgba(0,0,0,0.18)", overflow:"hidden", maxHeight:"90vh", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"18px 24px", borderBottom:"1px solid #F0EDE6", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:15, fontWeight:600, color:"#1C1A17" }}>Add New Project</div>
              <button onClick={()=>setShowAdd(false)} style={{ width:28, height:28, borderRadius:6, border:"1px solid #E0DDD6", background:"transparent", cursor:"pointer", fontSize:16, color:"#8B8680" }}>×</button>
            </div>
            <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:14, overflowY:"auto", flex:1 }}>
              <div style={{ background:"#F3EEFF", border:"1px solid #C9B3F5", borderRadius:8, padding:"10px 14px", fontSize:12, color:"#6B4CA8" }}>
                Fill in your project details. The manager will handle document review after submission.
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Field label="Project Name *">
                  <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Southside Community Solar" style={inputStyle} />
                </Field>
                <Field label="Customer Name">
                  <input value={form.customer} onChange={e=>setForm(f=>({...f,customer:e.target.value}))} placeholder="e.g. Maria Reyes" style={inputStyle} />
                </Field>
                <Field label="Sales Agent">
                  <input value={form.agent} onChange={e=>setForm(f=>({...f,agent:e.target.value}))} placeholder="e.g. D. Alvarez" style={inputStyle} />
                </Field>
                <Field label="Project Manager">
                  <input value={form.pm} onChange={e=>setForm(f=>({...f,pm:e.target.value}))} placeholder="e.g. M. Torres" style={inputStyle} />
                </Field>
                <Field label="Total REC Value ($)">
                  <input value={form.recValue} onChange={e=>setForm(f=>({...f,recValue:e.target.value}))} placeholder="e.g. 48250" style={inputStyle} type="number" />
                </Field>
                <Field label="DC Size (kW)">
                  <input value={form.dcSize} onChange={e=>setForm(f=>({...f,dcSize:e.target.value}))} placeholder="e.g. 99.9" style={inputStyle} type="number" />
                </Field>
              </div>
            </div>
            <div style={{ padding:"14px 24px", borderTop:"1px solid #F0EDE6", display:"flex", gap:10, flexShrink:0 }}>
              <button onClick={addProject} disabled={!form.name.trim()} style={{ padding:"9px 24px", borderRadius:8, border:"none", background:form.name.trim()?"#2B5E3B":"#A8C5B2", color:"#fff", fontFamily:"inherit", fontSize:13, fontWeight:500, cursor:form.name.trim()?"pointer":"not-allowed" }}>
                Submit Project
              </button>
              <button onClick={()=>setShowAdd(false)} style={{ background:"transparent", border:"none", fontSize:13, color:"#8B8680", cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
