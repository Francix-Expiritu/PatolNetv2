import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Assuming axios is needed in the modal for saving
import { BASE_URL } from '../../config';

// Component for avatar display
const Avatar = ({ imageName, userName, size = 'h-8 w-8' }) => {
  const [imageError, setImageError] = useState(false);
  
  
  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${BASE_URL}/uploads/${imageName}`;
  };
  
  const imageUrl = getImageUrl(imageName);

  if (!imageUrl || imageError) {
    return (
      <div 
        className={`${size} rounded-full flex items-center justify-center text-white shadow-lg`}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      </div>
    );
  }

  return (
    <img
      className={`${size} rounded-full object-cover shadow-lg ring-4 ring-white/30`}
      src={imageUrl}
      alt={userName || 'Tanod'}
      onError={() => setImageError(true)}
      style={{
        filter: 'brightness(1.05) contrast(1.1)',
      }}
    />
  );
};

const EditScheduleModal = ({ isOpen, onClose, selectedPerson, formData, onFormChange, onSave, getImageUrl }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
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
      setIsVisible(false);
      onClose();
    }, 200);
  };

  if (!isOpen || !selectedPerson) return null;

  const modalStyles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      opacity: isClosing ? 0 : 1,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    modal: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      maxWidth: '480px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'hidden',
      transform: isClosing ? 'scale(0.95) translateY(10px)' : 'scale(1) translateY(0)',
      opacity: isClosing ? 0 : 1,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 2rem 1rem 2rem',
      position: 'relative',
      overflow: 'hidden',
    },
    headerPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      opacity: 0.3,
    },
    title: {
      color: 'white',
      fontSize: '1.5rem',
      fontWeight: '700',
      margin: 0,
      textAlign: 'center',
      position: 'relative',
      zIndex: 1,
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '0.875rem',
      fontWeight: '500',
      textAlign: 'center',
      marginTop: '0.5rem',
      position: 'relative',
      zIndex: 1,
    },
    avatarContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '1.5rem',
      position: 'relative',
      zIndex: 1,
    },
    body: {
      padding: '2rem',
      background: 'rgba(255, 255, 255, 0.8)',
    },
    inputGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem',
      letterSpacing: '0.025em',
    },
    input: {
      width: '100%',
      padding: '0.875rem 1rem',
      fontSize: '1rem',
      border: '2px solid rgba(209, 213, 219, 0.8)',
      borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    inputFocus: {
      border: '2px solid #667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      background: 'white',
    },
    footer: {
      padding: '1.5rem 2rem',
      background: 'rgba(249, 250, 251, 0.9)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(229, 231, 235, 0.5)',
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
    },
    saveButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '0.875rem 2rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 6px -1px rgba(102, 126, 234, 0.3)',
      letterSpacing: '0.025em',
    },
    cancelButton: {
      background: 'rgba(255, 255, 255, 0.9)',
      color: '#6b7280',
      border: '2px solid rgba(209, 213, 219, 0.8)',
      borderRadius: '12px',
      padding: '0.875rem 1.5rem',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      backdropFilter: 'blur(10px)',
      letterSpacing: '0.025em',
    },
    closeIcon: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: 'white',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 2,
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={handleClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <div style={modalStyles.headerPattern}></div>
          
          <button 
            style={modalStyles.closeIcon}
            onClick={handleClose}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <h2 style={modalStyles.title}>Edit Schedule</h2>
          <p style={modalStyles.subtitle}>
            {selectedPerson.USER || `Tanod #${selectedPerson.ID}`}
          </p>
          
          <div style={modalStyles.avatarContainer}>
            <Avatar
              imageName={selectedPerson.IMAGE}
              userName={selectedPerson.USER}
              size="h-20 w-20"
            />
          </div>
        </div>

        <div style={modalStyles.body}>
          <div style={modalStyles.inputGroup}>
            <label htmlFor="location" style={modalStyles.label}>
              📍 Location
            </label>
            <input
              type="text"
              name="location"
              id="location"
              style={modalStyles.input}
              value={formData.location}
              onChange={onFormChange}
              placeholder="Enter patrol location"
              onFocus={(e) => Object.assign(e.target.style, modalStyles.inputFocus)}
              onBlur={(e) => {
                e.target.style.border = '2px solid rgba(209, 213, 219, 0.8)';
                e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                e.target.style.background = 'rgba(255, 255, 255, 0.9)';
              }}
            />
          </div>

          <div style={modalStyles.inputGroup}>
            <label htmlFor="time" style={modalStyles.label}>
              🕐 Schedule Time
            </label>
            <input
              type="datetime-local"
              name="time"
              id="time"
              style={modalStyles.input}
              value={formData.time}
              onChange={onFormChange}
              onFocus={(e) => Object.assign(e.target.style, modalStyles.inputFocus)}
              onBlur={(e) => {
                e.target.style.border = '2px solid rgba(209, 213, 219, 0.8)';
                e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                e.target.style.background = 'rgba(255, 255, 255, 0.9)';
              }}
            />
          </div>
        </div>

        <div style={modalStyles.footer}>
          <button
            type="button"
            style={modalStyles.cancelButton}
            onClick={handleClose}
            onMouseEnter={(e) => {
              e.target.style.background = 'white';
              e.target.style.borderColor = '#9ca3af';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.9)';
              e.target.style.borderColor = 'rgba(209, 213, 219, 0.8)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            style={modalStyles.saveButton}
            onClick={onSave}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 8px 15px -3px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px -1px rgba(102, 126, 234, 0.3)';
            }}
          >
            💾 Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditScheduleModal;