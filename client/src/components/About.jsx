import React, { useEffect } from 'react';
import './About.css';

const About = () => {
  useEffect(() => {
    const isInViewport = (element) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
        rect.bottom >= 0
      );
    };

    const handleScrollAnimation = () => {
      const featureBlocks = document.querySelectorAll('.feature-block, .timeline-item');
      featureBlocks.forEach((block) => {
        if (isInViewport(block) && !block.classList.contains('animated')) {
          block.classList.add('animated');
        }
      });
    };

    handleScrollAnimation();
    window.addEventListener('scroll', handleScrollAnimation);
    return () => window.removeEventListener('scroll', handleScrollAnimation);
  }, []);

  return (
    <>
      <section className="about-section">
        <div className="about-header about-header-background">
          <h1>About Us</h1>
          <p>
            PatrolNet is dedicated to building safer communities by connecting residents and local authorities through
            instant, efficient, and reliable incident reporting.
          </p>
        </div>

        <div className="about-content-wrapper">

        <div className="feature-block">
          <div className="feature-text">
            <h2>Instant Incident Reporting for Safer Communities</h2>
            <p>
              PatrolNet is a powerful web and mobile application designed to enhance community safety by enabling
              residents to instantly report accidents and incidents directly to their barangay. With just a few taps,
              vital information reaches local authorities, allowing them to respond quickly and effectively.
            </p>
          </div>
          <div className="feature-image">
            <div className="image-container">
              <img src="patrol1.jpg" alt="Instant Notification" />
              <div className="image-overlay">
                <h3>Innovation</h3>
                <p>Real-time alerts</p>
              </div>
            </div>
          </div>
        </div>

        <div className="feature-block reverse">
          <div className="feature-text">
            <h2>Designed for Barangays, Powered by Technology</h2>
            <p>
              Built with the specific needs of barangays in mind, PatrolNet bridges the gap between grassroots community
              efforts and modern digital tools.
            </p>
          </div>
          <div className="feature-image">
            <div className="image-container">
              <img src="patrol2.jpg" alt="Community Focused" />
              <div className="image-overlay">
                <h3>Precision</h3>
                <p>Localized solutions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="feature-block">
          <div className="feature-text">
            <h2>Empowering Action Through Information</h2>
            <p>
              PatrolNet ensures that every report submitted by residents is quickly relayed to the appropriate barangay
              personnel. The platform streamlines incident handling, increases awareness, and encourages a culture of
              cooperation.
            </p>
          </div>
          <div className="feature-image">
            <div className="image-container">
              <img src="patrol3.jpg" alt="Team at Work" />
              <div className="image-overlay">
                <h3>Expertise</h3>
                <p>Community-driven design</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Timeline for History */}
        <div className="section-separator"></div>
        <div className="history-section">
          <h2>Our History</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-content">
                <span className="year">2025</span>
                <p>PatrolNet was launched to address the growing need for faster, tech-driven community safety tools.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-content">
                <span className="year">2026</span>
                <p>First partnerships formed with multiple barangays, leading to improved emergency response rates.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-content">
                <span className="year">Today</span>
                <p>PatrolNet continues to expand, serving communities with cutting-edge solutions for public safety.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Showcase Section */}
        <div className="application-showcase-section">
          <h2>Application Showcase</h2>
          <p>Here's a glimpse of the PatrolNet application in action.</p>
          <div className="showcase-images">
            <div className="showcase-image">
              <img src="Alert.png" alt="Application Screenshot 1" />
              <div className="image-caption">
                <h3>Real-time Alerts</h3>
                <p>Receive instant notifications about incidents in your area.</p>
              </div>
            </div>
            <div className="showcase-image">
              <img src="Alert2.jpg" alt="Application Screenshot 2" />
              <div className="image-caption">
                <h3>Detailed Reports</h3>
                <p>View detailed incident reports with images and locations.</p>
              </div>
            </div>
            <div className="showcase-image">
              <img src="Alert3.jpg" alt="Application Screenshot 3" />
              <div className="image-caption">
                <h3>Easy Navigation</h3>
                <p>Navigate through the app with a user-friendly interface.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Download App Section */}
        <div className="download-app-section">
          <h2>Download the PatrolNet App</h2>
          <p>Stay connected and report incidents on the go. Download our mobile app for real-time alerts and seamless communication.</p>
          <a href="#" className="download-btn">Download Now</a>
        </div>
      </div>
      </section>

      <footer className="about-footer">
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
};

export default About;