import React from 'react';
import Announcements from './Announcements';
import ContactUs from './ContactUs';
import TouristSpotsList from './TouristSpotsList'; // Import the new component
import AppInstructions from './AppInstructions';
import './User.css'; // Assuming you'll create a User.css for styling
import Footer from './Footer';

const User = () => {
  return (
    <div className="user-dashboard">
      <section className="dashboard-section">
        <Announcements showEmergencyContacts={true} showCommunityHub={true} />
      </section>

      <section className="dashboard-section app-instructions-section">
        <AppInstructions />
      </section>

      <section className="dashboard-section">
        <TouristSpotsList />
      </section>
      <section className="dashboard-section">
        <ContactUs />
      </section>
     <section className="dashboard-section">
        <Footer />
      </section>
    </div>
  );
};

export default User;
