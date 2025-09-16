import React from 'react';
import Announcements from './Announcements';
import Activities from './Activities';
import About from './About';
import ContactUs from './ContactUs';
import './User.css'; // Assuming you'll create a User.css for styling

const User = () => {
  return (
    <div className="user-dashboard">
        <section className="dashboard-section">
        <About />
      </section>

      <section className="dashboard-section">
        <h3></h3>
        <Announcements />
      </section>

      <section className="dashboard-section">
        <h3>Activities</h3>
        <Activities />
      </section>



      <section className="dashboard-section">
        <h3>Contact Us</h3>
        <ContactUs />
      </section>
    </div>
  );
};

export default User;
