import { useState, useMemo, useEffect, useCallback } from "react";

const pulseStyle = `@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`;

const ITEMS = ["IPA","PPA","Shading Study","Planset","Array","SS","SSR","POO","UB","ES Box","ES Date","ILSFA Verified","IPA Linked","HRUP","Invoice"];
const EMPTY_DOCS = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

const ROLES = {
  admin:   { label:"Admin",              color:"#0A1628", bg:"#F0EDE6" },
  manager: { label:"Manager / Reviewer", color:"#1A5F9E", bg:"#EBF4FF" },
  pm:      { label:"Project Manager",    color:"#6B4CA8", bg:"#F3EEFF" },
};

const USERS = [
  // Managers / Reviewers
  { username:"judy",     password:"judy2026",     role:"manager", name:"Judy",          pm: null },
  { username:"mary",     password:"mary2026",     role:"manager", name:"Mary Ann Sante",        pm: null },
  // Admin
  { username:"admin",    password:"admin2026",    role:"admin",   name:"Admin",                 pm: null },
  // Project Managers - can only see their own projects
  { username:"allaiza",  password:"pm2026",       role:"pm",      name:"Allaiza Velasquez",     pm:"Allaiza Velasquez" },
  { username:"angelica", password:"pm2026",       role:"pm",      name:"Angelica Capili",       pm:"Angelica Capili" },
  { username:"franchise",password:"pm2026",       role:"pm",      name:"Francheska Alvarez",    pm:"Francheska Alvarez" },
  { username:"genneva",  password:"pm2026",       role:"pm",      name:"Genneva Arguelles",     pm:"Genneva Arguelles" },
  { username:"maryann",  password:"pm2026",       role:"pm",      name:"Mary Ann Sante",        pm:"Mary Ann Sante" },
  { username:"may",      password:"pm2026",       role:"pm",      name:"May Contestable",       pm:"May Contestable" },
];

const STATUS = {
  pending:        { label:"Pending",           color:"#8B7355", bg:"#FDF6EC", border:"#E8D5B0" },
  initial_review: { label:"Initial Review",    color:"#1A5F9E", bg:"#EBF4FF", border:"#BDDAF5" },
  final_review:   { label:"Final Review",      color:"#6B4CA8", bg:"#F3EEFF", border:"#C9B3F5" },
  approved:       { label:"Approved",          color:"#1A7A4A", bg:"#EBF9F1", border:"#A8E4C2" },
  flagged:        { label:"Flagged",           color:"#B03A2E", bg:"#FEF0EF", border:"#F5C0BC" },
  submitted:      { label:"Part I Submitted",  color:"#0369A1", bg:"#E0F2FE", border:"#7DD3FC" },
};

const INIT_DATA = [];

const EMPTY_FORM = { projectId:"", name:"", customer:"", agent:"", pm:"", programYear:"", recValue:"", dcSize:"", ejc:false, ec:false, iec:false };

const API_URL = "https://script.google.com/macros/s/AKfycbxXlm6OLl1AyVHsQAkNrs3dDpicmBJ0tPSJj-OIyB-ZLX24VdLbEpXLl4ErHxojsgibWQ/exec";

function parseProject(p) {
  return {
    ...p,
    programYear: p.programYear || "",
    recValue: parseFloat(p.recValue) || 0,
    dcSize:   parseFloat(p.dcSize)   || 0,
    ejc: p.ejc === true || p.ejc === "TRUE" || p.ejc === "true",
    ec:  p.ec  === true || p.ec  === "TRUE" || p.ec  === "true",
    iec: p.iec === true || p.iec === "TRUE" || p.iec === "true",
    initialDocs: typeof p.initialDocs === "string" ? JSON.parse(p.initialDocs || "[]") : (p.initialDocs || [...EMPTY_DOCS]),
    finalDocs:   typeof p.finalDocs   === "string" ? JSON.parse(p.finalDocs   || "[]") : (p.finalDocs   || [...EMPTY_DOCS]),
    messages: (()=>{
    const raw = typeof p.messages === "string" ? JSON.parse(p.messages || "[]") : (p.messages || []);
    return raw.map(m => ({...m, id: Number(m.id||0)}));
  })(),
  };
}

async function fetchProjects() {
  const res = await fetch(API_URL);
  const json = await res.json();
  return (json.data || []).filter(p => p.id).map(parseProject);
}

async function saveProjectToSheet(project) {
  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "save_project", project }),
  });
}

async function initHeaders() {
  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "init_headers" }),
  });
}

const AGENTS = [
  { group:"", options:["Abdulhalim Dayoub","Adam Kheder","Alaa Mahdi","Ashraf Dardar","Habib Maktabi","Hadi Haj Abdullah","Kai Nori","Karim Almasri","Khaled Zarzour","Luay Daboul","Marina Morcos","Mo Jaliawala","Mutawakel Nofal","Rami Alkhawandi","Romel George","Sam Aktham","Sami Alkabbani","Zack"] },
  { group:"Fleet Solar", options:["Daniel Murillo","Daniel Ortiz","Diego Garza","Kevin Bueno","Miguel Delgado","Raul Munoz","Rene Orozco","Rene Rodriguez","Rodolfo"] },
  { group:"VIP Team", options:["Ahmed AlSayyad","Abdal Barakat","Ahmad Shaban","Ben Qahwaji","Deana Hernandez","Hina Inayat","Marwan AlSmadi","Marwan Noweder","Matthew Romano","Mo Alkubaisi","Moe Salah"] },
];

const PM_LIST = ["Allaiza Velasquez","Angelica Capili","Francheska Alvarez","Genneva Arguelles","Mary Ann Sante","May Contestable"];

const fmt   = n => "$" + Number(n).toLocaleString();
const fmtKw = n => Number(n).toFixed(1) + " kW";

const COLORS = ["#3A6EA8","#3A8C58","#8B5E3A","#6B4CA8","#A83A5E","#3A8B8C"];

function Avatar({ name, size=24 }) {
  const ini = name ? name.split(" ").map(w=>w[0]).slice(0,2).join("") : "?";
  const c   = name ? COLORS[name.charCodeAt(0) % COLORS.length] : "#ccc";
  return <div style={{ width:size,height:size,borderRadius:"50%",background:c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.36,fontWeight:600,color:"#fff",flexShrink:0 }}>{ini}</div>;
}

function Pill({ status }) {
  const s = STATUS[status]; if (!s) return null;
  return <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:500,border:`1px solid ${s.border}`,background:s.bg,color:s.color,whiteSpace:"nowrap" }}><span style={{ width:5,height:5,borderRadius:"50%",background:s.color,display:"inline-block" }}></span>{s.label}</span>;
}

function DocsBar({ docs }) {
  const done=docs.filter(Boolean).length, total=docs.length;
  const color=done===total?"#3A8C58":done>total/2?"#4A8FCC":"#C8B89A";
  return <div style={{ display:"flex",alignItems:"center",gap:6 }}><div style={{ width:54,height:5,background:"#F0EDE6",borderRadius:3,overflow:"hidden" }}><div style={{ width:`${(done/total)*100}%`,height:"100%",background:color,borderRadius:3 }}></div></div><span style={{ fontSize:11,color:"#8B8680" }}>{done}/{total}</span></div>;
}

function Field({ label, children }) {
  return <div><div style={{ fontSize:11,fontWeight:500,color:"#8B8680",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6 }}>{label}</div>{children}</div>;
}

function SelFilter({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)} style={{ padding:"6px 10px",border:"1px solid #E0DDD6",borderRadius:7,fontSize:12,background:"#fff",color:value?"#0A1628":"#94A3B8",outline:"none",cursor:"pointer",fontFamily:"inherit" }}>
      <option value="">{placeholder}</option>
      {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
    </select>
  );
}

