import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { fmt, statusClass, initials } from '../utils';
import { toast } from 'react-toastify';
import ClientModal from '../components/modals/ClientModal';
import ConfirmModal from '../components/modals/ConfirmModal';

export default function Clients() {
  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCli,  setEditCli]  = useState(null);
  const [delCli,   setDelCli]   = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch { toast.error('Failed to load clients'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = clients.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company||'').toLowerCase().includes(search.toLowerCase()) ||
    (c.city||'').toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editCli) {
        const res = await api.put(`/clients/${editCli._id}`, data);
        setClients(c => c.map(x => x._id === editCli._id ? res.data : x));
        toast.success('Client updated!');
      } else {
        const res = await api.post('/clients', data);
        setClients(c => [res.data, ...c]);
        toast.success('Client added!');
      }
      setShowForm(false); setEditCli(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/clients/${delCli._id}`);
      setClients(c => c.filter(x => x._id !== delCli._id));
      toast.success('Client deleted'); setDelCli(null); setSelected(null);
    } catch { toast.error('Delete failed'); }
    setDeleting(false);
  };

  const openEdit = (client) => { setEditCli(client); setShowForm(true); setSelected(null); };

  const statusCounts = { active: clients.filter(c=>c.status==='active').length, inactive: clients.filter(c=>c.status==='inactive').length, prospect: clients.filter(c=>c.status==='prospect').length };

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Clients</div>
          <div className="page-sub">{clients.length} total — {statusCounts.active} active</div>
        </div>
        <div className="topbar-right">
          <div className="search-bar" style={{minWidth:220}}>
            <i className="ti ti-search"/>
            <input placeholder="Search clients..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <button className="btn btn-primary" onClick={()=>{setEditCli(null);setShowForm(true);}}>
            <i className="ti ti-plus"/>Add Client
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
        {[
          {lbl:'Active Clients',    val:statusCounts.active,   clr:'#4ade80',ic:'ti-circle-check'},
          {lbl:'Inactive Clients',  val:statusCounts.inactive, clr:'#94a3b8',ic:'ti-pause'},
          {lbl:'Prospects',         val:statusCounts.prospect, clr:'#60a5fa',ic:'ti-user-plus'},
        ].map(s=>(
          <div key={s.lbl} className="panel" style={{display:'flex',alignItems:'center',gap:14}}>
            <div style={{width:42,height:42,borderRadius:11,background:s.clr+'1a',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <i className={`ti ${s.ic}`} style={{color:s.clr,fontSize:18}}/>
            </div>
            <div>
              <div style={{fontSize:24,fontWeight:800,color:s.clr}}>{s.val}</div>
              <div style={{fontSize:11,color:'#475569'}}>{s.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      {loading && <div className="page-loader"><span className="spinner" style={{width:28,height:28,borderWidth:3}}/></div>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <div className="empty-title">{search ? 'No matching clients' : 'No clients yet'}</div>
          <div className="empty-sub">{search ? 'Try different keywords' : 'Add your first client'}</div>
          {!search && <button className="btn btn-primary" onClick={()=>setShowForm(true)}><i className="ti ti-plus"/>Add Client</button>}
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
        {filtered.map(client=>(
          <div key={client._id} onClick={()=>setSelected(s=>s?._id===client._id?null:client)}
            style={{background:'rgba(12,20,38,0.85)',border:`1px solid ${selected?._id===client._id?'rgba(59,130,246,0.3)':'rgba(99,179,237,0.09)'}`,borderRadius:14,padding:20,cursor:'pointer',transition:'all 0.2s'}}
            onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e=>e.currentTarget.style.transform=''}
          >
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:client.color||'#2563eb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800,color:'#fff',flexShrink:0}}>
                {initials(client.name)}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:'#f1f5f9',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{client.name}</div>
                <div style={{fontSize:11,color:'#334155'}}>{client.company||client.city||'—'}</div>
              </div>
              <span className={`badge ${statusClass(client.status)}`}>{client.status}</span>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {client.email && <div style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:'#475569'}}><i className="ti ti-mail" style={{color:'#3b82f6',fontSize:13}}/>{client.email}</div>}
              {client.phone && <div style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:'#475569'}}><i className="ti ti-phone" style={{color:'#3b82f6',fontSize:13}}/>{client.phone}</div>}
              {client.city  && <div style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:'#475569'}}><i className="ti ti-map-pin" style={{color:'#3b82f6',fontSize:13}}/>{client.city}</div>}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:14}}>
              <div style={{background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.1)',borderRadius:8,padding:'7px 10px'}}>
                <div style={{fontSize:9,color:'#4ade80',fontWeight:700,textTransform:'uppercase',marginBottom:2}}>Paid</div>
                <div style={{fontSize:14,fontWeight:700,color:'#4ade80'}}>{fmt(client.totalPaid)}</div>
              </div>
              <div style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.1)',borderRadius:8,padding:'7px 10px'}}>
                <div style={{fontSize:9,color:'#f87171',fontWeight:700,textTransform:'uppercase',marginBottom:2}}>Due</div>
                <div style={{fontSize:14,fontWeight:700,color:client.totalDue>0?'#f87171':'#4ade80'}}>{fmt(client.totalDue)}</div>
              </div>
            </div>

            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12,paddingTop:12,borderTop:'1px solid rgba(255,255,255,0.05)'}}>
              <button className="btn btn-ghost btn-sm" onClick={e=>{e.stopPropagation();openEdit(client);}}><i className="ti ti-edit"/>Edit</button>
              <button className="btn btn-danger btn-sm" style={{padding:'5px 10px'}} onClick={e=>{e.stopPropagation();setDelCli(client);}}><i className="ti ti-trash"/></button>
            </div>
          </div>
        ))}
      </div>

      {/* Side detail panel for selected client */}
      {selected && (
        <div style={{position:'fixed',bottom:24,right:24,width:320,background:'#0c1424',border:'1px solid rgba(99,179,237,0.15)',borderRadius:16,padding:20,boxShadow:'0 20px 60px rgba(0,0,0,0.5)',zIndex:100}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:'#f1f5f9'}}>{selected.name}</div>
              <div style={{fontSize:11,color:'#475569'}}>{selected.company}</div>
            </div>
            <button className="close-btn" style={{position:'static'}} onClick={()=>setSelected(null)}><i className="ti ti-x"/></button>
          </div>
          {selected.notes && <div style={{fontSize:12,color:'#64748b',lineHeight:1.6,marginBottom:14,background:'rgba(255,255,255,0.02)',borderRadius:8,padding:'10px 12px'}}>{selected.notes}</div>}
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-primary btn-sm" style={{flex:1}} onClick={()=>openEdit(selected)}><i className="ti ti-edit"/>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={()=>{setDelCli(selected);setSelected(null);}}><i className="ti ti-trash"/></button>
          </div>
        </div>
      )}

      {showForm && <ClientModal client={editCli} onSave={handleSave} onClose={()=>{setShowForm(false);setEditCli(null);}} loading={saving}/>}
      {delCli && <ConfirmModal title="Delete Client" message={`Delete "${delCli.name}"?`} onConfirm={handleDelete} onClose={()=>setDelCli(null)} loading={deleting}/>}
    </div>
  );
}
