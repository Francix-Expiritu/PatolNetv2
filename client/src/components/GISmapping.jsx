import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, RefreshCw, AlertTriangle, Activity, Shield, Flame, Car, Filter, BarChart3, Clock, User, Calendar, MapPinIcon } from 'lucide-react';
import Navbar from './Sidebar';
import { BASE_URL } from '../config';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Modern icons for incident types
const getIncidentIcon = (type) => {
  const icons = {
    'Fire': '🔥',
    'Accident': '🚗',
    'Crime': '🚨',
    'Emergency': '🚑',
    'Other': '⚠️'
  };
  return icons[type] || icons['Other'];
};

// Custom icons for different incident types with modern design
const createCustomIcon = (incidentType) => {
  const colors = {
    'Fire': '#ff4444',
    'Accident': '#ff8800',
    'Crime': '#8800ff',
    'Emergency': '#ff0088',
    'Other': '#0088ff'
  };
  
  const color = colors[incidentType] || colors['Other'];
  const icon = getIncidentIcon(incidentType);
  
  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, ${color}, ${color}dd);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        transition: all 0.2s ease;
        cursor: pointer;
      ">${icon}</div>
    `,
    className: 'modern-custom-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

function GISMapping({ showOnlyMap }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([14.565307024431522, 121.61516580730677]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/incidents`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch incidents');
      }
      
      const data = await response.json();
      
      // Filter out incidents without valid coordinates
      const validIncidents = data.filter(incident => 
        incident.latitude && 
        incident.longitude && 
        !isNaN(parseFloat(incident.latitude)) && 
        !isNaN(parseFloat(incident.longitude))
      );
      
      setIncidents(validIncidents);
      
      // Set map center to the first incident location if available
      if (validIncidents.length > 0) {
        setMapCenter([
          parseFloat(validIncidents[0].latitude),
          parseFloat(validIncidents[0].longitude)
        ]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching incidents:', err);
      setError('Failed to load incident data');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (datetime) => {
    return new Date(datetime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusStyle = (status) => {
    const styles = {
      'Resolved': { backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0' },
      'In Progress': { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' },
      'Under Review': { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' }
    };
    return styles[status] || { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' };
  };

  // Filter incidents based on type and search term
  const filteredIncidents = incidents.filter(incident => {
    const matchesType = filterType === 'All' || incident.incident_type === filterType;
    const matchesSearch = incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.incident_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.reported_by.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Get unique incident types for filter
  const incidentTypes = ['All', ...new Set(incidents.map(i => i.incident_type))];

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '1rem 0'
    },
    headerContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    headerIcon: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    },
    headerTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #1f2937, #4b5563)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: 0
    },
    headerSubtitle: {
      fontSize: '0.875rem',
      color: '#6b7280',
      margin: '2px 0 0 0'
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    statusBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '8px 16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151'
    },
    refreshBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      padding: '8px 16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    },
    pulse: {
      width: '8px',
      height: '8px',
      background: '#10b981',
      borderRadius: '50%',
      animation: 'pulse 2s infinite'
    },
    mainContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem 1.5rem',
      display: 'grid',
      gridTemplateColumns: showOnlyMap ? '1fr' : '300px 1fr',
      gap: '3rem'
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      width: '100%'
    },
    cardTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937',
      margin: '0 0 1rem 0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      borderRadius: '12px',
      fontSize: '0.875rem',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.2s ease',
      marginBottom: '1rem'
    },
    filterBtn: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      border: 'none',
      borderRadius: '12px',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginBottom: '8px'
    },
    activeFilter: {
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    },
    inactiveFilter: {
      background: 'rgba(255, 255, 255, 0.6)',
      color: '#374151',
      border: '1px solid rgba(226, 232, 240, 0.5)'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px'
    },
    legendIcon: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      border: '2px solid white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px'
    },
    statItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0'
    },
    mapContainer: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      height: showOnlyMap ? '400px' : '600px'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
      borderRadius: '12px'
    },
    spinner: {
      width: '48px',
      height: '48px',
      border: '4px solid #e2e8f0',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '16px'
    },
    errorContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
      borderRadius: '12px',
      color: '#dc2626'
    },
    incidentsList: {
      maxHeight: '400px',
      overflowY: 'auto',
      marginTop: '1rem'
    },
    incidentItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px',
      background: 'rgba(255, 255, 255, 0.6)',
      borderRadius: '12px',
      marginBottom: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    incidentItemLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    incidentItemRight: {
      textAlign: 'right'
    },
    statusBadgeSmall: {
      padding: '4px 8px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '500',
      border: '1px solid'
    }
  };

  const popupStyles = `
    .leaflet-popup-content-wrapper {
      background: rgba(255, 255, 255, 0.95) !important;
      backdrop-filter: blur(20px) !important;
      border-radius: 16px !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2) !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
    }
    .leaflet-popup-tip {
      background: rgba(255, 255, 255, 0.95) !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
    }
    .incident-popup h4 {
      color: #1f2937;
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .popup-details p {
      margin: 8px 0;
      color: #374151;
      font-size: 0.875rem;
    }
    .popup-details strong {
      color: #1f2937;
      font-weight: 600;
    }
    .modern-custom-icon:hover {
      transform: scale(1.1);
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;

  return (
    <div style={styles.container}>
      <style>{popupStyles}</style>
      
      {!showOnlyMap && <Navbar />}

      {/* Header */}
      {!showOnlyMap && (
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerLeft}>
              <div style={styles.headerIcon}>
                <MapPin size={20} />
              </div>
              <div>
                <h1 style={styles.headerTitle}>Incident Mapping System</h1>
                <p style={styles.headerSubtitle}>Real-time incident tracking and visualization</p>
              </div>
            </div>
            
            <div style={styles.headerRight}>
              <div style={styles.statusBadge}>
                <div style={styles.pulse}></div>
                <span>{filteredIncidents.length} Active Incidents</span>
              </div>
              
              <button
                onClick={fetchIncidents}
                disabled={loading}
                style={styles.refreshBtn}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.mainContent}>
        {/* Sidebar */}
        {!showOnlyMap && (
          <div style={styles.sidebar}>
            {/* Search & Filter Card */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <Filter size={18} />
                Filters & Search
              </h3>
              
              <input
                type="text"
                placeholder="Search incidents, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(226, 232, 240, 0.8)'}
              />
              
              {incidentTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  style={{
                    ...styles.filterBtn,
                    ...(filterType === type ? styles.activeFilter : styles.inactiveFilter)
                  }}
                  onMouseOver={(e) => {
                    if (filterType !== type) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (filterType !== type) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.6)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{type !== 'All' ? getIncidentIcon(type) : '📊'}</span>
                    <span>{type}</span>
                  </div>
                  <span style={{ 
                    background: filterType === type ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                    color: filterType === type ? 'white' : '#374151',
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    fontSize: '0.75rem' 
                  }}>
                    {type === 'All' ? incidents.length : incidents.filter(i => i.incident_type === type).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Legend Card */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <MapPinIcon size={18} />
                Legend
              </h3>
              {['Fire', 'Accident', 'Crime', 'Emergency', 'Other'].map(type => (
                <div key={type} style={styles.legendItem}>
                  <div 
                    style={{
                      ...styles.legendIcon,
                      background: `linear-gradient(135deg, ${
                        type === 'Fire' ? '#ff4444' :
                        type === 'Accident' ? '#ff8800' :
                        type === 'Crime' ? '#8800ff' :
                        type === 'Emergency' ? '#ff0088' : '#0088ff'
                      }, ${
                        type === 'Fire' ? '#ff4444dd' :
                        type === 'Accident' ? '#ff8800dd' :
                        type === 'Crime' ? '#8800ffdd' :
                        type === 'Emergency' ? '#ff0088dd' : '#0088ffdd'
                      })`
                    }}
                  >
                    {getIncidentIcon(type)}
                  </div>
                  <span style={{ fontWeight: '500', color: '#374151' }}>{type}</span>
                </div>
              ))}
            </div>

            {/* Stats Card */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <BarChart3 size={18} />
                Statistics
              </h3>
              <div style={styles.statsGrid}>
                <div style={styles.statItem}>
                  <span style={{ color: '#6b7280' }}>Total</span>
                  <span style={{ fontWeight: '700', fontSize: '1.25rem', color: '#1f2937' }}>
                    {incidents.length}
                  </span>
                </div>
                <div style={styles.statItem}>
                  <span style={{ color: '#6b7280' }}>Resolved</span>
                  <span style={{ fontWeight: '700', color: '#059669' }}>
                    {incidents.filter(i => i.status === 'Resolved').length}
                  </span>
                </div>
                <div style={styles.statItem}>
                  <span style={{ color: '#6b7280' }}>In Progress</span>
                  <span style={{ fontWeight: '700', color: '#d97706' }}>
                    {incidents.filter(i => i.status === 'In Progress').length}
                  </span>
                </div>
                <div style={styles.statItem}>
                  <span style={{ color: '#6b7280' }}>Under Review</span>
                  <span style={{ fontWeight: '700', color: '#dc2626' }}>
                    {incidents.filter(i => i.status === 'Under Review').length}
                  </span>
                </div>
              </div>
            </div>

{/* Recent Incidents */}
<div style={{...styles.card, width: '1190px'}}>
  <h3 style={styles.cardTitle}>
    <Clock size={18} />
    Recent Incidents
  </h3>
  <div style={styles.incidentsList}>
    {filteredIncidents.slice(0, 5).map(incident => (
      <div
        key={incident.id}
        style={styles.incidentItem}
        onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.8)'}
        onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.6)'}
        onClick={() => setSelectedIncident(incident)}
      >
        <div style={styles.incidentItemLeft}>
          <div style={{
            ...styles.legendIcon,
            width: '32px',
            height: '32px',
            background: `linear-gradient(135deg, ${
              incident.incident_type === 'Fire' ? '#ff4444' :
              incident.incident_type === 'Accident' ? '#ff8800' :
              incident.incident_type === 'Crime' ? '#8800ff' :
              incident.incident_type === 'Emergency' ? '#ff0088' : '#0088ff'
            }, ${
              incident.incident_type === 'Fire' ? '#ff4444dd' :
              incident.incident_type === 'Accident' ? '#ff8800dd' :
              incident.incident_type === 'Crime' ? '#8800ffdd' :
              incident.incident_type === 'Emergency' ? '#ff0088dd' : '#0088ffdd'
            })`
          }}>
            {getIncidentIcon(incident.incident_type)}
          </div>
          <div>
            <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '0.875rem' }}>
              {incident.incident_type}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
              {incident.location}
            </div>
          </div>
        </div>
        <div style={styles.incidentItemRight}>
          <div style={{
            ...styles.statusBadgeSmall,
            ...getStatusStyle(incident.status)
          }}>
            {incident.status}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
            {formatDateTime(incident.datetime)}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
          </div>
        )}

        {/* Map Container */}
        <div style={styles.mapContainer}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={{ color: '#6b7280', fontWeight: '500' }}>Loading incident data...</p>
            </div>
          ) : error ? (
            <div style={styles.errorContainer}>
              <AlertTriangle size={48} style={{ marginBottom: '16px' }} />
              <p style={{ fontWeight: '600', marginBottom: '16px' }}>{error}</p>
              <button
                onClick={fetchIncidents}
                style={{
                  ...styles.refreshBtn,
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)'
                }}
              >
                Try Again
              </button>
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%', borderRadius: '12px' }}
              className="modern-leaflet-map"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {filteredIncidents.map(incident => (
                <Marker
                  key={incident.id}
                  position={[parseFloat(incident.latitude), parseFloat(incident.longitude)]}
                  icon={createCustomIcon(incident.incident_type)}
                >
                  <Popup>
                    <div className="incident-popup">
                      <h4>
                        {getIncidentIcon(incident.incident_type)} {incident.incident_type}
                      </h4>
                      <div className="popup-details">
                        <p><strong>📍 Location:</strong> {incident.location}</p>
                        <p><strong>📅 Date:</strong> {formatDateTime(incident.datetime)}</p>
                        <p><strong>👤 Reported by:</strong> {incident.reported_by}</p>
                        <p>
                          <strong>🏷️ Status:</strong> 
                          <span 
                            className="status-badge"
                            style={{ 
                              ...getStatusStyle(incident.status),
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              marginLeft: '8px',
                              border: '1px solid'
                            }}
                          >
                            {incident.status}
                          </span>
                        </p>
                        <p><strong>🗺️ Coordinates:</strong> {incident.latitude}, {incident.longitude}</p>
                        {incident.image && (
                          <div className="popup-image" style={{ marginTop: '12px' }}>
                            <img 
                              src={`${BASE_URL}/uploads/${incident.image}`}
                              alt="Incident"
                              style={{ 
                                maxWidth: '200px', 
                                maxHeight: '150px', 
                                objectFit: 'cover',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>

      {!loading && !error && incidents.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#6b7280',
          fontSize: '1.125rem',
          fontWeight: '500'
        }}>
          <MapPin size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>No incident data available with valid coordinates</p>
        </div>
      )}
    </div>
  );
}

export default GISMapping;