import React, { useState } from "react";
import "./Login.css";
import { FaArrowLeft, FaUser, FaLock, FaShieldAlt, FaUsers, FaHome, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import RegisterModal from "./Modals/RegisterModal"; // Added import
import { BASE_URL } from '../config';

const Login = ({ setShowLogin, onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(""); // New state for role selection
  const [showRegisterModal, setShowRegisterModal] = useState(false); // Added state

  const roles = [
    { 
      value: "Tanod", 
      label: "Admin Tanod", 
      icon: <FaShieldAlt />,
      description: "Security Administration",
      color: "#e74c3c"
    },
    { 
      value: "Admin", 
      label: "Admin Tignoan", 
      icon: <FaUsers />,
      description: "Community Administration",
      color: "#3498db"
    },
    { 
      value: "Resident", 
      label: "Resident", 
      icon: <FaHome />,
      description: "Community Member",
      color: "#27ae60"
    }
  ];

  const handleLogin = async () => {
    setLoading(true);

    if (!username || !password) {
      setMessage("Please enter both username and password");
      setLoading(false);
      return;
    }

    if (!selectedRole) {
      setMessage("Please select your login role");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/login`, {
        username,
        password,
        clientType: 'web',
      }, {
        timeout: 10000
      });

      setMessage(res.data.message);

      if (res.data.success) {
        const userRole = res.data.user?.role || res.data.user?.ROLE;
        
        // Convert both to lowercase for case-insensitive comparison
        if (userRole.toLowerCase() !== selectedRole.toLowerCase()) {
          setMessage("Invalid credentials for selected role");
          setLoading(false);
          return;
        }

        const userData = {
          username: username,
          userRole: userRole,
          userId: res.data.user.id,
          userName: res.data.user.name,
          userEmail: res.data.user.email,
          userAddress: res.data.user.address,
          userStatus: res.data.user.status,
          userImage: res.data.user.image
        };

        localStorage.setItem("userRole", userRole);
        localStorage.setItem("isLoggedIn", true);

        console.log('Login successful, user data:', userData);
        onLoginSuccess(userData);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setMessage(err.response.data.error || "Access denied for selected role");
      } else if (err.response?.status === 401) {
        setMessage("Invalid username or password");
      } else if (err.response?.status === 400) {
        setMessage(err.response.data.error || "Please check your input");
      } else {
        setMessage(err.response?.data?.error || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getCurrentRoleInfo = () => {
    return roles.find(role => role.value === selectedRole);
  };

  return (
    <div className="website-container">
      {/* Header Navigation */}
      <header className="website-header">
        <div className="header-container">
          <div className="logo-section">
            <img src="/logo.jpg" alt="Barangay Logo" className="header-logo" />
            <div className="logo-text">
              <h1>Barangay Portal</h1>
              <span>PatrolNet System</span>
            </div>
          </div>
          <button className="back-btn" onClick={() => setShowLogin(false)}>
            <FaArrowLeft /> Back to Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {/* Left Side - Information */}
          <div className="info-section">
            <div className="welcome-content">
              <h2>Welcome to Barangay Portal</h2>
              <p>Access your community management system with secure authentication and role-based permissions.</p>
              
              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-icon" style={{backgroundColor: '#e74c3c20', color: '#e74c3c'}}>
                    <FaShieldAlt />
                  </div>
                  <div>
                    <h4>Security Management</h4>
                    <p>Comprehensive security oversight and community safety protocols</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon" style={{backgroundColor: '#3498db20', color: '#3498db'}}>
                    <FaUsers />
                  </div>
                  <div>
                    <h4>Community Administration</h4>
                    <p>Efficient management of community resources and services</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon" style={{backgroundColor: '#27ae6020', color: '#27ae60'}}>
                    <FaHome />
                  </div>
                  <div>
                    <h4>Resident Services</h4>
                    <p>Easy access to community services and information</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="login-section">
            <div className="login-form-container">
              <div className="form-header">
                <h3>Sign In to Your Account</h3>
                <p>Choose your role and enter your credentials</p>
              </div>

              {/* Role Selection Cards */}
              <div className="role-selection-grid">
                <label className="section-label">Select Your Role:</label>
                <div className="role-cards">
                  {roles.map((role) => (
                    <div
                      key={role.value}
                      className={`role-card ${selectedRole === role.value ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedRole(role.value);
                        setMessage("");
                      }}
                      style={selectedRole === role.value ? {
                        borderColor: role.color,
                        backgroundColor: `${role.color}10`
                      } : {}}
                    >
                      <div className="role-card-icon" style={{color: role.color}}>
                        {role.icon}
                      </div>
                      <h5>{role.label}</h5>
                      <span>{role.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Login Form */}

<form className="login-form" onSubmit={(e) => {e.preventDefault(); handleLogin();}}>
  <div className="form-group">
    <label htmlFor="username">Username</label>
    <div className="input-wrapper-horizontal">
      <div className="input-icon-external">
        <FaUser />
      </div>
      <input
        id="username"
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          setMessage("");
        }}
        className="form-input-horizontal"
      />
    </div>
  </div>

  <div className="form-group">
    <label htmlFor="password">Password</label>
    <div className="input-wrapper-horizontal">
      <div className="input-icon-external">
        <FaLock />
      </div>
      <div className="input-with-toggle">
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setMessage("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          className="form-input-horizontal"
        />
        <button 
          type="button"
          className="password-visibility-external"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  </div>

  <button
    type="submit"
    className={`submit-btn ${loading ? 'loading' : ''}`}
    disabled={loading || !selectedRole}
    style={getCurrentRoleInfo() ? {backgroundColor: getCurrentRoleInfo().color} : {}}
  >
    {loading ? (
      <>
        <div className="spinner"></div>
        <span>Signing In...</span>
      </>
    ) : (
      <>
        {getCurrentRoleInfo() && getCurrentRoleInfo().icon}
        <span>Sign In {selectedRole ? `as ${getCurrentRoleInfo()?.label}` : ''}</span>
      </>
    )}
  </button>

  <button
    type="button"
    className="register-account-btn"
    onClick={() => setShowRegisterModal(true)}
  >
    Create New Account
  </button>

  {message && (
    <div className={`alert ${message.includes("success") ? "success" : "error"}`}>
      {message}
    </div>
  )}
</form>

              <div className="form-footer">
                <a href="#forgot" className="forgot-link">
                  Forgot your password? Contact Administrator
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="website-footer">
        <div className="footer-content">
          <p>&copy; 2024 Barangay PatrolNet System. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#support">Support</a>
          </div>
        </div>
      </footer>
      {showRegisterModal && (
        <RegisterModal show={showRegisterModal} onClose={() => setShowRegisterModal(false)} />
      )}
    </div>
  );
};

export default Login;
