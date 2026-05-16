import React, { useState, useRef, useEffect } from 'react';
import api from '../api';

const INIT = [{ r:'bot', t:"Hello! I'm DevAI — your intelligent workspace assistant powered by Claude.\n\nI can help you:\n• Analyze your projects & revenue\n• Generate daily/weekly reports\n• Suggest task priorities\n• Detect delayed projects\n• Give financial insights\n\nWhat would you like to know?" }];

const CMDS = [
  'Show all delayed projects',
  'Generate today\'s productivity report',
  'Which projects have pending payments?',
  'Analyze team workload distribution',
  'Suggest which task to do next',
  'Show monthly revenue comparison',
  'Which client owes the most?',
  'What should I focus on today?',
  'Generate project status summary',
  'Identify any project risks',
];

export default function AI() {
  const [msgs,    setMsgs]    = useState(INIT);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [stats,   setStats]   = useState(null);
  const msgsRef = useRef();

  useEffect(() => {
    api.get('/dashboard/stats').then(r=>setStats(r.data)).catch(()=>{});
  }, []);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [msgs]);

  const send = async (q) => {
    const text = (q || input).trim();
    if (!text || loading) return;
    setMsgs(m => [...m, { r:'user', t:text }]);
    setInput('');
    setLoading(true);

    try {
      const f = stats?.finance || {};
      const p = stats?.projects || {};
      const t = stats?.tasks || {};
      const tm = stats?.team || {};
      const recent = (stats?.recentProjects||[]).map(x=>`${x.name}(${x.status},${x.progress}%,${x.clientName})`).join(', ');
      const ctx = `Developer Agency Dashboard Data:
PROJECTS: Total=${p.total}, Active=${p.active}, Completed=${p.completed}, OnHold=${p.onHold}, Planning=${p.planning}
FINANCE: TotalEarned=₨${f.totalEarned?.toLocaleString()}, Pending=₨${f.pending?.toLocaleString()}, MonthlyIncome=₨${f.monthlyIncome?.toLocaleString()}, Expenses=₨${f.totalExpense?.toLocaleString()}, Profit=₨${f.profit?.toLocaleString()}
TASKS: Todo=${t.todo}, InProgress=${t.inprogress}, Done=${t.done}
TEAM: ${tm.total} members, ${tm.online} online
RECENT PROJECTS: ${recent}`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514', max_tokens:1000,
          system:`You are DevAI, an intelligent assistant embedded in a Pakistani web developer agency's management dashboard. You have access to real workspace data. Be concise, specific, and actionable. Use ₨ for currency. Format responses clearly. When generating reports, use bullet points.\n\nCurrent workspace data:\n${ctx}`,
          messages: msgs.map(m=>({role:m.r==='bot'?'assistant':'user',content:m.t})).concat([{role:'user',content:text}]),
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(c=>c.text||'').join('') || 'Unable to get response.';
      setMsgs(m => [...m, { r:'bot', t:reply }]);
    } catch {
      setMsgs(m => [...m, { r:'bot', t:'Connection error. Please check your API configuration.' }]);
    }
    setLoading(false);
  };

  const clearChat = () => setMsgs(INIT);

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">AI Assistant</div>
          <div className="page-sub">Powered by Claude Sonnet — Full intelligence mode</div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-ghost" onClick={clearChat}><i className="ti ti-refresh"/>Clear Chat</button>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:16,height:'calc(100vh - 160px)'}}>
        {/* Chat area */}
        <div className="panel ai-panel" style={{padding:0,overflow:'hidden',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'14px 20px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:36,height:36,background:'linear-gradient(135deg,#2563eb,#7c3aed)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <i className="ti ti-brain" style={{color:'#fff',fontSize:16}}/>
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:'#f1f5f9'}}>DevAI — Full Assistant</div>
              <div style={{fontSize:11,color:'#4ade80',display:'flex',alignItems:'center',gap:4}}>
                <div style={{width:5,height:5,background:'#4ade80',borderRadius:'50%',animation:'blink 2s infinite'}}/>
                Claude Sonnet 4 — Live
              </div>
            </div>
          </div>

          <div className="ai-messages" ref={msgsRef} style={{flex:1}}>
            {msgs.map((m,i)=>(
              <div key={i} className={`ai-bubble ${m.r}`} style={{fontSize:13,maxWidth:'85%',whiteSpace:'pre-wrap'}}>
                {m.t}
              </div>
            ))}
            {loading && (
              <div className="ai-bubble bot" style={{fontSize:13}}>
                <span className="spinner" style={{width:12,height:12,borderWidth:2,marginRight:8,display:'inline-block',verticalAlign:'middle'}}/>
                Analyzing your workspace...
              </div>
            )}
          </div>

          {/* Quick commands */}
          <div style={{padding:'8px 16px',borderTop:'1px solid rgba(255,255,255,0.05)',display:'flex',gap:6,flexWrap:'wrap'}}>
            {CMDS.slice(0,4).map(c=>(
              <span key={c} className="ai-chip" style={{fontSize:11}} onClick={()=>send(c)}>{c}</span>
            ))}
          </div>

          <div className="ai-input-row" style={{padding:'12px 16px'}}>
            <input className="ai-input" style={{fontSize:13,padding:'10px 14px'}}
              placeholder="Ask anything about your projects, revenue, tasks..."
              value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}/>
            <button className="ai-send" style={{width:40,height:40}} onClick={()=>send()} disabled={loading}>
              <i className="ti ti-send"/>
            </button>
          </div>
        </div>

        {/* Sidebar: All quick commands */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className="panel" style={{flex:1,overflow:'auto'}}>
            <div className="panel-header">
              <div className="panel-title"><i className="ti ti-terminal"/>Quick Commands</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {CMDS.map(c=>(
                <button key={c} onClick={()=>send(c)}
                  style={{width:'100%',textAlign:'left',padding:'9px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,0.06)',background:'rgba(255,255,255,0.02)',color:'#64748b',cursor:'pointer',fontSize:12,fontFamily:'Inter,sans-serif',transition:'all 0.15s',lineHeight:1.4}}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(59,130,246,0.08)';e.currentTarget.style.color='#93c5fd';e.currentTarget.style.borderColor='rgba(59,130,246,0.2)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.02)';e.currentTarget.style.color='#64748b';e.currentTarget.style.borderColor='rgba(255,255,255,0.06)';}}>
                  <i className="ti ti-chevron-right" style={{fontSize:11,marginRight:6}}/>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header"><div className="panel-title"><i className="ti ti-info-circle"/>About DevAI</div></div>
            <p style={{fontSize:12,color:'#475569',lineHeight:1.7}}>
              DevAI is connected to your live workspace data. It can analyze projects, generate reports, detect delays, suggest priorities, and provide financial insights.
            </p>
            <div style={{marginTop:12,padding:'10px 12px',background:'rgba(37,99,235,0.08)',borderRadius:8,border:'1px solid rgba(37,99,235,0.15)'}}>
              <div style={{fontSize:10,color:'#60a5fa',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:4}}>Powered By</div>
              <div style={{fontSize:13,color:'#93c5fd',fontWeight:600}}>Claude Sonnet 4</div>
              <div style={{fontSize:11,color:'#334155',marginTop:2}}>Anthropic AI</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
