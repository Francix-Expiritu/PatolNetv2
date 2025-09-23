import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../config';
import './TouristSpotsList.css';

const TouristSpotsList = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSpotIndex, setCurrentSpotIndex] = useState(0);

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/tourist-spots`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setSpots(data);
      } catch (error) {
        console.error("Error fetching tourist spots:", error);
        setSpots([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSpots();
  }, []);

  const navigateSpot = (direction) => {
    if (spots.length === 0) return;
    setCurrentSpotIndex((prevIndex) => {
      if (direction === 'next') {
        return (prevIndex + 1) % spots.length;
      } else {
        return prevIndex === 0 ? spots.length - 1 : prevIndex - 1;
      }
    });
  };

  const goToSlide = (index) => {
    setCurrentSpotIndex(index);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Discovering amazing places...</p>
      </div>
    );
  }

  if (spots.length === 0) {
    return (
      <div className="empty-container">
        <div className="empty-icon">📍</div>
        <p className="empty-title">No Tourist Spots Available</p>
        <p className="empty-subtitle">Check back later for amazing destinations!</p>
      </div>
    );
  }

  const currentSpot = spots[currentSpotIndex];

  return (
    <div className="tourist-spots-container">
      {/* Animated background */}
      <div className="background-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`particle particle-${i % 3}`} />
        ))}
      </div>

      <div className="slider-wrapper">
        {/* Main slider card */}
        <div className="slider-card">
          
          {/* Image section */}
          <div className="image-section">
            <div className="image-overlay"></div>
            
            {/* Navigation buttons */}
            <button 
              className="nav-button nav-button-left" 
              onClick={() => navigateSpot('prev')}
            >
              <span className="nav-arrow">‹</span>
            </button>
            
            <button 
              className="nav-button nav-button-right" 
              onClick={() => navigateSpot('next')}
            >
              <span className="nav-arrow">›</span>
            </button>

            {/* Image */}
            <div className="image-container">
              {currentSpot.image ? (
                <img
                  src={`${BASE_URL}/uploads/${currentSpot.image}`}
                  alt={currentSpot.name}
                  className="spot-image"
                />
              ) : (
                <div className="image-placeholder">
                  <span className="placeholder-icon">🏞️</span>
                  <p>Beautiful Destination</p>
                </div>
              )}
            </div>

            {/* Slide indicators */}
            <div className="slide-indicators">
              {spots.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`indicator ${index === currentSpotIndex ? 'indicator-active' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Content section */}
          <div className="content-section">
            <div className="content-header">
              <h1 className="spot-title">{currentSpot.name}</h1>
              
              <div className="spot-badges">
                {currentSpot.rating && (
                  <div className="badge badge-rating">
                    <span className="badge-icon">⭐</span>
                    <span className="badge-text">{currentSpot.rating}</span>
                  </div>
                )}
                
                {currentSpot.visitTime && (
                  <div className="badge badge-time">
                    <span className="badge-icon">🕐</span>
                    <span className="badge-text">{currentSpot.visitTime}</span>
                  </div>
                )}
              </div>
            </div>

            <p className="spot-description">{currentSpot.description}</p>

            <div className="action-buttons">
              <button className="btn btn-primary">Plan Your Visit</button>
              <button className="btn btn-secondary">Learn More</button>
            </div>
          </div>
        </div>

        {/* Thumbnail navigation */}
        <div className="thumbnail-navigation">
          {spots.map((spot, index) => (
            <button
              key={spot.id || index}
              onClick={() => goToSlide(index)}
              className={`thumbnail ${index === currentSpotIndex ? 'thumbnail-active' : ''}`}
            >
              {spot.image ? (
                <img
                  src={`${BASE_URL}/uploads/${spot.image}`}
                  alt={spot.name}
                  className="thumbnail-image"
                />
              ) : (
                <div className="thumbnail-placeholder">
                  <span>📍</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TouristSpotsList;