import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainSidebarWrapper from './MainSidebarWrapper';
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

      // Start API requests
      const tanodResponse = await axios.get(`${BASE_URL}/api/tanods`);
      const schedulesResponse = await axios.get(`${BASE_URL}/api/schedules`);

      if (tanodResponse.data && Array.isArray(tanodResponse.data)) {
        console.log("Loaded tanods:", tanodResponse.data);
        console.log("Loaded schedules:", schedulesResponse.data);

        const allSchedules = schedulesResponse.data || [];

        // Calculate status and get log times for each personnel
        const personnelWithCalculatedData = await Promise.all(
          tanodResponse.data.map(async (person) => {
            // Find the schedule for this person
            const personSchedule = allSchedules.find(schedule => schedule.USER === person.USER);

            const calculatedStatus = await calculateStatusFromLogs(person.USER);
            const logData = await getMostRecentLogTime(person.USER);

            return {
              ...person,
              // Add schedule-specific data if found
              SCHEDULE_ID: personSchedule?.ID || null,
              SCHEDULE_TIME: personSchedule?.TIME || null,
              SCHEDULE_LOCATION: personSchedule?.LOCATION || null,
              CALCULATED_STATUS: calculatedStatus,
              LOG_TIME: logData?.time || null,
              LOG_LOCATION: logData?.location || null // Add log location
            };
          })
        );

        setPersonnel(personnelWithCalculatedData);
      } else {
        console.log("No tanods found or invalid data format");
        setPersonnel([]);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error loading tanod schedules:', err);
      setError('Failed to load tanod schedules. Please try again later.');
      setIsLoading(false);
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
      location: person.SCHEDULE_LOCATION || '',
      time: person.SCHEDULE_TIME || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedPerson(null);
    setShowModal(false);
  };

  const handleSave = async () => {
    try {
      let response;
      if (selectedPerson.SCHEDULE_ID) {
        // Update existing schedule
        response = await axios.put(`${BASE_URL}/api/schedules/${selectedPerson.SCHEDULE_ID}`, {
          location: formData.location,
          time: formData.time
        });
      } else {
        // Create new schedule
        response = await axios.post(`${BASE_URL}/api/schedules`, {
          user: selectedPerson.USER,
          location: formData.location,
          time: formData.time
        });
      }

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
      <MainSidebarWrapper />
      <div style={{ width: '100%' }}>
        <div className="header1">
          <div className="header-content">
            <div className="header-title-container">
              <h1 className="header-title">
                Tanod Schedule & Assignment
              </h1>
              <p className="header-subtitle">Manage tanod schedules, assign tanods, and track assignment status</p>
            </div>
          </div>
        </div>

        <div className="main-content">
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
                        {person.SCHEDULE_LOCATION || "Not assigned"}
                      </td>
                      <td>
                        {formatDateTime(person.SCHEDULE_TIME) || "Not scheduled"}
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleClick(person)}
                          className="btn btn-edit"
                        >
     
                          Add
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No tanods found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
      </div>
  );
};

export default ScheduleAssignment;