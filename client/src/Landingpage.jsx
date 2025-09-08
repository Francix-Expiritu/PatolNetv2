// src/components/GuestContent.jsx
import React from "react";
import "./Landingpage.css";



function Landingpage({ onLoginClick }) {
  return (
    <>
      <main className="hero">
        <div className="overlay">
          <h2>PatrolNet: Empowering Safer Communities</h2>
          <p>Real-time incident reporting, optimized patrol management, and seamless community connection.</p>
          <button className="login-btn" onClick={onLoginClick}>
           Log in
          </button>
        </div>
      
      </main>
      
    </>
    
  );
}

export default Landingpage;

