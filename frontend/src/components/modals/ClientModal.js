import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { CLIENT_STATUSES, COLORS } from '../../utils';

const EMPTY = {
  name: '', email: '', phone: '', company: '', country: 'Pakistan',
  city: '', address: '', notes: '', status: 'active', color: '#2563eb',
};

export default function ClientModal({ client, onSave, onClose, loading }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (client) setForm({ ...EMPTY, ...client });
  }, [client]);

  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      title={<><i className="ti ti-building" style={{ color: '#10b981' }} />{client ? 'Edit Client' : 'New Client'}</>}
      onClose={onClose}
    >
      <div style={{ marginBottom: 14 }}>
        <div className="form-label" style={{ marginBottom: 8 }}>Card Color</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {COLORS.map((c) => (
            <div key={c} onClick={() => up('color', c)}
              style={{ width: 24, height: 24, borderRadius: 6, background: c, cursor: 'pointer', border: form.color === c ? '2px solid #fff' : '2px solid transparent' }} />
          ))}
        </div>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <div className="form-label">Client Name *</div>
          <input className="form-input" placeholder="Full name" value={form.name} onChange={(e) => up('name', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Company</div>
          <input className="form-input" placeholder="Company or business name" value={form.company} onChange={(e) => up('company', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Email</div>
          <input className="form-input" type="email" placeholder="client@example.com" value={form.email} onChange={(e) => up('email', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Phone</div>
          <input className="form-input" placeholder="0300-1234567" value={form.phone} onChange={(e) => up('phone', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">City</div>
          <input className="form-input" placeholder="Karachi, Lahore..." value={form.city} onChange={(e) => up('city', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Status</div>
          <select className="form-select" value={form.status} onChange={(e) => up('status', e.target.value)}>
            {CLIENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group form-full">
          <div className="form-label">Notes</div>
          <textarea className="form-textarea" placeholder="Client preferences, payment history..." value={form.notes} onChange={(e) => up('notes', e.target.value)} />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onSave(form)} disabled={loading || !form.name}>
          {loading ? <span className="spinner" /> : <><i className="ti ti-check" />{client ? 'Update Client' : 'Add Client'}</>}
        </button>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}
