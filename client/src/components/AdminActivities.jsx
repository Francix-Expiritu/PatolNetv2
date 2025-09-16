import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Calendar, FileText, Image, X, Save, Loader } from "lucide-react";
import "./AdminActivities.css";
import MainSidebarWrapper from './MainSidebarWrapper';
import { BASE_URL } from '../config';

function AdminActivities() {
  const [activities, setActivities] = useState([]); // Initialize as empty array

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [editing, setEditing] = useState(false);
  const [currentActivityId, setCurrentActivityId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/activities`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setActivities(data);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Failed to load activities.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const resetForm = () => {
    setTitle("");
    setDate("");
    setDescription("");
    setImage(null);
    setImagePreview("");
    setEditing(false);
    setCurrentActivityId(null);
    setError("");
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("date", date);
    formData.append("description", description);
    if (image) {
      formData.append("image", image);
    }

    try {
      let response;
      if (editing) {
        response = await fetch(`${BASE_URL}/api/activities/${currentActivityId}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        response = await fetch(`${BASE_URL}/api/activities`, {
          method: "POST",
          body: formData,
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save activity.");
      }

      await fetchActivities(); // Refresh the list
      resetForm();
    } catch (err) {
      console.error("Error saving activity:", err);
      setError(err.message || "Failed to save activity.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (activity) => {
    setEditing(true);
    setCurrentActivityId(activity._id);
    setTitle(activity.title);
    setDate(activity.date.split('T')[0]); // Format date for input type="date"
    setDescription(activity.description);
    setImage(null); // Clear image input
    setImagePreview(activity.image ? `${BASE_URL}/uploads/${activity.image}` : "");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/activities/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete activity.");
      }

      await fetchActivities(); // Refresh the list
    } catch (err) {
      console.error("Error deleting activity:", err);
      setError(err.message || "Failed to delete activity.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="admin-activities-container">
      <MainSidebarWrapper/>
      {/* Header */}
      <div className="header1">
        <div className="header-content">
          <div className="header-title-container">
            <h1 className="header-title">Activity Management</h1>
            <p className="header-subtitle">Manage and organize your activities</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="add-activity-btn"
          >
            <Plus size={20} />
            Add Activity
          </button>
        </div>
      </div>

      <div className="main-content">
        {/* Form Modal/Slide */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">
                  {editing ? "Edit Activity" : "Create New Activity"}
                </h3>
                <button
                  onClick={resetForm}
                  className="close-btn"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="form-container">
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">
                      Activity Title
                    </label>
                    <div className="input-wrapper">
                      <FileText size={20} className="input-icon" />
                      <input
                        type="text"
                        placeholder="Enter activity title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        disabled={isLoading}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Date
                    </label>
                    <div className="input-wrapper">
                      <Calendar size={20} className="input-icon" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        disabled={isLoading}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Description
                    </label>
                    <textarea
                      placeholder="Describe the activity..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      disabled={isLoading}
                      rows={4}
                      className="form-textarea"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Image
                    </label>
                    <div className="input-wrapper">
                      <input
                        type="file"
                        onChange={handleImageChange}
                        disabled={isLoading}
                        accept="image/*"
                        className="file-input-hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="file-upload-area"
                      >
                        <Image size={24} className="file-upload-icon" />
                        <span className="file-upload-text">Click to upload image</span>
                      </label>
                    </div>
                  </div>

                  {imagePreview && (
                    <div className="image-preview">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="preview-image"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setImagePreview("");
                        }}
                        className="remove-image-btn"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-buttons">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="submit-btn"
                  >
                    {isLoading ? (
                      <Loader size={20} className="spinner" />
                    ) : (
                      <Save size={20} />
                    )}
                    {isLoading
                      ? editing ? "Updating..." : "Creating..."
                      : editing ? "Update Activity" : "Create Activity"
                    }
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isLoading}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        
        <div className="activities-section">
        {/*  <div className="section-header">
            <h2 className="section-title">
              All Activities ({activities.length})
            </h2>
          </div>*/}

          {isLoading ? (
            <div className="loading-state">
              <Loader size={48} className="spinner" />
              <p>Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FileText size={48} className="mx-auto" />
              </div>
              <h3 className="empty-state-title">No activities yet</h3>
              <p className="empty-state-description">Get started by creating your first activity</p>
              <button
                onClick={() => setShowForm(true)}
                className="add-activity-btn"
              >
                <Plus size={20} />
                Adding Your First Activity
              </button>
            </div>
          ) : (
            <div className="activities-grid">
              {activities.map((activity) => (
                <div
                  key={activity._id}
                  className="activity-card"
                >
                  {activity.image && (
                    <div className="activity-image">
                      <img
                        src={`${BASE_URL}/uploads/${activity.image}`}
                        alt={activity.title}
                        className="activity-image-tag"
                      />
                    </div>
                  )}
                  
                  <div className="activity-content">
                    <div className="mb-4">
                      <h3 className="activity-title">
                        {activity.title}
                      </h3>
                      <div className="activity-date">
                        <Calendar size={16} className="activity-date-icon" />
                        {new Date(activity.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <p className="activity-description">
                        {activity.description}
                      </p>
                    </div>
                    
                    <div className="activity-actions">
                      <button
                        onClick={() => handleEdit(activity)}
                        disabled={isLoading}
                        className="edit-btn"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(activity._id)}
                        disabled={isLoading}
                        className="delete-btn"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminActivities;