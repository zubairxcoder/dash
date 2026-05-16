import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { initials } from '../utils';
import { toast } from 'react-toastify';
import TeamModal from '../components/modals/TeamModal';
import ConfirmModal from '../components/modals/ConfirmModal';

export default function Team() {
  const [team,     setTeam]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMem,  setEditMem]  = useState(null);
  const [delMem,   setDelMem]   = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await api.get('/team'); setTeam(res.data); }
    catch { toast.error('Failed to load team'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editMem) {
        const res = await api.put(`/team/${editMem._id}`, data);
        setTeam(t => t.map(x => x._id===editMem._id ? res.data : x));
        toast.success('Member updated!');
      } else {
        const res = await api.post('/team', data);
        setTeam(t => [...t, res.data]);
        toast.success('Member added!');
      }
      setShowForm(false); setEditMem(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/team/${delMem._id}`);
      setTeam(t => t.filter(x => x._id!==delMem._id));
      toast.success('Member removed'); setDelMem(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    setDeleting(false);
  };

  const ROLE_COLORS = { admin:'#ef4444', developer:'#3b82f6', designer:'#8b5cf6', qa:'#10b981' };

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Team</div>
          <div className="page-sub">{team.length} members — {team.filter(m=>m.isOnline).length} online now</div>
        </div>
        <button className="btn btn-primary" onClick={()=>{setEditMem(null);setShowForm(true);}}>
          <i className="ti ti-user-plus"/>Add Member
        </button>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {['admin','developer','designer','qa'].map(role=>{
          const count = team.filter(m=>m.role===role).length;
          return (
            <div key={role} className="panel" style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:38,height:38,borderRadius:10,background:(ROLE_COLORS[role]||'#3b82f6')+'1a',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <i className={`ti ${role==='admin'?'ti-shield':role==='designer'?'ti-brush':role==='qa'?'ti-bug':'ti-code'}`} style={{color:ROLE_COLORS[role]||'#3b82f6',fontSize:16}}/>
              </div>
              <div>
                <div style={{fontSize:20,fontWeight:800,color:'#f1f5f9'}}>{count}</div>
                <div style={{fontSize:11,color:'#475569',textTransform:'capitalize'}}>{role}{count!==1?'s':''}</div>
              </div>
            </div>
          );
        })}
      </div>

      {loading && <div className="page-loader"><span className="spinner" style={{width:28,height:28,borderWidth:3}}/></div>}

      {!loading && team.length===0 && (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <div className="empty-title">No team members yet</div>
          <button className="btn btn-primary" onClick={()=>setShowForm(true)}><i className="ti ti-user-plus"/>Add Member</button>
        </div>
      )}

      {/* Team Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14,marginBottom:24}}>
        {team.map(member=>(
          <div key={member._id} style={{background:'rgba(12,20,38,0.85)',border:'1px solid rgba(99,179,237,0.09)',borderRadius:14,padding:22,transition:'all 0.2s'}}
            onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e=>e.currentTarget.style.transform=''}
          >
            <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:14}}>
              <div style={{width:50,height:50,borderRadius:'50%',background:member.color||'#2563eb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:800,color:'#fff',flexShrink:0,position:'relative'}}>
                {initials(member.name)}
                <div style={{position:'absolute',bottom:1,right:1,width:10,height:10,borderRadius:'50%',background:member.isOnline?'#4ade80':'#475569',border:'2px solid #0c1424'}}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:700,color:'#f1f5f9',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{member.name}</div>
                <div style={{fontSize:11,color:'#475569',textTransform:'capitalize',marginTop:2}}>{member.role}</div>
                <div style={{fontSize:11,color:member.isOnline?'#4ade80':'#475569',marginTop:3,display:'flex',alignItems:'center',gap:4}}>
                  <div style={{width:5,height:5,borderRadius:'50%',background:member.isOnline?'#4ade80':'#475569'}}/>
                  {member.isOnline ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>

            {member.email && (
              <div style={{fontSize:12,color:'#475569',marginBottom:6,display:'flex',alignItems:'center',gap:6}}>
                <i className="ti ti-mail" style={{color:'#3b82f6',fontSize:12}}/>{member.email}
              </div>
            )}
            {member.phone && (
              <div style={{fontSize:12,color:'#475569',marginBottom:6,display:'flex',alignItems:'center',gap:6}}>
                <i className="ti ti-phone" style={{color:'#3b82f6',fontSize:12}}/>{member.phone}
              </div>
            )}
            {member.hourlyRate > 0 && (
              <div style={{fontSize:12,color:'#475569',marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
                <i className="ti ti-coin" style={{color:'#3b82f6',fontSize:12}}/>₨{member.hourlyRate?.toLocaleString()}/hr
              </div>
            )}

            {(member.skills||[]).length > 0 && (
              <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:12}}>
                {member.skills.slice(0,4).map(s=><span key={s} className="tag tag-blue">{s}</span>)}
                {member.skills.length>4 && <span className="tag tag-gray">+{member.skills.length-4}</span>}
              </div>
            )}

            <div style={{display:'flex',gap:8,paddingTop:12,borderTop:'1px solid rgba(255,255,255,0.05)'}}>
              <button className="btn btn-ghost btn-sm" style={{flex:1}} onClick={()=>{setEditMem(member);setShowForm(true);}}>
                <i className="ti ti-edit"/>Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={()=>setDelMem(member)}>
                <i className="ti ti-trash"/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Workload table */}
      {team.length > 0 && (
        <div className="panel">
          <div className="panel-header"><div className="panel-title"><i className="ti ti-chart-bar"/>Team Overview</div></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Member</th><th>Role</th><th>Email</th><th>Hourly Rate</th><th>Skills</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {team.map(m=>(
                  <tr key={m._id}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:30,height:30,borderRadius:'50%',background:m.color||'#2563eb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff',flexShrink:0}}>
                          {initials(m.name)}
                        </div>
                        <span style={{fontWeight:600,color:'#e2e8f0'}}>{m.name}</span>
                      </div>
                    </td>
                    <td style={{textTransform:'capitalize',color:'#64748b'}}>{m.role}</td>
                    <td style={{color:'#64748b'}}>{m.email}</td>
                    <td style={{color:'#4ade80',fontWeight:600}}>{m.hourlyRate>0?'₨'+m.hourlyRate?.toLocaleString()+'/hr':'—'}</td>
                    <td><div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{(m.skills||[]).slice(0,3).map(s=><span key={s} className="tag tag-blue">{s}</span>)}</div></td>
                    <td><span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:11,color:m.isOnline?'#4ade80':'#475569'}}><div style={{width:6,height:6,borderRadius:'50%',background:m.isOnline?'#4ade80':'#475569'}}/>{m.isOnline?'Online':'Offline'}</span></td>
                    <td>
                      <div style={{display:'flex',gap:8}}>
                        <button onClick={()=>{setEditMem(m);setShowForm(true);}} style={{background:'none',border:'none',color:'#475569',cursor:'pointer',fontSize:14}}><i className="ti ti-edit"/></button>
                        <button onClick={()=>setDelMem(m)} style={{background:'none',border:'none',color:'#475569',cursor:'pointer',fontSize:14}}><i className="ti ti-trash"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && <TeamModal member={editMem} onSave={handleSave} onClose={()=>{setShowForm(false);setEditMem(null);}} loading={saving}/>}
      {delMem && <ConfirmModal title="Remove Member" message={`Remove "${delMem.name}" from the team?`} onConfirm={handleDelete} onClose={()=>setDelMem(null)} loading={deleting}/>}
    </div>
  );
}
