import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../config';

const CommunityHub = ({ formatDate }) => {
  const [activeTab, setActiveTab] = useState('activities');
  const [searchTerm, setSearchTerm] = useState('');
  const [activities, setActivities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [activitiesRes, announcementsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/activities`),
          fetch(`${BASE_URL}/api/announcements`)
        ]);

        if (!activitiesRes.ok) throw new Error(`HTTP error fetching activities! status: ${activitiesRes.status}`);
        if (!announcementsRes.ok) throw new Error(`HTTP error fetching announcements! status: ${announcementsRes.status}`);

        const activitiesData = await activitiesRes.json();
        const announcementsData = await announcementsRes.json();

        setActivities(activitiesData);
        setAnnouncements(announcementsData);

      } catch (error) {
        console.error("Error fetching data:", error);
        setActivities([]);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentItems = activeTab === 'activities' ? activities : announcements;
  
  const filteredItems = currentItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShare = async (item) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(`${item.title}\n${item.description}`);
      alert('Copied to clipboard!');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Assuming imagePath is just the filename, construct the full URL.
    return `${BASE_URL}/uploads/${imagePath}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <header style={styles.header}>
          <h1 style={styles.title}>Community Hub</h1>
          <p style={styles.subtitle}>Stay connected with local events and important updates</p>
        </header>

        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <div style={styles.searchWrapper}>
            <svg style={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={styles.clearButton}>
                ×
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabsContainer}>
          <button
            onClick={() => setActiveTab('activities')}
            style={{
              ...styles.tab,
              ...(activeTab === 'activities' ? styles.tabActive : {})
            }}
          >
            Activities ({activities.length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            style={{
              ...styles.tab,
              ...(activeTab === 'announcements' ? styles.tabActive : {})
            }}
          >
            Announcements ({announcements.length})
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner} />
              <p style={styles.loadingText}>Loading...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div style={styles.grid}>
              {filteredItems.map((item) => (
                <div key={item.id} style={styles.card}>
                  {item.image && (
                    <div style={styles.imageContainer}>
                      <img 
                        src={getImageUrl(item.image)} 
                        alt={item.title}
                        style={styles.image}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div style={styles.cardContent}>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.cardTitle}>{item.title}</h3>
                      {activeTab === 'announcements' && item.priority === 'high' && (
                        <span style={styles.badge}>Important</span>
                      )}
                      {activeTab === 'activities' && item.category && (
                        <span style={styles.categoryBadge}>{item.category}</span>
                      )}
                    </div>
                    <p style={styles.cardDescription}>{item.description}</p>
                    <div style={styles.cardFooter}>
                      <span style={styles.date}>
                        {formatDate ? formatDate(item.date) : new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => handleShare(item)}
                        style={styles.shareButton}
                        title="Share"
                      >
                        <svg style={styles.shareIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="18" cy="5" r="3" />
                          <circle cx="6" cy="12" r="3" />
                          <circle cx="18" cy="19" r="3" />
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                {activeTab === 'activities' ? '📅' : '📢'}
              </div>
              <h3 style={styles.emptyTitle}>
                {searchTerm ? 'No results found' : `No ${activeTab} available`}
              </h3>
              <p style={styles.emptyText}>
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : `Check back later for new ${activeTab}`}
              </p>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} style={styles.clearSearchButton}>
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '24px 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  wrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0,
  },
  searchContainer: {
    marginBottom: '24px',
  },
  searchWrapper: {
    position: 'relative',
    maxWidth: '600px',
    margin: '0 auto',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '20px',
    color: '#999',
  },
  searchInput: {
    width: '100%',
    padding: '14px 48px 14px 48px',
    fontSize: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  clearButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '28px',
    height: '28px',
    border: 'none',
    background: '#f0f0f0',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '20px',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
  tabsContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '32px',
    borderBottom: '2px solid #e0e0e0',
    justifyContent: 'center',
  },
  tab: {
    padding: '12px 32px',
    fontSize: '15px',
    fontWeight: '500',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#666',
    borderBottom: '3px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: '#2563eb',
    borderBottomColor: '#2563eb',
  },
  content: {
    minHeight: '400px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'box-shadow 0.2s, transform 0.2s',
    cursor: 'default',
  },
  imageContainer: {
    width: '100%',
    height: '200px',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardContent: {
    padding: '24px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '12px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: 0,
    flex: 1,
  },
  badge: {
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '6px',
    flexShrink: 0,
  },
  categoryBadge: {
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#e0f2fe',
    color: '#0284c7',
    borderRadius: '6px',
    flexShrink: 0,
  },
  cardDescription: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6',
    margin: '0 0 16px 0',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #f0f0f0',
  },
  date: {
    fontSize: '13px',
    color: '#999',
  },
  shareButton: {
    padding: '8px',
    border: 'none',
    background: '#f8f9fa',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  shareIcon: {
    width: '18px',
    height: '18px',
    color: '#666',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f0f0f0',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    fontSize: '15px',
    color: '#666',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 8px 0',
  },
  emptyText: {
    fontSize: '15px',
    color: '#666',
    margin: '0 0 24px 0',
  },
  clearSearchButton: {
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#2563eb',
    backgroundColor: 'white',
    border: '2px solid #2563eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

// Add keyframe animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  input:focus {
    border-color: #2563eb !important;
  }
  
  button:hover {
    opacity: 0.8;
  }
  
  div[style*="backgroundColor: white"]:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    transform: translateY(-2px) !important;
  }
`;
document.head.appendChild(styleSheet);

export default CommunityHub;