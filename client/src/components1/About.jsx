import React, { useState, useEffect } from 'react';
import './About.css';

const About = () => {
  const [activeTab, setActiveTab] = useState('mission');
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '200+', label: 'Barangays Served' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ];

  const features = [
    {
      icon: '🚨',
      title: 'Real-Time Alerts',
      description: 'Instant notifications keep communities informed and prepared'
    },
    {
      icon: '📱',
      title: 'Mobile-First Design',
      description: 'Seamless experience across all devices and platforms'
    },
    {
      icon: '🎯',
      title: 'Precise Location',
      description: 'GPS-enabled reporting for accurate incident mapping'
    },
    {
      icon: '🤝',
      title: 'Community Driven',
      description: 'Built for barangays, by people who understand communities'
    }
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Building <span className="highlight">Safer</span> Communities
            </h1>
            <p className="hero-subtitle">
              Connecting residents with local authorities through innovative technology
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary">Get Started</button>
              <button className="btn btn-secondary">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" data-animate id="stats">
        <div className="container">
          <div className={`stats-grid ${isVisible.stats ? 'visible' : ''}`}>
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <h2 className="section-title">Our Purpose</h2>
          
          <div className="tabs">
            <div className="tab-nav">
              {['mission', 'vision', 'values'].map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="tab-content">
              {activeTab === 'mission' && (
                <div className="content-panel">
                  <h3>Our Mission</h3>
                  <p>To empower communities with cutting-edge technology that enables rapid response to incidents and fosters a culture of collective safety and vigilance.</p>
                </div>
              )}
              
              {activeTab === 'vision' && (
                <div className="content-panel">
                  <h3>Our Vision</h3>
                  <p>A world where every community is equipped with the tools they need to ensure the safety and well-being of all residents through seamless digital communication.</p>
                </div>
              )}
              
              {activeTab === 'values' && (
                <div className="content-panel">
                  <h3>Our Values</h3>
                  <div className="values-grid">
                    <div className="value-item">
                      <strong>Community First</strong>
                      <p>Every decision is made with community benefit in mind</p>
                    </div>
                    <div className="value-item">
                      <strong>Innovation</strong>
                      <p>Continuous improvement through technology</p>
                    </div>
                    <div className="value-item">
                      <strong>Transparency</strong>
                      <p>Open communication and honest practices</p>
                    </div>
                    <div className="value-item">
                      <strong>Reliability</strong>
                      <p>Dependable service when it matters most</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" data-animate id="features">
        <div className="container">
          <h2 className="section-title">What Makes Us Different</h2>
          <div className={`features-grid ${isVisible.features ? 'visible' : ''}`}>
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="preview-section" data-animate id="preview">
        <div className="container">
          <div className="preview-content">
            <div className="preview-text">
              <h2>Experience PatrolNet</h2>
              <p>See how our intuitive interface makes community safety accessible to everyone</p>
              
              <div className="feature-list">
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>One-tap incident reporting</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Real-time status updates</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Community incident map</span>
                </div>
              </div>
            </div>

            <div className="preview-visual">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <div className="app-header">PatrolNet</div>
                  <div className="app-content">
                    <div className="incident-item emergency">
                      <div className="incident-icon">🚨</div>
                      <div className="incident-details">
                        <div className="incident-type">Emergency Alert</div>
                        <div className="incident-location">Barangay Center</div>
                      </div>
                      <div className="status active">Active</div>
                    </div>
                    
                    <div className="incident-item resolved">
                      <div className="incident-icon">✅</div>
                      <div className="incident-details">
                        <div className="incident-type">Traffic Issue</div>
                        <div className="incident-location">Main Street</div>
                      </div>
                      <div className="status resolved">Resolved</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Make Your Community Safer?</h2>
            <p>Join thousands of residents already using PatrolNet to build stronger, safer neighborhoods</p>
            <div className="cta-buttons">
              <button className="btn btn-primary">Download App</button>
              <button className="btn btn-outline">Contact Us</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;