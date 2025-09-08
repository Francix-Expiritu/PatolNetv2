import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Sidebar';
import EditScheduleModal from './Modals/EditScheduleModal';
import './ScheduleAssignment.css'; // Import the CSS file
import { BASE_URL } from '../config';

const ScheduleAssignment = () => {
  const [personnel, setPersonnel] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ status: '', location: '', time: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncMessage, setSyncMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Base URL for your backend
  

  // Function to get image URL
  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${BASE_URL}/uploads/${imageName}`;
  };

  // Function to get the most recent log time for display
  const getMostRecentLogTime = async (username) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/logs/${username}`);
      if (response.data && response.data.length > 0) {
        // Get today's date
        const today = new Date().toISOString().slice(0, 10);

        // Find today's log first
        const todayLog = response.data.find(log => {
          const logDate = new Date(log.TIME).toISOString().slice(0, 10);
          return logDate === today;
        });

        if (todayLog) {
          // Return an object with both time and location
          return {
            time: todayLog.TIME_OUT || todayLog.TIME_IN || todayLog.TIME,
            location: todayLog.LOCATION || null
          };
        }

        // If no today's log, get the most recent log
        return {
          time: response.data[0].TIME_OUT || response.data[0].TIME_IN || response.data[0].TIME,
          location: response.data[0].LOCATION || null
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching logs for ${username}:`, error);
      return null;
    }
  };

  // Function to calculate status based on logs
  const calculateStatusFromLogs = async (username) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/user-time-status/${username}`);
      if (response.data && response.data.success) {
        return response.data.calculatedStatus || 'Off Duty';
      }
      return 'Off Duty';
    } catch (error) {
      console.error(`Error calculating status for ${username}:`, error);
      return 'Off Duty';
    }
  };

  // Function to load schedules from the database with calculated status and log times
  const loadSchedules = async () => {
    try {
      setIsLoading(true);

      // Start API request
      const scheduleResponse = await axios.get(`${BASE_URL}/api/schedules`);

      if (scheduleResponse.data && Array.isArray(scheduleResponse.data)) {
        console.log("Loaded schedules:", scheduleResponse.data);

        // Calculate status and get log times for each personnel
        const personnelWithCalculatedData = await Promise.all(
          scheduleResponse.data.map(async (person) => {
            const calculatedStatus = await calculateStatusFromLogs(person.USER);
            const logData = await getMostRecentLogTime(person.USER);

            return {
              ...person,
              CALCULATED_STATUS: calculatedStatus,
              LOG_TIME: logData?.time || null,
              LOG_LOCATION: logData?.location || null // Add log location
            };
          })
        );

        setPersonnel(personnelWithCalculatedData);
      } else {
        console.log("No schedules found or invalid data format");
        setPersonnel([]);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error loading tanod schedules:', err);
      setError('Failed to load tanod schedules. Please try again later.');
      setIsLoading(false);
    }
  };

  // Function to sync tanods from users table
  const syncTanodsFromUsers = async () => {
    try {
      setIsLoading(true);

      // Start API request
      const response = await axios.post(`${BASE_URL}/api/sync-tanods`);

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setShowSuccessModal(true);
        await loadSchedules();
      } else {
        setSyncMessage('❌ Sync failed. Please try again.');
        setError('Failed to sync tanods from users table.');
      }

      setIsLoading(false);

      // Clear sync message after 5s
      setTimeout(() => {
        setSyncMessage('');
      }, 5000);

      return response.data;
    } catch (err) {
      console.error('Error syncing tanods:', err);
      setError('An error occurred while syncing the tanods from users table.');
      setIsLoading(false);
      setSyncMessage('');
      return { success: false, message: err.message };
    }
  };

  useEffect(() => {
    // Initial load of schedules
    loadSchedules();

    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(() => {
      loadSchedules();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = (person) => {
    setSelectedPerson(person);
    setFormData({
      status: person.CALCULATED_STATUS || '',
      location: person.LOG_LOCATION || person.LOCATION || '',
      time: person.TIME || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedPerson(null);
    setShowModal(false);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`${BASE_URL}/api/schedules/${selectedPerson.ID}`, {
        location: formData.location,
        time: formData.time
      });

      if (response.data.success) {
        await loadSchedules();
        closeModal();
      } else {
        setError('Failed to update schedule. Please try again.');
      }
    } catch (err) {
      console.error('Error updating schedule:', err);
      setError('An error occurred while updating the schedule.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredPersonnel = personnel.filter(person =>
    person.USER?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/schedules/${id}`);

      if (response.data.success) {
        // Remove the deleted person from the state
        setPersonnel(prev => prev.filter(p => p.ID !== id));
      } else {
        setError('Failed to delete schedule entry.');
      }
    } catch (err) {
      console.error('Error deleting schedule entry:', err);
      setError('An error occurred while deleting the schedule entry.');
    }
  };

  // Helper function to format datetime for display
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Not set";
    try {
      return new Date(dateTimeString).toLocaleString();
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusClass = (status) => {
    if (status === 'On Duty') {
      return 'status-on-duty';
    } else if (status === 'Off Duty') {
      return 'status-off-duty';
    }
    return 'status-default';
  };

  return (
    <div className="schedule-assignment-container">
      <Navbar />

      {/* Main Content */}
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">
            Tanod Schedule & Assignment
          </h1>
          <p className="page-subtitle">Manage tanod schedules, assign tanods, and track assignment status</p>
        </div>

        <EditScheduleModal
          isOpen={showModal}
          onClose={closeModal}
          selectedPerson={selectedPerson}
          formData={formData}
          onFormChange={handleChange}
          onSave={handleSave}
          getImageUrl={getImageUrl}
        />

        {error && (
          <div className="error-message">
            <div className="error-content">
              <div className="error-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="error-text">
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="table-container">
          <div className="table-header">
            <div className="search-section">
              <input
                type="text"
                placeholder="Search tanods..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="action-buttons">
              <button
                className="btn btn-primary"
                onClick={syncTanodsFromUsers}
                disabled={isLoading}
              >
                {isLoading ? 'Syncing...' : 'Sync Tanods'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={loadSchedules}
                disabled={isLoading}
              >
                Refresh Schedules
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="col-id">ID</th>
                  <th>Tanod</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Schedule Time</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPersonnel.length > 0 ? (
                  filteredPersonnel.map((person) => (
                    <tr key={person.ID}>
                      <td className="font-medium">
                        #{person.ID}
                      </td>
                      <td>
                        <div className="tanod-cell">
                          <div className="tanod-avatar">
                            {/* Avatar component is now in EditScheduleModal.jsx */}
                          </div>
                          <div className="tanod-name">
                            {person.USER}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(person.CALCULATED_STATUS)}`}>
                          {person.CALCULATED_STATUS || "Off Duty"}
                        </span>
                      </td>
                      <td>
                        {person.LOG_LOCATION || "Not assigned"}
                      </td>
                      <td>
                        {formatDateTime(person.TIME) || "Not scheduled"}
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleClick(person)}
                          className="btn btn-edit"
                        >
                          <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(person.ID);
                          }}
                          className="btn btn-delete"
                        >
                          <svg className="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No tanods found. Click "Sync Tanods" to fetch tanods from the users database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} message={successMessage} />
    </div>
  );
};

const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="success-modal-overlay">
      <div className="success-modal">
        {/* Red header stripe */}
        <div className="modal-header-stripe"></div>
        
        <div className="modal-content">
          <div className="modal-body">
            {/* Icon with red theme */}
            <div className="success-icon">
              <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            {/* Title */}
            <h3 className="modal-title">Success!</h3>

            {/* Message */}
            <p className="modal-message">
              {message || "Operation completed successfully!"}
            </p>

            {/* Button with red theme */}
            <button
              onClick={onClose}
              className="btn btn-modal-close"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleAssignment;