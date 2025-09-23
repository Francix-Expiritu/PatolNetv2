import React, { useState } from "react";
import { Download } from "lucide-react";
import DownloadModal from "./DownloadModal";
import { BASE_URL } from "../config";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("idle");
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setStatus("error");
      return;
    }
    
    setStatus("sending");
    try {
      const response = await fetch(`${BASE_URL}/api/contact-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        console.error("Submission failed:", data.message);
        setStatus("error");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <div className="contact-container">
      <div className="contact-wrapper">
        {/* Left Section - App Description */}
        <div className="app-description-section">
          <div className="status-indicator"></div>
          
          <div className="app-content">
            <h1 className="app-title">PATROLNET</h1>
            
            <div className="app-description">
              <p>
                PatrolNet is a comprehensive security management platform designed to streamline patrol operations and enhance safety monitoring.
              </p>
              <p>
                Our innovative solution connects security personnel, provides real-time tracking, incident reporting, and intelligent analytics to ensure maximum protection for your assets.
              </p>
              <p>
                Experience seamless coordination, automated scheduling, and instant communication tools that revolutionize modern security operations.
              </p>
            </div>

            <button className="download-btn" onClick={openModal}>
              <Download size={20} />
              Download App here
            </button>

            <div className="pagination-dots">
              <div className="dot inactive"></div>
              <div className="dot active"></div>
              <div className="dot inactive"></div>
            </div>
          </div>
        </div>

        {/* Right Section - Contact Form */}
        <div className="contact-form-section">
          <div className="form-container">
            <h2 className="form-title">Contact Us</h2>

            <div className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject:</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this regarding?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message:</label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button 
                onClick={handleSubmit}
                disabled={status === "sending"}
                className="submit-btn"
              >
                {status === "sending" ? (
                  <div className="loading-content">
                    <div className="spinner"></div>
                    Sending...
                  </div>
                ) : (
                  "Send Message"
                )}
              </button>
            </div>

            {status === "success" && (
              <div className="status-message success">
                <p>✅ Message sent successfully! We'll get back to you soon.</p>
              </div>
            )}
            
            {status === "error" && (
              <div className="status-message error">
                <p>❌ Failed to send message. Please try again.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <DownloadModal showModal={showModal} onClose={closeModal} />

      <style jsx>{`
        /* Base styles remain the same */
        .contact-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
          padding: 20px;
        }

        .contact-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          display: flex;
          min-height: 600px;
        }

        .app-description-section {
          flex: 1;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .app-description-section::before {
          content: '';
          position: absolute;
          bottom: -80px;
          right: -80px;
          width: 320px;
          height: 320px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
        }

        .app-description-section::after {
          content: '';
          position: absolute;
          top: -40px;
          left: -40px;
          width: 240px;
          height: 240px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
        }

        .status-indicator {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 12px;
          height: 12px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .app-content {
          position: relative;
          z-index: 10;
        }

        .app-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 30px;
          letter-spacing: -2px;
        }

        .app-description {
          margin-bottom: 40px;
        }

        .app-description p {
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 20px;
          opacity: 0.9;
          color: white;
        }

        .download-btn {
          background: white;
          color: #4f46e5;
          border: none;
          padding: 15px 30px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          margin-bottom: 40px;
          width: fit-content;
        }

        .download-btn:hover {
          background: #f9fafb;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .pagination-dots {
          display: flex;
          gap: 8px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: white;
        }

        .dot.inactive {
          opacity: 0.4;
        }

        .contact-form-section {
          flex: 1;
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .form-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 40px;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group textarea {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }

        .submit-btn {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 15px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          background: #4338ca;
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .status-message {
          margin-top: 20px;
          padding: 15px;
          border-radius: 8px;
          font-weight: 500;
        }

        .status-message.success {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .status-message.error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .contact-wrapper {
            flex-direction: column;
            margin: 10px;
            border-radius: 15px;
          }

          .app-description-section,
          .contact-form-section {
            padding: 40px 20px;
            color: white;
          }

          .app-title {
            font-size: 2.5rem;
          }

          .form-title {
            font-size: 2rem;
          }
        }

        @media (max-width: 480px) {
        }
      `}</style>
    </div>
  );
};

export default ContactUs;