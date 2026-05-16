import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';

import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects  from './pages/Projects';
import Tasks     from './pages/Tasks';
import Clients   from './pages/Clients';
import Finance   from './pages/Finance';
import Team      from './pages/Team';
import Workspace from './pages/Workspace';
import AI        from './pages/AI';

import api from './api';

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setCounts({
        projects:    r.data.projects?.total || 0,
        activeTasks: (r.data.tasks?.todo || 0) + (r.data.tasks?.inprogress || 0),
        clients:     r.data.clients?.total || 0,
      }))
      .catch(() => {});
  }, []);

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#070b14' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48, height:48, border:'3px solid rgba(59,130,246,0.2)', borderTopColor:'#3b82f6', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }}/>
        <p style={{ color:'#475569', fontSize:13 }}>Loading DevOps AI...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:150, display:'none' }}
          className="mobile-overlay"
        />
      )}

      <Sidebar counts={counts} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        {/* Mobile topbar */}
        <div style={{ display:'none', alignItems:'center', gap:12, marginBottom:16, paddingBottom:16, borderBottom:'1px solid rgba(99,179,237,0.08)' }} className="mobile-topbar">
          <button
            className="icon-btn"
            onClick={() => setSidebarOpen(true)}
            style={{ flexShrink:0 }}
          >
            <i className="ti ti-menu-2"/>
          </button>
          <div style={{ fontSize:16, fontWeight:800, background:'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            DevOps AI
          </div>
        </div>

        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/projects"  element={<Projects  />} />
          <Route path="/tasks"     element={<Tasks     />} />
          <Route path="/clients"   element={<Clients   />} />
          <Route path="/finance"   element={<Finance   />} />
          <Route path="/team"      element={<Team      />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/ai"        element={<AI        />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/*"     element={<ProtectedLayout />} />
        </Routes>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          theme="dark"
          style={{ fontSize:13 }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}
