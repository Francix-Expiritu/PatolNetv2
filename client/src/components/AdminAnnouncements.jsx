import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Calendar, FileText, Image, X, Save, Loader } from "lucide-react";
import "./AdminAnnouncements.css"; // Assuming you'll create this CSS file
import MainSidebarWrapper from './MainSidebarWrapper';
import { BASE_URL } from '../config';

function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [postedBy, setPostedBy] = useState(""); // New field for announcements
  const [editing, setEditing] = useState(false);
  const [currentAnnouncementId, setCurrentAnnouncementId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/announcements`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAnnouncements(data);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError("Failed to load announcements.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const resetForm = () => {
    setTitle("");
    setDate("");
    setDescription("");
    setImage(null);
    setImagePreview("");
    setPostedBy("");
    setEditing(false);
    setCurrentAnnouncementId(null);
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
    formData.append("posted_by", postedBy); // Add posted_by
    if (image) {
      formData.append("image", image);
    }

    try {
      let response;
      if (editing) {
        response = await fetch(`${BASE_URL}/api/announcements/${currentAnnouncementId}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        response = await fetch(`${BASE_URL}/api/announcements`, {
          method: "POST",
          body: formData,
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save announcement.");
      }

      await fetchAnnouncements(); // Refresh the list
      resetForm();
    } catch (err) {
      console.error("Error saving announcement:", err);
      setError(err.message || "Failed to save announcement.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setEditing(true);
    setCurrentAnnouncementId(announcement._id);
    setTitle(announcement.title);
    setDate(announcement.date.split('T')[0]); // Format date for input type="date"
    setDescription(announcement.description);
    setImage(null); // Clear image input
    setImagePreview(announcement.image ? `${BASE_URL}/uploads/${announcement.image}` : "");
    setPostedBy(announcement.posted_by || ""); // Set posted_by
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/announcements/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete announcement.");
      }

      await fetchAnnouncements(); // Refresh the list
    } catch (err) {
      console.error("Error deleting announcement:", err);
      setError(err.message || "Failed to delete announcement.");
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
    <div className="admin-announcements-container">
      <MainSidebarWrapper/>
      {/* Header */}
      <div className="header1">
        <div className="header-content">
          <div className="header-title-container">
            <h1 className="header-title">Announcement Management</h1>
            <p className="header-subtitle">Manage and organize your announcements</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="add-announcement-btn"
          >
            <Plus size={20} />
            Add Announcement
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
                  {editing ? "Edit Announcement" : "Create New Announcement"}
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
                      Announcement Title
                    </label>
                    <div className="input-wrapper">
                      <FileText size={20} className="input-icon" />
                      <input
                        type="text"
                        placeholder="Enter announcement title"
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
                      placeholder="Describe the announcement..."
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
                      Posted By
                    </label>
                    <div className="input-wrapper">
                      <FileText size={20} className="input-icon" />
                      <input
                        type="text"
                        placeholder="Enter name of poster"
                        value={postedBy}
                        onChange={(e) => setPostedBy(e.target.value)}
                        required
                        disabled={isLoading}
                        className="form-input"
                      />
                    </div>
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
                      : editing ? "Update Announcement" : "Create Announcement"
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

    
        <div className="announcements-section">
           {/*<div className="section-header">
            <h2 className="section-title">
              All Announcements ({announcements.length})
            </h2>
          </div>*/}

          {isLoading ? (
            <div className="loading-state">
              <Loader size={48} className="spinner" />
              <p>Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FileText size={48} className="mx-auto" />
              </div>
              <h3 className="empty-state-title">No announcements yet</h3>
              <p className="empty-state-description">Get started by creating your first announcement</p>
              <button
                onClick={() => setShowForm(true)}
                className="add-announcement-btn"
              >
                <Plus size={20} />
                Add Your First Announcement
              </button>
            </div>
          ) : (
            <div className="announcements-grid">
              {announcements.map((announcement) => (
                <div
                  key={announcement._id}
                  className="announcement-card"
                >
                  {announcement.image && (
                    <div className="announcement-image">
                      <img
                        src={`${BASE_URL}/uploads/${announcement.image}`}
                        alt={announcement.title}
                        className="announcement-image-tag"
                      />
                    </div>
                  )}
                  
                  <div className="announcement-content">
                    <div className="mb-4">
                      <h3 className="announcement-title">
                        {announcement.title}
                      </h3>
                      <div className="announcement-date">
                        <Calendar size={16} className="announcement-date-icon" />
                        {new Date(announcement.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <p className="announcement-description">
                        {announcement.description}
                      </p>
                      <p className="announcement-posted-by">
                        Posted by: {announcement.posted_by}
                      </p>
                    </div>
                    
                    <div className="announcement-actions">
                      <button
                        onClick={() => handleEdit(announcement)}
                        disabled={isLoading}
                        className="edit-btn"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(announcement._id)}
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

export default AdminAnnouncements;