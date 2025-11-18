import React from 'react';
import { X } from 'lucide-react';
import Message from './Messages';

const MessageModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const styles = {
    modalBackdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px',
    },
    modalContainer: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      width: '100%',
      maxWidth: '1400px',
      height: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    modalHeader: {
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      borderBottom: '1px solid #e5e7eb',
    },
    modalCloseBtn: {
      background: '#f3f4f6',
      border: 'none',
      color: '#6b7280',
      cursor: 'pointer',
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };

  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <button onClick={onClose} style={styles.modalCloseBtn}><X size={20} /></button>
        </div>
        <Message />
      </div>
    </div>
  );
};

export default MessageModal;