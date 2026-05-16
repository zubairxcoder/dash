import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { CATEGORIES, PAYMENT_METHODS } from '../../utils';

const EMPTY = {
  title: '', type: 'income', amount: '', category: 'Project Payment',
  projectName: '', clientName: '', status: 'completed',
  date: new Date().toISOString().split('T')[0], dueDate: '',
  paymentMethod: 'Bank Transfer', notes: '', invoiceNo: '',
};

export default function TransactionModal({ transaction, projects, clients, onSave, onClose, loading }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (transaction) {
      setForm({
        ...EMPTY, ...transaction,
        date:    transaction.date    ? transaction.date.split('T')[0]    : EMPTY.date,
        dueDate: transaction.dueDate ? transaction.dueDate.split('T')[0] : '',
        amount:  transaction.amount || '',
      });
    }
  }, [transaction]);

  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      title={<><i className="ti ti-cash" style={{ color: '#4ade80' }} />{transaction ? 'Edit Transaction' : 'Add Transaction'}</>}
      onClose={onClose}
    >
      <div className="form-grid">
        <div className="form-group form-full">
          <div className="form-label">Title *</div>
          <input className="form-input" placeholder="e.g. Royal Pizza — Final Payment" value={form.title} onChange={(e) => up('title', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Type</div>
          <select className="form-select" value={form.type} onChange={(e) => up('type', e.target.value)}>
            <option value="income">💰 Income</option>
            <option value="expense">💸 Expense</option>
          </select>
        </div>
        <div className="form-group">
          <div className="form-label">Amount (₨) *</div>
          <input className="form-input" type="number" min="0" placeholder="0" value={form.amount} onChange={(e) => up('amount', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Category</div>
          <select className="form-select" value={form.category} onChange={(e) => up('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <div className="form-label">Status</div>
          <select className="form-select" value={form.status} onChange={(e) => up('status', e.target.value)}>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="form-group">
          <div className="form-label">Project</div>
          <select className="form-select" value={form.projectName} onChange={(e) => up('projectName', e.target.value)}>
            <option value="">— None —</option>
            {(projects || []).map((p) => <option key={p._id} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <div className="form-label">Client</div>
          <select className="form-select" value={form.clientName} onChange={(e) => up('clientName', e.target.value)}>
            <option value="">— None —</option>
            {(clients || []).map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <div className="form-label">Payment Method</div>
          <select className="form-select" value={form.paymentMethod} onChange={(e) => up('paymentMethod', e.target.value)}>
            {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="form-group">
          <div className="form-label">Date</div>
          <input className="form-input" type="date" value={form.date} onChange={(e) => up('date', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Due Date (if pending)</div>
          <input className="form-input" type="date" value={form.dueDate} onChange={(e) => up('dueDate', e.target.value)} />
        </div>
        <div className="form-group">
          <div className="form-label">Invoice No.</div>
          <input className="form-input" placeholder="INV-001" value={form.invoiceNo} onChange={(e) => up('invoiceNo', e.target.value)} />
        </div>
        <div className="form-group form-full">
          <div className="form-label">Notes</div>
          <textarea className="form-textarea" placeholder="Additional details..." value={form.notes} onChange={(e) => up('notes', e.target.value)} />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onSave({ ...form, amount: Number(form.amount) })} disabled={loading || !form.title || !form.amount}>
          {loading ? <span className="spinner" /> : <><i className="ti ti-check" />{transaction ? 'Update Transaction' : 'Add Transaction'}</>}
        </button>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}
