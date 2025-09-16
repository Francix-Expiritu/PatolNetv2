import React from 'react';
import TanodSidebar from './TanodSidebar';
import AdminSidebar from './AdminSidebar';

const MainSidebarWrapper = ({ onLogout }) => {
  const userRole = localStorage.getItem('userRole')?.trim();

  if (userRole === "Tanod" || userRole === "Admintanod") {
    return <TanodSidebar onLogout={onLogout} />; 
  } else {
    return <AdminSidebar onLogout={onLogout} />;
  }
};

export default MainSidebarWrapper;