import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ✅ Correct Import Paths
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils';

const NAV = [
  { path: '/',          icon: 'ti-dashboard',   label: 'Dashboard' },
  { path: '/projects',  icon: 'ti-folder-open', label: 'Projects' },
  { path: '/tasks',     icon: 'ti-checklist',   label: 'Tasks' },
  { path: '/clients',   icon: 'ti-building',    label: 'Clients' },
  { path: '/finance',   icon: 'ti-receipt',     label: 'Finance' },
  { path: '/team',      icon: 'ti-users',       label: 'Team' },
  { path: '/workspace', icon: 'ti-rocket',      label: 'Workspace' },
  { path: '/ai',        icon: 'ti-brain',       label: 'AI Assistant' },
];

export default function Sidebar({ counts = {}, onClose }) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const go = (path) => {
    navigate(path);

    if (onClose) {
      onClose();
    }
  };

  return (
    <aside className="sidebar">
      
      {/* ================= LOGO ================= */}
      <div className="sidebar-logo">
        <div className="logo-row">
          <div className="logo-icon">
            <i
              className="ti ti-terminal-2"
              style={{
                color: '#fff',
                fontSize: 17,
              }}
            />
          </div>

          <div>
            <div className="logo-title">DevOps AI</div>
            <div className="logo-sub">Management Suite</div>
          </div>
        </div>
      </div>

      {/* ================= NAVIGATION ================= */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: 8,
        }}
      >
        <div className="nav-section">Navigation</div>

        {NAV.map((nav) => (
          <div
            key={nav.path}
            className={`nav-item ${
              location.pathname === nav.path ? 'active' : ''
            }`}
            onClick={() => go(nav.path)}
          >
            <i className={`ti ${nav.icon}`} />

            <span>{nav.label}</span>

            {/* Projects Count */}
            {nav.path === '/projects' && counts.projects > 0 && (
              <span className="nav-badge nb-blue">
                {counts.projects}
              </span>
            )}

            {/* Tasks Count */}
            {nav.path === '/tasks' && counts.activeTasks > 0 && (
              <span className="nav-badge nb-red">
                {counts.activeTasks}
              </span>
            )}

            {/* Clients Count */}
            {nav.path === '/clients' && counts.clients > 0 && (
              <span className="nav-badge nb-green">
                {counts.clients}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ================= USER FOOTER ================= */}
      <div className="sidebar-footer">
        {user && (
          <div
            className="user-card"
            onClick={() => navigate('/team')}
          >
            {/* Avatar */}
            <div
              className="user-av"
              style={{
                background: user.color || '#2563eb',
              }}
            >
              {initials(user.name || 'U')}
            </div>

            {/* User Info */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                className="user-nm"
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.name || 'User'}
              </div>

              <div className="user-rl">
                {user.role || 'Member'}
              </div>
            </div>

            {/* Logout */}
            <i
              className="ti ti-logout"
              style={{
                color: '#475569',
                fontSize: 15,
                flexShrink: 0,
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
            />
          </div>
        )}
      </div>
    </aside>
  );
}