import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { ChevronDown } from 'leaflet';
import { MapPin, RefreshCw, AlertTriangle, Activity, Shield, Flame, Car, Filter, BarChart3, Clock, User, Calendar, MapPinIcon, Plus, X, ChevronDownIcon, Smile } from 'lucide-react';
import { BASE_URL } from '../config';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different incident types with modern design
const createCustomIcon = (icon, color) => {
  
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

const emojiSuggestions = ['🌊', '🔥', '🚗', '🚨', '🚑', '⚡', '🥊', '⚠️', '❓', '🚧', '💨', '💥', '💧', '🌳', '🏠', '🏢', '🌉', '⛰️', '🚓', '🚲', '🚶', '📢', '⚙️', '🦠', '☢️'];

const AddTypeModal = ({
  styles,
  closeAddTypeModal,
  handleAddIncidentType,
  newType,
  handleNewTypeChange,
  addTypeError
}) => (
  <div style={styles.modalBackdrop}>
    <div style={styles.modalContent}>
      <div style={styles.modalHeader}>
        <h3 style={styles.modalTitle}>Add New Incident Type</h3>
        <button onClick={closeAddTypeModal} style={styles.modalCloseBtn}>
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleAddIncidentType}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Type Name</label>
          <input style={styles.modalInput} type="text" placeholder="e.g., Flood" value={newType.name} onChange={(e) => handleNewTypeChange('name', e.target.value)} required />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Emoji Icon</label>
          <div style={{ position: 'relative' }}>
            <Smile size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 1 }} />
            <select
              style={{...styles.modalInput, paddingLeft: '40px', appearance: 'none', cursor: 'pointer'}}
              value={newType.icon}
              onChange={(e) => handleNewTypeChange('icon', e.target.value)}
              required
            >
              <option value="" disabled>Select an icon</option>
              {emojiSuggestions.map(emoji => (
                <option key={emoji} value={emoji}>{emoji}</option>
              ))}
              <option value="custom">Enter Custom...</option>
            </select>
            <ChevronDownIcon size={20} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
          </div>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Marker Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input style={styles.colorInput} type="color" value={newType.color} onChange={(e) => handleNewTypeChange('color', e.target.value)} />
            <div style={styles.legendItem}>
              <div style={{...styles.legendIcon, background: `linear-gradient(135deg, ${newType.color}, ${newType.color}dd)`}}>{newType.icon}</div>
              <span style={{ fontWeight: '500', color: '#374151' }}>Preview</span>
            </div>
          </div>
        </div>
        {addTypeError && <p style={styles.modalError}>{addTypeError}</p>}
        <div style={styles.modalFooter}><button type="button" style={{...styles.modalButton, ...styles.cancelButton}} onClick={closeAddTypeModal}>Cancel</button><button type="submit" style={{...styles.modalButton, ...styles.addButton}}>Add Type</button></div>
      </form>
    </div>
  </div>
);

