import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom'; // Import Outlet
import './AdminLayout.css';

const AdminLayout = () => { // Remove children prop
  return (
    <div className="admin-layout">
      <Navbar />
      <main className="admin-content">
        <Outlet /> {/* Use Outlet to render nested routes */}
      </main>
    </div>
  );
};

export default AdminLayout;
