import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import api from '../api';
import { fmt, timeAgo, statusClass, progressColor } from '../utils';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AI_INIT = [{ r:'bot', t:"Hello! I'm DevAI. Ask me about projects, earnings, team, or anything about your workspace." }];
const QUICK = ['Show delayed projects','Pending payments','Today\'s report','Team workload'];

export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiMsgs, setAiMsgs]   = useState(AI_INIT);
  const [aiIn, setAiIn]       = useState('');
  const [aiLoad, setAiLoad]   = useState(false);
  const msgsRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [aiMsgs]);

  const sendAI = async () => {
    if (!aiIn.trim() || aiLoad) return;
    const q = aiIn.trim();
    setAiMsgs(m => [...m, { r:'user', t:q }]);
    setAiIn('');
    setAiLoad(true);
    try {
      const f = stats?.finance || {};
      const p = stats?.projects || {};
      const t = stats?.tasks || {};
      const ctx = `Projects:Total=${p.total},Active=${p.active},Completed=${p.completed},OnHold=${p.onHold}. Finance:Earned=${fmt(f.totalEarned)},Pending=${fmt(f.pending)},Monthly=${fmt(f.monthlyIncome)},Profit=${fmt(f.profit)}. Tasks:Todo=${t.todo},InProgress=${t.inprogress},Done=${t.done}. Team:${stats?.team?.total} members,${stats?.team?.online} online.`;
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514', max_tokens:600,
          system:`You are DevAI, assistant in a Pakistani developer agency dashboard. Data:${ctx} Reply in 2-3 sentences. Use ₨.`,
          messages:[...aiMsgs.map(m=>({role:m.r==='bot'?'assistant':'user',content:m.t})),{role:'user',content:q}],
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(c=>c.text||'').join('') || 'Unable to respond.';
      setAiMsgs(m => [...m, { r:'bot', t:reply }]);
    } catch {
      setAiMsgs(m => [...m, { r:'bot', t:'AI unavailable. Check API configuration.' }]);
    }
    setAiLoad(false);
  };

  if (loading) return (
    <div className="page-loader">
      <div style={{ textAlign:'center' }}>
        <span className="spinner" style={{ width:32, height:32, borderWidth:3 }} />
        <p style={{ color:'#475569', marginTop:12, fontSize:13 }}>Loading dashboard...</p>
      </div>
    </div>
  );

  const fi = stats?.finance || {};
  const pr = stats?.projects || {};
  const ta = stats?.tasks || {};
  const tm = stats?.team || {};

  const chartData = {
    labels: ['Aug','Sep','Oct','Nov','Dec','Jan'],
    datasets: [
      { label:'Income',   data:[180000,240000,195000,310000,285000,fi.monthlyIncome||340000], backgroundColor:'rgba(59,130,246,0.65)', borderRadius:5 },
      { label:'Expenses', data:[45000,62000,48000,75000,55000,68000], backgroundColor:'rgba(239,68,68,0.35)', borderRadius:5 },
    ],
  };
  const chartOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false}, tooltip:{callbacks:{label:v=>'₨'+(v.raw/1000).toFixed(0)+'k'}} },
    scales:{
      x:{grid:{color:'rgba(255,255,255,0.03)'},ticks:{color:'#475569',font:{size:11}}},
      y:{grid:{color:'rgba(255,255,255,0.03)'},ticks:{color:'#475569',font:{size:11},callback:v=>'₨'+(v/1000)+'k'}},
    },
  };

  const STATS = [
    {lbl:'Total Websites',   val:pr.total||0,           ic:'ti-world',         ac:'#3b82f6',ib:'rgba(59,130,246,0.1)',  tr:'+2',   up:true},
    {lbl:'Active Projects',  val:pr.active||0,           ic:'ti-rocket',        ac:'#8b5cf6',ib:'rgba(139,92,246,0.1)', tr:'+1',   up:true},
    {lbl:'Completed',        val:pr.completed||0,        ic:'ti-circle-check',  ac:'#10b981',ib:'rgba(16,185,129,0.1)',  tr:'+1',   up:true},
    {lbl:'On Hold',          val:pr.onHold||0,           ic:'ti-pause',         ac:'#f59e0b',ib:'rgba(245,158,11,0.1)',  tr:'—',    up:true},
    {lbl:'Monthly Revenue',  val:fmt(fi.monthlyIncome),  ic:'ti-trending-up',   ac:'#4ade80',ib:'rgba(74,222,128,0.1)', tr:'+23%', up:true},
    {lbl:'Total Earnings',   val:fmt(fi.totalEarned),    ic:'ti-cash',          ac:'#34d399',ib:'rgba(52,211,153,0.1)', tr:'+18%', up:true},
    {lbl:'Pending Payments', val:fmt(fi.pending),        ic:'ti-alert-circle',  ac:'#f87171',ib:'rgba(248,113,113,0.1)',tr:'-5%',  up:false},
    {lbl:'Active Tasks',     val:(ta.todo||0)+(ta.inprogress||0), ic:'ti-checklist', ac:'#fb923c',ib:'rgba(251,146,60,0.1)', tr:'-3', up:true},
    {lbl:'Team Members',     val:tm.total||0,            ic:'ti-users',         ac:'#a78bfa',ib:'rgba(167,139,250,0.1)',tr:tm.online+' online', up:true},
    {lbl:'Net Profit',       val:fmt(fi.profit),         ic:'ti-chart-pie',     ac:'#2dd4bf',ib:'rgba(45,212,191,0.1)', tr:'+15%', up:true},
    {lbl:'Total Expenses',   val:fmt(fi.totalExpense),   ic:'ti-receipt',       ac:'#f59e0b',ib:'rgba(245,158,11,0.1)', tr:'—',    up:true},
    {lbl:'Clients',          val:stats?.clients?.total||0,ic:'ti-building',     ac:'#06b6d4',ib:'rgba(6,182,212,0.1)',  tr:'+1',   up:true},
  ];

  return (
    <div>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <div className="page-title">Good morning 👋</div>
          <div className="page-sub">
            {new Date().toLocaleDateString('en-PK',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
            {' — '}{(ta.todo||0)+(ta.inprogress||0)} active tasks
          </div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-ghost" onClick={()=>navigate('/projects')}><i className="ti ti-folder-open"/>Projects</button>
          <button className="btn btn-primary" onClick={()=>navigate('/projects')}><i className="ti ti-plus"/>New Project</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {STATS.map((s,i)=>(
          <div key={i} className="stat-card" style={{'--accent':s.ac,'--icon-bg':s.ib}}>
            <div className="stat-icon"><i className={`ti ${s.ic}`}/></div>
            <div className="stat-value">{s.val}</div>
            <div className="stat-label">{s.lbl}</div>
            <div className={`stat-trend ${s.up?'trend-up':'trend-down'}`}>
              <i className={`ti ti-trending-${s.up?'up':'down'}`} style={{fontSize:10}}/>{s.tr}
            </div>
          </div>
        ))}
      </div>

      {/* 3-col: Chart | Projects | AI */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 300px',gap:16,marginBottom:20}}>
        {/* Revenue Chart */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title"><i className="ti ti-chart-bar"/>Revenue Overview</div>
            <div style={{display:'flex',gap:12}}>
              {[['rgba(59,130,246,0.65)','Income'],['rgba(239,68,68,0.35)','Expenses']].map(([c,l])=>(
                <span key={l} style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'#475569'}}>
                  <span style={{width:8,height:8,borderRadius:2,background:c,display:'inline-block'}}/>{l}
                </span>
              ))}
            </div>
          </div>
          <div style={{height:200}}><Bar data={chartData} options={chartOpts}/></div>
        </div>

        {/* Recent Projects */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title"><i className="ti ti-folder"/>Recent Projects</div>
            <span className="panel-link" onClick={()=>navigate('/projects')}>View all →</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {(stats?.recentProjects||[]).slice(0,5).map(proj=>(
              <div key={proj._id} onClick={()=>navigate('/projects')}
                style={{display:'flex',alignItems:'center',gap:12,padding:'10px 13px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:10,cursor:'pointer',transition:'all 0.18s'}}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(59,130,246,0.05)';e.currentTarget.style.borderColor='rgba(59,130,246,0.18)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.02)';e.currentTarget.style.borderColor='rgba(255,255,255,0.05)';}}
              >
                <div style={{width:36,height:36,borderRadius:9,background:(proj.color||'#3b82f6')+'1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{proj.icon||'🌐'}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:'#e2e8f0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{proj.name}</div>
                  <div style={{fontSize:11,color:'#334155'}}>{proj.clientName}</div>
                  <div className="prog-wrap" style={{marginTop:5}}>
                    <div className="prog-fill" style={{width:(proj.progress||0)+'%',background:progressColor(proj.progress)}}/>
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <span className={`badge ${statusClass(proj.status)}`}>{proj.status}</span>
                  <div style={{fontSize:12,fontWeight:700,color:'#4ade80',marginTop:4}}>{fmt(proj.totalEarned)}</div>
                </div>
              </div>
            ))}
            {!stats?.recentProjects?.length&&(
              <div className="empty-state">
                <div className="empty-icon">📂</div>
                <div className="empty-title">No projects yet</div>
                <button className="btn btn-primary btn-sm" onClick={()=>navigate('/projects')}><i className="ti ti-plus"/>Add Project</button>
              </div>
            )}
          </div>
        </div>

        {/* AI Chat */}
        <div className="panel ai-panel" style={{padding:0,overflow:'hidden',height:420}}>
          <div className="ai-header">
            <div className="ai-av"><i className="ti ti-brain" style={{color:'#fff',fontSize:14}}/></div>
            <div>
              <div className="ai-name">DevAI Assistant</div>
              <div className="ai-status"><span className="ai-dot"/>Claude Powered</div>
            </div>
          </div>
          <div className="ai-messages" ref={msgsRef} style={{flex:1}}>
            {aiMsgs.map((m,i)=><div key={i} className={`ai-bubble ${m.r}`}>{m.t}</div>)}
            {aiLoad&&<div className="ai-bubble bot"><span className="spinner" style={{width:12,height:12,borderWidth:2,marginRight:6,display:'inline-block',verticalAlign:'middle'}}/>Thinking...</div>}
          </div>
          <div className="ai-quick">
            {QUICK.map(c=><span key={c} className="ai-chip" onClick={()=>setAiIn(c)}>{c}</span>)}
          </div>
          <div className="ai-input-row">
            <input className="ai-input" placeholder="Ask anything..." value={aiIn} onChange={e=>setAiIn(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendAI()}/>
            <button className="ai-send" onClick={sendAI}><i className="ti ti-send" style={{fontSize:13}}/></button>
          </div>
        </div>
      </div>

      {/* Bottom row: Activity + Finance */}
      <div className="grid-2" style={{marginBottom:20}}>
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title"><i className="ti ti-activity"/>Live Activity</div>
          </div>
          {(stats?.activities||[]).length===0
            ? <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">No activity yet</div></div>
            : (stats?.activities||[]).map((a,i)=>(
              <div key={i} className="activity-item">
                <div className="activity-dot" style={{background:a.color||'#3b82f6'}}/>
                <div>
                  <div className="activity-text">{a.title}</div>
                  <div className="activity-time">{timeAgo(a.createdAt)}</div>
                </div>
              </div>
            ))
          }
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title"><i className="ti ti-cash"/>Finance Snapshot</div>
            <span className="panel-link" onClick={()=>navigate('/finance')}>Full report →</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {[
              {lbl:'Total Earned',    val:fmt(fi.totalEarned),  clr:'#4ade80'},
              {lbl:'Pending Invoices',val:fmt(fi.pending),      clr:'#f87171'},
              {lbl:'Monthly Income',  val:fmt(fi.monthlyIncome),clr:'#60a5fa'},
              {lbl:'Total Expenses',  val:fmt(fi.totalExpense), clr:'#f59e0b'},
              {lbl:'Net Profit',      val:fmt(fi.profit),       clr:'#a78bfa'},
            ].map(row=>(
              <div key={row.lbl} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'rgba(255,255,255,0.02)',borderRadius:9,border:'1px solid rgba(255,255,255,0.05)'}}>
                <span style={{fontSize:13,color:'#64748b'}}>{row.lbl}</span>
                <span style={{fontSize:15,fontWeight:800,color:row.clr}}>{row.val}</span>
              </div>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/finance')} style={{marginTop:4}}>
              <i className="ti ti-plus"/>Add Transaction
            </button>
          </div>
        </div>
      </div>

      {/* Task summary */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title"><i className="ti ti-checklist"/>Task Overview</div>
          <span className="panel-link" onClick={()=>navigate('/tasks')}>Kanban Board →</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
          {[
            {lbl:'To Do',      count:ta.todo||0,        clr:'#a78bfa',ic:'ti-circle'},
            {lbl:'In Progress',count:ta.inprogress||0,  clr:'#60a5fa',ic:'ti-loader'},
            {lbl:'In Review',  count:ta.review||0,      clr:'#f59e0b',ic:'ti-eye'},
            {lbl:'Completed',  count:ta.done||0,        clr:'#4ade80',ic:'ti-circle-check'},
          ].map(col=>(
            <div key={col.lbl} onClick={()=>navigate('/tasks')}
              style={{textAlign:'center',padding:'16px 10px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:10,cursor:'pointer',transition:'all 0.18s'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(59,130,246,0.05)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
            >
              <i className={`ti ${col.ic}`} style={{fontSize:22,color:col.clr,display:'block',marginBottom:8}}/>
              <div style={{fontSize:24,fontWeight:800,color:col.clr}}>{col.count}</div>
              <div style={{fontSize:11,color:'#475569',marginTop:3,textTransform:'uppercase',letterSpacing:'0.07em',fontWeight:600}}>{col.lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
