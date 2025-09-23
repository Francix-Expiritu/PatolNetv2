import React, { useState, useEffect } from 'react';
import GISMapping from "./GISmapping";
import "./Announcements.css";
import "./CommunityHub.css";
import CommunityHub from './CommunityHub';
import { BASE_URL } from '../config';

export default function AnnouncementPage() {
  const [recentIncident, setRecentIncident] = useState(null);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/incidents`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setIncidents(data);
        if (data.length > 0) {
          const sortedIncidents = data.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
          setRecentIncident(sortedIncidents[0]);
        }
      } catch (error) {
        console.error("Error fetching incidents:", error);
      }
    };

    fetchIncidents();
  }, []);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getIncidentsByType = () => {
    const types = {};
    incidents.forEach(incident => {
      const type = incident.incident_type || 'Other';
      types[type] = (types[type] || 0) + 1;
    });
    return types;
  };

  const getRiskLevel = () => {
    const activeIncidents = incidents.filter(i => i.status === 'active').length;
    if (activeIncidents >= 5) return { level: 'High', color: '#ef4444' };
    if (activeIncidents >= 2) return { level: 'Moderate', color: '#f59e0b' };
    return { level: 'Low', color: '#10b981' };
  };

  const riskLevel = getRiskLevel();

  return (
    <div className="announcement-page">
      {/* Hero Section with Map Dashboard */}
      <section className="hero-dashboard">
        <div className="hero-background">
          <div className="animated-grid"></div>
          <div className="floating-particles">
            {[...Array(15)].map((_, i) => (
              <div key={i} className={`particle particle-${i % 3}`} />
            ))}
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-header">
            <h1 className="hero-title">
              <span className="title-main">Community Safety</span>
              <span className="title-sub">Dashboard</span>
            </h1>
            <p className="hero-description">
              Real-time monitoring and community engagement platform
            </p>
          </div>

          <div className="dashboard-grid">
            {/* Enhanced Map Section */}
            <div className="map-section">
              <div className="map-card">
                <div className="map-header">
                  <div className="map-title">
                    <h3>Live Incident Map</h3>
                    <div className="live-indicator">
                      <div className="pulse-dot"></div>
                      <span>Live Updates</span>
                    </div>
                  </div>
                </div>
                <div className="map-container">
                  <GISMapping showOnlyMap={true} />
                  <div className="map-overlay">
                    <div className="quick-stats">
                      <div className="stat-bubble">
                        <span className="stat-number">{incidents.length}</span>
                        <span className="stat-label">Total</span>
                      </div>
                      <div className="stat-bubble active">
                        <span className="stat-number">{incidents.filter(i => i.status === 'active').length}</span>
                        <span className="stat-label">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Info Panel */}
            <div className="info-section">
              <div className="info-cards">
                {/* Risk Level Card */}
                <div className="info-card risk-card">
                  <div className="card-header">
                    <div className="card-icon">🛡️</div>
                    <div className="card-title">Current Risk Level</div>
                  </div>
                  <div className="risk-display">
                    <div 
                      className="risk-level"
                      style={{ backgroundColor: riskLevel.color }}
                    >
                      {riskLevel.level}
                    </div>
                    <div className="risk-details">
                      <span>{incidents.filter(i => i.status === 'active').length} active incidents</span>
                      <span>Last update: {new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                {/* Latest Incident Card */}
                {recentIncident && (
                  <div className="info-card incident-card">
                    <div className="card-header">
                      <div className="card-icon">🚨</div>
                      <div className="card-title">Latest Incident</div>
                    </div>
                    <div className="incident-info">
                      <div className="incident-type-badge">
                        {recentIncident.incident_type || 'General'}
                      </div>
                      <div className="incident-time">
                        {formatDate(recentIncident.datetime)}
                      </div>
                      <p className="incident-description">
                        {recentIncident.description}
                      </p>
                      <div className="incident-status">
                        <span className={`status-badge ${recentIncident.status}`}>
                          {recentIncident.status}
                        </span>
                        <span className="response-time" >
                          Response: {recentIncident.responsetime}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Incident Statistics */}
                <div className="info-card stats-card">
                  <div className="card-header">
                    <div className="card-icon">📊</div>
                    <div className="card-title">Incident Distribution</div>
                  </div>
                  <div className="incident-chart">
                    {Object.entries(getIncidentsByType()).map(([type, count]) => (
                      <div key={type} className="chart-item">
                        <div className="chart-label">
                          <span className="type-name">{type}</span>
                          <span className="type-count">{count}</span>
                        </div>
                        <div className="chart-bar">
                          <div 
                            className="chart-fill" 
                            style={{
                              width: `${(count / incidents.length) * 100}%`,
                              animationDelay: `${Object.keys(getIncidentsByType()).indexOf(type) * 0.1}s`
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="info-card contacts-card">
                  <div className="card-header">
                    <div className="card-icon">📞</div>
                    <div className="card-title">Emergency Contacts</div>
                  </div>
                  <div className="contact-list">
                    <div className="contact-item emergency">
                      <div className="contact-info">
                        <span className="contact-name">Emergency Services</span>
                        <span className="contact-number">911</span>
                      </div>
                      <button className="call-btn">📞</button>
                    </div>
                    <div className="contact-item">
                      <div className="contact-info">
                        <span className="contact-name">Local Emergency</span>
                        <span className="contact-number">(02) 8888-0911</span>
                      </div>
                      <button className="call-btn">📞</button>
                    </div>
                    <div className="contact-item">
                      <div className="contact-info">
                        <span className="contact-name">Disaster Response</span>
                        <span className="contact-number">(02) 911-1406</span>
                      </div>
                      <button className="call-btn">📞</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Community Hub */}
      <CommunityHub formatDate={formatDate} />
    </div>
  );
}