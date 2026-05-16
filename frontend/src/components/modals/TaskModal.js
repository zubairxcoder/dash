import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { PRIORITIES, TASK_STATUSES } from '../../utils';

const EMPTY = {
  title: '', description: '', projectName: '', assigneeName: '',
  status: 'todo', priority: 'Medium', dueDate: '', timeEstimate: '',
};

export default function TaskModal({ task, projects, team, onSave, onClose, loading }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (task) {
      setForm({
        ...EMPTY, ...task,
        projectName:  task.projectName  || task.project?.name || '',
        assigneeName: task.assigneeName || task.assignedTo?.name || '',
        dueDate:      task.dueDate ? task.dueDate.split('T')[0] : '',
        timeEstimate: task.timeEstimate || '',
      });
    }
  }, [task]);

  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    const selectedProject = projects?.find((p) => p.name === form.projectName);
    const selectedMember  = team?.find((m) => m.name === form.assigneeName);
    onSave({
      ...form,
      project:     selectedProject?._id,
      assignedTo:  selectedMember?._id,
      timeEstimate: Number(form.timeEstimate) || 0,
    });
  };

  return (
    <Modal
      title={<><i className="ti ti-checkbox" style={{ color: '#8b5cf6' }} />{task ? 'Edit Task' : 'New Task'}</>}
      onClose={onClose}
    >
      <div className="form-grid">
        <div className="form-group form-full">
          <div className="form-label">Task Title *</div>
          <input className="form-input" placeholder="e.g. Fix payment gateway bug" value={form.title} onChange={(e) => up('title', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Project</div>
          <select className="form-select" value={form.projectName} onChange={(e) => up('projectName', e.target.value)}>
            <option value="">— None —</option>
            {(projects || []).map((p) => <option key={p._id} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <div className="form-label">Assigned To</div>
          <select className="form-select" value={form.assigneeName} onChange={(e) => up('assigneeName', e.target.value)}>
            <option value="">— Unassigned —</option>
            {(team || []).map((m) => <option key={m._id} value={m.name}>{m.name} ({m.role})</option>)}
          </select>
        </div>
        <div className="form-group">
          <div className="form-label">Status</div>
          <select className="form-select" value={form.status} onChange={(e) => up('status', e.target.value)}>
            {TASK_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div className="form-group">
          <div className="form-label">Priority</div>
          <select className="form-select" value={form.priority} onChange={(e) => up('priority', e.target.value)}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-group">
          <div className="form-label">Due Date</div>
          <input className="form-input" type="date" value={form.dueDate} onChange={(e) => up('dueDate', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Time Estimate (hours)</div>
          <input className="form-input" type="number" min="0" placeholder="0" value={form.timeEstimate} onChange={(e) => up('timeEstimate', e.target.value)} />
        </div>
        <div className="form-group form-full">
          <div className="form-label">Description</div>
          <textarea className="form-textarea" placeholder="Task details, acceptance criteria..." value={form.description} onChange={(e) => up('description', e.target.value)} />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={submit} disabled={loading || !form.title}>
          {loading ? <span className="spinner" /> : <><i className="ti ti-check" />{task ? 'Update Task' : 'Create Task'}</>}
        </button>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}
