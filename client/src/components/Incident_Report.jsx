// IncidentReport.jsx
import React, { useState, useEffect } from "react";
import ViewIncidentModal from "./Modals/ViewIncidentModal";
import AssignTanodModal from "./Modals/Tanodmodal";
import ConfirmationModal from "./Modals/ConfirmationModal";
import { BASE_URL } from "../config";
import "./IncidentReport.css";

function IncidentReport() {
  const [incidents, setIncidents] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableTanods, setAvailableTanods] = useState([]);
  const [selectedTanod, setSelectedTanod] = useState("");
  const [currentUser, setCurrentUser] = useState("");

  const getStatusColor = (status) => {
    switch (status) {
      case "Under Review":
        return "status-yellow";
      case "In Progress":
        return "status-blue";
      case "Resolved":
        return "status-green";
      default:
        return "";
    }
  };

  // Get current user from localStorage or session
  useEffect(() => {
    const user = localStorage.getItem("currentUser") || "Admin";
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    const fetchIncidents = () => {
      fetch(`${BASE_URL}/api/incidents`)
        .then((res) => res.json())
        .then((data) => {
          setIncidents(data);
        })
        .catch((err) => {
          console.error("Failed to fetch incidents:", err);
          setIncidents([]);
        });
    };

    fetchIncidents();
    const intervalId = setInterval(fetchIncidents, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchAvailableTanods = () => {
    const today = new Date().toISOString().slice(0, 10);

    fetch(`${BASE_URL}/api/logs`)
      .then((res) => res.json())
      .then((data) => {
        const todayLogs = data.filter((log) => {
          const logDate = log.TIME ? log.TIME.slice(0, 10) : null;
          return logDate === today && log.TIME_IN && !log.TIME_OUT;
        });

        const availableUsers = todayLogs.reduce((acc, log) => {
          if (!acc.find((u) => u.USER === log.USER)) {
            acc.push({
              USER: log.USER,
              TIME_IN: log.TIME_IN,
              ID: log.ID,
            });
          }
          return acc;
        }, []);

        setAvailableTanods(availableUsers);
      })
      .catch((err) => {
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
    setSelectedTanod("");
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

  // === FIX: delete handler wired to the delete confirmation modal ===
  const handleDeleteIncident = async () => {
    if (!selectedIncident) return;

    setIsUpdating(true);

    try {
      const res = await fetch(`${BASE_URL}/api/incidents/${selectedIncident.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // If your API returns no JSON for DELETE, you can handle res.ok instead
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success === undefined || data.success === true)) {
        // Remove the incident from local state
        setIncidents((prev) => prev.filter((inc) => inc.id !== selectedIncident.id));

        // Close modal and clear selection
        setShowDeleteConfirmation(false);
        setSelectedIncident(null);

        alert("Incident deleted successfully");
      } else {
        const msg = data.message || `Server responded with status ${res.status}`;
        alert("Failed to delete incident: " + msg);
      }
    } catch (err) {
      console.error("Error deleting incident:", err);
      alert("An error occurred while deleting the incident");
    } finally {
      setIsUpdating(false);
    }
  };
  // ================================================================

  // keep your existing assign/resolved handlers (omitted here for brevity)
  // ... (you can keep the rest of your existing handlers like handleAssignTanod, handleMarkAsResolved)

  const handleMarkAsResolved = async () => {
    if (!selectedIncident) return;

    setIsUpdating(true);

    try {
      const res = await fetch(`${BASE_URL}/api/incidents/${selectedIncident.id}/resolve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resolved_by: currentUser }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Update the incident in local state
        setIncidents((prev) =>
          prev.map((inc) =>
            inc.id === selectedIncident.id ? { ...inc, status: "Resolved" } : inc
          )
        );

        // Close modal and clear selection
        setShowConfirmation(false);
        setSelectedIncident(null);

        alert("Incident marked as resolved successfully");
      } else {
        const msg = data.message || `Server responded with status ${res.status}`;
        alert("Failed to mark incident as resolved: " + msg);
      }
    } catch (err) {
      console.error("Error marking incident as resolved:", err);
      alert("An error occurred while marking the incident as resolved");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="dashboard">
      <div style={{ width: '100%', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.5rem 2rem', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '0.75rem' }}>🚨</span>Incident Reports
              </h1>
              <p style={{ fontSize: '1rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Manage incident reports, assign tanods, and track resolution status
              </p>
            </div>
          </div>
        </div>

        <div className="incident-container" style={{ padding: "2rem", maxWidth: '1200px', margin: '0 auto' }}>

          <div className="incident-controls">
          <input type="text" placeholder="Search incidents..." className="incident-search" />
        </div>

        <div className="incident-table-wrapper">
          <table className="incident-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Incident</th>
                <th>Type</th>
                <th>Reported By</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    No incidents found.
                  </td>
                </tr>
              ) : (
                incidents.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>
                      <img
                        src={`${BASE_URL}/uploads/${item.image}`}
                        alt="Incident"
                        className="incident-avatar"
                      />
                    </td>
                    <td>
                      <span className="type-badge">{item.incident_type || "N/A"}</span>
                    </td>
                    <td>{item.reported_by || "Unknown"}</td>
                    <td>{item.location || "Not specified"}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(item.status)}`}>{item.status}</span>
                    </td>
                    <td>
                      <button className="btn view-btn" onClick={() => handleViewClick(item)}>
                        View
                      </button>
                      <button className="btn delete-btn" onClick={() => handleDeleteClick(item)}>
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
      </div>

      {/* View Modal */}
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
        onAssignTanod={() => {
          /* your assign handler if you have it */
        }}
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

      {/* Delete Confirmation Modal (wired to handleDeleteIncident) */}
      <ConfirmationModal
        showModal={showDeleteConfirmation}
        selectedIncident={selectedIncident}
        currentUser={currentUser}
        isUpdating={isUpdating}
        onClose={closeDeleteConfirmationModal}
        onConfirm={handleDeleteIncident}
        title="Confirm Delete"
        message="Are you sure you want to delete this incident?"
        confirmText={isUpdating ? "Deleting..." : "Delete"}
        confirmStyle={{ backgroundColor: "#dc3545" }}
        showResolvedBy={false}
        dialogClassName="delete-confirmation-dialog"
      />
    </div>
  );
}

export default IncidentReport;