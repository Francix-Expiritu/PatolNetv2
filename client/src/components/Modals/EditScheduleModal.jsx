import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';

// Component for avatar display
const Avatar = ({ imageName, userName }) => {
  const [imageError, setImageError] = useState(false);
  
  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${BASE_URL}/uploads/${imageName}`;
  };
  const imageUrl = getImageUrl(imageName);

  if (!imageUrl || imageError) {
    return (
      <div className="avatar-fallback">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
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

const EditScheduleModal = ({ isOpen, onClose, selectedPerson, formData, onFormChange, onSave }) => {
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

  return (
    <div className={`edit-schedule-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className="edit-schedule-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="edit-schedule-modal-header">
          <div className="edit-schedule-modal-header-pattern"></div>
          
          <button
            className="edit-schedule-close-btn"
            onClick={handleClose}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <h2 className="edit-schedule-modal-title">Add Schedule</h2>
          <p className="edit-schedule-modal-subtitle">
            {selectedPerson.USER || `Tanod #${selectedPerson.ID}`}
          </p>
          
          <div className="edit-schedule-avatar-container">
            <Avatar
              imageName={selectedPerson.IMAGE}
              userName={selectedPerson.USER}
            />
          </div>
        </div>

        <div className="edit-schedule-modal-body">
          <div className="edit-schedule-form-group">
            <label htmlFor="location" className="edit-schedule-label">
              📍 Location
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

          <div className="edit-schedule-form-group">
            <label htmlFor="time" className="edit-schedule-label">
              🕐 Schedule Time
            </label>
            <input
              type="datetime-local"
              name="time"
              id="time"
              className="edit-schedule-input"
              value={formData.time}
              onChange={onFormChange}
            />
          </div>
        </div>

        <div className="edit-schedule-modal-footer">
          <button
            type="button"
            className="edit-schedule-btn edit-schedule-cancel-btn"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="edit-schedule-btn edit-schedule-save-btn"
            onClick={onSave}
          >
            💾 Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditScheduleModal;