import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { statusClass, fmtDate } from '../utils';
import { toast } from 'react-toastify';
import TaskModal from '../components/modals/TaskModal';
import ConfirmModal from '../components/modals/ConfirmModal';

const COLS = [
  { id:'todo',       label:'To Do',      color:'#a78bfa' },
  { id:'inprogress', label:'In Progress',color:'#60a5fa' },
  { id:'review',     label:'In Review',  color:'#f59e0b' },
  { id:'done',       label:'Completed',  color:'#4ade80' },
];

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="kanban-card" style={{position:'relative'}}>
      <div className="kanban-card-title">{task.title}</div>
      {task.description && <div style={{fontSize:11,color:'#334155',marginBottom:7,lineHeight:1.4}}>{task.description.slice(0,80)}{task.description.length>80?'...':''}</div>}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
        <span style={{fontSize:11,color:'#475569'}}>{task.projectName||'No project'}</span>
        <span className={`badge ${statusClass(task.priority)}`}>{task.priority}</span>
      </div>
      {task.assigneeName && (
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
          <div style={{width:18,height:18,borderRadius:'50%',background:'#2563eb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:800,color:'#fff'}}>
            {task.assigneeName.split(' ').map(w=>w[0]).join('').slice(0,2)}
          </div>
          <span style={{fontSize:11,color:'#475569'}}>{task.assigneeName}</span>
        </div>
      )}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:8}}>
        {task.dueDate ? (
          <div style={{fontSize:10,color: new Date(task.dueDate) < new Date() && task.status !== 'done' ? '#f87171' : '#334155',display:'flex',alignItems:'center',gap:3}}>
            <i className="ti ti-calendar" style={{fontSize:10}}/>{fmtDate(task.dueDate)}
          </div>
        ) : <div/>}
        <div style={{display:'flex',gap:6}}>
          <button onClick={e=>{e.stopPropagation();onEdit(task);}} style={{background:'none',border:'none',color:'#475569',cursor:'pointer',padding:2,fontSize:13}} title="Edit">
            <i className="ti ti-edit"/>
          </button>
          <button onClick={e=>{e.stopPropagation();onDelete(task);}} style={{background:'none',border:'none',color:'#475569',cursor:'pointer',padding:2,fontSize:13}} title="Delete">
            <i className="ti ti-trash"/>
          </button>
        </div>
      </div>
      {/* Quick move */}
      <div style={{marginTop:8,borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:8,display:'flex',gap:4,flexWrap:'wrap'}}>
        {COLS.filter(c=>c.id!==task.status).map(c=>(
          <button key={c.id} onClick={e=>{e.stopPropagation();onStatusChange(task._id,c.id);}}
            style={{fontSize:9,padding:'2px 7px',borderRadius:4,border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.03)',color:'#475569',cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s'}}
            onMouseEnter={e=>e.currentTarget.style.color='#94a3b8'}
            onMouseLeave={e=>e.currentTarget.style.color='#475569'}
          >→ {c.label}</button>
        ))}
      </div>
    </div>
  );
}

