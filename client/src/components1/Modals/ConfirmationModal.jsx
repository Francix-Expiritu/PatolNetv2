import React from 'react';
import { createPortal } from 'react-dom';
import './ConfirmationModal.css';

function ConfirmationModal({ 
  showModal, 
  selectedIncident, 
  currentUser,
  isUpdating,
  onClose, 
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to mark this incident as resolved?",
  confirmText = "Confirm",
  confirmStyle = {},
  showResolvedBy = true,
  dialogClassName = ''
}) {
  if (!showModal || !selectedIncident) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className={`confirmation-dialog ${dialogClassName}`} onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="confirmation-body">
          <p>{message}</p>
          <p>Incident ID: #{selectedIncident.id}</p>
          <p>Type: {selectedIncident.incident_type}</p>
          {showResolvedBy && (
            <p>Resolved by: <strong>{currentUser}</strong></p>
          )}
        </div>
        <div className="confirmation-footer">
          <button 
            className="btn primary" 
            onClick={onConfirm}
            disabled={isUpdating}
            style={confirmStyle}
          >
            {isUpdating ? 'Processing...' : confirmText}
          </button>
          <button className="btn close" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;