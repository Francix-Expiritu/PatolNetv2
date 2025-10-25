import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

function AssignTanodModal({ 
  showModal, 
  selectedIncident, 
  availableTanods = [],
  selectedTanod,
  setSelectedTanod,
  isUpdating,
  onClose, 
  onAssignTanod 
}) {
  if (!showModal || !selectedIncident) return null;

  return createPortal(
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          {/* Header with Close Button */}
          <div className="modal-header">
            <button className="modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {/* Incident ID and Status Row */}
            <div className="modal-row">
              <div className="modal-field">
                <label className="field-label">INCIDENT ID</label>
                <div className="field-value incident-id">
                  INC-{String(selectedIncident.id).padStart(6, '0')}
                </div>
              </div>
              <div className="modal-field">
                <label className="field-label">STATUS</label>
                <div className="field-value status-badge">
                  {selectedIncident.status || 'Pending'}
                </div>
              </div>
            </div>

            {/* Incident Type and Priority Row */}
            <div className="modal-row">
              <div className="modal-field">
                <label className="field-label">INCIDENT TYPE</label>
                <div className="field-value">
                  {selectedIncident.incident_type}
                </div>
              </div>
              <div className="modal-field">
                <label className="field-label">PRIORITY</label>
                <div className="field-value">
                  {selectedIncident.priority || 'Normal'}
                </div>
              </div>
            </div>

            {/* Available Tanods Selection */}
            <div className="modal-field-full">
              <label className="field-label">AVAILABLE TANODS</label>
              
              {availableTanods.length === 0 ? (
                <div className="field-value empty-state-text">
                  No tanods are currently on duty
                </div>
              ) : (
                <div className="select-wrapper">
                  <select 
                    className="tanod-select"
                    value={selectedTanod}
                    onChange={(e) => setSelectedTanod(e.target.value)}
                  >
                    <option value="">Select a tanod...</option>
                    {availableTanods.map((tanod) => (
                      <option key={tanod.ID} value={tanod.USER}>
                        {tanod.USER} (On duty since: {new Date(tanod.TIME_IN).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button 
              className="btn btn-primary"
              onClick={onAssignTanod}
              disabled={isUpdating || !selectedTanod || availableTanods.length === 0}
            >
              {isUpdating ? 'Assigning...' : 'Assign Tanod'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          max-width: 700px;
          width: 100%;
          animation: slideUp 0.3s ease-out;
        }

        .modal-header {
          padding: 20px 24px 0;
          display: flex;
          justify-content: flex-end;
        }

        .modal-close-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          border-radius: 6px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-close-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .modal-body {
          padding: 24px 24px 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .modal-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .modal-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .modal-field-full {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-label {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .field-value {
          padding: 14px 16px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 15px;
          color: #111827;
          min-height: 48px;
          display: flex;
          align-items: center;
        }

        .incident-id {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #1e40af;
          font-weight: 600;
        }

        .status-badge {
          background: #fef3c7;
          border-color: #fde68a;
          color: #92400e;
          font-weight: 500;
        }

        .empty-state-text {
          color: #6b7280;
          font-style: italic;
        }

        .select-wrapper {
          position: relative;
        }

        .tanod-select {
          width: 100%;
          padding: 14px 40px 14px 16px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 15px;
          color: #111827;
          cursor: pointer;
          outline: none;
          transition: all 0.2s;
          appearance: none;
          min-height: 48px;
        }

        .tanod-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .tanod-select option {
          padding: 8px;
        }

        .select-arrow {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #9ca3af;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
        }

        .btn {
          padding: 10px 24px;
          font-size: 15px;
          font-weight: 500;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 120px;
        }

        .btn-secondary {
          background: transparent;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover {
          background: #f9fafb;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .btn-primary:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          opacity: 0.6;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>,
    document.body
  );
}

export default AssignTanodModal;