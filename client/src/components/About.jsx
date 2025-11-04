import React, { useState, useEffect } from 'react';
// To implement translations, you would first install react-i18next:
// npm install react-i18next i18next
import { useTranslation, Trans } from 'react-i18next';
import './About.css';

const About = () => {
  const [activeTab, setActiveTab] = useState('mission');
  const [isVisible, setIsVisible] = useState({});
  const { t, i18n } = useTranslation();

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
    { number: '50K+', labelKey: 'stats.activeUsers' },
    { number: '200+', labelKey: 'stats.barangaysServed' },
    { number: '99.9%', labelKey: 'stats.uptime' },
    { number: '24/7', labelKey: 'stats.support' }
  ];

  const features = [
    {
      icon: '🚨',
      titleKey: 'features.realTimeAlerts.title',
      descriptionKey: 'features.realTimeAlerts.description'
    },
    {
      icon: '📱',
      titleKey: 'features.mobileFirst.title',
      descriptionKey: 'features.mobileFirst.description'
    },
    {
      icon: '🎯',
      titleKey: 'features.preciseLocation.title',
      descriptionKey: 'features.preciseLocation.description'
    },
    {
      icon: '🤝',
      titleKey: 'features.communityDriven.title',
      descriptionKey: 'features.communityDriven.description'
    }
  ];

  const sectionTitleStyle = {
    fontSize: '2.5rem',
    color: 'black',
    fontWeight: 'bold', 
    backgroundColor: 'transparent',
  };

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="language-switcher">
              <button onClick={() => i18n.changeLanguage('en')} className={i18n.language === 'en' ? 'active' : ''}>EN</button>
              <button onClick={() => i18n.changeLanguage('tl')} className={i18n.language === 'tl' ? 'active' : ''}>TL</button>
            </div>
            <h1 className="hero-title">
              <Trans i18nKey="hero.title">
                Building <span className="highlight">Safer</span> Communities
              </Trans>
            </h1>
            <p className="hero-subtitle">
              {t('hero.subtitle')}
            </p>
            <div className="hero-buttons">
              {/* These buttons are likely for navigation, text can be translated if needed */}
              <button className="btn btn-primary">{t('hero.getStarted')}</button>
              <button className="btn btn-secondary">{t('hero.learnMore')}</button>
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
                <div className="stat-label">{t(stat.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <h2 className="section-title" style={sectionTitleStyle}>{t('purpose.title')}</h2>
          
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
                  <h3>{t('purpose.mission.title')}</h3>
                  <p>{t('purpose.mission.text')}</p>
                </div>
              )}
              
              {activeTab === 'vision' && (
                <div className="content-panel">
                  <h3>{t('purpose.vision.title')}</h3>
                  <p>{t('purpose.vision.text')}</p>
                </div>
              )}
              
              {activeTab === 'values' && (
                <div className="content-panel">
                  <h3>{t('purpose.values.title')}</h3>
                  <div className="values-grid">
                    <div className="value-item">
                      <strong>{t('purpose.values.community.title')}</strong>
                      <p>{t('purpose.values.community.text')}</p>
                    </div>
                    <div className="value-item">
                      <strong>{t('purpose.values.innovation.title')}</strong>
                      <p>{t('purpose.values.innovation.text')}</p>
                    </div>
                    <div className="value-item">
                      <strong>{t('purpose.values.transparency.title')}</strong>
                      <p>{t('purpose.values.transparency.text')}</p>
                    </div>
                    <div className="value-item">
                      <strong>{t('purpose.values.reliability.title')}</strong>
                      <p>{t('purpose.values.reliability.text')}</p>
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
          <h2 className="section-title" style={sectionTitleStyle}>{t('features.mainTitle')}</h2>
          <div className={`features-grid ${isVisible.features ? 'visible' : ''}`}>
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{t(feature.titleKey)}</h3>
                <p className="feature-description">{t(feature.descriptionKey)}</p>
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
              <h2>{t('preview.title')}</h2>
              <p>{t('preview.subtitle')}</p>
              
              <div className="feature-list">
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>{t('preview.feature1')}</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>{t('preview.feature2')}</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>{t('preview.feature3')}</span>
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
            <h2>{t('cta.title')}</h2>
            <p>{t('cta.subtitle')}</p>
            <div className="cta-buttons">
              <button className="btn btn-primary">{t('cta.download')}</button>
              <button className="btn btn-outline">{t('cta.contact')}</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;