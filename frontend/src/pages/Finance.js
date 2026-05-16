import React, { useState, useEffect, useCallback } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import api from '../api';
import { fmt, statusClass, fmtDate } from '../utils';
import { toast } from 'react-toastify';
import TransactionModal from '../components/modals/TransactionModal';
import ConfirmModal from '../components/modals/ConfirmModal';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Finance() {
  const [txns,     setTxns]     = useState([]);
  const [summary,  setSummary]  = useState({});
  const [projects, setProjects] = useState([]);
  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTx,   setEditTx]   = useState(null);
  const [delTx,    setDelTx]    = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [search,   setSearch]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, sRes, pRes, cRes] = await Promise.all([
        api.get('/finance'), api.get('/finance/summary'),
        api.get('/projects'), api.get('/clients'),
      ]);
      setTxns(tRes.data);
      setSummary(sRes.data);
      setProjects(pRes.data);
      setClients(cRes.data);
    } catch { toast.error('Failed to load finance data'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = txns.filter(t => {
    const mt = typeFilter==='all' || t.type===typeFilter;
    const ms = !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.projectName||'').toLowerCase().includes(search.toLowerCase());
    return mt && ms;
  });

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editTx) {
        const res = await api.put(`/finance/${editTx._id}`, data);
        setTxns(t => t.map(x => x._id===editTx._id ? res.data : x));
        toast.success('Transaction updated!');
      } else {
        const res = await api.post('/finance', data);
        setTxns(t => [res.data, ...t]);
        toast.success('Transaction added!');
      }
      setShowForm(false); setEditTx(null);
      const sRes = await api.get('/finance/summary');
      setSummary(sRes.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/finance/${delTx._id}`);
      setTxns(t => t.filter(x => x._id!==delTx._id));
      toast.success('Transaction deleted'); setDelTx(null);
    } catch { toast.error('Delete failed'); }
    setDeleting(false);
  };

  const monthly = summary.monthly || [];
  const chartData = {
    labels: monthly.map(m=>m.label),
    datasets: [
      {label:'Income',  data:monthly.map(m=>m.income),  backgroundColor:'rgba(59,130,246,0.65)', borderRadius:5},
      {label:'Expense', data:monthly.map(m=>m.expense), backgroundColor:'rgba(239,68,68,0.35)', borderRadius:5},
    ],
  };
  const chartOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{legend:{display:false},tooltip:{callbacks:{label:v=>'₨'+(v.raw/1000).toFixed(0)+'k'}}},
    scales:{
      x:{grid:{color:'rgba(255,255,255,0.03)'},ticks:{color:'#475569',font:{size:11}}},
      y:{grid:{color:'rgba(255,255,255,0.03)'},ticks:{color:'#475569',font:{size:11},callback:v=>'₨'+(v/1000)+'k'}},
    },
  };

  const donutData = {
    labels:['Income','Expenses'],
    datasets:[{data:[summary.income||0,summary.expenses||0],backgroundColor:['rgba(59,130,246,0.8)','rgba(239,68,68,0.7)'],borderWidth:0}],
  };
  const donutOpts = {responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#64748b',font:{size:11}}}}};

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Finance</div>
          <div className="page-sub">{txns.length} transactions — {txns.filter(t=>t.status==='pending').length} pending</div>
        </div>
        <div className="topbar-right">
          <div className="search-bar" style={{minWidth:200}}>
            <i className="ti ti-search"/>
            <input placeholder="Search transactions..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <button className="btn btn-primary" onClick={()=>{setEditTx(null);setShowForm(true);}}>
            <i className="ti ti-plus"/>Add Transaction
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
        {[
          {lbl:'Total Revenue',    val:fmt(summary.income),   clr:'#4ade80',ic:'ti-trending-up',  bg:'rgba(74,222,128,0.07)', br:'rgba(74,222,128,0.14)'},
          {lbl:'Pending Payments', val:fmt(summary.pending),  clr:'#f87171',ic:'ti-clock',         bg:'rgba(248,113,113,0.07)',br:'rgba(248,113,113,0.14)'},
          {lbl:'Total Expenses',   val:fmt(summary.expenses), clr:'#f59e0b',ic:'ti-receipt',       bg:'rgba(245,158,11,0.07)', br:'rgba(245,158,11,0.14)'},
          {lbl:'Net Profit',       val:fmt(summary.profit),   clr:'#a78bfa',ic:'ti-chart-pie',     bg:'rgba(167,139,250,0.07)',br:'rgba(167,139,250,0.14)'},
          {lbl:'This Month',       val:fmt(monthly[monthly.length-1]?.income), clr:'#60a5fa',ic:'ti-calendar',bg:'rgba(96,165,250,0.07)',br:'rgba(96,165,250,0.14)'},
          {lbl:'Profit Margin',    val: summary.income ? Math.round((summary.profit||0)/summary.income*100)+'%' : '0%', clr:'#2dd4bf',ic:'ti-percentage',bg:'rgba(45,212,191,0.07)',br:'rgba(45,212,191,0.14)'},
        ].map((c,i)=>(
          <div key={i} style={{background:c.bg,border:'1px solid '+c.br,borderRadius:14,padding:'18px 20px'}}>
            <div style={{fontSize:10,color:c.clr,textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:700,marginBottom:8,display:'flex',alignItems:'center',gap:6}}>
              <i className={`ti ${c.ic}`}/>{c.lbl}
            </div>
            <div style={{fontSize:26,fontWeight:800,color:c.clr,letterSpacing:'-0.03em'}}>{c.val||'₨0'}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2" style={{marginBottom:20}}>
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title"><i className="ti ti-chart-bar"/>Monthly Revenue vs Expenses</div>
          </div>
          <div style={{height:220}}>
            {monthly.length>0 ? <Bar data={chartData} options={chartOpts}/> : <div className="page-loader"><span style={{color:'#475569',fontSize:12}}>No data yet</span></div>}
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title"><i className="ti ti-chart-donut"/>Income vs Expenses</div>
          </div>
          <div style={{height:220}}>
            {(summary.income||0)+(summary.expenses||0)>0
              ? <Doughnut data={donutData} options={donutOpts}/>
              : <div className="page-loader"><span style={{color:'#475569',fontSize:12}}>No data yet</span></div>}
          </div>
        </div>
      </div>

      {/* Type filter */}
      <div style={{display:'flex',gap:4,marginBottom:14}}>
        {[['all','All'],['income','Income 💰'],['expense','Expenses 💸']].map(([v,l])=>(
          <button key={v} onClick={()=>setTypeFilter(v)} style={{padding:'6px 14px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',border:'none',background:typeFilter===v?'rgba(59,130,246,0.18)':'rgba(255,255,255,0.04)',color:typeFilter===v?'#60a5fa':'#475569',transition:'all 0.18s'}}>
            {l}
          </button>
        ))}
      </div>

      {/* Transactions table */}
      {loading && <div className="page-loader"><span className="spinner" style={{width:28,height:28,borderWidth:3}}/></div>}
      {!loading && (
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title"><i className="ti ti-list"/>Transactions ({filtered.length})</div>
          </div>
          {filtered.length===0 ? (
            <div className="empty-state">
              <div className="empty-icon">💳</div>
              <div className="empty-title">No transactions yet</div>
              <button className="btn btn-primary" onClick={()=>setShowForm(true)}><i className="ti ti-plus"/>Add Transaction</button>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th><th>Type</th><th>Amount</th><th>Project</th>
                    <th>Category</th><th>Method</th><th>Date</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(tx=>(
                    <tr key={tx._id}>
                      <td style={{color:'#e2e8f0',fontWeight:600}}>{tx.title}</td>
                      <td><span className={`badge ${tx.type==='income'?'b-income':'b-expense'}`}>{tx.type==='income'?'💰 Income':'💸 Expense'}</span></td>
                      <td style={{color:tx.type==='income'?'#4ade80':'#f87171',fontWeight:700}}>{tx.type==='income'?'+':'-'}{fmt(tx.amount)}</td>
                      <td style={{color:'#64748b'}}>{tx.projectName||'—'}</td>
                      <td style={{color:'#64748b'}}>{tx.category}</td>
                      <td style={{color:'#64748b'}}>{tx.paymentMethod}</td>
                      <td style={{color:'#64748b'}}>{fmtDate(tx.date)}</td>
                      <td><span className={`badge ${statusClass(tx.status)}`}>{tx.status}</span></td>
                      <td>
                        <div style={{display:'flex',gap:8}}>
                          <button onClick={()=>{setEditTx(tx);setShowForm(true);}} style={{background:'none',border:'none',color:'#475569',cursor:'pointer',fontSize:14}}><i className="ti ti-edit"/></button>
                          <button onClick={()=>setDelTx(tx)} style={{background:'none',border:'none',color:'#475569',cursor:'pointer',fontSize:14}}><i className="ti ti-trash"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showForm && <TransactionModal transaction={editTx} projects={projects} clients={clients} onSave={handleSave} onClose={()=>{setShowForm(false);setEditTx(null);}} loading={saving}/>}
      {delTx && <ConfirmModal title="Delete Transaction" message={`Delete "${delTx.title}"?`} onConfirm={handleDelete} onClose={()=>setDelTx(null)} loading={deleting}/>}
    </div>
  );
}
