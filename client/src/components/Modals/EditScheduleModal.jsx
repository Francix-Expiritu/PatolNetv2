import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import { X, Calendar, Clock, MapPin, Save, Trash2 } from 'lucide-react';

// Component for avatar display
const Avatar = ({ imageName, userName }) => {
  const [imageError, setImageError] = useState(false);
  
  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${BASE_URL}/uploads/${imageName}`;
  };
  const imageUrl = getImageUrl(imageName); // Use a different variable name

  if (!imageUrl || imageError) {
    return (
      <div className="avatar-fallback">
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  return (
    <img
      className="avatar-image"
      src={imageUrl}
      alt={userName || 'Tanod'}
      onError={() => setImageError(true)}
    />
  );
};

const EditScheduleModal = ({ isOpen, onClose, selectedPerson, formData, onFormChange, onSave, onClear }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen || !selectedPerson) return null;

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <>
      <div className={`edit-schedule-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
        <div className="edit-schedule-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="edit-schedule-modal-header">
            <div className="header-info">
              <div className="edit-schedule-avatar-container">
                <Avatar
                  imageName={selectedPerson.IMAGE}
                  userName={selectedPerson.USER}
                />
              </div>
              <div>
                <h2 className="edit-schedule-modal-title">Edit Schedule</h2>
                <p className="edit-schedule-modal-subtitle">
                  {selectedPerson.USER || `Tanod #${selectedPerson.ID}`}
                </p>
              </div>
            </div>
            <button className="edit-schedule-close-btn" onClick={handleClose}>
              <X size={20} />
            </button>
          </div>

          <div className="edit-schedule-modal-body">
            <div className="edit-schedule-form-group">
              <label htmlFor="location" className="edit-schedule-label">
                <MapPin size={14} /> Location
              </label>
              <input
                type="text"
                name="location"
                id="location"
                className="edit-schedule-input"
                value={formData.location}
                onChange={onFormChange}
                placeholder="Enter patrol location"
              />
            </div>

            <div className="edit-schedule-form-group-row">
              <div className="edit-schedule-form-group">
                <label htmlFor="month" className="edit-schedule-label">
                  <Calendar size={14} /> Month
                </label>
                <select name="month" id="month" className="edit-schedule-input" value={formData.month} onChange={onFormChange}>
                  <option value="All">All Months</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>
              <div className="edit-schedule-form-group-row"></div>
              <div className="edit-schedule-form-group">
                <label htmlFor="day" className="edit-schedule-label">
                  <Calendar size={14} /> Day of the Week
                </label>
                <div className="day-checkbox-group">
                  {daysOfWeek.map(day => (
                    <label key={day} className="day-checkbox-label">
                      <input
                        type="checkbox"
                        name="day"
                        value={day} // This value is what onFormChange will receive
                        checked={formData.day && formData.day.includes(day)}
                        onChange={onFormChange}
                      />
                      <span className="day-checkbox-text">{day.substring(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="edit-schedule-form-group-row">
              <div className="edit-schedule-form-group">
                <label htmlFor="start_time" className="edit-schedule-label">
                  <Clock size={14} /> Start Time
                </label>
                <input type="time" name="start_time" id="start_time" className="edit-schedule-input" value={formData.start_time} onChange={onFormChange} />
              </div>
              <div className="edit-schedule-form-group">
                <label htmlFor="end_time" className="edit-schedule-label">
                  <Clock size={14} /> End Time
                </label>
                <input type="time" name="end_time" id="end_time" className="edit-schedule-input" value={formData.end_time} onChange={onFormChange} />
              </div>
            </div>
          </div>

          <div className="edit-schedule-modal-footer">
            <button type="button" className="edit-schedule-btn edit-schedule-delete-btn" onClick={onClear}>
              <Trash2 size={16} /> Clear Schedule
            </button>
            <button type="button" className="edit-schedule-btn edit-schedule-cancel-btn" onClick={handleClose}>
              Cancel
            </button>
            <button type="button" className="edit-schedule-btn edit-schedule-save-btn" onClick={onSave}>
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .edit-schedule-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          opacity: 1;
          transition: opacity 0.3s ease-in-out;
        }
        .edit-schedule-modal-overlay.closing {
          opacity: 0;
        }
        .edit-schedule-modal-content {
          /* Styles for the day checkbox group */
          .day-checkbox-group {
            display: flex;
            justify-content: space-between;
            background-color: white;
            padding: 8px;
            border-radius: 8px;
            border: 1px solid #d1d5db;
          }
          .day-checkbox-label {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
          }
          .day-checkbox-label input[type="checkbox"] {
            display: none;
          }
          .day-checkbox-text {
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            color: #374151;
            transition: all 0.2s ease;
            border: 1px solid transparent;
          }
          .day-checkbox-label input[type="checkbox"]:checked + .day-checkbox-text {
            background-color: #eff6ff;
            color: #2563eb;
            border-color: #93c5fd;
          }
          .day-checkbox-label:hover .day-checkbox-text {
            background-color: #f9fafb;
          }
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
          max-width: 500px;
          width: 100%;
          overflow: hidden;
          transform: scale(1);
          transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
        }
        .edit-schedule-modal-overlay.closing .edit-schedule-modal-content {
          transform: scale(0.95);
        }
        .edit-schedule-modal-header {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .header-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .edit-schedule-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: #f3f4f6;
          border-radius: 50%;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }
        .edit-schedule-close-btn:hover {
          background: #e5e7eb;
          transform: rotate(90deg);
        }
        .edit-schedule-modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }
        .edit-schedule-modal-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }
        .edit-schedule-avatar-container {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid white;
          box-shadow: 0 0 0 1px #e5e7eb;
        }
        .avatar-image, .avatar-fallback {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .avatar-fallback {
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
        }
        .edit-schedule-modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background-color: #f9fafb;
        }
        .edit-schedule-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .edit-schedule-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .edit-schedule-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          background-color: white;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .edit-schedule-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .edit-schedule-form-group-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .edit-schedule-modal-footer {
          padding: 16px 24px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid #e5e7eb;
          background-color: white;
        }
        .edit-schedule-btn {
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .edit-schedule-cancel-btn {
          background-color: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }
        .edit-schedule-cancel-btn:hover {
          background-color: #e5e7eb;
        }
        .edit-schedule-save-btn {
          background-color: #2563eb;
          color: white;
        }
        .edit-schedule-save-btn:hover {
          background-color: #1d4ed8;
        }
        .edit-schedule-delete-btn {
          background-color: #fee2e2;
          color: #b91c1c;
          margin-right: auto;
        }
        .edit-schedule-delete-btn:hover {
          background-color: #fecaca;
        }
      `}</style>
    </>
  );
};

export default EditScheduleModal;