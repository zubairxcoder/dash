import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { PROJECT_STATUSES, PRIORITIES, ICONS, COLORS, TECH_STACK_OPTIONS } from '../../utils';

const EMPTY = {
  name: '', clientName: '', websiteUrl: '', adminUrl: '', stagingUrl: '',
  hostingProvider: '', hostingUrl: '', githubRepo: '', figmaUrl: '',
  techStack: [], status: 'Planning', priority: 'Medium', progress: 0,
  startDate: '', deadline: '', budget: '', totalEarned: '', pendingPayment: '',
  expenses: '', icon: '🌐', color: '#2563eb', notes: '', tags: '',
};

export default function ProjectModal({ project, clients, onSave, onClose, loading }) {
  const [form, setForm] = useState(EMPTY);
  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    if (project) {
      setForm({
        ...EMPTY, ...project,
        clientName:    project.clientName    || project.client?.name || '',
        startDate:     project.startDate     ? project.startDate.split('T')[0] : '',
        deadline:      project.deadline      ? project.deadline.split('T')[0] : '',
        budget:        project.budget        || '',
        totalEarned:   project.totalEarned   || '',
        pendingPayment:project.pendingPayment || '',
        expenses:      project.expenses      || '',
        tags:          (project.tags || []).join(', '),
        techStack:     project.techStack     || [],
      });
    }
  }, [project]);

  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addTech = (t) => {
    const trimmed = t.trim();
    if (trimmed && !form.techStack.includes(trimmed)) {
      up('techStack', [...form.techStack, trimmed]);
    }
    setTechInput('');
  };

  const removeTech = (t) => up('techStack', form.techStack.filter((x) => x !== t));

  const submit = () => {
    const payload = {
      ...form,
      budget:         Number(form.budget)         || 0,
      totalEarned:    Number(form.totalEarned)    || 0,
      pendingPayment: Number(form.pendingPayment) || 0,
      expenses:       Number(form.expenses)       || 0,
      progress:       Number(form.progress)       || 0,
      tags:           form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };
    onSave(payload);
  };

  return (
    <Modal
      title={
        <>
          <span style={{ fontSize: 22 }}>{form.icon}</span>
          {project ? 'Edit Project' : 'New Project'}
        </>
      }
      onClose={onClose}
      wide
    >
      {/* Icon + Color */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
          <div className="form-label">Icon</div>
          <select className="form-select" value={form.icon} onChange={(e) => up('icon', e.target.value)}>
            {ICONS.map((ic) => <option key={ic} value={ic}>{ic} {ic}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
          <div className="form-label">Card Color</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            {COLORS.map((c) => (
              <div key={c} onClick={() => up('color', c)}
                style={{ width: 24, height: 24, borderRadius: 6, background: c, cursor: 'pointer', border: form.color === c ? '2px solid #fff' : '2px solid transparent' }} />
            ))}
          </div>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group form-full">
          <div className="form-label">Project Name *</div>
          <input className="form-input" placeholder="e.g. Royal Pizza Website" value={form.name} onChange={(e) => up('name', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Client Name</div>
          {clients?.length > 0 ? (
            <select className="form-select" value={form.clientName} onChange={(e) => up('clientName', e.target.value)}>
              <option value="">— Select client —</option>
              {clients.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          ) : (
            <input className="form-input" placeholder="Client name" value={form.clientName} onChange={(e) => up('clientName', e.target.value)} />
          )}
        </div>
        <div className="form-group">
          <div className="form-label">Status</div>
          <select className="form-select" value={form.status} onChange={(e) => up('status', e.target.value)}>
            {PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <div className="form-label">Priority</div>
          <select className="form-select" value={form.priority} onChange={(e) => up('priority', e.target.value)}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-group">
          <div className="form-label">Progress (%)</div>
          <input className="form-input" type="number" min="0" max="100" value={form.progress} onChange={(e) => up('progress', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Website URL</div>
          <input className="form-input" placeholder="https://example.com" value={form.websiteUrl} onChange={(e) => up('websiteUrl', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Admin Panel URL</div>
          <input className="form-input" placeholder="https://example.com/admin" value={form.adminUrl} onChange={(e) => up('adminUrl', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">GitHub Repository</div>
          <input className="form-input" placeholder="github.com/user/repo" value={form.githubRepo} onChange={(e) => up('githubRepo', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Figma URL</div>
          <input className="form-input" placeholder="figma.com/file/..." value={form.figmaUrl} onChange={(e) => up('figmaUrl', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Hosting Provider</div>
          <input className="form-input" placeholder="Hostinger, AWS, DigitalOcean..." value={form.hostingProvider} onChange={(e) => up('hostingProvider', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Start Date</div>
          <input className="form-input" type="date" value={form.startDate} onChange={(e) => up('startDate', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Deadline</div>
          <input className="form-input" type="date" value={form.deadline} onChange={(e) => up('deadline', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Budget (₨)</div>
          <input className="form-input" type="number" placeholder="0" value={form.budget} onChange={(e) => up('budget', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Total Earned (₨)</div>
          <input className="form-input" type="number" placeholder="0" value={form.totalEarned} onChange={(e) => up('totalEarned', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Pending Payment (₨)</div>
          <input className="form-input" type="number" placeholder="0" value={form.pendingPayment} onChange={(e) => up('pendingPayment', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Expenses (₨)</div>
          <input className="form-input" type="number" placeholder="0" value={form.expenses} onChange={(e) => up('expenses', e.target.value)} />
        </div>

        {/* Tech Stack */}
        <div className="form-group form-full">
          <div className="form-label">Tech Stack</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
            {form.techStack.map((t) => (
              <span key={t} className="tag tag-blue" style={{ cursor: 'pointer', gap: 5 }}>
                {t} <span onClick={() => removeTech(t)} style={{ opacity: 0.7 }}>×</span>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            <input className="form-input" list="tech-opts" placeholder="Add tech (React, Node.js...)"
              value={techInput} onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(techInput); } }} />
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => addTech(techInput)}>Add</button>
          </div>
          <datalist id="tech-opts">{TECH_STACK_OPTIONS.map((t) => <option key={t} value={t} />)}</datalist>
        </div>

        <div className="form-group form-full">
          <div className="form-label">Tags (comma separated)</div>
          <input className="form-input" placeholder="ecommerce, mobile, food..." value={form.tags} onChange={(e) => up('tags', e.target.value)} />
        </div>
        <div className="form-group form-full">
          <div className="form-label">Notes</div>
          <textarea className="form-textarea" placeholder="Internal notes, client feedback..." value={form.notes} onChange={(e) => up('notes', e.target.value)} />
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={submit} disabled={loading || !form.name}>
          {loading ? <span className="spinner" /> : <><i className="ti ti-check" />{project ? 'Update Project' : 'Create Project'}</>}
        </button>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}
