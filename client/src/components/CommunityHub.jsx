import React, { useState, useEffect } from 'react';
import CommunityContentGrid from './CommunityContentGrid';
import './CommunityHub.css';
import { BASE_URL } from '../config';

const CommunityHub = ({ formatDate }) => {
  const [view, setView] = useState('activities');
  const [announcements, setAnnouncements] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);

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

  const filteredItems = (view === 'activities' ? activities : announcements).filter(item => {
    const matchesSearch = item.title.toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleShare = async (item) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`${item.title}\n${item.description}\n${window.location.href}`);
      alert('Link copied to clipboard!');
    }
  };

  const toggleCardExpand = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  return (
    <section className="community-hub">
      <div className="hub-container">
        <div className="hub-controls">
          <div className="search-container">
            
          </div>

          <div className="filter-tabs">
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search activities and announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
            <div className="tabs-wrapper">
              <button
                className={`tab-button ${view === 'activities' ? 'active' : ''}`}
                onClick={() => setView('activities')}
              >
                <span className="tab-icon">🎯</span>
                <span className="tab-text">Activities</span>
                <span className="tab-count">{activities.length}</span>
              </button>
              <button
                className={`tab-button ${view === 'announcements' ? 'active' : ''}`}
                onClick={() => setView('announcements')}
              >
                <span className="tab-icon">📢</span>
                <span className="tab-text">Announcements</span>
                <span className="tab-count">{announcements.length}</span>
              </button>
              <div className="tab-indicator"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Content */}
        <div className="hub-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-animation">
                <div className="loading-spinner-modern"></div>
                <div className="loading-dots">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
              <h3 className="loading-title">Loading {view}...</h3>
              <p className="loading-subtitle">Please wait while we fetch the latest information</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <CommunityContentGrid
              items={filteredItems}
              view={view}
              expandedCard={expandedCard}
              toggleCardExpand={toggleCardExpand}
              handleShare={handleShare}
              formatDate={formatDate}
            />
          ) : (
            <div className="empty-state">
              <div className="empty-animation">
                <div className="empty-icon">
                  {view === 'activities' ? '🎯' : '📢'}
                </div>
                <div className="empty-circles">
                  <div className="circle circle-1"></div>
                  <div className="circle circle-2"></div>
                  <div className="circle circle-3"></div>
                </div>
              </div>
              <h3 className="empty-title">
                No {view === 'activities' ? 'Activities' : 'Announcements'} Found
              </h3>
              <p className="empty-description">
                {searchTerm
                  ? 'Try adjusting your search terms or check back later'
                  : `No ${view} available at the moment. Check back soon for updates!`}
              </p>
              {searchTerm && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CommunityHub;