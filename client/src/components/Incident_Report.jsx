import React, { useState, useEffect } from 'react';
import Navbar from './Sidebar';
import ViewIncidentModal from './Modals/ViewIncidentModal';
import AssignTanodModal from './Modals/Tanodmodal';
import ConfirmationModal from './Modals/ConfirmationModal';
import './IncidentReport.css';
import { BASE_URL } from '../config';

function IncidentReport() {
  const [incidents, setIncidents] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableTanods, setAvailableTanods] = useState([]);
  const [selectedTanod, setSelectedTanod] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Under Review':
        return 'status-yellow';
      case 'In Progress':
        return 'status-blue';
      case 'Resolved':
        return 'status-green';
      default:
        return '';
    }
  };

  // Get current user from localStorage or session
  useEffect(() => {
    const user = localStorage.getItem('currentUser') || 'Admin';
    setCurrentUser(user);
  }, []);

  // Simplified data fetching - no audio/notification logic needed here
  useEffect(() => {
    const fetchIncidents = () => {
      fetch(`${BASE_URL}/api/incidents`)
        .then(res => res.json())
        .then(data => {
          setIncidents(data);
        })
        .catch(err => {
          console.error("Failed to fetch incidents:", err);
          setIncidents([]);
        });
    };

    // Initial fetch
    fetchIncidents();

    // Set interval for auto-refresh (every 3 seconds)
    const intervalId = setInterval(fetchIncidents, 3000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchAvailableTanods = () => {
    // Get today's date
    const today = new Date().toISOString().slice(0, 10);
    
    fetch(`${BASE_URL}/api/logs`)
      .then(res => res.json())
      .then(data => {
        // Filter logs for today that have TIME_IN but no TIME_OUT
        const todayLogs = data.filter(log => {
          const logDate = log.TIME ? log.TIME.slice(0, 10) : null;
          return logDate === today && log.TIME_IN && !log.TIME_OUT;
        });
        
        // Get unique users who are currently on duty
        const availableUsers = todayLogs.reduce((acc, log) => {
          if (!acc.find(user => user.USER === log.USER)) {
            acc.push({
              USER: log.USER,
              TIME_IN: log.TIME_IN,
              ID: log.ID
            });
          }
          return acc;
        }, []);
        
        setAvailableTanods(availableUsers);
      })
      .catch(err => {
        console.error("Failed to fetch available tanods:", err);
        setAvailableTanods([]);
      });
  };

  const handleViewClick = (incident) => {
    setSelectedIncident(incident);
    setShowViewModal(true);
  };

  const handleAssignTanodClick = (incident) => {
    setSelectedIncident(incident);
    fetchAvailableTanods();
    setShowAssignModal(true);
  };

  const handleDeleteClick = (incident) => {
    setSelectedIncident(incident);
    setShowDeleteConfirmation(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedIncident(null);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedIncident(null);
    setSelectedTanod('');
    setAvailableTanods([]);
  };
  
  const openConfirmationModal = () => {
    setShowConfirmation(true);
  };
  
  const closeConfirmationModal = () => {
    setShowConfirmation(false);
  };

  const closeDeleteConfirmationModal = () => {
    setShowDeleteConfirmation(false);
    setSelectedIncident(null);
  };

  const handleAssignTanod = () => {
    if (!selectedTanod || !selectedIncident) {
      alert('Please select a tanod to assign');
      return;
    }

    setIsUpdating(true);
    
    // Update incident status to "In Progress" and assign tanod
    fetch(`${BASE_URL}/api/incidents/${selectedIncident.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        status: 'In Progress',
        assigned_tanod: selectedTanod 
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Update the incident in the local state
          setIncidents(prevIncidents => 
            prevIncidents.map(inc => 
              inc.id === selectedIncident.id 
                ? { ...inc, status: 'In Progress', assigned_tanod: selectedTanod } 
                : inc
            )
          );
          
          // Update the selected incident
          setSelectedIncident({
            ...selectedIncident, 
            status: 'In Progress', 
            assigned_tanod: selectedTanod
          });
          
          // Close assign modal
          closeAssignModal();
          alert(`Tanod ${selectedTanod} has been assigned to this incident`);
        } else {
          alert('Failed to assign tanod: ' + data.message);
        }
      })
      .catch(err => {
        console.error('Error assigning tanod:', err);
        alert('An error occurred while assigning the tanod');
      })
      .finally(() => {
        setIsUpdating(false);
      });
  };
  
  const handleMarkAsResolved = () => {
    if (!selectedIncident) return;
    
    setIsUpdating(true);
    
    // Updated to use the resolve endpoint with resolved_by and resolved_at
    fetch(`${BASE_URL}/api/incidents/${selectedIncident.id}/resolve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        resolved_by: currentUser 
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Update the incident in the local state with resolved_by and resolved_at
          const resolvedAt = new Date().toISOString();
          setIncidents(prevIncidents => 
            prevIncidents.map(inc => 
              inc.id === selectedIncident.id 
                ? { 
                    ...inc, 
                    status: 'Resolved', 
                    resolved_by: currentUser,
                    resolved_at: resolvedAt
                  } 
                : inc
            )
          );
          
          // Update the selected incident
          setSelectedIncident({
            ...selectedIncident, 
            status: 'Resolved',
            resolved_by: currentUser,
            resolved_at: resolvedAt
          });
          
          // Close confirmation modal
          setShowConfirmation(false);
          alert('Incident has been marked as resolved successfully');
        } else {
          alert('Failed to update status: ' + data.message);
        }
      })
      .catch(err => {
        console.error('Error updating incident status:', err);
        alert('An error occurred while updating the status');
      })
      .finally(() => {
        setIsUpdating(false);
      });
  };

  const handleDeleteIncident = () => {
    if (!selectedIncident) return;
    
    setIsUpdating(true);
    
    fetch(`${BASE_URL}/api/incidents/${selectedIncident.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Remove the incident from local state
          setIncidents(prevIncidents => 
            prevIncidents.filter(inc => inc.id !== selectedIncident.id)
          );
          
          // Close delete confirmation modal
          setShowDeleteConfirmation(false);
          setSelectedIncident(null);
          alert('Incident deleted successfully');
        } else {
          alert('Failed to delete incident: ' + data.message);
        }
      })
      .catch(err => {
        console.error('Error deleting incident:', err);
        console.error('Error details:', err.message, err.stack);
        alert('An error occurred while deleting the incident');
      })
      .finally(() => {
        setIsUpdating(false);
      });
  };

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="account-management-container">
        <div className="account-header">
          <div className="account-title">
            <span className="account-icon">🚨</span>
            <h2>Incident Reports</h2>
          </div>
          <div className="account-description">
            Manage incident reports, assign tanods, and track resolution status
          </div>
        </div>

        <div className="account-controls">
          <div className="search-container">
            <input type="text" placeholder="Search incidents..." className="search-input" />
          </div>
        </div>

        <div className="table-container">
          <table className="accounts-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>ID</th>
                <th style={{width: '250px'}}>INCIDENT</th>
                <th style={{width: '100px'}}>TYPE</th>
                <th style={{width: '120px'}}>REPORTED BY</th>
                <th style={{width: '200px'}}>LOCATION</th>
                <th style={{width: '120px'}}>STATUS</th>
                <th style={{width: '140px'}}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center'}}>No incidents found.</td>
                </tr>
              ) : (
                incidents.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td className="incident-cell">
                      <div className="incident-icon">
                        <img
                          src={`${BASE_URL}/uploads/${item.image}`}
                          alt="Incident"
                          className="small-avatar"
                        />
                      </div>
                    </td>
                    <td>
                      <span className="type-badge">{item.incident_type || "N/A"}</span>
                    </td>
                    <td>{item.reported_by || "Unknown"}</td>
                    <td>{item.location || "Not specified"}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(item.status)}`}>{item.status}</span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="edit-button"
                        onClick={() => handleViewClick(item)}
                      >
                        View
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteClick(item)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Incident Modal */}
      <ViewIncidentModal 
        showModal={showViewModal}
        selectedIncident={selectedIncident}
        currentUser={currentUser}
        onClose={closeViewModal}
        onMarkAsResolved={openConfirmationModal}
        onAssignTanod={() => handleAssignTanodClick(selectedIncident)}
      />

      {/* Assign Tanod Modal */}
      <AssignTanodModal 
        showModal={showAssignModal}
        selectedIncident={selectedIncident}
        availableTanods={availableTanods}
        selectedTanod={selectedTanod}
        setSelectedTanod={setSelectedTanod}
        isUpdating={isUpdating}
        onClose={closeAssignModal}
        onAssignTanod={handleAssignTanod}
      />
      
      {/* Mark as Resolved Confirmation Modal */}
      <ConfirmationModal 
        showModal={showConfirmation}
        selectedIncident={selectedIncident}
        currentUser={currentUser}
        isUpdating={isUpdating}
        onClose={closeConfirmationModal}
        onConfirm={handleMarkAsResolved}
        title="Confirm Action"
        message="Are you sure you want to mark this incident as resolved?"
        confirmText="Confirm"
        showResolvedBy={true}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal 
        showModal={showDeleteConfirmation}
        selectedIncident={selectedIncident}
        currentUser={currentUser}
        isUpdating={isUpdating}
        onClose={closeDeleteConfirmationModal}
        onConfirm={handleDeleteIncident}
        title="Confirm Delete"
        message="Are you sure you want to delete this incident?"
        confirmText={isUpdating ? 'Deleting...' : 'Delete'}
        confirmStyle={{backgroundColor: '#dc3545'}}
        showResolvedBy={false}
      />
    </div>
  );
};

export default IncidentReport;