export default function Tasks() {
  const [tasks,    setTasks]    = useState([]);
  const [projects, setProjects] = useState([]);
  const [team,     setTeam]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [delTask,  setDelTask]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, pRes, mRes] = await Promise.all([
        api.get('/tasks'), api.get('/projects'), api.get('/team'),
      ]);
      setTasks(tRes.data);
      setProjects(pRes.data);
      setTeam(mRes.data);
    } catch { toast.error('Failed to load tasks'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredTasks = tasks.filter(t => {
    const mf = filter==='all' || t.priority.toLowerCase()===filter;
    const ms = !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.projectName||'').toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  const tasksByCol = (colId) => filteredTasks.filter(t => t.status === colId);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editTask) {
        const res = await api.put(`/tasks/${editTask._id}`, data);
        setTasks(t => t.map(x => x._id === editTask._id ? res.data : x));
        toast.success('Task updated!');
      } else {
        const res = await api.post('/tasks', data);
        setTasks(t => [res.data, ...t]);
        toast.success('Task created!');
      }
      setShowForm(false); setEditTask(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!delTask) return;
    setDeleting(true);
    try {
      await api.delete(`/tasks/${delTask._id}`);
      setTasks(t => t.filter(x => x._id !== delTask._id));
      toast.success('Task deleted'); setDelTask(null);
    } catch { toast.error('Delete failed'); }
    setDeleting(false);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks(t => t.map(x => x._id === taskId ? { ...x, status: newStatus } : x));
      toast.success(`Moved to ${newStatus}`);
    } catch { toast.error('Status update failed'); }
  };

  const openEdit = (task) => { setEditTask(task); setShowForm(true); };

  const totalActive = tasks.filter(t=>t.status!=='done').length;
  const doneToday   = tasks.filter(t=>t.status==='done' && t.completedAt && new Date(t.completedAt).toDateString()===new Date().toDateString()).length;

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Task Board</div>
          <div className="page-sub">{totalActive} active — {doneToday} completed today</div>
        </div>
        <div className="topbar-right">
          <div className="search-bar" style={{minWidth:200}}>
            <i className="ti ti-search"/>
            <input placeholder="Search tasks..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="form-select" style={{width:'auto',padding:'8px 32px 8px 12px'}}>
            <option value="all">All Priority</option>
            {['urgent','high','medium','low'].map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
          </select>
          <button className="btn btn-primary" onClick={()=>{setEditTask(null);setShowForm(true);}}>
            <i className="ti ti-plus"/>New Task
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {COLS.map(col=>(
          <div key={col.id} style={{background:'rgba(12,20,38,0.85)',border:'1px solid rgba(99,179,237,0.09)',borderRadius:12,padding:'14px 16px',display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:36,height:36,borderRadius:10,background:col.color+'1a',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <i className={`ti ${col.id==='done'?'ti-circle-check':col.id==='review'?'ti-eye':col.id==='inprogress'?'ti-loader':'ti-circle'}`} style={{color:col.color,fontSize:16}}/>
            </div>
            <div>
              <div style={{fontSize:22,fontWeight:800,color:col.color}}>{tasks.filter(t=>t.status===col.id).length}</div>
              <div style={{fontSize:11,color:'#475569'}}>{col.label}</div>
            </div>
          </div>
        ))}
      </div>

      {loading && <div className="page-loader"><span className="spinner" style={{width:28,height:28,borderWidth:3}}/></div>}

      {!loading && (
        <div className="kanban-board">
          {COLS.map(col => (
            <div key={col.id} className="kanban-col">
              <div className="kanban-col-header" style={{color:col.color}}>
                {col.label}
                <span className="kanban-count" style={{background:col.color+'1a',color:col.color}}>{tasksByCol(col.id).length}</span>
              </div>

              {tasksByCol(col.id).length === 0 && (
                <div style={{textAlign:'center',padding:'24px 12px',color:'#1e293b',fontSize:12}}>
                  <i className="ti ti-inbox" style={{fontSize:24,display:'block',marginBottom:8,opacity:0.5}}/>
                  No tasks here
                </div>
              )}

              {tasksByCol(col.id).map(task => (
                <TaskCard key={task._id} task={task} onEdit={openEdit} onDelete={setDelTask} onStatusChange={handleStatusChange}/>
              ))}

              <button onClick={()=>{setEditTask({status:col.id});setShowForm(true);}}
                style={{width:'100%',padding:'8px',borderRadius:8,border:'1px dashed rgba(255,255,255,0.1)',background:'transparent',color:'#334155',cursor:'pointer',fontSize:12,fontFamily:'inherit',marginTop:4,transition:'all 0.18s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(59,130,246,0.3)';e.currentTarget.style.color='#60a5fa';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.color='#334155';}}>
                <i className="ti ti-plus"/> Add task
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <TaskModal task={editTask?._id ? editTask : (editTask?.status ? {status:editTask.status} : null)}
          projects={projects} team={team} onSave={handleSave}
          onClose={()=>{setShowForm(false);setEditTask(null);}} loading={saving}/>
      )}
      {delTask && (
        <ConfirmModal title="Delete Task" message={`Delete "${delTask.title}"?`}
          onConfirm={handleDelete} onClose={()=>setDelTask(null)} loading={deleting}/>
      )}
    </div>
  );
}
