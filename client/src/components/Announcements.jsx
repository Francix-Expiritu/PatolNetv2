import React, { useState, useEffect } from 'react';
import GISMapping from "./GISmapping";
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
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.container}>
          <h1 style={styles.title}>Community Safety Dashboard</h1>
          <p style={styles.subtitle}>Real-time incident monitoring and community updates</p>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.container}>
          <div style={styles.mainGrid}>
            {/* Map Section */}
            <div style={styles.mapSection}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h2 style={styles.cardTitle}>Live Incident Map</h2>
                  <div style={styles.liveIndicator}>
                    <div style={styles.liveDot}></div>
                    <span style={styles.liveText}>Live</span>
                  </div>
                </div>
                <div style={styles.mapContainer}>
                  <GISMapping showOnlyMap={true} />
                </div>
                <div style={styles.mapStats}>
                  <div style={styles.statItem}>
                    <span style={styles.statNumber}>{incidents.length}</span>
                    <span style={styles.statLabel}>Total Incidents</span>
                  </div>
                  <div style={styles.statDivider}></div>
                  <div style={styles.statItem}>
                    <span style={styles.statNumber}>{incidents.filter(i => i.status === 'active').length}</span>
                    <span style={styles.statLabel}>Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div style={styles.infoSection}>
              {/* Risk Level */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Risk Level</h3>
                </div>
                <div style={styles.riskContent}>
                  <div style={{...styles.riskBadge, backgroundColor: riskLevel.color}}>
                    {riskLevel.level}
                  </div>
                  <p style={styles.riskDetail}>
                    {incidents.filter(i => i.status === 'active').length} active incidents
                  </p>
                </div>
              </div>

              {/* Latest Incident */}
              {recentIncident && (
                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>Latest Incident</h3>
                  </div>
                  <div style={styles.incidentContent}>
                    <div style={styles.incidentHeader}>
                      <span style={styles.incidentType}>{recentIncident.incident_type}</span>
                      <span style={{...styles.statusBadge, ...styles[recentIncident.status]}}>
                        {recentIncident.status}
                      </span>
                    </div>
                    <p style={styles.incidentTime}>{formatDate(recentIncident.datetime)}</p>
                    <p style={styles.incidentDescription}>{recentIncident.description}</p>
                    <p style={styles.responseTime}>Response time: {recentIncident.responsetime}</p>
                  </div>
                </div>
              )}

              {/* Statistics */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Incident Types</h3>
                </div>
                <div style={styles.statsContent}>
                  {Object.entries(getIncidentsByType()).map(([type, count]) => (
                    <div key={type} style={styles.statRow}>
                      <span style={styles.statType}>{type}</span>
                      <span style={styles.statCount}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Contacts */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Emergency Contacts</h3>
                </div>
                <div style={styles.contactsContent}>
                  <div style={styles.contactItem}>
                    <div>
                      <div style={styles.contactName}>Emergency Services</div>
                      <div style={styles.contactNumber}>911</div>
                    </div>
                    <button style={styles.callButton}>Call</button>
                  </div>
                  <div style={styles.contactItem}>
                    <div>
                      <div style={styles.contactName}>Local Emergency</div>
                      <div style={styles.contactNumber}>(02) 8888-0911</div>
                    </div>
                    <button style={styles.callButton}>Call</button>
                  </div>
                  <div style={styles.contactItem}>
                    <div>
                      <div style={styles.contactName}>Disaster Response</div>
                      <div style={styles.contactNumber}>(02) 911-1406</div>
                    </div>
                    <button style={styles.callButton}>Call</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Hub */}
      <div style={styles.communityWrapper}>
        <div style={styles.communityContainer}>
          <CommunityHub formatDate={formatDate} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '40px 0',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  mainContent: {
    flex: '1',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0,
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
    padding: '40px 0',
  },
  mapSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  liveDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#ef4444',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
  },
  liveText: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
  },
  mapContainer: {
    height: '400px',
    marginBottom: '16px',
  },
  mapStats: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
  },
  statDivider: {
    width: '1px',
    backgroundColor: '#e5e7eb',
  },
  riskContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 0',
  },
  riskBadge: {
    padding: '12px 32px',
    borderRadius: '8px',
    color: 'white',
    fontSize: '20px',
    fontWeight: '700',
  },
  riskDetail: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  incidentContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  incidentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incidentType: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  active: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  resolved: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  incidentTime: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },
  incidentDescription: {
    fontSize: '14px',
    color: '#374151',
    margin: 0,
    lineHeight: '1.5',
  },
  responseTime: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },
  statsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  statType: {
    fontSize: '14px',
    color: '#374151',
  },
  statCount: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
  },
  contactsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  contactItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  contactName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px',
  },
  contactNumber: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
  },
  callButton: {
    padding: '8px 16px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  communityWrapper: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e5e7eb',
    marginTop: '60px',
    paddingTop: '60px',
    paddingBottom: '60px',
  },
  communityContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    position: 'relative',
    zIndex: 1,
  },
};

// Add keyframes for pulse animation in a style tag
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @media (max-width: 768px) {
    div[style*="gridTemplateColumns: 2fr 1fr"] {
      grid-template-columns: 1fr !important;
    }
  }
`;
document.head.appendChild(styleSheet);