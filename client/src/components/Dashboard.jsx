import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../config';

import './Dashboard.css';

function Dashboard() {
  const [incidentCount, setIncidentCount] = useState(0);
  const [schedulingCount, setSchedulingCount] = useState(0);
  const [gisMappingCount, setGisMappingCount] = useState(0);
  const [patrolLogsCount, setPatrolLogsCount] = useState(0);
  const [activitiesCount, setActivitiesCount] = useState(0);
  const [accountsCount, setAccountsCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch Incident Count
        const incidentRes = await fetch(`${BASE_URL}/api/incidents`);
        const incidentData = await incidentRes.json();
        setIncidentCount(incidentData.length); // Assuming incidents is an array

        // Fetch Scheduling Count (Placeholder)
        const schedulingRes = await fetch(`${BASE_URL}/api/schedules/count`);
        const schedulingData = await schedulingRes.json();
        setSchedulingCount(schedulingData.count);

        // Fetch GIS Mapping Count (Placeholder)
        const gisMappingRes = await fetch(`${BASE_URL}/api/gis/count`);
        const gisMappingData = await gisMappingRes.json();
        setGisMappingCount(gisMappingData.count);

        // Fetch Patrol Logs Count (Placeholder)
        const patrolLogsRes = await fetch(`${BASE_URL}/api/patrollogs/count`);
        const patrolLogsData = await patrolLogsRes.json();
        setPatrolLogsCount(patrolLogsData.count);

        // Fetch Activities Count (Placeholder)
        const activitiesRes = await fetch(`${BASE_URL}/api/activities/count`);
        const activitiesData = await activitiesRes.json();
        setActivitiesCount(activitiesData.count);

        // Fetch Accounts Count (Placeholder)
        const accountsRes = await fetch(`${BASE_URL}/api/accounts/count`);
        const accountsData = await accountsRes.json();
        setAccountsCount(accountsData.count);

      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="dashboard-container">
      
      
      <div className="homepage-wrapper">
        <div className="homepage-welcome">
          <h1>Welcome to BarangayWatch Admin Panel 🧑‍💼</h1>
          <p className="homepage-tagline">Manage user roles, accounts, and barangay access</p>
        </div>

        <div className="homepage-grid">

          <Link to="/incident-report" className="homepage-card">
            <h3>🚨 Incident Reports <span className="count-number">({incidentCount})</span></h3>
            <p>View and manage all reported incidents</p>
          </Link>

          <Link to="/scheduling" className="homepage-card">
            <h3>🗓️ Scheduling & Assessment <span className="count-number">({schedulingCount})</span></h3>
            <p>Manage patrol schedules and assessments</p>
          </Link>

          <Link to="/gis-mapping" className="homepage-card">
            <h3>🗺️ GIS Mapping <span className="count-number">({gisMappingCount})</span></h3>
            <p>Visualize incidents and patrols on a map</p>
          </Link>

          <Link to="/patrol-logs" className="homepage-card">
            <h3>📝 Patrol Logs <span className="count-number">({patrolLogsCount})</span></h3>
            <p>Review and manage daily patrol activities</p>
          </Link>

          <Link to="/activities" className="homepage-card">
            <h3>⭐ Activities <span className="count-number">({activitiesCount})</span></h3>
            <p>Manage landing page activities</p>
          </Link>

          <Link to="/accounts" className="homepage-card">
            <h3>👥 Accounts Management <span className="count-number">({accountsCount})</span></h3>
            <p>Manage all user accounts (Residents, Officers, Admins)</p>
          </Link>

          {/* Existing Account-specific links, consider consolidating or linking from Accounts Management */}
          {/* 
          <Link to="/accounts/residents" className="homepage-card">
            <h3>🏠 Resident Accounts</h3>
            <p>View and manage registered residents</p>
          </Link>

          <Link to="/accounts/barangay-officers" className="homepage-card">
            <h3>🧑 Barangay Officers</h3>
            <p>Manage officer accounts and privileges</p>
          </Link>

          <Link to="/accounts/admins" className="homepage-card">
            <h3>👮 Admin Accounts</h3>
            <p>Control admin-level users and access</p>
          </Link>

          <Link to="/accounts/create" className="homepage-card">
            <h3>➕ Create Account</h3>
            <p>Add new residents or officers to the system</p>
          </Link>

          <Link to="/accounts/logs" className="homepage-card">
            <h3>📜 Account Logs</h3>
            <p>View account activity and login logs</p>
          </Link>
          */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;