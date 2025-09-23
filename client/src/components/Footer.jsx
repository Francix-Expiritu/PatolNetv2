import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-about">
          <h3>
            <img src="new-icon.png" alt="Logo" className="footer-logo" />
            PatrolNet
          </h3>
          <p>
            Building safer communities through innovative technology. Connecting residents and local authorities for a more secure neighborhood.
          </p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">About Us</Link></li>
            <li><Link to="/">Contact</Link></li>
            <li><Link to="/">Announcements</Link></li>
            <li><Link to="/">Download App</Link></li>
          </ul>
        </div>
        <div className="footer-social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon"><Facebook size={20} /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon"><Twitter size={20} /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon"><Instagram size={20} /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon"><Linkedin size={20} /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} PatrolNet. All Rights Reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

