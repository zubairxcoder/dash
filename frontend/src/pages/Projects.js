import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { fmt, statusClass, fmtDate, progressColor } from '../utils';
import { toast } from 'react-toastify';
import ProjectModal from '../components/modals/ProjectModal';
import ConfirmModal from '../components/modals/ConfirmModal';

const STATUS_FILTERS = ['All','Planning','Design','Development','Testing','Revision','Completed','On Hold'];

function ProjectDetailDrawer({ project, onClose, onEdit, onDelete }) {
  if (!project) return null;
  const profit = (project.totalEarned||0) - (project.expenses||0);
  return (
    <div style={{position:'fixed',inset:0,zIndex:500,display:'flex'}}>
      <div onClick={onClose} style={{flex:1,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(3px)'}}/>
      <div style={{width:'100%',maxWidth:460,background:'#0c1424',borderLeft:'1px solid rgba(99,179,237,0.15)',overflowY:'auto',padding:28,display:'flex',flexDirection:'column',gap:16}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
          <div style={{width:48,height:48,borderRadius:12,background:(project.color||'#3b82f6')+'1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{project.icon||'🌐'}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:800,color:'#f1f5f9'}}>{project.name}</div>
            <div style={{fontSize:12,color:'#475569',marginTop:2}}>{project.clientName}</div>
            <div style={{marginTop:6,display:'flex',gap:6,flexWrap:'wrap'}}>
              <span className={`badge ${statusClass(project.status)}`}>{project.status}</span>
              <span className={`badge ${statusClass(project.priority)}`}>{project.priority}</span>
            </div>
          </div>
          <button className="close-btn" style={{position:'static'}} onClick={onClose}><i className="ti ti-x"/></button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
          {[
            {lbl:'Earned', val:fmt(project.totalEarned),    clr:'#4ade80',bg:'rgba(34,197,94,0.07)',  br:'rgba(34,197,94,0.14)'},
            {lbl:'Pending',val:fmt(project.pendingPayment), clr:'#f87171',bg:'rgba(239,68,68,0.07)',  br:'rgba(239,68,68,0.14)'},
            {lbl:'Profit', val:fmt(profit),                 clr:'#60a5fa',bg:'rgba(59,130,246,0.07)',br:'rgba(59,130,246,0.14)'},
          ].map(c=>(
            <div key={c.lbl} style={{background:c.bg,border:'1px solid '+c.br,borderRadius:10,padding:'11px 13px'}}>
              <div style={{fontSize:9,color:c.clr,textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:700,marginBottom:4}}>{c.lbl}</div>
              <div style={{fontSize:16,fontWeight:800,color:c.clr}}>{c.val}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#64748b',marginBottom:6}}>
            <span>Progress</span><span style={{fontWeight:700,color:progressColor(project.progress)}}>{project.progress||0}%</span>
          </div>
          <div className="prog-wrap" style={{height:8}}>
            <div className="prog-fill" style={{width:(project.progress||0)+'%',background:progressColor(project.progress)}}/>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:7}}>
          {[
            {ic:'ti-calendar',    lbl:'Start Date',val:fmtDate(project.startDate)},
            {ic:'ti-calendar-due',lbl:'Deadline',  val:fmtDate(project.deadline)},
            {ic:'ti-server',      lbl:'Hosting',   val:project.hostingProvider||'—'},
            {ic:'ti-receipt',     lbl:'Expenses',  val:fmt(project.expenses)},
            {ic:'ti-coin',        lbl:'Budget',    val:fmt(project.budget)},
          ].map(r=>(
            <div key={r.lbl} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',background:'rgba(255,255,255,0.02)',borderRadius:8}}>
              <i className={`ti ${r.ic}`} style={{color:'#3b82f6',fontSize:14,width:16}}/>
              <span style={{fontSize:12,color:'#475569',flex:1}}>{r.lbl}</span>
              <span style={{fontSize:12,color:'#94a3b8',fontWeight:500}}>{r.val}</span>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {project.websiteUrl && <a href={'https://'+project.websiteUrl.replace(/^https?:\/\//,'')} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"><i className="ti ti-external-link"/>Website</a>}
          {project.githubRepo  && <a href={'https://'+project.githubRepo.replace(/^https?:\/\//,'')}  target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"><i className="ti ti-brand-github"/>GitHub</a>}
          {project.figmaUrl    && <a href={'https://'+project.figmaUrl.replace(/^https?:\/\//,'')}    target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"><i className="ti ti-brand-figma"/>Figma</a>}
        </div>
        {(project.techStack||[]).length > 0 && (
          <div>
            <div style={{fontSize:10,color:'#334155',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>Tech Stack</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{project.techStack.map(t=><span key={t} className="tag tag-blue">{t}</span>)}</div>
          </div>
        )}
        {project.notes && (
          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,padding:'12px 14px',fontSize:12,color:'#64748b',lineHeight:1.6}}>
            <b style={{color:'#94a3b8'}}>Notes: </b>{project.notes}
          </div>
        )}
        <div style={{display:'flex',gap:10,marginTop:8}}>
          <button className="btn btn-primary" style={{flex:1}} onClick={onEdit}><i className="ti ti-edit"/>Edit</button>
          <button className="btn btn-danger" onClick={onDelete}><i className="ti ti-trash"/>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('All');
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editProj, setEditProj] = useState(null);
  const [showDel,  setShowDel]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([api.get('/projects'), api.get('/clients')]);
      setProjects(pRes.data);
      setClients(cRes.data);
    } catch { toast.error('Failed to load projects'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = projects.filter(p => {
    const ms = filter === 'All' || p.status === filter;
    const mq = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.clientName||'').toLowerCase().includes(search.toLowerCase());
    return ms && mq;
  });

  const openAdd  = () => { setEditProj(null); setShowForm(true); };
  const openEdit = (proj) => { setSelected(null); setEditProj(proj); setShowForm(true); };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editProj) {
        const res = await api.put(`/projects/${editProj._id}`, data);
        setProjects(p => p.map(x => x._id === editProj._id ? res.data : x));
        toast.success('Project updated!');
      } else {
        const res = await api.post('/projects', data);
        setProjects(p => [res.data, ...p]);
        toast.success('Project created!');
      }
      setShowForm(false); setEditProj(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${selected._id}`);
      setProjects(p => p.filter(x => x._id !== selected._id));
      toast.success('Project deleted'); setSelected(null); setShowDel(false);
    } catch { toast.error('Delete failed'); }
    setDeleting(false);
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Projects</div>
          <div className="page-sub">{projects.length} total — {projects.filter(p=>['Development','Testing','Revision'].includes(p.status)).length} active</div>
        </div>
        <div className="topbar-right">
          <div className="search-bar" style={{minWidth:220}}>
            <i className="ti ti-search"/>
            <input placeholder="Search projects..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <button className="btn btn-primary" onClick={openAdd}><i className="ti ti-plus"/>New Project</button>
        </div>
      </div>

      <div style={{display:'flex',gap:4,marginBottom:20,overflowX:'auto',paddingBottom:4}}>
        {STATUS_FILTERS.map(s => {
          const cnt = s==='All' ? projects.length : projects.filter(p=>p.status===s).length;
          return (
            <button key={s} onClick={()=>setFilter(s)} style={{padding:'6px 14px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',border:'none',whiteSpace:'nowrap',background:filter===s?'rgba(59,130,246,0.18)':'rgba(255,255,255,0.04)',color:filter===s?'#60a5fa':'#475569',transition:'all 0.18s'}}>
              {s} <span style={{opacity:0.6}}>({cnt})</span>
            </button>
          );
        })}
      </div>

      {loading && <div className="page-loader"><span className="spinner" style={{width:28,height:28,borderWidth:3}}/></div>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <div className="empty-title">{search||filter!=='All' ? 'No matching projects' : 'No projects yet'}</div>
          <div className="empty-sub">{search||filter!=='All' ? 'Try a different filter' : 'Create your first project'}</div>
          {!search && filter==='All' && <button className="btn btn-primary" onClick={openAdd}><i className="ti ti-plus"/>Add Project</button>}
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(310px,1fr))',gap:16}}>
        {filtered.map(proj=>(
          <div key={proj._id} onClick={()=>setSelected(proj)}
            style={{background:'rgba(12,20,38,0.85)',border:`1px solid rgba(99,179,237,0.09)`,borderTop:`3px solid ${proj.color||'#3b82f6'}`,borderRadius:14,padding:20,cursor:'pointer',transition:'all 0.22s'}}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 8px 30px ${proj.color||'#3b82f6'}22`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}
          >
            <div style={{display:'flex',alignItems:'flex-start',gap:11,marginBottom:14}}>
              <div style={{width:42,height:42,borderRadius:11,background:(proj.color||'#3b82f6')+'1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{proj.icon||'🌐'}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:800,color:'#f1f5f9',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{proj.name}</div>
                <div style={{fontSize:11,color:'#334155',marginTop:2}}>{proj.clientName||'No client'}</div>
              </div>
              <span className={`badge ${statusClass(proj.status)}`}>{proj.status}</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:13}}>
              <div style={{background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.1)',borderRadius:8,padding:'8px 11px'}}>
                <div style={{fontSize:9,color:'#4ade80',fontWeight:700,textTransform:'uppercase',marginBottom:2}}>Earned</div>
                <div style={{fontSize:16,fontWeight:800,color:'#4ade80'}}>{fmt(proj.totalEarned)}</div>
              </div>
              <div style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.1)',borderRadius:8,padding:'8px 11px'}}>
                <div style={{fontSize:9,color:'#f87171',fontWeight:700,textTransform:'uppercase',marginBottom:2}}>Pending</div>
                <div style={{fontSize:16,fontWeight:800,color:proj.pendingPayment>0?'#f87171':'#4ade80'}}>{fmt(proj.pendingPayment)}</div>
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#334155',marginBottom:5}}>
                <span>Progress</span>
                <span style={{color:progressColor(proj.progress),fontWeight:700}}>{proj.progress||0}%</span>
              </div>
              <div className="prog-wrap"><div className="prog-fill" style={{width:(proj.progress||0)+'%',background:proj.color||'#3b82f6'}}/></div>
            </div>
            <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10}}>
              {(proj.techStack||[]).slice(0,4).map(t=><span key={t} className="tag tag-blue">{t}</span>)}
              {(proj.techStack||[]).length>4 && <span className="tag tag-gray">+{proj.techStack.length-4}</span>}
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:10,borderTop:'1px solid rgba(255,255,255,0.05)'}}>
              <div style={{fontSize:11,color:'#334155',display:'flex',alignItems:'center',gap:4}}>
                <i className="ti ti-calendar" style={{fontSize:11}}/>{proj.deadline ? fmtDate(proj.deadline) : 'No deadline'}
              </div>
              <button className="btn btn-ghost btn-sm" style={{padding:'4px 10px'}} onClick={e=>{e.stopPropagation();openEdit(proj);}}>
                <i className="ti ti-edit"/>Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && projects.length > 0 && (
        <div className="panel" style={{marginTop:20}}>
          <div style={{display:'flex',gap:24,alignItems:'center',overflowX:'auto',flexWrap:'wrap'}}>
            <div style={{fontSize:13,fontWeight:700,color:'#475569',flexShrink:0}}>Summary:</div>
            {['Planning','Development','Testing','Completed','On Hold'].map(s=>{
              const n = projects.filter(p=>p.status===s).length;
              return n>0 && <div key={s} style={{textAlign:'center',flexShrink:0}}>
                <div style={{fontSize:18,fontWeight:800,color:'#e2e8f0'}}>{n}</div>
                <div style={{fontSize:10,color:'#475569',marginTop:2}}>{s}</div>
              </div>;
            })}
            <div style={{marginLeft:'auto',textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:18,fontWeight:800,color:'#4ade80'}}>{fmt(projects.reduce((s,p)=>s+p.totalEarned,0))}</div>
              <div style={{fontSize:10,color:'#475569'}}>Total Earned</div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:18,fontWeight:800,color:'#f87171'}}>{fmt(projects.reduce((s,p)=>s+p.pendingPayment,0))}</div>
              <div style={{fontSize:10,color:'#475569'}}>Total Pending</div>
            </div>
          </div>
        </div>
      )}

      {selected && !showForm && (
        <ProjectDetailDrawer project={selected} onClose={()=>setSelected(null)} onEdit={()=>openEdit(selected)} onDelete={()=>setShowDel(true)}/>
      )}
      {showForm && <ProjectModal project={editProj} clients={clients} onSave={handleSave} onClose={()=>{setShowForm(false);setEditProj(null);}} loading={saving}/>}
      {showDel && <ConfirmModal title="Delete Project" message={`Delete "${selected?.name}"? This cannot be undone.`} onConfirm={handleDelete} onClose={()=>setShowDel(false)} loading={deleting}/>}
    </div>
  );
}
