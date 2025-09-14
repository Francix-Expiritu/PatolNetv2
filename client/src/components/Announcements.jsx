import React, { useState, useEffect } from "react";
import GISMapping from "./GISmapping";
import "./Announcements.css";
import { BASE_URL } from '../config';

export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [recentIncident, setRecentIncident] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/announcements`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAnnouncements(data);
      } catch (error) {
        console.error("Error fetching announcements:", error);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const fetchRecentIncident = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/incidents`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.length > 0) {
          // Sort incidents by date in descending order and get the most recent one
          const sortedIncidents = data.sort((a, b) => new Date(b.date) - new Date(a.date));
          setRecentIncident(sortedIncidents[0]);
        }
      } catch (error) {
        console.error("Error fetching recent incident:", error);
      }
    };

    fetchRecentIncident();
  }, []);

  const categories = ['all', 'emergency', 'community', 'maintenance', 'events'];

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesCategory = selectedCategory === 'all' || 
      announcement.category === selectedCategory;
    const matchesSearch = announcement.title.toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      announcement.description.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-normal';
    }
  };

  const visualImages = [
    { src: "/Alert.png", alt: "Emergency Alert Guidelines", category: "emergency" },
    { src: "Alert2.jpg", alt: "Safety Protocols", category: "safety" },
    { src: "Alert3.jpg", alt: "Community Guidelines", category: "community" },
    { src: "Medical.jpg", alt: "Medical Information", category: "health" },
    { src: "slide1.jpg", alt: "Community Event", category: "events" },
    { src: "slide2.jpg", alt: "Safety Awareness", category: "safety" },
    { src: "slide3.jpg", alt: "Emergency Procedures", category: "emergency" },
    { src: "/slide.jpg", alt: "General Information", category: "general" }
  ];

  return (
    <div className="announcement-page">
      {/* Header Section */}
      <section className="page-header">
        <div className="container">
          <div className="header-content">
            <h1 className="page-title">Community Announcements</h1>
            <p className="page-subtitle">
              Stay informed with the latest updates from your community
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="filters-section">
        <div className="container">
          <div className="filters-content">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category}
                  className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Announcements Section */}
      <section className="announcements-section">
        <div className="container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading announcements...</p>
            </div>
          ) : filteredAnnouncements.length > 0 ? (
            <div className="announcements-grid">
              {filteredAnnouncements.map((announcement) => (
                <div key={announcement._id} className={`announcement-card ${getPriorityClass(announcement.priority)}`}>
                  <div className="card-header">
                    <div className="card-meta">
                      <span className="announcement-category">
                        {announcement.category || 'General'}
                      </span>
                      {announcement.priority && (
                        <span className={`priority-badge ${getPriorityClass(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                      )}
                    </div>
                    <div className="announcement-date">
                      {formatDate(announcement.date)}
                    </div>
                  </div>
                  
                  <div className="card-content">
                    <h3 className="announcement-title">{announcement.title}</h3>
                    <p className="announcement-description">
                      {announcement.description}
                    </p>
                  </div>

                  {announcement.image && (
                    <div className="card-image">
                      <img
                        src={`${BASE_URL}/uploads/${announcement.image}`}
                        alt={announcement.title}
                        className="announcement-image"
                      />
                    </div>
                  )}

                  <div className="card-actions">
                    <button className="btn btn-primary">Read More</button>
                    <button className="btn btn-secondary">Share</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📢</div>
              <h3>No Announcements Found</h3>
              <p>
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No announcements are available at the moment.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Incident Map Section */}
      <section className="incident-section">
  <div className="container">
    <div className="incident-content">
      <div className="incident-info">
        <h2 className="section-title">Live Incident Map</h2>
        {recentIncident ? (
          <div className="incident-alert">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <h4>Recent Incident Report</h4>
              <p>{recentIncident.description}</p>
              <div className="incident-details">
                <span className="detail-item">
                  <strong>Status:</strong> {recentIncident.status}
                </span>
                <span className="detail-item">
                  <strong>Response Time:</strong> {recentIncident.responsetime}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="loading-state">
            <p>Loading recent incident...</p>
          </div>
        )}
        
        {recentIncident && recentIncident.image && (
          <div className="incident-image-container">
            <img
              src={`${BASE_URL}/uploads/${recentIncident.image}`}
              alt="Incident Location"
              className="incident-image"
            />
          </div>
        )}
      </div>

      <div className="map-container">
        <GISMapping showOnlyMap={true} />
      </div>
    </div>
  </div>
</section>

      {/* Visual Announcements Section */}
      <section className="visual-announcements">
        <div className="container">
          <h2 className="section-title">Visual Information Board</h2>
          <div className="visual-grid">
            {visualImages.map((image, index) => (
              <div key={index} className="visual-card">
                <div className="image-container">
                  <img 
                    src={image.src} 
                    alt={image.alt}
                    className="visual-image"
                  />
                  <div className="image-overlay">
                    <span className="image-category">{image.category}</span>
                  </div>
                </div>
                <div className="image-info">
                  <h4 className="image-title">{image.alt}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{announcements.length}</div>
              <div className="stat-label">Total Announcements</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Community Monitoring</div>
            </div>
            <div className="stat-item">
              <div className="stat-number"> 5min</div>
              <div className="stat-label">Average Response Time</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">System Uptime</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}