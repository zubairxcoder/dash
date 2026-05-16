import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { ROLES, COLORS } from '../../utils';

const EMPTY = {
  name: '', email: '', password: '', role: 'developer',
  phone: '', skills: '', hourlyRate: '', color: '#2563eb',
};

export default function TeamModal({ member, onSave, onClose, loading }) {
  const [form, setForm] = useState(EMPTY);
  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (member) setForm({ ...EMPTY, ...member, skills: (member.skills || []).join(', '), password: '' });
  }, [member]);

  const submit = () => {
    const payload = {
      ...form,
      skills: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      hourlyRate: Number(form.hourlyRate) || 0,
    };
    if (!member && !payload.password) return alert('Password is required for new members');
    onSave(payload);
  };

  return (
    <Modal
      title={<><i className="ti ti-user-plus" style={{ color: '#6366f1' }} />{member ? 'Edit Member' : 'Add Team Member'}</>}
      onClose={onClose}
    >
      <div style={{ marginBottom: 14 }}>
        <div className="form-label" style={{ marginBottom: 8 }}>Avatar Color</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {COLORS.map((c) => (
            <div key={c} onClick={() => up('color', c)}
              style={{ width: 24, height: 24, borderRadius: 6, background: c, cursor: 'pointer', border: form.color === c ? '2px solid #fff' : '2px solid transparent' }} />
          ))}
        </div>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <div className="form-label">Full Name *</div>
          <input className="form-input" placeholder="Ahmad Khan" value={form.name} onChange={(e) => up('name', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Role</div>
          <select className="form-select" value={form.role} onChange={(e) => up('role', e.target.value)}>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-group">
          <div className="form-label">Email *</div>
          <input className="form-input" type="email" placeholder="member@team.com" value={form.email} onChange={(e) => up('email', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">{member ? 'New Password (optional)' : 'Password *'}</div>
          <input className="form-input" type="password" placeholder={member ? 'Leave blank to keep' : 'Min 6 characters'} value={form.password} onChange={(e) => up('password', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Phone</div>
          <input className="form-input" placeholder="0300-1234567" value={form.phone} onChange={(e) => up('phone', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Hourly Rate (₨)</div>
          <input className="form-input" type="number" placeholder="0" value={form.hourlyRate} onChange={(e) => up('hourlyRate', e.target.value)} />
        </div>
        <div className="form-group form-full">
          <div className="form-label">Skills (comma separated)</div>
          <input className="form-input" placeholder="React, Node.js, Figma..." value={form.skills} onChange={(e) => up('skills', e.target.value)} />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={submit} disabled={loading || !form.name || !form.email}>
          {loading ? <span className="spinner" /> : <><i className="ti ti-check" />{member ? 'Update Member' : 'Add Member'}</>}
        </button>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}
