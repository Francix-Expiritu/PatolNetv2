// AppInstructions.jsx
import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  QrCode,
  CheckCircle,
} from "lucide-react";
import './AppInstructions.css';

const AppInstructions = () => {
  const [hoveredStep, setHoveredStep] = useState(null);

  const steps = [
    {
      id: 1,
      icon: <Download size={48} />,
      title: "Download Expo Go",
      description: "Get the Expo Go app from your device's app store to begin the installation process.",
      tags: ["Google Play", "App Store"],
      color: "#4F46E5"
    },
    {
      id: 2,
      icon: <Smartphone size={48} />,
      title: "Launch Expo Go",
      description: "Open the Expo Go application and navigate to the QR scanner feature.",
      color: "#7C3AED"
    },
    {
      id: 3,
      icon: <QrCode size={48} />,
      title: "Scan QR Code",
      description: "Point your camera at the QR code below to automatically download PatrolNet.",
      color: "#059669"
    },
    {
      id: 4,
      icon: <CheckCircle size={48} />,
      title: "Start Patrolling!",
      description: "Sign in with your credentials and begin using PatrolNet's powerful features.",
      color: "#DC2626"
    },
  ];

  return (
    <div className="app-instructions-container">
      <div className="instructions-wrapper">
        <div className="header" style={{ marginBottom: "40px" }}>
          <h1 className="main-title">DOWNLOAD AND USE PATROLNET APP</h1>
          <p className="subtitle" style={{ color: "white" }}>
  Get started in minutes with these simple steps
</p>

        </div>

        <div className="steps-grid">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`step-card ${hoveredStep === step.id ? 'hovered' : ''}`}
              style={{ '--step-color': step.color }}
              onMouseEnter={() => setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <div className="step-number">
                {step.id}
              </div>
              
              <div className="step-icon">
                {step.icon}
              </div>
              
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
              
              {step.tags && (
                <div className="step-tags">
                  {step.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="qr-section">
          <div className="qr-container">
            <div className="qr-placeholder">
              <QrCode size={60} className="qr-icon" />
              <div className="qr-scanner-effect"></div>
            </div>
          </div>
          <h3 className="qr-title">PatrolNet QR Code</h3>
          <p className="qr-subtitle">Scan with Expo Go to install the app</p>
        </div>
      </div>
    </div>
  );
};

export default AppInstructions;