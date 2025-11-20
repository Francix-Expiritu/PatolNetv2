import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Send, Loader, AlertTriangle } from 'lucide-react';
import './AttendanceModal.css';

const AttendanceModal = ({ isOpen, onClose, person, BASE_URL }) => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen && person) {
      const fetchLogs = async () => {
        setIsLoading(true);
        setError('');
        try {
          const response = await axios.get(`${BASE_URL}/api/logs/${person.USER}`);
          if (response.data && Array.isArray(response.data)) {
            // We only care about logs with TIME_IN or TIME_OUT
            const relevantLogs = response.data.filter(log => log.TIME_IN || log.TIME_OUT);
            setLogs(relevantLogs);
          } else {
            setLogs([]);
          }
        } catch (err) {
          console.error('Error fetching attendance logs:', err);
          setError('Failed to fetch attendance logs.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchLogs();
    }
  }, [isOpen, person, BASE_URL]);

  const handleSendProof = () => {
    setSending(true);
    // This is a placeholder for the actual "send" logic.
    // In a real app, this would trigger an API call to send an email, SMS, or other notification.
    console.log("Sending proof for:", person.USER);
    console.log("Logs to send:", logs);
    
    setTimeout(() => {
      alert(`Proof of attendance for ${person.USER} has been sent (simulated).`);
      setSending(false);
      onClose();
    }, 1500);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="attendance-modal-overlay" onClick={onClose}>
      <div className="attendance-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="attendance-modal-header">
          <h2 className="attendance-modal-title">Attendance for {person?.USER}</h2>
          <button onClick={onClose} className="attendance-modal-close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="attendance-modal-body">
          {isLoading ? (
            <div className="loading-state">
              <Loader className="spinner" size={32} />
              <p>Loading attendance records...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <AlertTriangle size={32} />
              <p>{error}</p>
            </div>
          ) : logs.length > 0 ? (
            <div className="logs-table-wrapper">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.ID}>
                      <td>{formatDate(log.TIME_IN || log.TIME_OUT).split(',')[0]}</td>
                      <td>{formatDate(log.TIME_IN)}</td>
                      <td>{formatDate(log.TIME_OUT)}</td>
                      <td>{log.LOCATION || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No attendance records found for this user.</p>
            </div>
          )}
        </div>

        <div className="attendance-modal-footer">
          <button onClick={onClose} className="btn-cancel">
            Close
          </button>
          <button
            onClick={handleSendProof}
            className="btn-send-proof"
            disabled={sending || isLoading || logs.length === 0}
          >
            {sending ? (
              <>
                <Loader className="spinner-sm" size={16} />
                Sending...
              </>
            ) : (
              <>
                <Send size={16} />
                Send Proof
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;