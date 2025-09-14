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
import MainSidebarWrapper from "./components/MainSidebarWrapper.jsx"; // Corrected import
import Messages from "./components/Messages";
import ContactUs from "./components/ContactUs";
import ResidentLandingPage from "./components/ResidentLandingPage";
import TouristSpots from "./components/TouristSpots";

// Components for Activities & Announcements
import Activities from "./components/Activities";
import Announcements from "./components/Announcements";

// Create a wrapper component to access navigate
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Derive isLoggedIn and userRole directly from localStorage on every render
  const initialIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const initialUserRole = localStorage.getItem("userRole") || "";

  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);
  const [userRole, setUserRole] = useState(initialUserRole);

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
    localStorage.clear();
    
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
    }, 50);
  };

  // Helper functions for route protection
  const isAdmin = () => {
    return isLoggedIn && userRole !== "Tanod" && userRole !== "Resident";
  };

  const isTanodOrAdmin = () => {
    return isLoggedIn && (userRole === "Tanod" || userRole === "Admintanod" || isAdmin());
  };

  const isResidentOrTanod = () => {
    return isLoggedIn && (userRole === "Tanod" || userRole === "Resident");
  };

  const currentUser = useMemo(() => {
    const localStorageRole = localStorage.getItem('userRole');
    const localStorageUsername = localStorage.getItem('username');
    
    console.log('=== APP.JS CURRENT USER DEBUG ===');
    console.log('userRole state:', userRole);
    console.log('localStorage userRole:', localStorageRole);
    console.log('localStorage username:', localStorageUsername);
    
    const user = {
      username: localStorageUsername || '',
      role: String(userRole || localStorageRole || '').trim() // Ensure role is always a trimmed string
    };
    
    console.log('Final currentUser object being passed to Sidebar:', user);
    console.log('===============================\n'); // Added newline for clarity
    
    return user;
  }, [userRole]);

  // Check if we should show the sidebar
  const shouldShowSidebar = isLoggedIn && currentUser?.role && currentUser.role !== "Resident";

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
        <MainSidebarWrapper 
          currentUser={currentUser} 
          onLogout={handleLogout}
        />
      )}

      {/* Main content area - adjust margin when sidebar is present */}
      <div className={shouldShowSidebar ? "main-content" : ""}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={!isLoggedIn && !showLogin ? <Landingpage onLoginClick={() => setShowLogin(true)} /> : (isLoggedIn && isResidentOrTanod() ? <Navigate to="/user" replace /> : (isLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />))} />
          <Route path="/about" element={<About />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/download" element={<Download />} />

          {/* User routes (for Tanod and Resident) */}
          <Route path="/user" element={isResidentOrTanod() ? <User onLogout={handleLogout} /> : <Navigate to="/" replace />} />

          {/* Admin-only routes */}
          <Route path="/dashboard" element={isAdmin() ? <Dashboard /> : <Navigate to="/" replace />} />
          <Route path="/admin-activities" element={isAdmin() ? <AdminActivities /> : <Navigate to="/" replace />} />
          <Route path="/admin-announcements" element={isAdmin() ? <AdminAnnouncements /> : <Navigate to="/" replace />} />
          <Route path="/messages" element={isAdmin() ? <Messages /> : <Navigate to="/" replace />} />
          <Route path="/tourist-spots" element={isAdmin() ? <TouristSpots /> : <Navigate to="/" replace />} />

          {/* Shared routes (Tanod + Admin access) */}
          <Route path="/incident-report" element={isTanodOrAdmin() ? <IncidentReport /> : <Navigate to="/" replace />} />
          <Route path="/scheduling" element={isTanodOrAdmin() ? <ScheduleAssignment /> : <Navigate to="/" replace />} />
          <Route path="/patrol-logs" element={isTanodOrAdmin() ? <PatrolLogs /> : <Navigate to="/" replace />} />
          <Route path="/accounts" element={isTanodOrAdmin() ? <Accounts /> : <Navigate to="/" replace />} />
          <Route path="/gis-mapping" element={isTanodOrAdmin() ? <GISMapping /> : <Navigate to="/" replace />} />

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
