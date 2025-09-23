import React, { useState } from "react";
import {
  X,
  Download,
  Smartphone,
  QrCode,
  Play,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

import "./DownloadModal.css"; // Custom CSS

const DownloadModal = ({ showModal, onClose }) => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      icon: <Play size={24} />,
      title: "Download Expo Go",
      description:
        "Get the Expo Go app from your device's app store to begin the installation process.",
      tags: ["Google Play", "App Store"],
      color: "blue",
    },
    {
      id: 2,
      icon: <Smartphone size={24} />,
      title: "Launch Expo Go",
      description:
        "Open the Expo Go application and navigate to the QR scanner feature.",
      color: "purple",
    },
    {
      id: 3,
      icon: <QrCode size={24} />,
      title: "Scan QR Code",
      description:
        "Point your camera at the QR code below to automatically download PatrolNet.",
      color: "green",
    },
    {
      id: 4,
      icon: <CheckCircle size={24} />,
      title: "Start Patrolling!",
      description:
        "Sign in with your credentials and begin using PatrolNet's powerful features.",
      color: "orange",
    },
  ];

  if (!showModal) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Animated Background */}
        <div className="modal-bg-elements">
          <div className="floating-element element-1"></div>
          <div className="floating-element element-2"></div>
          <div className="floating-element element-3"></div>
        </div>

        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              <Download size={28} />
              <Sparkles size={16} className="sparkle-icon" />
            </div>
            <div>
              <h2 className="modal-title">Download PatrolNet</h2>
              <p className="modal-subtitle">Get started in minutes</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="modal-intro">
            <div className="intro-badge">
              <Sparkles size={16} />
              Quick Setup
            </div>
            <p className="intro-text">
              Follow these <span className="highlight">simple steps</span> to
              get PatrolNet running on your device
            </p>
          </div>

          {/* Steps */}
          <div className="steps-container">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`step-item ${activeStep >= step.id ? "active" : ""}`}
                onMouseEnter={() => setActiveStep(step.id)}
              >
                <div className="step-visual">
                  <div className={`step-number ${step.color}`}>
                    {step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="step-connector">
                      <ArrowRight size={16} />
                    </div>
                  )}
                </div>

                <div className={`step-content ${step.color}`}>
                  <div className="step-header">
                    <div className={`step-icon ${step.color}`}>{step.icon}</div>
                    <h3 className="step-title">{step.title}</h3>
                  </div>

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

                  {step.id === 3 && (
                    <div className="qr-section">
                      <div className="qr-code-container">
                        <div className="qr-code-wrapper">
                          <div className="qr-code-placeholder">
                            <QrCode size={80} />
                            <div className="qr-scanner-effect"></div>
                          </div>
                        </div>
                        <div className="qr-info">
                          <p className="qr-title">PatrolNet QR Code</p>
                          <p className="qr-subtitle">Tap to scan with Expo Go</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Help Section */}
          <div className="help-section">
            <div className="help-icon">
              <Sparkles size={20} />
            </div>
            <div className="help-content">
              <h4 className="help-title">Need Assistance?</h4>
              <p className="help-description">
                Our support team is ready to help! Contact us if you encounter
                any issues.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="footer-info">
            <span className="footer-text">Ready to patrol? Let's go! 🚀</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <span>Got it!</span>
            <CheckCircle size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