function DocChecklist({ docs, onChange, readOnly=false }) {
  return (
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6 }}>
      {ITEMS.map((item,i)=>(
        <div key={i} onClick={()=>!readOnly&&onChange(i)} style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,border:`1px solid ${docs[i]?"#A8E4C2":"#E8E5DE"}`,background:docs[i]?"#F0FBF4":"#fff",cursor:readOnly?"default":"pointer" }}>
          <div style={{ width:18,height:18,borderRadius:4,border:`1px solid ${docs[i]?"#3A8C58":"#E0DDD6"}`,background:docs[i]?"#3A8C58":"#FAFAF7",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            {docs[i]?<span style={{ color:"#fff",fontSize:11,fontWeight:700 }}>✓</span>:null}
          </div>
          <span style={{ fontSize:12,color:docs[i]?"#1A7A4A":"#8B8680",fontWeight:docs[i]?600:400 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

const inputStyle = { width:"100%",padding:"8px 12px",border:"1px solid #E0DDD6",borderRadius:8,fontSize:13,color:"#0A1628",background:"#FAFAF7",outline:"none",fontFamily:"inherit",boxSizing:"border-box" };

export default function App() {
  const [user, setUser]             = useState(null);
  const [page, setPage]             = useState("dashboard");
  const [loginUser, setLoginUser]   = useState("");
  const [loginPass, setLoginPass]   = useState("");
  const [loginError, setLoginError] = useState("");
  const [projects, setProjects]     = useState(INIT_DATA);
  const [loading, setLoading]       = useState(false);
  const [syncing, setSyncing]       = useState(false);
  const [sheetReady, setSheetReady] = useState(false);
  const [loadError, setLoadError]   = useState("");
  const [search, setSearch]         = useState("");
  const [fStatus, setFStatus]       = useState("");
  const [fAgent, setFAgent]         = useState("");
  const [fPM, setFPM]               = useState("");
  const [fDoc, setFDoc]             = useState("");
  const [fProgramYear, setFProgramYear] = useState("");
  const [sel, setSel]               = useState(null);
  const [drawerTab, setDrawerTab]   = useState("details");
  const [reviewTab, setReviewTab]   = useState("initial");
  const [eStatus, setEStatus]       = useState("");
  const [iDocs, setIDocs]           = useState([...EMPTY_DOCS]);
  const [iComment, setIComment]     = useState("");
  const [iReviewer, setIReviewer]   = useState("");
  const [fDocs, setFDocs]           = useState([...EMPTY_DOCS]);
  const [fComment, setFComment]     = useState("");
  const [fReviewer, setFReviewer]   = useState("");
  const [saved, setSaved]           = useState(false);
  const [newMsg, setNewMsg]         = useState("");
  const [showAdd, setShowAdd]       = useState(false);
  const [showEdit, setShowEdit]     = useState(false);
  const [seenMessages, setSeenMessages] = useState({});
  const [msgPolling, setMsgPolling]     = useState(null);
  const [editForm, setEditForm]     = useState(EMPTY_FORM);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formDocs, setFormDocs]     = useState([...EMPTY_DOCS]);

  const agents = useMemo(()=>[...new Set(projects.map(p=>p.agent).filter(Boolean))].sort(),[projects]);
  const pms    = useMemo(()=>[...new Set(projects.map(p=>p.pm).filter(Boolean))].sort(),[projects]);

  const list = useMemo(()=>projects.filter(p=>{
    // PMs can only see their own projects
    if (user?.role==="pm" && user?.pm && p.pm !== user.pm) return false;
    if (fStatus && p.status!==fStatus) return false;
    if (fAgent  && p.agent!==fAgent)   return false;
    if (fPM     && p.pm!==fPM)         return false;
    if (fDoc) { const idx=ITEMS.indexOf(fDoc); if(idx>=0&&!p.initialDocs[idx]) return false; }
    if (fProgramYear && p.programYear !== fProgramYear) return false;
    if (search && ![p.name,p.id,p.customer,p.agent,p.pm].some(v=>v.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  }),[projects,fStatus,fAgent,fPM,fDoc,fProgramYear,search,user]);

  const unreadCount = useMemo(()=>{
    if (!sel) return 0;
    const msgs = sel.messages||[];
    const seenId = Number(seenMessages[sel.id]||0);
    return msgs.filter(m=>Number(m.id||0)>seenId).length;
  },[sel,seenMessages]);

  const totals = useMemo(()=>({
    rec:       list.reduce((s,p)=>s+(p.recValue||0),0),
    dc:        list.reduce((s,p)=>s+(p.dcSize||0),0),
    approved:  list.filter(p=>p.status==="approved").length,
    flagged:   list.filter(p=>p.status==="flagged").length,
    initial:   list.filter(p=>p.status==="initial_review").length,
    final:     list.filter(p=>p.status==="final_review").length,
    pending:   list.filter(p=>p.status==="pending").length,
    submitted: list.filter(p=>p.status==="submitted").length,
  }),[list]);

  const anyFilter = fStatus||fAgent||fPM||fDoc||fProgramYear||search;
  const isAdmin   = user?.role==="admin";
  const isManager = user?.role==="manager"||isAdmin;

  function openProject(p) {
    setSel(p);
    setDrawerTab("details");
    setReviewTab("initial");
    setEStatus(p.status);
    setIDocs([...p.initialDocs]);
    setIComment(p.initialComment||"");
    setIReviewer(p.initialReviewer||"");
    setFDocs([...p.finalDocs]);
    setFComment(p.finalComment||"");
    setFReviewer(p.finalReviewer||"");
    setNewMsg("");
    setSaved(false);
  }

  async function saveProject() {
    const updated = { ...sel, status:eStatus, initialDocs:iDocs, initialComment:iComment, initialReviewer:iReviewer, finalDocs:fDocs, finalComment:fComment, finalReviewer:fReviewer };
    setProjects(prev=>prev.map(p=>p.id===sel.id?updated:p));
    setSel(updated);
    setSaved(true);
    setSyncing(true);
    try { await saveProjectToSheet(updated); } catch(e) { console.error("Sync error",e); }
    setSyncing(false);
  }

  

  function openEdit(p) {
    setEditForm({
      projectId: p.id || "",
      name: p.name || "",
      customer: p.customer || "",
      agent: p.agent || "",
      pm: p.pm || "",
      programYear: p.programYear || "",
      recValue: p.recValue || "",
      dcSize: p.dcSize || "",
      ejc: p.ejc || false,
      ec: p.ec || false,
      iec: p.iec || false,
    });
    setShowEdit(true);
  }

  async function saveEdit() {
    if (!editForm.projectId.trim()) return;
    const updated = {
      ...sel,
      id: editForm.projectId.trim(),
      name: editForm.name,
      customer: editForm.customer,
      agent: editForm.agent,
      pm: editForm.pm,
      programYear: editForm.programYear,
      recValue: parseFloat(editForm.recValue) || 0,
      dcSize: parseFloat(editForm.dcSize) || 0,
      ejc: editForm.ejc,
      ec: editForm.ec,
      iec: editForm.iec,
    };
    setProjects(prev => prev.map(p => p.id === sel.id ? updated : p));
    setSel(updated);
    setShowEdit(false);
    setSyncing(true);
    try { await saveProjectToSheet(updated); } catch(e) { console.error("Sync error", e); }
    setSyncing(false);
  }

  async function deleteProject(projectId) {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setSel(null);
    setSyncing(true);
    try {
      await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "delete_project", id: projectId }),
      });
    } catch(e) { console.error("Delete error", e); }
    setSyncing(false);
  }

  function sendMessage() {
    if (!newMsg.trim()) return;
    const senderName = user?.name || "Unknown";
    const senderRole = user?.role || "pm";
    const msg = {
      id: Date.now(),
      from: senderName,
      role: senderRole,
      text: newMsg.trim(),
      time: new Date().toLocaleString("en-US",{month:"2-digit",day:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})
    };
    const updated = { ...sel, messages:[...(sel.messages||[]), msg] };
    setProjects(prev => prev.map(p => p.id === sel.id ? updated : p));
    setSel(updated);
    setNewMsg("");
    fetch(API_URL, { method:"POST", body:JSON.stringify({ action:"save_project", project:updated }) }).catch(()=>{});
  }

  async function addProject() {
    if (!form.projectId.trim() || !form.programYear) return;
    const id = form.projectId.trim();
    const newProject = { ...form, id, programYear:form.programYear, recValue:parseFloat(form.recValue)||0, dcSize:parseFloat(form.dcSize)||0, status:"pending", initialDocs:[...formDocs], finalDocs:[...EMPTY_DOCS], initialComment:"", finalComment:"", initialReviewer:"", finalReviewer:"", messages:[] };
    setProjects(prev=>[newProject,...prev]);
    setForm(EMPTY_FORM);
    setFormDocs([...EMPTY_DOCS]);
    setShowAdd(false);
    setSyncing(true);
    try { await saveProjectToSheet(newProject); } catch(e) { console.error("Sync error",e); }
    setSyncing(false);
  }

  function toggleDoc(arr, setArr, i) { const n=[...arr]; n[i]=n[i]?0:1; setArr(n); }
  function handleLogin() {
    const found = USERS.find(u => u.username.toLowerCase() === loginUser.toLowerCase().trim() && u.password === loginPass);
    if (found) {
      setUser(found);
      setLoginError("");
      setLoginUser("");
      setLoginPass("");
    } else {
      setLoginError("Incorrect username or password.");
    }
  }

  function clearFilters() { setFStatus(""); setFAgent(""); setFPM(""); setFDoc(""); setFProgramYear(""); setSearch(""); }

  const loadFromSheet = useCallback(async (silent=false) => {
    if (!silent) setLoading(true);
    setLoadError("");
    try {
      const data = await fetchProjects();
      setProjects(data);
      setSheetReady(true);
      // If a project is open, refresh its messages too
      setSel(prev => {
        if (!prev) return prev;
        const fresh = data.find(p => p.id === prev.id);
        return fresh ? { ...prev, messages: fresh.messages || [] } : prev;
      });
    } catch(err) {
      if (!silent) setLoadError("Could not connect to Google Sheet. Check your connection.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadFromSheet();
      // Load seen message IDs from localStorage for this user
      try {
        const stored = localStorage.getItem("seen_" + user.username);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") setSeenMessages(parsed);
        }
      } catch(e) { localStorage.removeItem("seen_" + user.username); }
    } else {
      setSeenMessages({});
    }
  }, [user]);

  // Poll for new messages every 15s when drawer is open on messages tab
  useEffect(() => {
    if (sel && drawerTab === "messages") {
      const interval = setInterval(() => {
        loadFromSheet(true);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [sel?.id, drawerTab]);

  // Mark messages as seen whenever a project with messages is selected and visible
  useEffect(() => {
    if (!sel || !user) return;
    const msgs = sel.messages||[];
    if (msgs.length === 0) return;
    // Mark as seen if on messages page OR messages tab in drawer
    const shouldMark = page === "messages" || drawerTab === "messages";
    if (!shouldMark) return;
    const lastId = msgs.reduce((max,m)=>Math.max(max,Number(m.id)||0),0);
    const seenId = Number(seenMessages[sel.id]||0);
    if (lastId > seenId) {
      const updated = {...seenMessages, [sel.id]: lastId};
      setSeenMessages(updated);
      try {
        localStorage.setItem("seen_"+user.username, JSON.stringify(updated));
      } catch(e) {}
    }
  }, [sel?.id, page, drawerTab, sel?.messages?.length]);

  // Persist seenMessages to localStorage whenever it changes
  useEffect(() => {
    if (user && Object.keys(seenMessages).length > 0) {
      try {
        localStorage.setItem("seen_" + user.username, JSON.stringify(seenMessages));
      } catch(e) {}
    }
  }, [seenMessages, user]);

  // ── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (!user) return (
    <div style={{ fontFamily:"'Helvetica Neue',sans-serif",background:"#F7F5F0",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
      <div style={{ width:380,background:"#fff",borderRadius:16,boxShadow:"0 4px 32px rgba(0,0,0,0.10)",overflow:"hidden" }}>
        <div style={{ background:"#0F2044",padding:"28px 32px 24px" }}>
          <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:8 }}>
            <div style={{ width:40,height:40,background:"#3A8C58",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 3h16v3H2zm0 5h10v3H2zm0 5h12v3H2z" fill="#fff" opacity="0.9"/><circle cx="16" cy="15" r="3" fill="#6FCF8A"/></svg>
            </div>
            <div>
              <div style={{ color:"#FFFFFF",fontSize:16,fontWeight:700 }}>ILSFA Part I</div>
              <div style={{ color:"#94A3B8",fontSize:12 }}>Submission Review Dashboard</div>
            </div>
          </div>
        </div>
        <div style={{ padding:"28px 32px 32px" }}>
          <div style={{ fontSize:15,fontWeight:600,color:"#0A1628",marginBottom:4 }}>Sign in</div>
          <div style={{ fontSize:12,color:"#8B8680",marginBottom:24 }}>Enter your username and password to continue</div>
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            <div>
              <div style={{ fontSize:11,fontWeight:500,color:"#8B8680",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6 }}>Username</div>
              <input value={loginUser} onChange={e=>setLoginUser(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="Enter username" style={{ width:"100%",padding:"10px 14px",border:`1px solid ${loginError?"#F5C0BC":"#E0DDD6"}`,borderRadius:9,fontSize:13,color:"#0A1628",background:"#FAFAF7",outline:"none",fontFamily:"inherit",boxSizing:"border-box" }} autoFocus />
            </div>
            <div>
              <div style={{ fontSize:11,fontWeight:500,color:"#8B8680",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6 }}>Password</div>
              <input value={loginPass} onChange={e=>setLoginPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} type="password" placeholder="Enter password" style={{ width:"100%",padding:"10px 14px",border:`1px solid ${loginError?"#F5C0BC":"#E0DDD6"}`,borderRadius:9,fontSize:13,color:"#0A1628",background:"#FAFAF7",outline:"none",fontFamily:"inherit",boxSizing:"border-box" }} />
            </div>
            {loginError && <div style={{ background:"#FEF0EF",border:"1px solid #F5C0BC",borderRadius:8,padding:"9px 14px",fontSize:12,color:"#B03A2E" }}>⚠️ {loginError}</div>}
            <button onClick={handleLogin} style={{ padding:"11px",borderRadius:9,border:"none",background:"#2B5E3B",color:"#fff",fontFamily:"inherit",fontSize:14,fontWeight:600,cursor:"pointer",marginTop:4 }}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── MAIN DASHBOARD ──────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:"'Helvetica Neue',sans-serif",background:"#F7F5F0",minHeight:"100vh" }}>
      <style>{pulseStyle}</style>

      {/* Header */}
      <div style={{ background:"#0F2044",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div style={{ display:"flex",alignItems:"center",gap:24 }}>
          <div style={{ color:"#FFFFFF",fontSize:15,fontWeight:600 }}>ILSFA Part I</div>
          <div style={{ display:"flex",gap:4 }}>
            {["dashboard","messages","reports"].map(p=>(
              <button key={p} onClick={()=>setPage(p)} style={{ padding:"6px 14px",borderRadius:7,border:"none",background:page===p?"#F97316":"transparent",color:page===p?"#FFFFFF":"#94A3B8",borderRadius:page===p?"8px":"8px",fontFamily:"inherit",fontSize:12,fontWeight:500,cursor:"pointer",textTransform:"capitalize" }}>
                {p==="dashboard"?"📋 Dashboard":p==="messages"?"💬 Messages"+((()=>{
                  const visProjects = user?.role==="pm" ? projects.filter(pr=>pr.pm===user.pm) : projects;
                  const t=visProjects.reduce((s,pr)=>s+(pr.messages||[]).filter(m=>Number(m.id||0)>Number(seenMessages[pr.id]||0)).length,0);
                  return t>0?` (${t})`:""})()):"📊 Reports"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>

          {!sheetReady && !loading && (
            <button onClick={async()=>{ await initHeaders(); await loadFromSheet(); }} style={{ padding:"7px 14px",borderRadius:8,border:"1px solid #6FCF8A",background:"transparent",color:"#6FCF8A",fontFamily:"inherit",fontSize:12,fontWeight:500,cursor:"pointer" }}>
              ⚡ Initialize Sheet
            </button>
          )}
          {loading && <span style={{ fontSize:12,color:"#94A3B8" }}>⏳ Loading…</span>}
          {syncing && <span style={{ fontSize:12,color:"#6FCF8A" }}>⟳ Saving…</span>}
          {sheetReady && !loading && !syncing && (
            <button onClick={loadFromSheet} style={{ padding:"5px 12px",borderRadius:7,border:"1px solid #94A3B8",background:"transparent",color:"#FFFFFF",fontFamily:"inherit",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}>
              ↺ Refresh
            </button>
          )}
          <button onClick={()=>{ setForm({...EMPTY_FORM, pm: user?.role==="pm" ? user.pm : ""}); setFormDocs([...EMPTY_DOCS]); setShowAdd(true); }} style={{ padding:"7px 16px",borderRadius:8,border:"none",background:"#3A8C58",color:"#fff",fontFamily:"inherit",fontSize:12,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
            <span style={{ fontSize:16,lineHeight:1 }}>+</span> Add Project
          </button>
          <div style={{ display:"flex",alignItems:"center",gap:8,background:ROLES[user.role].bg,border:`1px solid ${ROLES[user.role].color}60`,borderRadius:8,padding:"5px 14px" }}>
            <div style={{ width:7,height:7,borderRadius:"50%",background:ROLES[user.role].color }}></div>
            <span style={{ color:ROLES[user.role].color,fontSize:12,fontWeight:500 }}>{user.name}</span>
            <span style={{ color:"#C8C4BA",fontSize:11,margin:"0 2px" }}>·</span>
            <span style={{ color:ROLES[user.role].color,fontSize:11,opacity:0.7 }}>{ROLES[user.role].label}</span>
          </div>
          <button onClick={()=>{ setUser(null); setProjects([]); setSheetReady(false); }} style={{ padding:"5px 12px",borderRadius:7,border:"1px solid #94A3B8",background:"transparent",color:"#FFFFFF",fontFamily:"inherit",fontSize:11,cursor:"pointer" }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ padding:"20px 24px",maxWidth:1400,margin:"0 auto" }}>

        {page === "dashboard" && <>
        {/* Summary cards */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr repeat(6,auto)",gap:10,marginBottom:14 }}>
          <div style={{ background:"#F0FBF4",border:"1px solid #A8E4C2",borderTop:"3px solid #1A7A4A",borderRadius:10,padding:"14px 18px" }}>
            <div style={{ fontSize:11,color:"#1A7A4A",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4 }}>Total REC Value{anyFilter?" (filtered)":""}</div>
            <div style={{ fontSize:24,fontWeight:700,color:"#1A7A4A" }}>{fmt(totals.rec)}</div>
            {anyFilter&&<div style={{ fontSize:11,color:"#3A8C58",marginTop:2 }}>{list.length}/{projects.length} projects</div>}
          </div>
          <div style={{ background:"#EBF4FF",border:"1px solid #BDDAF5",borderTop:"3px solid #1A5F9E",borderRadius:10,padding:"14px 18px" }}>
            <div style={{ fontSize:11,color:"#1A5F9E",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4 }}>Total DC Size{anyFilter?" (filtered)":""}</div>
            <div style={{ fontSize:24,fontWeight:700,color:"#1A5F9E" }}>{fmtKw(totals.dc)}</div>
            {anyFilter&&<div style={{ fontSize:11,color:"#4A8FCC",marginTop:2 }}>{list.length}/{projects.length} projects</div>}
          </div>
          {[["Approved",totals.approved,"#1A7A4A","#EBF9F1","#A8E4C2"],["Initial Review",totals.initial,"#1A5F9E","#EBF4FF","#BDDAF5"],["Final Review",totals.final,"#6B4CA8","#F3EEFF","#C9B3F5"],["Part I Submitted",totals.submitted,"#0369A1","#E0F2FE","#7DD3FC"],["Flagged",totals.flagged,"#B03A2E","#FEF0EF","#F5C0BC"],["Pending",totals.pending,"#8B7355","#FDF6EC","#E8D5B0"]].map(([l,v,c,bg,br])=>(
            <div key={l} style={{ background:bg,border:`1px solid ${br}`,borderTop:`3px solid ${c}`,borderRadius:10,padding:"14px 18px",minWidth:100 }}>
              <div style={{ fontSize:11,color:c,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4,whiteSpace:"nowrap" }}>{l}</div>
              <div style={{ fontSize:24,fontWeight:700,color:c }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background:"#fff",border:"1px solid #E8E5DE",borderRadius:10,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search project, customer…" style={{ padding:"6px 12px",border:"1px solid #E0DDD6",borderRadius:7,fontSize:12,width:220,outline:"none" }} />
          <div style={{ width:1,height:24,background:"#E8E5DE" }}></div>
          <SelFilter value={fStatus} onChange={setFStatus} placeholder="All Statuses" options={[{v:"pending",l:"Pending"},{v:"initial_review",l:"Initial Review"},{v:"final_review",l:"Final Review"},{v:"approved",l:"Approved"},{v:"flagged",l:"Flagged"},{v:"submitted",l:"Part I Submitted"}]} />
          <select value={fAgent} onChange={e=>setFAgent(e.target.value)} style={{ padding:"6px 10px",border:"1px solid #E0DDD6",borderRadius:7,fontSize:12,background:"#fff",color:fAgent?"#0A1628":"#94A3B8",outline:"none",cursor:"pointer",fontFamily:"inherit" }}>
            <option value="">Sales Agent</option>
            {AGENTS.map(grp=>(
              grp.group
                ? <optgroup key={grp.group} label={grp.group}>{grp.options.map(o=><option key={o} value={o}>{o}</option>)}</optgroup>
                : grp.options.map(o=><option key={o} value={o}>{o}</option>)
            ))}
          </select>
          <select value={fPM} onChange={e=>setFPM(e.target.value)} style={{ padding:"6px 10px",border:"1px solid #E0DDD6",borderRadius:7,fontSize:12,background:"#fff",color:fPM?"#0A1628":"#94A3B8",outline:"none",cursor:"pointer",fontFamily:"inherit" }}>
            <option value="">Project Manager</option>
            {PM_LIST.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
          <SelFilter value={fDoc}    onChange={setFDoc}    placeholder="Has Document" options={ITEMS} />
          <select value={fProgramYear} onChange={e=>setFProgramYear(e.target.value)} style={{ padding:"6px 10px",border:"1px solid #E0DDD6",borderRadius:7,fontSize:12,background:"#fff",color:fProgramYear?"#0A1628":"#94A3B8",outline:"none",cursor:"pointer",fontFamily:"inherit" }}>
            <option value="">Program Year</option>
            {["PY8-2026","PY8-2026 Waitlisted"].map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          {anyFilter && <button onClick={clearFilters} style={{ padding:"5px 12px",borderRadius:6,border:"1px solid #E0DDD6",background:"#fff",fontFamily:"inherit",fontSize:11,color:"#B03A2E",cursor:"pointer",fontWeight:500 }}>✕ Clear</button>}
          <div style={{ marginLeft:"auto",fontSize:12,color:"#8B8680",fontWeight:500 }}>{list.length} project{list.length!==1?"s":""}</div>
        </div>

        {/* Table */}
        <div style={{ background:"#fff",border:"1px solid #E8E5DE",borderRadius:12,overflow:"hidden",marginBottom:20 }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
              <thead>
                <tr style={{ background:"#FAFAF7" }}>
                  {["Project ID","Program Year","Customer","Sales Agent","Project Manager","REC Value","DC Size","Initial Docs","Final Docs","Status","Messages",""].map(h=>(
                    <th key={h} style={{ padding:"8px 14px",textAlign:"left",fontWeight:500,color:"#8B8680",fontSize:11,borderBottom:"1px solid #F0EDE6",whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={12} style={{ padding:"60px",textAlign:"center" }}>
                    <div style={{ fontSize:14,color:"#8B8680",marginBottom:8 }}>⏳ Loading projects from Google Sheet…</div>
                  </td></tr>
                ) : loadError ? (
                  <tr><td colSpan={12} style={{ padding:"40px",textAlign:"center" }}>
                    <div style={{ fontSize:13,color:"#B03A2E",marginBottom:12 }}>⚠️ {loadError}</div>
                    <button onClick={loadFromSheet} style={{ padding:"7px 16px",borderRadius:7,border:"1px solid #E0DDD6",background:"#fff",fontFamily:"inherit",fontSize:12,cursor:"pointer",color:"#0A1628" }}>Try again</button>
                  </td></tr>
                ) : !sheetReady ? (
                  <tr><td colSpan={12} style={{ padding:"60px",textAlign:"center" }}>
                    <div style={{ fontSize:14,color:"#8B8680",marginBottom:6 }}>📋 Sheet not initialized yet</div>
                    <div style={{ fontSize:12,color:"#94A3B8",marginBottom:16 }}>Click "Initialize Sheet" in the header to set up your Google Sheet headers first.</div>
                  </td></tr>
                ) : list.length===0 ? (
                  <tr><td colSpan={12} style={{ padding:"60px",textAlign:"center" }}>
                    <div style={{ fontSize:14,color:"#8B8680",marginBottom:6 }}>No projects yet</div>
                    <div style={{ fontSize:12,color:"#94A3B8" }}>Click "+ Add Project" to add your first project.</div>
                  </td></tr>
                ) : list.map((p,i)=>(
                  <tr key={p.id} onClick={()=>openProject(p)} style={{ background:i%2===0?"#fff":"#FDFCFA",borderBottom:"1px solid #F5F3EE",cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#EFEDE7"}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"#FDFCFA"}>
                    <td style={{ padding:"10px 14px",fontFamily:"monospace",fontSize:11,color:"#8B8680" }}>{p.id}</td>
                    <td style={{ padding:"10px 14px" }}>{p.programYear ? <span style={{ display:"inline-flex",alignItems:"center",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:"#F3EEFF",color:"#6B4CA8",border:"1px solid #C9B3F5" }}>{p.programYear}</span> : <span style={{ color:"#C8C4BA",fontSize:11 }}>—</span>}</td>
                    <td style={{ padding:"10px 14px" }}><div style={{ display:"flex",alignItems:"center",gap:7 }}><Avatar name={p.customer} /><span style={{ color:"#5A5652",whiteSpace:"nowrap" }}>{p.customer}</span></div></td>
                    <td style={{ padding:"10px 14px" }}><div style={{ display:"flex",alignItems:"center",gap:7 }}><Avatar name={p.agent} /><span style={{ color:"#5A5652" }}>{p.agent}</span></div></td>
                    <td style={{ padding:"10px 14px" }}>{p.pm?<div style={{ display:"flex",alignItems:"center",gap:7 }}><Avatar name={p.pm} /><span style={{ color:"#5A5652" }}>{p.pm}</span></div>:<span style={{ color:"#C8C4BA",fontSize:11 }}>Unassigned</span>}</td>
                    <td style={{ padding:"10px 14px",fontFamily:"monospace",fontSize:11,color:"#1A7A4A",fontWeight:600 }}>{p.recValue?fmt(p.recValue):"—"}</td>
                    <td style={{ padding:"10px 14px",fontFamily:"monospace",fontSize:11,color:"#1A5F9E" }}>{p.dcSize?fmtKw(p.dcSize):"—"}</td>
                    <td style={{ padding:"10px 14px" }}><DocsBar docs={p.initialDocs} /></td>
                    <td style={{ padding:"10px 14px" }}><DocsBar docs={p.finalDocs} /></td>
                    <td style={{ padding:"10px 14px" }}><Pill status={p.status} /></td>
                    <td style={{ padding:"10px 14px" }}>
                      {(p.messages||[]).length > 0
                        ? (() => {
                            const msgs = p.messages||[];
                            const seenId = seenMessages[p.id]||0;
                            const unread = msgs.filter(m=>(m.id||0)>seenId).length;
                            return <span style={{ display:"inline-flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:500,background:unread>0?"#FEF0EF":"#EBF4FF",color:unread>0?"#B03A2E":"#1A5F9E",border:`1px solid ${unread>0?"#F5C0BC":"#BDDAF5"}` }}>
                              💬 {msgs.length}{unread>0 && <span style={{ background:"#B03A2E",color:"#fff",fontSize:10,fontWeight:700,padding:"1px 5px",borderRadius:8 }}>{unread} new</span>}
                            </span>;
                          })()
                        : <span style={{ color:"#C8C4BA",fontSize:11 }}>—</span>}
                    </td>
                    <td style={{ padding:"10px 14px" }}><div style={{ width:20,height:20,borderRadius:4,border:"1px solid #E0DDD6",display:"flex",alignItems:"center",justifyContent:"center",color:"#8B8680",fontSize:10 }}>›</div></td>
                  </tr>
                ))}
              </tbody>
              {list.length>1&&(
                <tfoot>
                  <tr style={{ background:"#FAFAF7",borderTop:"2px solid #E8E5DE" }}>
                    <td colSpan={5} style={{ padding:"10px 14px",fontSize:11,fontWeight:600,color:"#8B8680" }}>TOTALS ({list.length} projects)</td>
                    <td style={{ padding:"10px 14px",fontFamily:"monospace",fontSize:12,color:"#1A7A4A",fontWeight:700 }}>{fmt(totals.rec)}</td>
                    <td style={{ padding:"10px 14px",fontFamily:"monospace",fontSize:12,color:"#1A5F9E",fontWeight:700 }}>{fmtKw(totals.dc)}</td>
                    <td colSpan={5}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Admin Analytics */}
        {isAdmin&&(
          <div style={{ background:"#0A1628",borderRadius:12,padding:"20px 24px",marginBottom:20 }}>
            <div style={{ fontSize:13,fontWeight:600,color:"#F7F5F0",marginBottom:16 }}>⭐ Admin Overview</div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16 }}>
              <div style={{ background:"#0F2044",borderRadius:10,padding:"14px 16px" }}>
                <div style={{ fontSize:11,color:"#94A3B8",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10 }}>By Sales Agent</div>
                {agents.map(agent=>{
                  const ap=projects.filter(p=>p.agent===agent);
                  return <div key={agent} style={{ marginBottom:10,paddingBottom:10,borderBottom:"1px solid #3A3830" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}><Avatar name={agent} size={20}/><span style={{ fontSize:12,fontWeight:500,color:"#F7F5F0" }}>{agent}</span></div>
                      <span style={{ fontSize:11,color:"#6FCF8A",fontFamily:"monospace" }}>{fmt(ap.reduce((s,p)=>s+(p.recValue||0),0))}</span>
                    </div>
                    <div style={{ fontSize:10,color:"#94A3B8" }}>{ap.length} projects · <span style={{ color:"#6FCF8A" }}>{ap.filter(p=>p.status==="approved").length} approved</span></div>
                  </div>;
                })}
              </div>
              <div style={{ background:"#0F2044",borderRadius:10,padding:"14px 16px" }}>
                <div style={{ fontSize:11,color:"#94A3B8",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10 }}>By Project Manager</div>
                {pms.length>0?pms.map(pm=>{
                  const pp=projects.filter(p=>p.pm===pm);
                  return <div key={pm} style={{ marginBottom:10,paddingBottom:10,borderBottom:"1px solid #3A3830" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}><Avatar name={pm} size={20}/><span style={{ fontSize:12,fontWeight:500,color:"#F7F5F0" }}>{pm}</span></div>
                      <span style={{ fontSize:11,color:"#6FCF8A",fontFamily:"monospace" }}>{fmt(pp.reduce((s,p)=>s+(p.recValue||0),0))}</span>
                    </div>
                    <div style={{ fontSize:10,color:"#94A3B8" }}>{pp.length} projects · <span style={{ color:"#6FCF8A" }}>{pp.filter(p=>p.status==="approved").length} approved</span></div>
                  </div>;
                }):<div style={{ fontSize:12,color:"#94A3B8" }}>No PMs assigned yet.</div>}
              </div>
              <div style={{ background:"#0F2044",borderRadius:10,padding:"14px 16px" }}>
                <div style={{ fontSize:11,color:"#94A3B8",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10 }}>Document Completion</div>
                {ITEMS.map((item,idx)=>{
                  const pct=Math.round((projects.filter(p=>p.initialDocs[idx]).length/projects.length)*100);
                  return <div key={item} style={{ marginBottom:7 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:2 }}>
                      <span style={{ fontSize:11,color:"#94A3B8" }}>{item}</span>
                      <span style={{ fontSize:11,color:pct===100?"#6FCF8A":pct>=50?"#4A8FCC":"#D4614F",fontFamily:"monospace" }}>{pct}%</span>
                    </div>
                    <div style={{ height:4,background:"#1E3A5F",borderRadius:2,overflow:"hidden" }}>
                      <div style={{ width:`${pct}%`,height:"100%",background:pct===100?"#3A8C58":pct>=50?"#4A8FCC":"#D4614F",borderRadius:2 }}></div>
                    </div>
                  </div>;
                })}
              </div>
              <div style={{ background:"#0F2044",borderRadius:10,padding:"14px 16px" }}>
                <div style={{ fontSize:11,color:"#94A3B8",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10 }}>Pipeline Summary</div>
                {Object.entries(STATUS).map(([k,s])=>{
                  const cnt=projects.filter(p=>p.status===k).length;
                  const pct=Math.round((cnt/projects.length)*100);
                  return <div key={k} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3 }}>
                      <span style={{ fontSize:12,fontWeight:500,color:s.color }}>{s.label}</span>
                      <span style={{ fontSize:11,color:"#94A3B8" }}>{cnt} · {fmt(projects.filter(p=>p.status===k).reduce((sum,p)=>sum+(p.recValue||0),0))}</span>
                    </div>
                    <div style={{ height:5,background:"#1E3A5F",borderRadius:3,overflow:"hidden" }}>
                      <div style={{ width:`${pct}%`,height:"100%",background:s.color,borderRadius:3,opacity:0.8 }}></div>
                    </div>
                  </div>;
                })}
                <div style={{ marginTop:14,paddingTop:12,borderTop:"1px solid #3A3830" }}>
                  <div style={{ fontSize:11,color:"#94A3B8",marginBottom:4 }}>Total Portfolio</div>
                  <div style={{ fontSize:18,fontWeight:700,color:"#6FCF8A" }}>{fmt(projects.reduce((s,p)=>s+(p.recValue||0),0))}</div>
                  <div style={{ fontSize:12,color:"#4A8FCC",marginTop:2 }}>{fmtKw(projects.reduce((s,p)=>s+(p.dcSize||0),0))}</div>
                </div>
              </div>
            </div>
            <div style={{ display:"flex",justifyContent:"flex-end" }}>
              <button onClick={()=>{
                const header=["Project ID","Name","Customer","Agent","PM","REC Value","DC Size","Status","Initial Docs","Final Docs","Initial Comment","Final Comment"].join(",");
                const rows=[header,...projects.map(p=>[p.id,'"'+p.name+'"','"'+p.customer+'"',p.agent,p.pm,p.recValue,p.dcSize,p.status,p.initialDocs.filter(Boolean).length+"/"+ITEMS.length,p.finalDocs.filter(Boolean).length+"/"+ITEMS.length,'"'+p.initialComment+'"','"'+p.finalComment+'"'].join(","))].join("\n");
                const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([rows],{type:"text/csv"})); a.download="ILSFA_projects.csv"; a.click();
              }} style={{ padding:"8px 20px",borderRadius:8,border:"1px solid #94A3B8",background:"transparent",color:"#FFFFFF",fontFamily:"inherit",fontSize:12,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:7 }}>
                ↓ Export CSV
              </button>
            </div>
          </div>
        )}
        </>}

        {/* ── MESSAGES PAGE ─────────────────────────────────────────────── */}
        {page === "messages" && (
          <div style={{ background:"#fff",border:"1px solid #E8E5DE",borderRadius:12,overflow:"hidden" }}>
            <div style={{ padding:"16px 20px",borderBottom:"1px solid #F0EDE6",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div style={{ fontSize:14,fontWeight:600,color:"#0A1628" }}>All Messages</div>
              <div style={{ fontSize:12,color:"#8B8680" }}>{projects.filter(p=>(p.messages||[]).length>0).length} conversations</div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"280px 1fr",height:"calc(100vh - 220px)" }}>
              {/* Left: conversation list */}
              <div style={{ borderRight:"1px solid #F0EDE6",overflowY:"auto" }}>
                {projects.filter(p=>{
                  if(user?.role==="pm" && p.pm!==user.pm) return false;
                  return (p.messages||[]).length>0;
                }).length===0 && (
                  <div style={{ padding:"40px 20px",textAlign:"center",color:"#94A3B8",fontSize:13 }}>No conversations yet</div>
                )}
                {projects.filter(p=>{
                  if(user?.role==="pm" && p.pm!==user.pm) return false;
                  return (p.messages||[]).length>0;
                }).map(p=>{
                  const msgs=p.messages||[];
                  const seenId=seenMessages[p.id]||0;
                  const unread=msgs.filter(m=>Number(m.id||0)>Number(seenId||0)).length;
                  const last=msgs[msgs.length-1];
                  const isActive=sel?.id===p.id;
                  return (
                    <div key={p.id} onClick={()=>{
                      openProject(p);
                      setDrawerTab("messages");
                      // Immediately mark as seen
                      const pMsgs = p.messages||[];
                      if (pMsgs.length > 0) {
                        const lastId = pMsgs.reduce((max,m)=>Math.max(max,Number(m.id)||0),0);
                        const updated = {...seenMessages, [p.id]: lastId};
                        setSeenMessages(updated);
                        try { localStorage.setItem("seen_"+user.username, JSON.stringify(updated)); } catch(e){}
                      }
                    }} style={{ padding:"14px 16px",borderBottom:"1px solid #F5F3EE",cursor:"pointer",background:isActive?"#F0FBF4":unread>0?"#FEF9F0":"#fff",transition:"background 0.1s" }}
                      onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background="#FAFAF7"; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background=isActive?"#F0FBF4":unread>0?"#FEF9F0":"#fff"; }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4 }}>
                        <div style={{ fontSize:12,fontWeight:600,color:"#0A1628" }}>{p.id}</div>
                        {unread>0 && <span style={{ background:"#B03A2E",color:"#fff",fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:10 }}>{unread}</span>}
                      </div>
                      <div style={{ fontSize:11,color:"#5A5652",marginBottom:4 }}>{p.customer}</div>
                      {last && <div style={{ fontSize:11,color:"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{last.from}: {last.text}</div>}
                      {last && <div style={{ fontSize:10,color:"#C8C4BA",marginTop:3 }}>{last.time}</div>}
                    </div>
                  );
                })}
              </div>
              {/* Right: active conversation */}
              <div style={{ display:"flex",flexDirection:"column",overflow:"hidden" }}>
                {!sel ? (
                  <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:"#94A3B8",fontSize:13 }}>
                    <div style={{ textAlign:"center" }}><div style={{ fontSize:32,marginBottom:10 }}>💬</div>Select a conversation</div>
                  </div>
                ) : (
                  <>
                    <div style={{ padding:"14px 20px",borderBottom:"1px solid #F0EDE6",flexShrink:0 }}>
                      <div style={{ fontSize:13,fontWeight:600,color:"#0A1628" }}>{sel.id} — {sel.customer}</div>
                      <div style={{ fontSize:11,color:"#8B8680",marginTop:2 }}>PM: {sel.pm||"Unassigned"} · Agent: {sel.agent}</div>
                    </div>
                    <div style={{ flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:12,minHeight:0 }}>
                      {(sel.messages||[]).map(msg=>{
                        const isMe=msg.role===user?.role;
                        const rc=msg.role==="manager"?"#1A5F9E":msg.role==="admin"?"#0A1628":"#6B4CA8";
                        const rb=msg.role==="manager"?"#EBF4FF":msg.role==="admin"?"#F0EDE6":"#F3EEFF";
                        return (
                          <div key={msg.id} style={{ display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start" }}>
                            <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:4,flexDirection:isMe?"row-reverse":"row" }}>
                              <Avatar name={msg.from} size={20}/>
                              <span style={{ fontSize:11,fontWeight:600,color:rc }}>{msg.from}</span>
                              <span style={{ fontSize:10,padding:"1px 6px",borderRadius:10,background:rb,color:rc,fontWeight:500 }}>{msg.role==="manager"?"Reviewer":msg.role==="admin"?"Admin":"PM"}</span>
                              <span style={{ fontSize:10,color:"#94A3B8" }}>{msg.time}</span>
                            </div>
                            <div style={{ maxWidth:"75%",padding:"10px 14px",borderRadius:isMe?"12px 4px 12px 12px":"4px 12px 12px 12px",background:isMe?"#0F2044":"#F5F3EE",color:isMe?"#F7F5F0":"#0A1628",fontSize:13,lineHeight:1.6 }}>
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ padding:"14px 20px",borderTop:"1px solid #F0EDE6",flexShrink:0 }}>
                      <div style={{ display:"flex",gap:8 }}>
                        <textarea value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}} placeholder="Type a message… (Enter to send)" rows={2} style={{ flex:1,padding:"9px 12px",border:"1px solid #E0DDD6",borderRadius:8,fontSize:13,color:"#0A1628",resize:"none",background:"#FAFAF7",outline:"none",fontFamily:"inherit",lineHeight:1.5 }} />
                        <button onClick={()=>sendMessage()} style={{ padding:"0 18px",borderRadius:8,border:"none",background:newMsg.trim()?"#0A1628":"#E0DDD6",color:"#fff",cursor:newMsg.trim()?"pointer":"default",fontFamily:"inherit",fontSize:12,fontWeight:500,flexShrink:0 }}>Send</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── REPORTS PAGE ──────────────────────────────────────────────── */}
        {page === "reports" && (
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            {/* Top row summary */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12 }}>
              {[
                ["Total Projects",projects.length,"#4A4640"],
                ["Total REC Value",fmt(projects.reduce((s,p)=>s+(p.recValue||0),0)),"#1A7A4A"],
                ["Total DC Size",fmtKw(projects.reduce((s,p)=>s+(p.dcSize||0),0)),"#1A5F9E"],
                ["Approved",projects.filter(p=>p.status==="approved").length+" / "+projects.length,"#1A7A4A"],
              ].map(([l,v,c])=>(
                <div key={l} style={{ background:"#fff",border:"1px solid #E8E5DE",borderTop:`3px solid ${c}`,borderRadius:10,padding:"16px 20px" }}>
                  <div style={{ fontSize:11,color:"#8B8680",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6 }}>{l}</div>
                  <div style={{ fontSize:24,fontWeight:700,color:c }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
              {/* Status Breakdown */}
              <div style={{ background:"#fff",border:"1px solid #E8E5DE",borderRadius:12,padding:"20px" }}>
                <div style={{ fontSize:13,fontWeight:600,color:"#0A1628",marginBottom:16 }}>Status Breakdown</div>
                {Object.entries(STATUS).map(([k,s])=>{
                  const cnt=projects.filter(p=>p.status===k).length;
                  const pct=projects.length>0?Math.round((cnt/projects.length)*100):0;
                  const rec=projects.filter(p=>p.status===k).reduce((sum,p)=>sum+(p.recValue||0),0);
                  return (
                    <div key={k} style={{ marginBottom:14 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                          <span style={{ width:10,height:10,borderRadius:"50%",background:s.color,display:"inline-block" }}></span>
                          <span style={{ fontSize:13,fontWeight:500,color:"#0A1628" }}>{s.label}</span>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <span style={{ fontSize:13,fontWeight:600,color:s.color }}>{cnt}</span>
                          <span style={{ fontSize:11,color:"#8B8680",marginLeft:6 }}>{fmt(rec)}</span>
                        </div>
                      </div>
                      <div style={{ height:8,background:"#F0EDE6",borderRadius:4,overflow:"hidden" }}>
                        <div style={{ width:`${pct}%`,height:"100%",background:s.color,borderRadius:4,transition:"width 0.5s" }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Program Year Breakdown */}
              <div style={{ background:"#fff",border:"1px solid #E8E5DE",borderRadius:12,padding:"20px" }}>
                <div style={{ fontSize:13,fontWeight:600,color:"#0A1628",marginBottom:16 }}>Program Year Breakdown</div>
                {["PY8-2026","PY8-2026 Waitlisted"].map(py=>{
                  const pyProjects=projects.filter(p=>p.programYear===py);
                  const rec=pyProjects.reduce((s,p)=>s+(p.recValue||0),0);
                  const dc=pyProjects.reduce((s,p)=>s+(p.dcSize||0),0);
                  const approved=pyProjects.filter(p=>p.status==="approved").length;
                  return (
                    <div key={py} style={{ marginBottom:16,padding:"14px 16px",background:py==="PY8-2026"?"#F3EEFF":"#FDF6EC",border:`1px solid ${py==="PY8-2026"?"#C9B3F5":"#E8D5B0"}`,borderRadius:10 }}>
                      <div style={{ fontSize:13,fontWeight:600,color:py==="PY8-2026"?"#6B4CA8":"#8B7355",marginBottom:8 }}>{py}</div>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
                        <div><div style={{ fontSize:10,color:"#8B8680",marginBottom:2 }}>PROJECTS</div><div style={{ fontSize:16,fontWeight:700,color:"#0A1628" }}>{pyProjects.length}</div></div>
                        <div><div style={{ fontSize:10,color:"#8B8680",marginBottom:2 }}>REC VALUE</div><div style={{ fontSize:14,fontWeight:700,color:"#1A7A4A" }}>{fmt(rec)}</div></div>
                        <div><div style={{ fontSize:10,color:"#8B8680",marginBottom:2 }}>DC SIZE</div><div style={{ fontSize:14,fontWeight:700,color:"#1A5F9E" }}>{fmtKw(dc)}</div></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
              {/* By Sales Agent */}
              <div style={{ background:"#fff",border:"1px solid #E8E5DE",borderRadius:12,padding:"20px" }}>
                <div style={{ fontSize:13,fontWeight:600,color:"#0A1628",marginBottom:16 }}>By Sales Agent</div>
                <div style={{ overflowY:"auto",maxHeight:300 }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                    <thead><tr style={{ background:"#FAFAF7" }}>
                      {["Agent","Projects","REC Value","DC Size","Approved"].map(h=><th key={h} style={{ padding:"7px 10px",textAlign:"left",fontWeight:500,color:"#8B8680",fontSize:11,borderBottom:"1px solid #F0EDE6" }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {[...new Set(projects.map(p=>p.agent).filter(Boolean))].sort().map(agent=>{
                        const ap=projects.filter(p=>p.agent===agent);
                        return <tr key={agent} style={{ borderBottom:"1px solid #F5F3EE" }}>
                          <td style={{ padding:"8px 10px" }}><div style={{ display:"flex",alignItems:"center",gap:7 }}><Avatar name={agent} size={22}/>{agent}</div></td>
                          <td style={{ padding:"8px 10px",color:"#0A1628",fontWeight:500 }}>{ap.length}</td>
                          <td style={{ padding:"8px 10px",color:"#1A7A4A",fontWeight:500 }}>{fmt(ap.reduce((s,p)=>s+(p.recValue||0),0))}</td>
                          <td style={{ padding:"8px 10px",color:"#1A5F9E" }}>{fmtKw(ap.reduce((s,p)=>s+(p.dcSize||0),0))}</td>
                          <td style={{ padding:"8px 10px" }}><span style={{ color:"#1A7A4A",fontWeight:600 }}>{ap.filter(p=>p.status==="approved").length}</span><span style={{ color:"#C8C4BA" }}>/{ap.length}</span></td>
                        </tr>;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* By Project Manager */}
              <div style={{ background:"#fff",border:"1px solid #E8E5DE",borderRadius:12,padding:"20px" }}>
                <div style={{ fontSize:13,fontWeight:600,color:"#0A1628",marginBottom:16 }}>By Project Manager</div>
                <div style={{ overflowY:"auto",maxHeight:300 }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
                    <thead><tr style={{ background:"#FAFAF7" }}>
                      {["PM","Projects","REC Value","DC Size","Approved"].map(h=><th key={h} style={{ padding:"7px 10px",textAlign:"left",fontWeight:500,color:"#8B8680",fontSize:11,borderBottom:"1px solid #F0EDE6" }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {PM_LIST.map(pm=>{
                        const pp=projects.filter(p=>p.pm===pm);
                        if(pp.length===0) return null;
                        return <tr key={pm} style={{ borderBottom:"1px solid #F5F3EE" }}>
                          <td style={{ padding:"8px 10px" }}><div style={{ display:"flex",alignItems:"center",gap:7 }}><Avatar name={pm} size={22}/>{pm}</div></td>
                          <td style={{ padding:"8px 10px",color:"#0A1628",fontWeight:500 }}>{pp.length}</td>
                          <td style={{ padding:"8px 10px",color:"#1A7A4A",fontWeight:500 }}>{fmt(pp.reduce((s,p)=>s+(p.recValue||0),0))}</td>
                          <td style={{ padding:"8px 10px",color:"#1A5F9E" }}>{fmtKw(pp.reduce((s,p)=>s+(p.dcSize||0),0))}</td>
                          <td style={{ padding:"8px 10px" }}><span style={{ color:"#1A7A4A",fontWeight:600 }}>{pp.filter(p=>p.status==="approved").length}</span><span style={{ color:"#C8C4BA" }}>/{pp.length}</span></td>
                        </tr>;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Document completion */}
            <div style={{ background:"#fff",border:"1px solid #E8E5DE",borderRadius:12,padding:"20px" }}>
              <div style={{ fontSize:13,fontWeight:600,color:"#0A1628",marginBottom:16 }}>Document Completion Rate (Initial Review)</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10 }}>
                {ITEMS.map((item,idx)=>{
                  const checked=projects.filter(p=>p.initialDocs&&p.initialDocs[idx]).length;
                  const pct=projects.length>0?Math.round((checked/projects.length)*100):0;
                  const color=pct===100?"#3A8C58":pct>=70?"#4A8FCC":pct>=40?"#F5A623":"#D4614F";
                  return (
                    <div key={item} style={{ background:"#FAFAF7",border:"1px solid #F0EDE6",borderRadius:8,padding:"12px" }}>
                      <div style={{ fontSize:11,fontWeight:600,color:"#0A1628",marginBottom:8 }}>{item}</div>
                      <div style={{ height:6,background:"#F0EDE6",borderRadius:3,overflow:"hidden",marginBottom:6 }}>
                        <div style={{ width:`${pct}%`,height:"100%",background:color,borderRadius:3 }}></div>
                      </div>
                      <div style={{ display:"flex",justifyContent:"space-between" }}>
                        <span style={{ fontSize:11,color:"#8B8680" }}>{checked}/{projects.length}</span>
                        <span style={{ fontSize:11,fontWeight:600,color }}>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Export */}
            <div style={{ display:"flex",justifyContent:"flex-end" }}>
              <button onClick={()=>{
                const hdr=["Project ID","Program Year","Customer","Agent","PM","REC Value","DC Size","Status","Initial Docs","Final Docs","EJC","EC","IEC"].join(",");
                const rowData=projects.map(p=>{
                  const iD=p.initialDocs?p.initialDocs.filter(Boolean).length+"/"+ITEMS.length:"0/"+ITEMS.length;
                  const fD=p.finalDocs?p.finalDocs.filter(Boolean).length+"/"+ITEMS.length:"0/"+ITEMS.length;
                  return [p.id||"",p.programYear||"",'"'+(p.customer||"")+'"',p.agent||"",p.pm||"",p.recValue||0,p.dcSize||0,p.status||"",iD,fD,p.ejc?"Yes":"No",p.ec?"Yes":"No",p.iec?"Yes":"No"].join(",");
                });
                const csv=[hdr,...rowData].join("\n");
                const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download="ILSFA_Report.csv"; a.click();
              }} style={{ padding:"10px 24px",borderRadius:8,border:"none",background:"#2B5E3B",color:"#fff",fontFamily:"inherit",fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:8 }}>
                ↓ Export Full Report (CSV)
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── DETAIL DRAWER ───────────────────────────────────────────────────── */}
      {sel&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(28,26,23,0.45)",display:"flex",justifyContent:"flex-end",zIndex:100 }} onClick={e=>{ if(e.target===e.currentTarget) setSel(null); }}>
          <div style={{ width:540,background:"#fff",height:"100vh",maxHeight:"100vh",display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,0.12)",overflow:"hidden" }}>

            {/* Fixed top info */}
            <div style={{ padding:"16px 22px",borderBottom:"1px solid #F0EDE6",flexShrink:0 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:11,fontFamily:"monospace",color:"#8B8680",marginBottom:3 }}>{sel.id}</div>
                  <div style={{ fontSize:16,fontWeight:600,color:"#0A1628" }}>{sel.name}</div>
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  <button onClick={()=>openEdit(sel)} style={{ padding:"5px 12px",borderRadius:6,border:"1px solid #E0DDD6",background:"#FAFAF7",cursor:"pointer",fontSize:12,color:"#5A5652",fontFamily:"inherit",fontWeight:500,display:"flex",alignItems:"center",gap:5 }}>
                    ✏️ Edit Info
                  </button>
                  <button onClick={()=>setSel(null)} style={{ width:28,height:28,borderRadius:6,border:"1px solid #E0DDD6",background:"transparent",cursor:"pointer",fontSize:16,color:"#8B8680" }}>×</button>
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10 }}>
                {[["Customer",sel.customer],["Sales Agent",sel.agent],["Project Manager",sel.pm||"Unassigned"]].map(([l,v])=>(
                  <div key={l} style={{ background:"#FAFAF7",border:"1px solid #F0EDE6",borderRadius:8,padding:"8px 10px" }}>
                    <div style={{ fontSize:10,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5 }}>{l}</div>
                    <div style={{ display:"flex",alignItems:"center",gap:6 }}><Avatar name={v!=="Unassigned"?v:""} size={20}/><span style={{ fontSize:12,fontWeight:500,color:v==="Unassigned"?"#C8C4BA":"#0A1628" }}>{v}</span></div>
                  </div>
                ))}
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10 }}>
                <div style={{ background:"#F0FBF4",border:"1px solid #A8E4C2",borderRadius:8,padding:"10px 14px" }}>
                  <div style={{ fontSize:10,color:"#1A7A4A",textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:500,marginBottom:4 }}>Total REC Value</div>
                  <div style={{ fontSize:18,fontWeight:700,color:"#1A7A4A" }}>{sel.recValue?fmt(sel.recValue):"—"}</div>
                </div>
                <div style={{ background:"#EBF4FF",border:"1px solid #BDDAF5",borderRadius:8,padding:"10px 14px" }}>
                  <div style={{ fontSize:10,color:"#1A5F9E",textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:500,marginBottom:4 }}>DC Size</div>
                  <div style={{ fontSize:18,fontWeight:700,color:"#1A5F9E" }}>{sel.dcSize?fmtKw(sel.dcSize):"—"}</div>
                </div>
              </div>
              <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
                {sel.programYear && <span style={{ padding:"3px 12px",borderRadius:20,fontSize:11,fontWeight:600,background:"#F3EEFF",color:"#6B4CA8",border:"1px solid #C9B3F5" }}>📅 {sel.programYear}</span>}
                {[["ejc","EJC"],["ec","EC"],["iec","IEC"]].map(([key,label])=>(
                  <span key={key} style={{ padding:"3px 12px",borderRadius:20,fontSize:11,fontWeight:600,border:`1px solid ${sel[key]?"#3A8C58":"#E0DDD6"}`,background:sel[key]?"#EBF9F1":"#F5F3EE",color:sel[key]?"#1A7A4A":"#94A3B8" }}>
                    {sel[key]?"✓ ":""}{label}
                  </span>
                ))}
              </div>
            </div>

            {/* Details / Messages tabs */}
            <div style={{ display:"flex",borderBottom:"1px solid #F0EDE6",background:"#FAFAF7",flexShrink:0 }}>
              {/* Details Tab */}
              <button onClick={()=>{ setDrawerTab("details"); }} style={{ flex:1,padding:"10px",border:"none",background:"transparent",fontFamily:"inherit",fontSize:12,fontWeight:500,cursor:"pointer",color:drawerTab==="details"?"#0A1628":"#8B8680",borderBottom:`2px solid ${drawerTab==="details"?"#0A1628":"transparent"}` }}>
                📋 Details
              </button>
              {/* Messages Tab */}
              <button onClick={()=>{ 
                  setDrawerTab("messages"); 
                  loadFromSheet(true).then(()=>{
                    setSel(prev=>prev ? prev : prev);
                  });
                }} style={{ flex:1,padding:"10px",border:"none",background:"transparent",fontFamily:"inherit",fontSize:12,fontWeight:500,cursor:"pointer",color:drawerTab==="messages"?"#0A1628":"#8B8680",borderBottom:`2px solid ${drawerTab==="messages"?"#0A1628":"transparent"}`,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                💬 Messages
{unreadCount > 0 && <span style={{ background:"#B03A2E",color:"#fff",fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10 }}>{unreadCount}</span>}
              </button>
            </div>

            {/* DETAILS TAB */}
            {drawerTab==="details"&&(
              <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0 }}>
                {!isManager ? (
                  /* PM: read-only */
                  <div style={{ flex:1,overflowY:"auto",padding:"20px 22px" }}>
                    <div style={{ background:"#F3EEFF",border:"1px solid #C9B3F5",borderRadius:10,padding:"14px 16px",marginBottom:16 }}>
                      <div style={{ fontSize:12,fontWeight:600,color:"#6B4CA8",marginBottom:4 }}>Project Manager View</div>
                      <div style={{ fontSize:12,color:"#8B8680",lineHeight:1.6 }}>Document review is handled by the Manager. Use Messages to communicate.</div>
                    </div>
                    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                      <div>
                        <div style={{ fontSize:11,fontWeight:500,color:"#8B8680",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8 }}>Current Status</div>
                        <Pill status={sel.status} />
                      </div>
                      <div>
                        <div style={{ fontSize:11,fontWeight:500,color:"#8B8680",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8 }}>Initial Review ({sel.initialDocs.filter(Boolean).length}/{ITEMS.length})</div>
                        <DocChecklist docs={sel.initialDocs} onChange={()=>{}} readOnly />
                      </div>
                      {sel.initialComment&&<div style={{ background:"#FAFAF7",border:"1px solid #F0EDE6",borderRadius:8,padding:"12px 14px" }}><div style={{ fontSize:10,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6 }}>Initial Comment</div><div style={{ fontSize:13,color:"#0A1628",lineHeight:1.6 }}>{sel.initialComment}</div></div>}
                      {(sel.status==="final_review"||sel.status==="approved")&&<div><div style={{ fontSize:11,fontWeight:500,color:"#8B8680",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8 }}>Final Review ({sel.finalDocs.filter(Boolean).length}/{ITEMS.length})</div><DocChecklist docs={sel.finalDocs} onChange={()=>{}} readOnly /></div>}
                      {sel.finalComment&&<div style={{ background:"#FAFAF7",border:"1px solid #F0EDE6",borderRadius:8,padding:"12px 14px" }}><div style={{ fontSize:10,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6 }}>Final Comment</div><div style={{ fontSize:13,color:"#0A1628",lineHeight:1.6 }}>{sel.finalComment}</div></div>}
                    </div>
                  </div>
                ) : (
                  /* Manager: editable */
                  <>
                    <div style={{ padding:"12px 22px",borderBottom:"1px solid #F0EDE6",flexShrink:0 }}>
                      <Field label="Review Status">
                        <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginTop:6 }}>
                          {Object.entries(STATUS).map(([k,s])=>(
                            <button key={k} onClick={()=>setEStatus(k)} style={{ padding:"6px 14px",borderRadius:20,border:`1.5px solid ${eStatus===k?s.color:s.border}`,background:eStatus===k?s.bg:"#fff",color:s.color,fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5 }}>
                              <span style={{ width:6,height:6,borderRadius:"50%",background:s.color }}></span>{s.label}
                            </button>
                          ))}
                        </div>
                      </Field>
                    </div>
                    <div style={{ display:"flex",borderBottom:"1px solid #F0EDE6",flexShrink:0 }}>
                      {[["initial","Initial Review","#1A5F9E"],["final","Final Review","#6B4CA8"]].map(([tab,label,color])=>(
                        <button key={tab} onClick={()=>setReviewTab(tab)} style={{ flex:1,padding:"10px",border:"none",background:"transparent",fontFamily:"inherit",fontSize:12,fontWeight:500,cursor:"pointer",color:reviewTab===tab?color:"#8B8680",borderBottom:`2px solid ${reviewTab===tab?color:"transparent"}` }}>
                          {label} <span style={{ marginLeft:5,fontSize:11,background:reviewTab===tab?`${color}18`:"#F0EDE6",color:reviewTab===tab?color:"#8B8680",padding:"1px 7px",borderRadius:10 }}>
                            {tab==="initial"?`${iDocs.filter(Boolean).length}/${ITEMS.length}`:`${fDocs.filter(Boolean).length}/${ITEMS.length}`}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div style={{ flex:1,overflowY:"auto",padding:"16px 22px",display:"flex",flexDirection:"column",gap:14 }}>
                      {reviewTab==="initial" ? <>
                        <Field label={`Documents — Initial (${iDocs.filter(Boolean).length}/${ITEMS.length})`}><div style={{ marginTop:6 }}><DocChecklist docs={iDocs} onChange={i=>toggleDoc(iDocs,setIDocs,i)} /></div></Field>
                        <Field label="Reviewer Name"><input value={iReviewer} onChange={e=>setIReviewer(e.target.value)} placeholder="Your name" style={inputStyle} /></Field>
                        <Field label="Initial Review Comment"><textarea value={iComment} onChange={e=>setIComment(e.target.value)} placeholder="Notes…" rows={4} style={{ ...inputStyle,resize:"vertical",lineHeight:1.6 }} /></Field>
                      </> : <>
                        <div style={{ background:"#F3EEFF",border:"1px solid #C9B3F5",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#6B4CA8" }}>Final Review re-checks all documents independently.</div>
                        <Field label={`Documents — Final (${fDocs.filter(Boolean).length}/${ITEMS.length})`}><div style={{ marginTop:6 }}><DocChecklist docs={fDocs} onChange={i=>toggleDoc(fDocs,setFDocs,i)} /></div></Field>
                        <Field label="Reviewer Name"><input value={fReviewer} onChange={e=>setFReviewer(e.target.value)} placeholder="Your name" style={inputStyle} /></Field>
                        <Field label="Final Review Comment"><textarea value={fComment} onChange={e=>setFComment(e.target.value)} placeholder="Notes…" rows={4} style={{ ...inputStyle,resize:"vertical",lineHeight:1.6 }} /></Field>
                      </>}
                    </div>
                    <div style={{ padding:"14px 22px",borderTop:"1px solid #F0EDE6",display:"flex",alignItems:"center",gap:12,flexShrink:0 }}>
                      <button onClick={saveProject} style={{ padding:"8px 22px",borderRadius:8,border:"none",background:"#2B5E3B",color:"#fff",fontFamily:"inherit",fontSize:13,fontWeight:500,cursor:"pointer" }}>Save changes</button>
                      {saved&&<span style={{ fontSize:12,color:"#3A8C58" }}>✓ Saved</span>}
                      <button onClick={()=>setSel(null)} style={{ marginLeft:"auto",background:"transparent",border:"none",fontSize:12,color:"#8B8680",cursor:"pointer",fontFamily:"inherit" }}>Cancel</button>
                      {isManager && <button onClick={()=>{ if(window.confirm(`Delete project ${sel.id}? This cannot be undone.`)) deleteProject(sel.id); }} style={{ padding:"7px 14px",borderRadius:7,border:"1px solid #F5C0BC",background:"#FEF0EF",color:"#B03A2E",fontFamily:"inherit",fontSize:12,fontWeight:500,cursor:"pointer" }}>🗑 Delete</button>}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* MESSAGES TAB */}
            {drawerTab==="messages"&&(
              <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0 }}>
                <div style={{ flex:1,overflowY:"auto",padding:"16px 22px",display:"flex",flexDirection:"column",gap:12,minHeight:0 }}>

                  {(sel.messages||[]).length===0 ? (
                    <div style={{ textAlign:"center",padding:"40px 20px" }}>
                      <div style={{ fontSize:32,marginBottom:10 }}>💬</div>
                      <div style={{ fontSize:14,fontWeight:500,color:"#0A1628",marginBottom:6 }}>No messages yet</div>
                      <div style={{ fontSize:12,color:"#8B8680" }}>Start the conversation below.</div>
                    </div>
                  ) : (sel.messages||[]).map(msg=>{
                    const isMe=msg.role===user?.role;
                    const rc=msg.role==="manager"?"#1A5F9E":msg.role==="admin"?"#0A1628":"#6B4CA8";
                    const rb=msg.role==="manager"?"#EBF4FF":msg.role==="admin"?"#F0EDE6":"#F3EEFF";
                    return (
                      <div key={msg.id} style={{ display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:4,flexDirection:isMe?"row-reverse":"row" }}>
                          <Avatar name={msg.from} size={20}/>
                          <span style={{ fontSize:11,fontWeight:600,color:rc }}>{msg.from}</span>
                          <span style={{ fontSize:10,padding:"1px 6px",borderRadius:10,background:rb,color:rc,fontWeight:500 }}>{msg.role==="manager"?"Reviewer":msg.role==="admin"?"Admin":"PM"}</span>
                          <span style={{ fontSize:10,color:"#94A3B8" }}>{msg.time}</span>
                        </div>
                        <div style={{ maxWidth:"82%",padding:"10px 14px",borderRadius:isMe?"12px 4px 12px 12px":"4px 12px 12px 12px",background:isMe?"#0F2044":"#F5F3EE",color:isMe?"#F7F5F0":"#0A1628",fontSize:13,lineHeight:1.6 }}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding:"14px 22px",borderTop:"1px solid #F0EDE6",flexShrink:0 }}>
                  <div style={{ fontSize:11,color:"#8B8680",marginBottom:6 }}>Sending as <span style={{ fontWeight:600,color:user?.role==="manager"?"#1A5F9E":user?.role==="admin"?"#0A1628":"#6B4CA8" }}>{user?.role==="manager"?"Reviewer":user?.role==="admin"?"Admin":"Project Manager"}</span></div>
                  <div style={{ display:"flex",gap:8 }}>
                    <textarea value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}} placeholder="Type a message… (Enter to send)" rows={2} style={{ flex:1,padding:"9px 12px",border:"1px solid #E0DDD6",borderRadius:8,fontSize:13,color:"#0A1628",resize:"none",background:"#FAFAF7",outline:"none",fontFamily:"inherit",lineHeight:1.5 }} />
                    <button onClick={()=>sendMessage()} style={{ padding:"0 16px",borderRadius:8,border:"none",background:newMsg.trim()?"#0A1628":"#E0DDD6",color:"#fff",cursor:newMsg.trim()?"pointer":"default",fontFamily:"inherit",fontSize:12,fontWeight:500,flexShrink:0,minWidth:60 }}>Send</button>
                  </div>
                  <div style={{ fontSize:10,color:"#C8C4BA",marginTop:4 }}>Shift+Enter for new line</div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── EDIT PROJECT MODAL ─────────────────────────────────────────────── */}
      {showEdit && sel && (
        <div style={{ position:"fixed",inset:0,background:"rgba(28,26,23,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300 }} onClick={e=>{ if(e.target===e.currentTarget) setShowEdit(false); }}>
          <div style={{ width:540,background:"#fff",borderRadius:14,boxShadow:"0 8px 40px rgba(0,0,0,0.18)",maxHeight:"90vh",display:"flex",flexDirection:"column" }}>
            <div style={{ padding:"18px 24px",borderBottom:"1px solid #F0EDE6",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
              <div>
                <div style={{ fontSize:15,fontWeight:600,color:"#0A1628" }}>Edit Project Info</div>
                <div style={{ fontSize:12,color:"#8B8680",marginTop:2 }}>{sel.id}</div>
              </div>
              <button onClick={()=>setShowEdit(false)} style={{ width:28,height:28,borderRadius:6,border:"1px solid #E0DDD6",background:"transparent",cursor:"pointer",fontSize:16,color:"#8B8680" }}>×</button>
            </div>
            <div style={{ padding:"20px 24px",overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:14 }}>
              {/* Program Year */}
              <Field label="Program Year *">
                <div style={{ display:"flex",gap:10 }}>
                  {["PY8-2026","PY8-2026 Waitlisted"].map(y=>(
                    <div key={y} onClick={()=>setEditForm(f=>({...f,programYear:y}))} style={{ flex:1,padding:"12px 16px",borderRadius:9,border:`2px solid ${editForm.programYear===y?"#6B4CA8":"#E0DDD6"}`,background:editForm.programYear===y?"#F3EEFF":"#FAFAF7",cursor:"pointer",textAlign:"center",transition:"all 0.15s" }}>
                      <div style={{ fontSize:13,fontWeight:600,color:editForm.programYear===y?"#6B4CA8":"#5A5652" }}>{y}</div>
                    </div>
                  ))}
                </div>
              </Field>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <Field label="Project ID *">
                  <input value={editForm.projectId} onChange={e=>setEditForm(f=>({...f,projectId:e.target.value}))} placeholder="Enter project ID" style={inputStyle} />
                </Field>
                <Field label="Customer Name">
                  <input value={editForm.customer} onChange={e=>setEditForm(f=>({...f,customer:e.target.value}))} placeholder="e.g. Maria Reyes" style={inputStyle} />
                </Field>
                <Field label="Project Name">
                  <input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Southside Community Solar" style={inputStyle} />
                </Field>
                <Field label="Sales Agent">
                  <select value={editForm.agent} onChange={e=>setEditForm(f=>({...f,agent:e.target.value}))} style={{ ...inputStyle, color:editForm.agent?"#0A1628":"#94A3B8" }}>
                    <option value="">Select agent…</option>
                    {AGENTS.map(grp=>(
                      grp.group
                        ? <optgroup key={grp.group} label={grp.group}>{grp.options.map(o=><option key={o} value={o}>{o}</option>)}</optgroup>
                        : grp.options.map(o=><option key={o} value={o}>{o}</option>)
                    ))}
                  </select>
                </Field>
                <Field label="Project Manager">
                  <select value={editForm.pm} onChange={e=>setEditForm(f=>({...f,pm:e.target.value}))} style={{ ...inputStyle, color:editForm.pm?"#0A1628":"#94A3B8" }}>
                    <option value="">Select PM…</option>
                    {PM_LIST.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="Total REC Value ($)">
                  <input value={editForm.recValue} onChange={e=>setEditForm(f=>({...f,recValue:e.target.value}))} placeholder="e.g. 48250" style={inputStyle} type="number" />
                </Field>
                <Field label="DC Size (kW)">
                  <input value={editForm.dcSize} onChange={e=>setEditForm(f=>({...f,dcSize:e.target.value}))} placeholder="e.g. 99.9" style={inputStyle} type="number" />
                </Field>
              </div>
              <Field label="Program Eligibility (optional)">
                <div style={{ display:"flex",gap:10,marginTop:4 }}>
                  {[["ejc","EJC"],["ec","EC"],["iec","IEC"]].map(([key,label])=>(
                    <div key={key} onClick={()=>setEditForm(f=>({...f,[key]:!f[key]}))} style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 16px",borderRadius:8,border:`1.5px solid ${editForm[key]?"#3A8C58":"#E0DDD6"}`,background:editForm[key]?"#EBF9F1":"#FAFAF7",cursor:"pointer",userSelect:"none" }}>
                      <div style={{ width:18,height:18,borderRadius:4,border:`1.5px solid ${editForm[key]?"#3A8C58":"#D0CCC6"}`,background:editForm[key]?"#3A8C58":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        {editForm[key]?<span style={{ color:"#fff",fontSize:11,fontWeight:700 }}>✓</span>:null}
                      </div>
                      <span style={{ fontSize:13,fontWeight:600,color:editForm[key]?"#1A7A4A":"#5A5652" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </Field>
            </div>
            <div style={{ padding:"14px 24px",borderTop:"1px solid #F0EDE6",display:"flex",gap:10,flexShrink:0 }}>
              <button onClick={saveEdit} disabled={!editForm.projectId.trim()} style={{ padding:"9px 24px",borderRadius:8,border:"none",background:editForm.projectId.trim()?"#2B5E3B":"#A8C5B2",color:"#fff",fontFamily:"inherit",fontSize:13,fontWeight:500,cursor:editForm.projectId.trim()?"pointer":"not-allowed" }}>
                Save Changes
              </button>
              <button onClick={()=>setShowEdit(false)} style={{ background:"transparent",border:"none",fontSize:13,color:"#8B8680",cursor:"pointer",fontFamily:"inherit" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD PROJECT MODAL ───────────────────────────────────────────────── */}
      {showAdd&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(28,26,23,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }} onClick={e=>{ if(e.target===e.currentTarget) setShowAdd(false); }}>
          <div style={{ width:540,background:"#fff",borderRadius:14,boxShadow:"0 8px 40px rgba(0,0,0,0.18)",maxHeight:"90vh",display:"flex",flexDirection:"column" }}>
            <div style={{ padding:"18px 24px",borderBottom:"1px solid #F0EDE6",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
              <div style={{ fontSize:15,fontWeight:600,color:"#0A1628" }}>Add New Project</div>
              <button onClick={()=>setShowAdd(false)} style={{ width:28,height:28,borderRadius:6,border:"1px solid #E0DDD6",background:"transparent",cursor:"pointer",fontSize:16,color:"#8B8680" }}>×</button>
            </div>
            <div style={{ padding:"20px 24px",overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:14 }}>
              <div style={{ background:"#F3EEFF",border:"1px solid #C9B3F5",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#6B4CA8" }}>
                Fill in your project details. The manager will handle document review after submission.
              </div>
              {/* Program Year - full width, always visible */}
              <Field label="Program Year *">
                <div style={{ display:"flex",gap:10 }}>
                  {["PY8-2026","PY8-2026 Waitlisted"].map(y=>(
                    <div key={y} onClick={()=>setForm(f=>({...f,programYear:y}))} style={{ flex:1,padding:"12px 16px",borderRadius:9,border:`2px solid ${form.programYear===y?"#6B4CA8":"#E0DDD6"}`,background:form.programYear===y?"#F3EEFF":"#FAFAF7",cursor:"pointer",textAlign:"center",transition:"all 0.15s" }}>
                      <div style={{ fontSize:13,fontWeight:600,color:form.programYear===y?"#6B4CA8":"#5A5652" }}>{y}</div>
                    </div>
                  ))}
                </div>
              </Field>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <Field label="Project ID *">
                  <input value={form.projectId} onChange={e=>setForm(f=>({...f,projectId:e.target.value}))} placeholder="Enter project ID" style={inputStyle} />
                </Field>
                <Field label="Customer Name"><input  value={form.customer} onChange={e=>setForm(f=>({...f,customer:e.target.value}))} placeholder="e.g. Maria Reyes" style={inputStyle} /></Field>
                
                <Field label="Sales Agent">
                  <select value={form.agent} onChange={e=>setForm(f=>({...f,agent:e.target.value}))} style={{ ...inputStyle, color:form.agent?"#0A1628":"#94A3B8" }}>
                    <option value="">Select agent…</option>
                    {AGENTS.map(grp=>(
                      grp.group
                        ? <optgroup key={grp.group} label={grp.group}>{grp.options.map(o=><option key={o} value={o}>{o}</option>)}</optgroup>
                        : grp.options.map(o=><option key={o} value={o}>{o}</option>)
                    ))}
                  </select>
                </Field>
                <Field label="Project Manager">
                  <select value={form.pm} onChange={e=>setForm(f=>({...f,pm:e.target.value}))} style={{ ...inputStyle, color:form.pm?"#0A1628":"#94A3B8" }}>
                    <option value="">Select PM…</option>
                    {PM_LIST.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="Total REC Value ($)"><input value={form.recValue} onChange={e=>setForm(f=>({...f,recValue:e.target.value}))} placeholder="e.g. 48250" style={inputStyle} type="number" /></Field>
                <Field label="DC Size (kW)">  <input value={form.dcSize}   onChange={e=>setForm(f=>({...f,dcSize:e.target.value}))}   placeholder="e.g. 99.9" style={inputStyle} type="number" /></Field>
              </div>
              <Field label="Program Eligibility (optional — check all that apply)">
                <div style={{ display:"flex",gap:10,marginTop:4,flexWrap:"wrap" }}>
                  {[["ejc","EJC"],["ec","EC"],["iec","IEC"]].map(([key,label])=>(
                    <div key={key} onClick={()=>setForm(f=>({...f,[key]:!f[key]}))} style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 16px",borderRadius:8,border:`1.5px solid ${form[key]?"#3A8C58":"#E0DDD6"}`,background:form[key]?"#EBF9F1":"#FAFAF7",cursor:"pointer",userSelect:"none" }}>
                      <div style={{ width:18,height:18,borderRadius:4,border:`1.5px solid ${form[key]?"#3A8C58":"#D0CCC6"}`,background:form[key]?"#3A8C58":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        {form[key]?<span style={{ color:"#fff",fontSize:11,fontWeight:700 }}>✓</span>:null}
                      </div>
                      <span style={{ fontSize:13,fontWeight:600,color:form[key]?"#1A7A4A":"#5A5652" }}>{label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:11,color:"#94A3B8",marginTop:6 }}>Leave unchecked if not applicable</div>
              </Field>
              <Field label={`Initial Documents (${formDocs.filter(Boolean).length}/${ITEMS.length} checked — optional)`}>
                <div style={{ marginTop:6 }}><DocChecklist docs={formDocs} onChange={i=>{ const n=[...formDocs]; n[i]=n[i]?0:1; setFormDocs(n); }} /></div>
              </Field>
            </div>
            <div style={{ padding:"14px 24px",borderTop:"1px solid #F0EDE6",display:"flex",gap:10,flexShrink:0 }}>
              <button onClick={addProject} disabled={!form.projectId.trim()||!form.programYear} style={{ padding:"9px 24px",borderRadius:8,border:"none",background:(form.projectId.trim()&&form.programYear)?"#2B5E3B":"#A8C5B2",color:"#fff",fontFamily:"inherit",fontSize:13,fontWeight:500,cursor:(form.projectId.trim()&&form.programYear)?"pointer":"not-allowed" }}>
                Submit Project
              </button>
              <button onClick={()=>setShowAdd(false)} style={{ background:"transparent",border:"none",fontSize:13,color:"#8B8680",cursor:"pointer",fontFamily:"inherit" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
