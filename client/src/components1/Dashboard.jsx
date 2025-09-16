import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [incidentCount, setIncidentCount] = useState(0);
  const [schedulingCount, setSchedulingCount] = useState(0);
  const [gisMappingCount, setGisMappingCount] = useState(0);
  const [patrolLogsCount, setPatrolLogsCount] = useState(0);
  const [activitiesCount, setActivitiesCount] = useState(0);
  const [accountsCount, setAccountsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        
        // You need to define BASE_URL - uncomment and adjust this line:
        const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3001';
        
        // Fetch Incident Count
        const incidentRes = await fetch(`${BASE_URL}/api/incidents`);
        const incidentData = await incidentRes.json();
        setIncidentCount(incidentData.length); // Assuming incidents is an array

        // Fetch Scheduling Count
        const schedulingRes = await fetch(`${BASE_URL}/api/schedules/count`);
        const schedulingData = await schedulingRes.json();
        setSchedulingCount(schedulingData.count);

        // Fetch GIS Mapping Count
        const gisMappingRes = await fetch(`${BASE_URL}/api/gis/count`);
        const gisMappingData = await gisMappingRes.json();
        setGisMappingCount(gisMappingData.count);

        // Fetch Patrol Logs Count
        const patrolLogsRes = await fetch(`${BASE_URL}/api/patrollogs/count`);
        const patrolLogsData = await patrolLogsRes.json();
        setPatrolLogsCount(patrolLogsData.count);

        // Fetch Activities Count
        const activitiesRes = await fetch(`${BASE_URL}/api/activities/count`);
        const activitiesData = await activitiesRes.json();
        setActivitiesCount(activitiesData.count);

        // Fetch Accounts Count
        const accountsRes = await fetch(`${BASE_URL}/api/accounts/count`);
        const accountsData = await accountsRes.json();
        setAccountsCount(accountsData.count);
        
        setLoading(false);

      } catch (error) {
        console.error("Error fetching counts:", error);
        setLoading(false);
        // Set default values on error
        setIncidentCount(0);
        setSchedulingCount(0);
        setGisMappingCount(0);
        setPatrolLogsCount(0);
        setActivitiesCount(0);
        setAccountsCount(0);
      }
    };

    fetchCounts();
  }, []);

  const handleCardClick = (route) => {
    // In a real app, this would use React Router's useNavigate
    console.log(`Navigating to: ${route}`);
    alert(`Would navigate to: ${route}`);
  };

  const dashboardCards = [
    {
      id: 1,
      title: 'Incident Reports',
      icon: '🚨',
      count: incidentCount,
      route: '/incident-report',
      description: 'Monitor and manage all reported incidents in real-time',
      color: 'red',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Scheduling & Assessment',
      icon: '🗓️',
      count: schedulingCount,
      route: '/scheduling',
      description: 'Coordinate patrol schedules and security assessments',
      color: 'blue',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'GIS Mapping',
      icon: '🗺️',
      count: gisMappingCount,
      route: '/gis-mapping',
      description: 'Visualize incidents and patrol routes on interactive maps',
      color: 'green',
      priority: 'medium'
    },
    {
      id: 4,
      title: 'Patrol Logs',
      icon: '📝',
      count: patrolLogsCount,
      route: '/patrol-logs',
      description: 'Review and analyze daily patrol activities and reports',
      color: 'purple',
      priority: 'medium'
    },
    {
      id: 5,
      title: 'Activities',
      icon: '⭐',
      count: activitiesCount,
      route: '/activities',
      description: 'Manage community activities and public announcements',
      color: 'orange',
      priority: 'low'
    },
    {
      id: 6,
      title: 'Accounts Management',
      icon: '👥',
      count: accountsCount,
      route: '/accounts',
      description: 'Oversee all user accounts, roles, and permissions',
      color: 'teal',
      priority: 'high'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: 0,
      margin: 0
    }}>
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        padding: '3rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.4
        }} />
        
        <div style={{
          width: '100%',
          margin: '0',
          padding: '0 2rem',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50px',
            padding: '1rem 2rem',
            marginBottom: '1.5rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <span style={{ fontSize: '2rem', marginRight: '1rem' }}>🧑‍💼</span>
            <h1 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: '700',
              margin: 0,
              background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              BarangayWatch Admin Panel
            </h1>
          </div>
          
          <p style={{
            fontSize: '1.125rem',
            opacity: 0.9,
            margin: '0 auto',
            maxWidth: '600px',
            lineHeight: 1.6,
            fontWeight: '400'
          }}>
            Comprehensive administrative dashboard for managing community safety, user accounts, and barangay operations
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        width: '100%',
        margin: '0',
        padding: '3rem 2rem'
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid #f1f5f9',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '1.5rem'
            }} />
            <p style={{
              fontSize: '1.125rem',
              color: '#64748b',
              fontWeight: '500',
              margin: 0
            }}>
              Loading dashboard data...
            </p>
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {dashboardCards.map((card, index) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.route)}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `slideUp 0.6s ease-out ${index * 0.1}s both`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.borderColor = getColorValue(card.color, 300);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                {/* Priority Indicator */}
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: card.priority === 'high' ? '#ef4444' : card.priority === 'medium' ? '#f59e0b' : '#10b981'
                }} />

                {/* Card Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      fontSize: '2rem',
                      padding: '0.5rem',
                      background: `linear-gradient(135deg, ${getColorValue(card.color, 50)} 0%, ${getColorValue(card.color, 100)} 100%)`,
                      borderRadius: '12px',
                      border: `1px solid ${getColorValue(card.color, 200)}`
                    }}>
                      {card.icon}
                    </div>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: 0
                    }}>
                      {card.title}
                    </h3>
                  </div>

                  <div style={{
                    background: `linear-gradient(135deg, ${getColorValue(card.color, 500)} 0%, ${getColorValue(card.color, 600)} 100%)`,
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    minWidth: '60px',
                    textAlign: 'center',
                    boxShadow: `0 4px 14px 0 ${getColorValue(card.color, 500)}33`
                  }}>
                    {card.count}
                  </div>
                </div>

                {/* Card Description */}
                <p style={{
                  color: '#6b7280',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {card.description}
                </p>

                {/* Hover Effect Background */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${getColorValue(card.color, 50)}40 0%, ${getColorValue(card.color, 100)}40 100%)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                }} />
              </div>
            ))}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (max-width: 768px) {
            div[style*="grid-template-columns"] {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
            }
          }
        `}
      </style>
    </div>
  );
}

// Helper function to get color values
function getColorValue(color, shade) {
  const colors = {
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      500: '#ef4444',
      600: '#dc2626'
    },
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      500: '#3b82f6',
      600: '#2563eb'
    },
    green: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      500: '#22c55e',
      600: '#16a34a'
    },
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      500: '#8b5cf6',
      600: '#7c3aed'
    },
    orange: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      500: '#f97316',
      600: '#ea580c'
    },
    teal: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      500: '#14b8a6',
      600: '#0d9488'
    }
  };
  
  return colors[color]?.[shade] || colors.blue[shade];
}

export default Dashboard;