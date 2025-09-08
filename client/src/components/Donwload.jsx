import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { 
  FaDownload, 
  FaMobileAlt, 
  FaShieldAlt, 
  FaUserPlus, 
  FaPlay, 
  FaAndroid, 
  FaApple, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaQuestionCircle,
  FaRocket
} from 'react-icons/fa';

function DownloadInstructions() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Download the App",
      icon: <FaDownload />,
      color: "#3b82f6",
      content: "Get the latest version of PatrolNet for your device"
    },
    {
      id: 2,
      title: "Install the App",
      icon: <FaMobileAlt />,
      color: "#10b981",
      content: "Follow simple installation steps for your platform"
    },
    {
      id: 3,
      title: "Create Account",
      icon: <FaUserPlus />,
      color: "#f59e0b",
      content: "Set up your PatrolNet account or log in"
    },
    {
      id: 4,
      title: "Start Patrolling",
      icon: <FaRocket />,
      color: "#8b5cf6",
      content: "Begin using all PatrolNet features"
    }
  ];

  return (
    <div className="download-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <FaShieldAlt className="badge-icon" />
            <span>PatrolNet Mobile App</span>
          </div>
          <h1>Get Started with PatrolNet</h1>
          <p>Download our powerful community patrol management app and join thousands of users keeping their neighborhoods safe.</p>
          
          {/* Download Buttons */}
          <div className="download-buttons">
            <button className="download-btn android">
              <FaAndroid className="btn-icon" />
              <div className="btn-content">
                <span className="btn-text">Download for</span>
                <strong>Android</strong>
              </div>
            </button>
            <button className="download-btn ios">
              <FaApple className="btn-icon" />
              <div className="btn-content">
                <span className="btn-text">Download for</span>
                <strong>iOS</strong>
              </div>
            </button>
          </div>
          
          <div className="download-note">
            <FaCheckCircle className="note-icon" />
            <span>Free download • No subscription required • Secure & trusted</span>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="phone-mockup">
            <div className="phone-screen">
              <div className="app-preview">
                <div className="app-header">
                  <div className="app-logo">
                    <FaShieldAlt />
                  </div>
                  <span>PatrolNet</span>
                </div>
                <div className="app-features">
                  <div className="feature-dot active"></div>
                  <div className="feature-dot"></div>
                  <div className="feature-dot"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="steps-section">
        <div className="section-header">
          <h2>Easy Setup in 4 Steps</h2>
          <p>Get up and running with PatrolNet in just a few minutes</p>
        </div>

        {/* Step Navigation */}
        <div className="step-navigation">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div 
                className={`step-indicator ${activeStep >= step.id ? 'active' : ''}`}
                onClick={() => setActiveStep(step.id)}
                style={activeStep >= step.id ? { backgroundColor: step.color } : {}}
              >
                <div className="step-icon">
                  {step.icon}
                </div>
                <div className="step-info">
                  <span className="step-number">Step {step.id}</span>
                  <h4>{step.title}</h4>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`step-connector ${activeStep > step.id ? 'completed' : ''}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="step-content">
          {activeStep === 1 && (
            <div className="step-details">
              <div className="step-visual">
                <div className="download-illustration">
                  <FaDownload className="illustration-icon" />
                </div>
              </div>
              <div className="step-info-detailed">
                <h3>Download PatrolNet</h3>
                <p>Choose your platform and download the latest version of PatrolNet. Our app is available for both Android and iOS devices.</p>
                
                <div className="platform-options">
                  <div className="platform-card">
                    <FaAndroid className="platform-icon android-color" />
                    <div>
                      <h5>Android (APK)</h5>
                      <p>Compatible with Android 7.0+</p>
                      <span className="file-size">~25 MB</span>
                    </div>
                    <button className="platform-btn">Download</button>
                  </div>
                  
                  <div className="platform-card">
                    <FaApple className="platform-icon ios-color" />
                    <div>
                      <h5>iOS (App Store)</h5>
                      <p>Compatible with iOS 12.0+</p>
                      <span className="file-size">~30 MB</span>
                    </div>
                    <button className="platform-btn">Download</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="step-details">
              <div className="step-visual">
                <div className="install-illustration">
                  <FaMobileAlt className="illustration-icon" />
                </div>
              </div>
              <div className="step-info-detailed">
                <h3>Install the Application</h3>
                <p>Follow the installation process for your device. Don't worry, we'll guide you through each step.</p>
                
                <div className="install-tabs">
                  <div className="install-tab active">
                    <FaAndroid />
                    <span>Android Installation</span>
                  </div>
                </div>
                
                <div className="install-steps">
                  <div className="install-step">
                    <div className="step-number-small">1</div>
                    <div>
                      <h5>Open the downloaded APK file</h5>
                      <p>Tap on the downloaded file in your notifications or file manager</p>
                    </div>
                  </div>
                  <div className="install-step">
                    <div className="step-number-small">2</div>
                    <div>
                      <h5>Enable Unknown Sources</h5>
                      <p>If prompted, go to Settings Security Install unknown apps</p>
                    </div>
                  </div>
                  <div className="install-step">
                    <div className="step-number-small">3</div>
                    <div>
                      <h5>Complete Installation</h5>
                      <p>Follow the on-screen prompts to finish installing PatrolNet</p>
                    </div>
                  </div>
                </div>

                <div className="warning-box">
                  <FaExclamationTriangle className="warning-icon" />
                  <div>
                    <h5>Security Notice</h5>
                    <p>Only download PatrolNet from official sources to ensure your device security.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="step-details">
              <div className="step-visual">
                <div className="account-illustration">
                  <FaUserPlus className="illustration-icon" />
                </div>
              </div>
              <div className="step-info-detailed">
                <h3>Set Up Your Account</h3>
                <p>Create your PatrolNet account to access all features and connect with your community.</p>
                
                <div className="account-options">
                  <div className="account-option">
                    <div className="option-header">
                      <h5>New User</h5>
                      <span className="recommended-badge">Recommended</span>
                    </div>
                    <p>Create a new account with your email and set up your profile</p>
                    <ul>
                      <li>Personal profile setup</li>
                      <li>Community verification</li>
                      <li>Role assignment</li>
                    </ul>
                  </div>
                  
                  <div className="account-option">
                    <div className="option-header">
                      <h5>Existing User</h5>
                    </div>
                    <p>Already have an account? Simply log in with your credentials</p>
                    <ul>
                      <li>Quick login process</li>
                      <li>Sync your data</li>
                      <li>Resume activities</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="step-details">
              <div className="step-visual">
                <div className="start-illustration">
                  <FaRocket className="illustration-icon" />
                </div>
              </div>
              <div className="step-info-detailed">
                <h3>Start Using PatrolNet</h3>
                <p>You're all set! Explore PatrolNet's powerful features and start making your community safer.</p>
                
                <div className="features-grid">
                  <div className="feature-card">
                    <FaShieldAlt className="feature-icon" />
                    <h5>Patrol Management</h5>
                    <p>Organize and track patrol activities</p>
                  </div>
                  <div className="feature-card">
                    <FaPlay className="feature-icon" />
                    <h5>Incident Reporting</h5>
                    <p>Report and manage security incidents</p>
                  </div>
                  <div className="feature-card">
                    <FaUserPlus className="feature-icon" />
                    <h5>Team Coordination</h5>
                    <p>Connect with patrol team members</p>
                  </div>
                </div>
                
                <div className="get-started-actions">
                  <button className="primary-action">
                    <FaRocket />
                    Launch PatrolNet
                  </button>
                  <button className="secondary-action">
                    <FaQuestionCircle />
                    View Tutorial
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Support Section */}
      <div className="support-section">
        <div className="support-content">
          <h3>Need Help?</h3>
          <p>Our support team is here to help you get started with PatrolNet</p>
          <div className="support-options">
            <button onClick={() => navigate('/contact-us')} className="support-link">
              <FaQuestionCircle />
              Contact Support
            </button>
            <a href="/faq" className="support-link">
              <FaQuestionCircle />
              View FAQ
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .download-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .hero-section {
          padding: 4rem 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          max-width: 1200px;
          margin: 0 auto;
          align-items: center;
          min-height: 80vh;
        }

        .hero-content {
          color: white;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.9rem;
          margin-bottom: 2rem;
          backdrop-filter: blur(10px);
        }

        .badge-icon {
          font-size: 1rem;
        }

        .hero-content h1 {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.1;
        }

        .hero-content p {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: 3rem;
          line-height: 1.6;
        }

        .download-buttons {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .download-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
          color: white;
          text-decoration: none;
        }

        .download-btn.android {
          background: #34a853;
        }

        .download-btn.ios {
          background: #000;
        }

        .download-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .btn-icon {
          font-size: 1.5rem;
        }

        .btn-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .btn-text {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .download-note {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          opacity: 0.8;
          font-size: 0.9rem;
        }

        .note-icon {
          color: #10b981;
        }

        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .phone-mockup {
          width: 300px;
          height: 600px;
          background: #1f2937;
          border-radius: 40px;
          padding: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .phone-screen {
          width: 100%;
          height: 100%;
          background: white;
          border-radius: 30px;
          overflow: hidden;
        }

        .app-preview {
          padding: 2rem 1.5rem;
          height: 100%;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .app-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .app-logo {
          width: 40px;
          height: 40px;
          background: #3b82f6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .app-features {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .feature-dot {
          width: 60px;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
        }

        .feature-dot.active {
          background: #3b82f6;
        }

        .steps-section {
          background: white;
          padding: 5rem 2rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .section-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .section-header p {
          font-size: 1.1rem;
          color: #6b7280;
        }

        .step-navigation {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          margin-bottom: 4rem;
          max-width: 1000px;
          margin-left: auto;
          margin-right: auto;
        }

        .step-indicator {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f8fafc;
          border: 2px solid #e5e7eb;
          min-width: 200px;
        }

        .step-indicator.active {
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .step-icon {
          font-size: 1.5rem;
        }

        .step-info h4 {
          margin: 0;
          font-weight: 600;
        }

        .step-number {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .step-connector {
          width: 40px;
          height: 2px;
          background: #e5e7eb;
          transition: all 0.3s ease;
        }

        .step-connector.completed {
          background: #10b981;
        }

        .step-content {
          max-width: 1000px;
          margin: 0 auto;
        }

        .step-details {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 3rem;
          align-items: center;
        }

        .step-visual {
          display: flex;
          justify-content: center;
        }

        .download-illustration,
        .install-illustration,
        .account-illustration,
        .start-illustration {
          width: 200px;
          height: 200px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 4rem;
        }

        .step-info-detailed h3 {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .step-info-detailed p {
          font-size: 1.1rem;
          color: #6b7280;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .platform-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .platform-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .platform-card:hover {
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .platform-icon {
          font-size: 2rem;
        }

        .android-color {
          color: #34a853;
        }

        .ios-color {
          color: #000;
        }

        .platform-card h5 {
          margin: 0 0 0.25rem 0;
          font-weight: 600;
        }

        .platform-card p {
          margin: 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .file-size {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .platform-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          margin-left: auto;
        }

        .install-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .install-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          background: #f1f5f9;
          cursor: pointer;
        }

        .install-tab.active {
          background: #3b82f6;
          color: white;
        }

        .install-steps {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .install-step {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .step-number-small {
          width: 32px;
          height: 32px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .install-step h5 {
          margin: 0 0 0.5rem 0;
          font-weight: 600;
        }

        .install-step p {
          margin: 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .warning-box {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: #fef3cd;
          border: 1px solid #fde68a;
          border-radius: 8px;
          align-items: flex-start;
        }

        .warning-icon {
          color: #d97706;
          font-size: 1.2rem;
          flex-shrink: 0;
          margin-top: 0.2rem;
        }

        .warning-box h5 {
          margin: 0 0 0.25rem 0;
          color: #92400e;
        }

        .warning-box p {
          margin: 0;
          color: #92400e;
          font-size: 0.9rem;
        }

        .account-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .account-option {
          padding: 1.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
        }

        .option-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .recommended-badge {
          background: #10b981;
          color: white;
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 600;
        }

        .account-option h5 {
          margin: 0;
          font-weight: 600;
        }

        .account-option p {
          margin: 0 0 1rem 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .account-option ul {
          margin: 0;
          padding-left: 1rem;
          list-style: none;
        }

        .account-option li {
          position: relative;
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .account-option li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: 600;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .feature-card {
          text-align: center;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }

        .feature-icon {
          font-size: 2rem;
          color: #3b82f6;
          margin-bottom: 1rem;
        }

        .feature-card h5 {
          margin: 0 0 0.5rem 0;
          font-weight: 600;
        }

        .feature-card p {
          margin: 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .get-started-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .primary-action {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
        }

        .secondary-action {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: white;
          color: #3b82f6;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
        }

        .support-section {
          background: #1f2937;
          color: white;
          padding: 3rem 2rem;
          text-align: center;
        }

        .support-content h3 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .support-content p {
          font-size: 1.1rem;
          opacity: 0.8;
          margin-bottom: 2rem;
        }

        .support-options {
          display: flex;
          justify-content: center;
          gap: 2rem;
        }

        .support-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .support-link:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .hero-section {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 2rem;
          }

          .hero-content h1 {
            font-size: 2.5rem;
          }

          .download-buttons {
            flex-direction: column;
          }

          .step-navigation {
            flex-direction: column;
          }

          .step-details {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .account-options {
            grid-template-columns: 1fr;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .support-options {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default DownloadInstructions;