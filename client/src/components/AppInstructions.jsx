import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  QrCode,
  CheckCircle,
} from "lucide-react";

const AppInstructions = () => {
  const [hoveredStep, setHoveredStep] = useState(null);

  const steps = [
    {
      id: 1,
      icon: <Download size={32} />,
      title: "Download Expo Go",
      description: "Get the Expo Go app from your device's app store to begin the installation process.",
      tags: ["Google Play", "App Store"],
      color: "#2563eb"
    },
    {
      id: 2,
      icon: <Smartphone size={32} />,
      title: "Launch Expo Go",
      description: "Open the Expo Go application and navigate to the QR scanner feature.",
      color: "#7c3aed"
    },
    {
      id: 3,
      icon: <QrCode size={32} />,
      title: "Scan QR Code",
      description: "Point your camera at the QR code below to automatically download PatrolNet.",
      color: "#059669"
    },
    {
      id: 4,
      icon: <CheckCircle size={32} />,
      title: "Start Patrolling",
      description: "Sign in with your credentials and begin using PatrolNet's powerful features.",
      color: "#dc2626"
    },
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '60px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    wrapper: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '50px'
    },
    mainTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: '12px',
      letterSpacing: '-0.5px',
      lineHeight: '1.2'
    },
    subtitle: {
      fontSize: '1.125rem',
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '400'
    },
    stepsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '24px',
      marginBottom: '60px'
    },
    stepCard: {
      background: '#ffffff',
      borderRadius: '16px',
      padding: '32px 24px',
      position: 'relative',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
      cursor: 'default'
    },
    stepCardHovered: {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)'
    },
    stepNumber: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: '700',
      color: '#ffffff',
      transition: 'transform 0.3s ease'
    },
    stepNumberHovered: {
      transform: 'scale(1.1)'
    },
    stepIcon: {
      marginBottom: '20px',
      transition: 'transform 0.3s ease'
    },
    stepIconHovered: {
      transform: 'scale(1.1)'
    },
    stepTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '12px',
      lineHeight: '1.3'
    },
    stepDescription: {
      fontSize: '0.938rem',
      color: '#6b7280',
      lineHeight: '1.6',
      marginBottom: '16px'
    },
    stepTags: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    tag: {
      padding: '6px 12px',
      background: '#f3f4f6',
      borderRadius: '6px',
      fontSize: '0.813rem',
      color: '#4b5563',
      fontWeight: '500'
    },
    qrSection: {
      background: '#ffffff',
      borderRadius: '20px',
      padding: '48px',
      textAlign: 'center',
      boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)'
    },
    qrContainer: {
      display: 'inline-block',
      position: 'relative',
      marginBottom: '24px'
    },
    qrPlaceholder: {
      width: '200px',
      height: '200px',
      background: '#f9fafb',
      border: '3px dashed #d1d5db',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    },
    qrIcon: {
      color: '#9ca3af',
      zIndex: 1
    },
    qrTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '8px'
    },
    qrSubtitle: {
      fontSize: '1rem',
      color: '#6b7280'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.mainTitle}>Download and Use PatrolNet App</h1>
          <p style={styles.subtitle}>Get started in minutes with these simple steps</p>
        </div>

        <div style={styles.stepsGrid}>
          {steps.map((step) => (
            <div
              key={step.id}
              style={{
                ...styles.stepCard,
                ...(hoveredStep === step.id ? styles.stepCardHovered : {})
              }}
              onMouseEnter={() => setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <div
                style={{
                  ...styles.stepNumber,
                  background: step.color,
                  ...(hoveredStep === step.id ? styles.stepNumberHovered : {})
                }}
              >
                {step.id}
              </div>
              
              <div
                style={{
                  ...styles.stepIcon,
                  color: step.color,
                  ...(hoveredStep === step.id ? styles.stepIconHovered : {})
                }}
              >
                {step.icon}
              </div>
              
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepDescription}>{step.description}</p>
              
              {step.tags && (
                <div style={styles.stepTags}>
                  {step.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} style={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={styles.qrSection}>
          <div style={styles.qrContainer}>
            <div style={styles.qrPlaceholder}>
              <QrCode size={80} style={styles.qrIcon} />
            </div>
          </div>
          <h3 style={styles.qrTitle}>PatrolNet QR Code</h3>
          <p style={styles.qrSubtitle}>Scan with Expo Go to install the app</p>
        </div>
      </div>
    </div>
  );
};

export default AppInstructions;