import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "axios";
import "./Activities.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BASE_URL } from '../config';

export default function Activities() {
  const [activities, setActivities] = useState([]);

  // Image slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 1000,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false
  };

  const sliderImages = ["/slide.jpg", "/slide3.jpg", "/slide4.jpg"];

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/activities`);
      setActivities(response.data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  return (
    <>
      <div className="activities-page">
        {/* 🔹 Sliding Header */}
        <div className="slider-container">
          <Slider {...sliderSettings}>
            {sliderImages.map((img, index) => (
              <div key={index}>
                <img src={img} alt={`Slide ${index}`} className="slider-image" />
              </div>
            ))}
          </Slider>
        </div>

        {/* 🔹 Main Content */}
        <div className="activities-content">
          <div className="activities-left">
            <h2 className="section-title">Latest Activities</h2>
            <div className="activities-grid">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity._id} className="activity-card">
                    {activity.image && (
                      <img
                        src={`${BASE_URL}/uploads/${activity.image}`}
                        alt={activity.title}
                        className="activity-card-image"
                      />
                    )}
                    <div className="activity-card-content">
                      <span className="activity-date">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                      <h3 className="activity-card-title">{activity.title}</h3>
                      <p>{activity.description}</p>
                      <a href="/" className="read-more-btn">
                        Read More
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <p>No activities available yet.</p>
              )}
            </div>
          </div>

          {/* 🔹 Sidebar (unchanged) */}
          <div className="activities-right">
            <div className="popular-news">
              <h3>POPULAR NEWS</h3>
              <div className="news-item">
                <a href="/">Laguna LGU Launches New Waste Management Program</a>
                <span className="news-date">August 5, 2025</span>
              </div>
              <div className="news-item">
                <a href="/">Pagsanjan Falls Tourism Sees Boost After Infrastructure Upgrades</a>
                <span className="news-date">July 28, 2025</span>
              </div>
              <div className="news-item">
                <a href="/">Calamba City Hosts Successful Youth Sports Festival</a>
                <span className="news-date">August 1, 2025</span>
              </div>
              <div className="news-item">
                <a href="/">New Road Network Project to Ease Traffic in Santa Rosa</a>
                <span className="news-date">July 20, 2025</span>
              </div>
            </div>

            <div className="facebook-widget">
              <h3>FOLLOW US ON FACEBOOK</h3>
              <a
                href="https://www.facebook.com/PatrolNet"
                target="_blank"
                rel="noopener noreferrer"
                className="facebook-link"
              >
                <img src="/logo.png" alt="Facebook Page" className="facebook-logo" />
                <span>Visit our Facebook Page</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <footer className="activities-footer">
        <div className="footer-content">
          <p>&copy; 2025 PatrolNet. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact Us</a>
          </div>
          <div className="social-media">
            <a href="#facebook" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#twitter" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            <a href="#linkedin" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>
      </footer>
    </>
  );
}
