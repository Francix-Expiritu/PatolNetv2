import React from 'react';

function EditAccountModal({
  isOpen,
  onClose,
  editAccount,
  handleEditInputChange,
  handleEditAccount,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          padding: 32px;
          width: 100%;
          max-width: 640px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.05);
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin: 20px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .modal-title {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .close-button {
          background: rgba(0, 0, 0, 0.05);
          border: none;
          border-radius: 12px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 18px;
          color: #6b7280;
        }

        .close-button:hover {
          background: rgba(0, 0, 0, 0.1);
          transform: scale(1.05);
        }

        .form-container {
          display: grid;
          gap: 24px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .form-row.two-col {
          grid-template-columns: 2fr 1fr;
        }

        .form-row.equal-col {
          grid-template-columns: 1fr 1fr;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
        }

        .form-input, .form-select {
          padding: 16px;
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-radius: 16px;
          font-size: 16px;
          background: rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
          outline: none;
          font-family: inherit;
        }

        .form-input:focus, .form-select:focus {
          border-color: #667eea;
          box-shadow: 
            0 0 0 4px rgba(102, 126, 234, 0.1),
            0 4px 12px rgba(102, 126, 234, 0.15);
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 1);
        }

        .form-input:hover, .form-select:hover {
          border-color: rgba(102, 126, 234, 0.5);
          background: rgba(255, 255, 255, 0.9);
        }

        .button-group {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .btn {
          padding: 14px 28px;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          position: relative;
          overflow: hidden;
          font-family: inherit;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transition: left 0.5s;
        }

        .btn:hover::before {
          left: 100%;
        }

        .btn-secondary {
          background: rgba(107, 114, 128, 0.1);
          color: #374151;
          border: 2px solid rgba(107, 114, 128, 0.2);
        }

        .btn-secondary:hover {
          background: rgba(107, 114, 128, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(107, 114, 128, 0.2);
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: 2px solid transparent;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        /* Mobile Responsiveness */
        @media (max-width: 640px) {
          .modal-container {
            margin: 10px;
            padding: 24px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-row.two-col,
          .form-row.equal-col {
            grid-template-columns: 1fr;
          }

          .button-group {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }

        /* Custom scrollbar */
        .modal-container::-webkit-scrollbar {
          width: 6px;
        }

        .modal-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }

        .modal-container::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.6);
          border-radius: 3px;
        }

        .modal-container::-webkit-scrollbar-thumb:hover {
          background: rgba(102, 126, 234, 0.8);
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">Edit Account</h3>
            <button className="close-button" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="form-container">
            <div className="form-row two-col">
              <div className="form-group">
                <label htmlFor="edit-name" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="edit-name"
                  value={editAccount.name}
                  onChange={handleEditInputChange}
                  required
                  className="form-input"
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-type" className="form-label">
                  Account Type
                </label>
                <select
                  id="edit-type"
                  name="type"
                  value={editAccount.type}
                  onChange={handleEditInputChange}
                  className="form-select"
                >
                  <option value="Resident">Resident</option>
                  <option value="Tanod">Tanod</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="form-row equal-col">
              <div className="form-group">
                <label htmlFor="edit-username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="edit-username"
                  value={editAccount.username}
                  onChange={handleEditInputChange}
                  required
                  className="form-input"
                  placeholder="Enter username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-status" className="form-label">
                  Account Status
                </label>
                <select
                  id="edit-status"
                  name="status"
                  value={editAccount.status}
                  onChange={handleEditInputChange}
                  className="form-select"
                >
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="edit-email"
                  value={editAccount.email}
                  onChange={handleEditInputChange}
                  className="form-input"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-address" className="form-label">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  id="edit-address"
                  value={editAccount.address}
                  onChange={handleEditInputChange}
                  className="form-input"
                  placeholder="Enter address"
                />
              </div>
            </div>

            <div className="button-group">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                onClick={handleEditAccount}
              >
                Update Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditAccountModal;