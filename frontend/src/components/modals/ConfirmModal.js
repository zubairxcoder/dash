import React from 'react';
import Modal from './Modal';

export default function ConfirmModal({ title, message, onConfirm, onClose, loading }) {
  return (
    <Modal title={<><i className="ti ti-alert-triangle" style={{ color: '#f87171' }} />{title}</>} onClose={onClose}>
      <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>{message}</p>
      <div className="form-actions">
        <button className="btn btn-danger" style={{ flex: 1 }} onClick={onConfirm} disabled={loading}>
          {loading ? <span className="spinner" /> : <><i className="ti ti-trash" />Delete</>}
        </button>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}
