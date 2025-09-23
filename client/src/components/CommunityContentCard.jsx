import React from 'react';
import { BASE_URL } from '../config';

const CommunityContentCard = ({
  item,
  isExpanded,
  onToggleExpand,
  onShare,
  view,
  formatDate,
  animationDelay,
}) => {
  return (
    <div
      className={`content-card ${isExpanded ? 'expanded' : ''}`}
      style={{ animationDelay }}
    >
      {/* Card Image */}
      {item.image && (
        <div className="card-image-container">
          <img
            src={`${BASE_URL}/uploads/${item.image}`}
            alt={item.title}
            className="card-image"
            loading="lazy"
          />
          <div className="image-overlay">
            <div className="overlay-gradient"></div>
          </div>
        </div>
      )}

      {/* Card Header */}
      <div className="card-header">
        <div className="card-meta">
          <div className="meta-badge">
            <span className="badge-icon">
              {view === 'activities' ? '🎯' : '📢'}
            </span>
            <span className="badge-text">
              {view === 'activities' ? 'Activity' : 'Announcement'}
            </span>
          </div>
          <div className="card-date">{formatDate(item.date)}</div>
        </div>
      </div>

      {/* Card Content */}
      <div className="card-body">
        <h3 className="card-title">{item.title}</h3>

        <p className="card-description">
          {isExpanded
            ? item.description
            : item.description.length > 120
            ? `${item.description.substring(0, 120)}...`
            : item.description}
        </p>

        {/* Activity Specific Info */}
        {view === 'activities' && (
          <div className="activity-details">
            {item.location && (
              <div className="detail-item">
                <svg
                  className="detail-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>{item.location}</span>
              </div>
            )}
            {item.time && (
              <div className="detail-item">
                <svg
                  className="detail-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z" />
                </svg>
                <span>{item.time}</span>
              </div>
            )}
          </div>
        )}

        {/* Posted By for Announcements */}
        {view === 'announcements' && item.posted_by && (
          <div className="posted-by">
            <div className="author-avatar">
              {item.posted_by.charAt(0).toUpperCase()}
            </div>
            <span className="author-name">By {item.posted_by}</span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="card-actions">
        <button
          className="action-btn expand-btn"
          onClick={() => onToggleExpand(item._id)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d={
                isExpanded
                  ? 'M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z'
                  : 'M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z'
              }
            />
          </svg>
          {isExpanded ? 'Show Less' : 'Read More'}
        </button>

        <button className="action-btn share-btn" onClick={() => onShare(item)}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
};

export default CommunityContentCard;