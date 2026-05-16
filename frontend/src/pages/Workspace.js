import React, { useState, useEffect } from 'react';
import api from '../api';

const TOOLS = [
  { ic:'ti-code',          lbl:'VS Code',        url:'vscode://',                    color:'#007acc' },
  { ic:'ti-brand-github',  lbl:'GitHub',          url:'https://github.com',           color:'#6366f1' },
  { ic:'ti-server',        lbl:'Hostinger',       url:'https://hpanel.hostinger.com', color:'#673dde' },
  { ic:'ti-database',      lbl:'MongoDB Atlas',   url:'https://cloud.mongodb.com',    color:'#10b981' },
  { ic:'ti-brand-figma',   lbl:'Figma',           url:'https://figma.com',            color:'#f24e1e' },
  { ic:'ti-world',         lbl:'Browser',         url:'https://google.com',           color:'#4285f4' },
  { ic:'ti-brand-vercel',  lbl:'Vercel',          url:'https://vercel.com',           color:'#f1f5f9' },
  { ic:'ti-brand-docker',  lbl:'Docker Hub',      url:'https://hub.docker.com',       color:'#2496ed' },
  { ic:'ti-brand-npm',     lbl:'npm',             url:'https://npmjs.com',            color:'#cb3837' },
  { ic:'ti-cloud',         lbl:'AWS Console',     url:'https://console.aws.amazon.com',color:'#f90' },
  { ic:'ti-shield',        lbl:'Cloudflare',      url:'https://dash.cloudflare.com',  color:'#f48120' },
  { ic:'ti-brand-linkedin',lbl:'LinkedIn',        url:'https://linkedin.com',         color:'#0a66c2' },
];

export default function Workspace() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Workspace</div>
          <div className="page-sub">One-click launchers for all your dev tools</div>
        </div>
      </div>

      {/* Global Tools */}
      <div className="panel" style={{marginBottom:20}}>
        <div className="panel-header">
          <div className="panel-title"><i className="ti ti-bolt"/>Global Dev Tools</div>
          <span style={{fontSize:12,color:'#334155'}}>Click to open in new tab</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:12}}>
          {TOOLS.map(t=>(
            <div key={t.lbl} className="ws-btn" onClick={()=>t.url&&window.open(t.url,'_blank')} style={{textAlign:'center',padding:'18px 12px'}}>
              <i className={`ti ${t.ic}`} style={{fontSize:26,marginBottom:9,display:'block',color:t.color}}/>
              <div className="ws-label">{t.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Project Workspace */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title"><i className="ti ti-folder-open"/>Project Workspaces</div>
          <span style={{fontSize:12,color:'#334155'}}>Quick access to project-specific tools</span>
        </div>
        {projects.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🚀</div>
            <div className="empty-title">No projects yet</div>
            <div className="empty-sub">Add projects to see their workspaces here</div>
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
          {projects.map(p=>(
            <div key={p._id} style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderLeft:`3px solid ${p.color||'#3b82f6'}`,borderRadius:10,padding:14,transition:'all 0.2s'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(59,130,246,0.04)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
            >
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                <span style={{fontSize:18}}>{p.icon||'🌐'}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:'#e2e8f0'}}>{p.name}</div>
                  <div style={{fontSize:11,color:'#334155'}}>{p.clientName}</div>
                </div>
              </div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {[
                  p.websiteUrl && { lbl:'Website', ic:'ti-external-link', url:'https://'+p.websiteUrl.replace(/^https?:\/\//,'') },
                  p.adminUrl   && { lbl:'Admin',   ic:'ti-lock',          url:'https://'+p.adminUrl.replace(/^https?:\/\//,'') },
                  p.githubRepo && { lbl:'GitHub',  ic:'ti-brand-github',  url:'https://'+p.githubRepo.replace(/^https?:\/\//,'') },
                  p.figmaUrl   && { lbl:'Figma',   ic:'ti-brand-figma',   url:'https://'+p.figmaUrl.replace(/^https?:\/\//,'') },
                ].filter(Boolean).map(btn=>(
                  <button key={btn.lbl} onClick={()=>window.open(btn.url,'_blank')}
                    style={{background:'rgba(37,99,235,0.1)',border:'1px solid rgba(37,99,235,0.18)',color:'#60a5fa',borderRadius:6,padding:'4px 10px',fontSize:11,cursor:'pointer',fontFamily:'Inter,sans-serif',fontWeight:600,display:'flex',alignItems:'center',gap:4}}>
                    <i className={`ti ${btn.ic}`} style={{fontSize:11}}/>{btn.lbl}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
