import React from 'react';
import './AttendanceModal.css';

const AttendanceModal = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Attendance</h2>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AttendanceModal;
