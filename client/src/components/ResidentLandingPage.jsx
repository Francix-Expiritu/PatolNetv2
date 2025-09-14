import React from 'react';
import Activities from './Activities';
import Announcements from './Announcements';
import About from './About';
import './ResidentLandingPage.css'; // Assuming you'll create a CSS file for styling

const ResidentLandingPage = () => {
  return (
    <div className="resident-landing-page">
      <h2>Welcome, Resident!</h2>
      <section className="resident-section">
        <h3>Activities</h3>
        <Activities />
      </section>
      <section className="resident-section">
        <h3>Announcements</h3>
        <Announcements />
      </section>
      <section className="resident-section">
        <h3>About PatrolNet</h3>
        <About />
      </section>
    </div>
  );
};

export default ResidentLandingPage;
