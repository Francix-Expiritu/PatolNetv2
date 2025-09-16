import React, { useState } from 'react';
import { BASE_URL } from '../config';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const response = await fetch(`${BASE_URL}/api/contact-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setStatus('error');
        console.error('Failed to send message:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    }
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '50px auto',
      padding: '2rem',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      fontFamily: 'Arial, sans-serif',
      color: '#333'
    },
    heading: {
      textAlign: 'center',
      color: '#1e40af',
      marginBottom: '30px',
      fontSize: '2.5em',
      fontWeight: 'bold'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: 'bold',
      color: '#555'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '1em',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s ease'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '1em',
      minHeight: '120px',
      resize: 'vertical',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s ease'
    },
    button: {
      width: '100%',
      padding: '15px',
      backgroundColor: '#1e40af',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1.1em',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease, transform 0.2s ease',
      marginTop: '20px'
    },
    buttonHover: {
      backgroundColor: '#1a368a',
      transform: 'translateY(-2px)'
    },
    statusMessage: {
      textAlign: 'center',
      marginTop: '20px',
      padding: '10px',
      borderRadius: '5px',
      fontWeight: 'bold'
    },
    success: {
      backgroundColor: '#d4edda',
      color: '#155724'
    },
    error: {
      backgroundColor: '#f8d7da',
      color: '#721c24'
    },
    sending: {
      backgroundColor: '#cce5ff',
      color: '#004085'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Contact Us</h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="name" style={styles.label}>Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="subject" style={styles.label}>Subject:</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="message" style={styles.label}>Message:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            style={styles.textarea}
            required
          ></textarea>
        </div>
        <button 
          type="submit" 
          style={styles.button}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}
        >
          Send Message
        </button>
      </form>
      {status === 'sending' && (
        <p style={{ ...styles.statusMessage, ...styles.sending }}>Sending your message...</p>
      )}
      {status === 'success' && (
        <p style={{ ...styles.statusMessage, ...styles.success }}>Message sent successfully!</p>
      )}
      {status === 'error' && (
        <p style={{ ...styles.statusMessage, ...styles.error }}>Failed to send message. Please try again.</p>
      )}
    </div>
  );
};

export default ContactUs;
