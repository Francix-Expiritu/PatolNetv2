import React from 'react';
import { createPortal } from 'react-dom';

function AssignTanodModal({ 
  showModal, 
  selectedIncident, 
  availableTanods,
  selectedTanod,
  setSelectedTanod,
  isUpdating,
  onClose, 
  onAssignTanod 
}) {
  if (!showModal || !selectedIncident) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assign Tanod</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="modal-field">
            <label>Incident ID: #{selectedIncident.id}</label>
            <div className="modal-value">{selectedIncident.incident_type}</div>
          </div>
          <div className="modal-field">
            <label>Available Tanods (Currently On Duty)</label>
            {availableTanods.length === 0 ? (
              <div className="modal-value" style={{color: '#666', fontStyle: 'italic'}}>
                No tanods are currently on duty
              </div>
            ) : (
              <select 
                className="tanod-select"
                value={selectedTanod}
                onChange={(e) => setSelectedTanod(e.target.value)}
              >
                <option value="">Select a tanod...</option>
                {availableTanods.map((tanod) => (
                  <option key={tanod.ID} value={tanod.USER}>
                    {tanod.USER} (On duty since: {new Date(tanod.TIME_IN).toLocaleTimeString()})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn primary" 
            onClick={onAssignTanod}
            disabled={isUpdating || !selectedTanod || availableTanods.length === 0}
          >
            {isUpdating ? 'Assigning...' : 'Assign Tanod'}
          </button>
          <button className="btn close" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AssignTanodModal;