function GISMapping({ showOnlyMap }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([14.565307024431522, 121.61516580730677]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [newType, setNewType] = useState({ name: '', icon: '❓', color: '#cccccc' });
  const [addTypeError, setAddTypeError] = useState('');

  const defaultIncidentTypes = {
    'Fire': { icon: '🔥', color: '#ff4444' },
    'Accident': { icon: '🚗', color: '#ff8800' },
    'Crime': { icon: '🚨', color: '#8800ff' },
    'Emergency': { icon: '🚑', color: '#ff0088' },
    'Drowing people': { icon: '🆘', color: '#00aaff' },
    'Electrical Circuit': { icon: '⚡', color: '#ffee00' },
    'Fighting person': { icon: '🥊', color: '#ff0000' },
    'Other': { icon: '⚠️', color: '#0088ff' }
  };

  const [incidentTypeConfig, setIncidentTypeConfig] = useState(defaultIncidentTypes);

  const getIncidentConfig = (type) => {
    return incidentTypeConfig[type] || incidentTypeConfig['Other'];
  };

  const handleAddIncidentType = (e) => {
    e.preventDefault();
    setAddTypeError('');
    if (!newType.name || incidentTypeConfig[newType.name]) {
      setAddTypeError("Incident type name must be unique and not empty.");
      return;
    }

    (async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/incident-types`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newType),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null); // Gracefully handle non-JSON responses
          const errorMessage = errorData?.message || `Failed to save. Server responded with status: ${response.status}`;
          throw new Error(errorMessage);
        }

        const savedType = await response.json();
        // Use the returned data from the server to update state
        setIncidentTypeConfig(prev => ({ ...prev, [savedType.name]: { icon: savedType.icon, color: savedType.color } }));
        
        setShowAddTypeModal(false);
        setNewType({ name: '', icon: '❓', color: '#cccccc' });

      } catch (error) {
        console.error("Error adding incident type:", error);
        setAddTypeError(error.message || "An unexpected error occurred.");
      }
    })();
  };

  const handleNewTypeChange = (field, value) => {
    if (addTypeError) setAddTypeError('');
    setNewType(prev => ({ ...prev, [field]: value }));
  };

  const closeAddTypeModal = () => {
    setShowAddTypeModal(false);
    setNewType({ name: '', icon: '❓', color: '#cccccc' });
    setAddTypeError('');
  };

  useEffect(() => {
    const initialFetch = async () => {
      try {
        setLoading(true);
        const [incidentsRes, typesRes] = await Promise.all([
          fetch(`${BASE_URL}/api/incidents`),
          fetch(`${BASE_URL}/api/incident-types`) // Fetch custom types
        ]);

        if (!incidentsRes.ok) throw new Error('Failed to fetch incidents');
        
        const incidentsData = await incidentsRes.json();
        
        // Merge default types with custom types from DB
        if (typesRes.ok) {
          const customTypesData = await typesRes.json();
          const customTypesConfig = customTypesData.reduce((acc, type) => {
            acc[type.name] = { icon: type.icon, color: type.color };
            return acc;
          }, {});
          setIncidentTypeConfig({ ...defaultIncidentTypes, ...customTypesConfig });
        }

        // Process incidents after setting up types
        processIncidents(incidentsData);

      } catch (err) {
        console.error('Error during initial fetch:', err);
        setError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    initialFetch();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/incidents`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch incidents');
      }
      
      const data = await response.json();
      processIncidents(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching incidents:', err);
      setError('Failed to load incident data');
    } finally {
      setLoading(false);
    }
  };

  const processIncidents = (data) => {
    // Filter out incidents without valid coordinates
    const validIncidents = data.filter(incident => 
      incident.latitude && 
      incident.longitude && 
      !isNaN(parseFloat(incident.latitude)) && 
      !isNaN(parseFloat(incident.longitude))
    );
    
    setIncidents(validIncidents);
    
    // Set map center to the first incident location if available
    if (validIncidents.length > 0 && mapCenter[0] === 14.565307024431522) { // Only set on initial load
      setMapCenter([
        parseFloat(validIncidents[0].latitude),
        parseFloat(validIncidents[0].longitude)
      ]);
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
      'Under Review': { backgroundColor: '#a16207', color: 'white', borderColor: '#fde68a' }
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
  const incidentTypes = ['All', ...Object.keys(incidentTypeConfig)];

  const styles = {
    container: {
      minHeight: '100vh',
      
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      backgroundColor: '#ffffff',
      padding: '1.5rem 2rem',
      borderBottom: '1px solid #e5e7eb',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
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
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#1f2937',
      margin: 0
    },
    headerSubtitle: {
      fontSize: '1rem',
      color: '#6b7280',
      marginTop: '0.25rem'
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
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
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
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.875rem',
      backgroundColor: '#ffffff',
      boxShadow: 'none',
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
    },
    modalBackdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalContent: {
      background: 'white',
      padding: '2rem',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
      width: '400px',
    },
    colorInput: {
      width: '100%',
      height: '40px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      padding: '0.25rem',
      cursor: 'pointer',
      marginTop: '1rem',
    }
    ,
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '1rem',
      marginBottom: '1.5rem',
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0,
    },
    modalCloseBtn: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: '#9ca3af',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    formLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem',
    },
    modalInput: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
    },
    modalError: {
      color: '#ef4444',
      background: '#fee2e2',
      border: '1px solid #fca5a5',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      fontSize: '0.875rem',
      marginTop: '1rem',
    },
    modalFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      marginTop: '2rem',
      paddingTop: '1rem',
      borderTop: '1px solid #e5e7eb',
    },
    modalButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
    },
    cancelButton: { background: '#e5e7eb', color: '#374151' },
    addButton: { background: '#2563eb', color: 'white' },
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
      {showAddTypeModal && <AddTypeModal 
        styles={styles}
        closeAddTypeModal={closeAddTypeModal}
        handleAddIncidentType={handleAddIncidentType}
        newType={newType}
        handleNewTypeChange={handleNewTypeChange}
        addTypeError={addTypeError}
      />
      }
      
      {/* Header */}
      {!showOnlyMap && (
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div>
              <div>
                <h1 style={styles.headerTitle}>GIS Mapping</h1>
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
                onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                }}
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
                    <span>{type !== 'All' ? getIncidentConfig(type).icon : '📊'}</span>
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
              {Object.entries(incidentTypeConfig).map(([type, config]) => (
                <div key={type} style={styles.legendItem}>
                  <div 
                    style={{
                      ...styles.legendIcon,
                      background: `linear-gradient(135deg, ${config.color}, ${config.color}dd)`
                    }}
                  >
                    {config.icon}
                  </div>
                  <span style={{ fontWeight: '500', color: '#374151' }}>{type}</span>
                </div>
              ))}
              <button 
                onClick={() => setShowAddTypeModal(true)}
                style={{...styles.filterBtn, ...styles.inactiveFilter, marginTop: '1rem'}}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={16} /> Add New Type</div><ChevronDownIcon size={20} />
              </button>
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
<div style={{...styles.card, width: '1140px'}}>
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
            background: `linear-gradient(135deg, ${getIncidentConfig(incident.incident_type).color}, ${getIncidentConfig(incident.incident_type).color}dd)`
          }}>
            {getIncidentConfig(incident.incident_type).icon}
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
                  icon={createCustomIcon(getIncidentConfig(incident.incident_type).icon, getIncidentConfig(incident.incident_type).color)}
                >
                  <Popup>
                    <div className="incident-popup">
                      <h4>
                        {getIncidentConfig(incident.incident_type).icon} {incident.incident_type}
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