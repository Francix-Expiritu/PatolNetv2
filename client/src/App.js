import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate, useLocation } from "react-router-dom";
import Login from './components/Login';
import About from "./components/About";
import IncidentReport from "./components/Incident_Report";
import ScheduleAssignment from './components/ScheduleAssignment';
import PatrolLogs from "./components/Patrollogs";
import Accounts from "./components/Accounts";
import GISMapping from "./components/GISmapping";
import User from "./components/User";
import "./App.css";
import Landingpage from "./Landingpage.jsx";

import AdminActivities from "./components/AdminActivities";
import Dashboard from "./components/Dashboard.jsx";
import AdminAnnouncements from "./components/AdminAnnouncements";
import Download from "./components/Donwload";
import Sidebar from "./components/Sidebar.jsx"; // Updated import
import Messages from "./components/Messages";
import ContactUs from "./components/ContactUs"; // Import ContactUs

// Components for Activities & Announcements
import Activities from "./components/Activities";
import Announcements from "./components/Announcements";

// Create a wrapper component to access navigate
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("userRole");
    if (loggedIn === "true") {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUserRole(userData.userRole);
    setShowLogin(false);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", userData.userRole);
    localStorage.setItem("username", userData.username);
    
    // Navigate to appropriate dashboard after login
    if (userData.userRole === "Tanod" || userData.userRole === "Resident") {
      navigate("/user");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogout = () => {
    console.log("Logout initiated from App.js...");
    
    // Set loading state
    setIsLoggingOut(true);
    
    // Clear localStorage immediately
    localStorage.clear(); // This clears ALL localStorage items
    
    // Clear all state immediately (synchronously)
    setIsLoggedIn(false);
    setUserRole("");
    setShowLogin(false);
    
    console.log("State cleared, navigating to home...");
    
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      // Navigate to home and replace the current entry in history
      navigate("/", { replace: true });
      
      // Reset loading state
      setIsLoggingOut(false);
      
      console.log("Logout complete - should be on landing page");
    }, 50); // Very short delay to ensure state updates
  };

  // Check if we should show the sidebar
  const shouldShowSidebar = isLoggedIn && userRole !== "Resident";

  const currentUser = useMemo(() => ({
    username: localStorage.getItem('username'),
    role: userRole
  }), [userRole]);

  return (
    <div className="app">
      {/* Show header for guest pages and user pages (not admin pages) */}
      {(!['/Accounts'].includes(location.pathname) && (!isLoggedIn || userRole === "Resident")) && (
        <header className="header">
          <div className="left">
            <img src="logo.png" alt="Logo" className="logo" />
            <h1>PatrolNet</h1>
          </div>
          <div className="right">
            {!isLoggedIn && (
              <>
                <button className="login-btn1" onClick={() => navigate("/download")}>
                  Download App
                </button>
              </>
            )}
            {/* Show user role and logout for logged in users */}
            {isLoggedIn && (
              <div className="user-info">
                <span className="user-role">Logged in as: {userRole}</span>
                <button 
                  className={`logout-btn ${isLoggingOut ? 'loading' : ''}`}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <>
                      <span className="spinner"></span>
                      Logging out...
                    </>
                  ) : (
                    'Log Me Out'
                  )}
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Show Sidebar for admin users - FIXED: Pass onLogout prop */}
      {shouldShowSidebar && (
        <Sidebar 
          currentUser={currentUser} 
          onLogout={handleLogout}
        />
      )}

      {/* Main content area - adjust margin when sidebar is present */}
      <div className={shouldShowSidebar ? "main-content" : ""}>
        <Routes>
          <Route path="/" element={!isLoggedIn && !showLogin ? <Landingpage onLoginClick={() => setShowLogin(true)} /> : (isLoggedIn && (userRole === "Tanod" || userRole === "Resident") ? <Navigate to="/user" replace /> : (isLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />))} />
          <Route path="/about" element={<About />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/contact-us" element={<ContactUs />} /> {/* Always accessible ContactUs Route */}
          <Route path="/download" element={<Download />} />

          {/* Logged-in routes */}
          <Route path="/user" element={isLoggedIn && (userRole === "Tanod" || userRole === "Resident") ? <User onLogout={handleLogout} /> : <Navigate to="/" replace />} />
          <Route path="/dashboard" element={isLoggedIn && !(userRole === "Tanod" || userRole === "Resident") ? <Dashboard /> : <Navigate to="/" replace />} />
          <Route path="/incident-report" element={isLoggedIn && !(userRole === "Tanod" || userRole === "Resident") ? <IncidentReport /> : <Navigate to="/" replace />} />
          <Route path="/scheduling" element={isLoggedIn && !(userRole === "Tanod" || userRole === "Resident") ? <ScheduleAssignment /> : <Navigate to="/" replace />} />
          <Route path="/patrol-logs" element={isLoggedIn && !(userRole === "Tanod" || userRole === "Resident") ? <PatrolLogs /> : <Navigate to="/" replace />} />
          <Route path="/Accounts" element={isLoggedIn && !(userRole === "Tanod" || userRole === "Resident") ? <Accounts /> : <Navigate to="/" replace />} />
          <Route path="/gis-mapping" element={isLoggedIn && !(userRole === "Tanod" || userRole === "Resident") ? <GISMapping /> : <Navigate to="/" replace />} />
          <Route path="/admin-activities" element={isLoggedIn && !(userRole === "Tanod" || userRole === "Resident") ? <AdminActivities /> : <Navigate to="/" replace />} />
          <Route path="/admin-announcements" element={isLoggedIn && !(userRole === "Tanod" || userRole === "Resident") ? <AdminAnnouncements /> : <Navigate to="/" replace />} />
          <Route path="/messages" element={isLoggedIn && !(userRole === "Tanod" || userRole === "Resident") ? <Messages /> : <Navigate to="/" replace />} />

          {/* Catch-all route for unmatched paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Show Login form (kept as conditional rendering) */}
        {showLogin && (
          <Login setShowLogin={setShowLogin} onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </div>
  );
}

// Main App component with Router wrapper
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;