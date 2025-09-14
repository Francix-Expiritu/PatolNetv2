import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainSidebarWrapper from './MainSidebarWrapper';
import './Patrollogs.css'; // Import the CSS file
import { BASE_URL } from '../config';

const PatrolLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activitiesSearchTerm, setActivitiesSearchTerm] = useState('');
  const [patrolLogs, setPatrolLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state for both tables
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSchedulePage, setCurrentSchedulePage] = useState(1);
  const itemsPerPage = 10;

  const [patrolActivitiesData, setPatrolActivitiesData] = useState([]);

  // Function to truncate location text
  const truncateLocation = (text, maxLength = 18) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Function to load logs from the database
  const loadLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${BASE_URL}/api/logs`);
      
      if (response.data && Array.isArray(response.data)) {
        // Transform the logs data for TANOD SCHEDULE table
        const transformedLogs = response.data.map((log, index) => ({
          id: log.ID || index + 1,
          tanod: log.USER || 'Unknown',
          timeIn: log.TIME_IN || 'Not specified', 
          timeOut: log.TIME_OUT || 'Not specified',
          location: log.LOCATION || 'Not specified',
          status: log.ACTION || 'No Action'
        }));
        
        // Filter activities that have been resolved/completed for PATROL ACTIVITIES table
        const activities = response.data
          .filter(log => log.ACTION === 'COMPLETED' || log.ACTION === 'RESOLVED INCIDENT' || log.TIME_OUT)
          .map((log, index) => ({
            id: log.ID || index + 1,
            tanod: log.USER || 'Unknown',
            timeResolved: log.TIME_OUT || log.TIME || 'Not specified',
            location: log.LOCATION || 'Not specified',
            status: log.ACTION || 'No Action'
          }));
        
        setPatrolLogs(transformedLogs);
        setPatrolActivitiesData(activities);
      } else {
        console.log("No logs found or invalid data format");
        setPatrolLogs([]);
        setPatrolActivitiesData([]);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading patrol logs:', err);
      setError('Failed to load patrol logs. Please try again later.');
      setIsLoading(false);
    }
  };

  const loadPatrolActivities = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/logs_patrol`);
      
      if (response.data && Array.isArray(response.data)) {
        const transformedActivities = response.data.map((activity, index) => ({
          id: activity.ID || index + 1,
          tanod: activity.USER || 'Unknown',
          time: activity.TIME || 'Not specified',
          location: activity.LOCATION || 'Not specified',
          action: activity.ACTION || 'No Action'
        }));
        
        setPatrolActivitiesData(transformedActivities);
      } else {
        setPatrolActivitiesData([]);
      }
    } catch (err) {
      console.error('Error loading patrol activities:', err);
      setPatrolActivitiesData([]);
    }
  };

  useEffect(() => {
    loadLogs();
    loadPatrolActivities();
  }, []);

  // Enhanced print function
  const handlePrint = () => {
    // Set the print date attribute before printing
    const container = document.querySelector('.patrol-logs-container');
    if (container) {
      const now = new Date();
      const printDate = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      container.setAttribute('data-print-date', printDate);
    }
    
    // Brief delay to ensure attribute is set
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Filter logs based on search term for TANOD SCHEDULE
  const filteredLogs = patrolLogs.filter(log =>
    log.tanod.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic for tanod schedule
  const totalSchedulePages = Math.ceil(filteredLogs.length / itemsPerPage);
  const scheduleStartIndex = (currentSchedulePage - 1) * itemsPerPage;
  const scheduleEndIndex = scheduleStartIndex + itemsPerPage;
  const currentLogs = filteredLogs.slice(scheduleStartIndex, scheduleEndIndex);

  // Filter activities based on search term for PATROL ACTIVITIES
  const filteredActivities = patrolActivitiesData.filter(activity =>
    activity.tanod.toLowerCase().includes(activitiesSearchTerm.toLowerCase()) ||
    activity.location.toLowerCase().includes(activitiesSearchTerm.toLowerCase()) ||
    activity.action.toLowerCase().includes(activitiesSearchTerm.toLowerCase())
  );

  // Pagination logic for patrol activities
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = filteredActivities.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSchedulePageChange = (pageNumber) => {
    setCurrentSchedulePage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSchedulePrevPage = () => {
    if (currentSchedulePage > 1) {
      setCurrentSchedulePage(currentSchedulePage - 1);
    }
  };

  const handleScheduleNextPage = () => {
    if (currentSchedulePage < totalSchedulePages) {
      setCurrentSchedulePage(currentSchedulePage + 1);
    }
  };

  const getStatusClass = (status) => {
    if (status === undefined || status === null) {
      return 'status-default';
    }
    if (status.includes('Available') || status.includes('Completed') || status.includes('Resolved')) {
      return 'status-success';
    } else if (status.includes('way') || status.includes('Progress')) {
      return 'status-warning';
    } else if (status.includes('duty')) {
      return 'status-info';
    }
    return 'status-default';
  };

  return (
    <div className="patrol-logs-container">
      <div className="no-print">
        <MainSidebarWrapper />
      </div>

      <div className="main-content">
        {/* Page Header */}
        <div className="page-header no-print">
          <h1 className="page-title">
            <span className="title-icon">🛡️</span>
            <span>Patrol Logs</span>
          </h1>
          <p className="page-subtitle">Track tanod schedules and patrol activities</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message no-print">
            <div className="error-content">
              <div className="error-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="error-text">
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* TANOD SCHEDULE TABLE */}
        <div className="table-container schedule-table">
          <div className="table-header">
            <div className="header-left">
              <h2 className="table-title">TANOD SCHEDULE</h2>
              <div className="search-container no-print">
                <input
                  type="text"
                  placeholder="Search Schedule"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="header-buttons no-print">
              <button 
                onClick={loadLogs}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                <span className="btn-icon">🔄</span>
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
              <button 
                onClick={handlePrint}
                className="btn btn-secondary"
              >
                <span className="btn-icon">🖨️</span>
                Print Logs
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="loading-container no-print">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading patrol logs...</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tanod</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* For print, show all filtered logs instead of paginated ones */}
                  {(window.matchMedia && window.matchMedia('print').matches ? filteredLogs : currentLogs).length > 0 ? (
                    (window.matchMedia && window.matchMedia('print').matches ? filteredLogs : currentLogs).map((log) => (
                      <tr key={log.id}>
                        <td className="font-medium">#{log.id}</td>
                        <td>{log.tanod}</td>
                        <td>
                          {log.timeIn !== 'Not specified' ? new Date(log.timeIn).toLocaleString() : '—'}
                        </td>
                        <td>
                          {log.timeOut !== 'Not specified' ? new Date(log.timeOut).toLocaleString() : '—'}
                        </td>
                        <td title={log.location}>
                          {log.location}
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">
                        {isLoading ? "Loading..." : "No patrol logs found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination for Tanod Schedule */}
          {totalSchedulePages > 1 && (
            <div className="pagination-container no-print">
              <div className="pagination-mobile">
                <button
                  onClick={handleSchedulePrevPage}
                  disabled={currentSchedulePage === 1}
                  className="btn btn-pagination"
                >
                  Previous
                </button>
                <button
                  onClick={handleScheduleNextPage}
                  disabled={currentSchedulePage === totalSchedulePages}
                  className="btn btn-pagination"
                >
                  Next
                </button>
              </div>
              <div className="pagination-desktop">
                <div className="pagination-info">
                  <p>
                    Showing <span className="font-medium">{scheduleStartIndex + 1}</span>
                    {' '}to <span className="font-medium">{Math.min(scheduleEndIndex, filteredLogs.length)}</span>
                    {' '}of <span className="font-medium">{filteredLogs.length}</span>
                    {' '}results
                  </p>
                </div>
                <div className="pagination-nav">
                  <button
                    onClick={handleSchedulePrevPage}
                    disabled={currentSchedulePage === 1}
                    className="btn btn-pagination nav-btn"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: totalSchedulePages }, (_, i) => i + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => handleSchedulePageChange(pageNumber)}
                      className={`btn btn-pagination page-btn ${
                        currentSchedulePage === pageNumber ? 'active' : ''
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  
                  <button
                    onClick={handleScheduleNextPage}
                    disabled={currentSchedulePage === totalSchedulePages}
                    className="btn btn-pagination nav-btn"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PATROL ACTIVITIES TABLE */}
        <div className="table-container activities-table">
          <div className="table-header">
            <div className="header-left">
              <h2 className="table-title">PATROL ACTIVITIES</h2>
              <div className="search-container no-print">
                <input
                  type="text"
                  placeholder="Search Activities"
                  className="search-input"
                  value={activitiesSearchTerm}
                  onChange={(e) => setActivitiesSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="loading-container no-print">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading patrol activities...</p>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tanod</th>
                      <th>Time Resolved</th>
                      <th>Location</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* For print, show all filtered activities instead of paginated ones */}
                    {(window.matchMedia && window.matchMedia('print').matches ? filteredActivities : currentActivities).length > 0 ? (
                      (window.matchMedia && window.matchMedia('print').matches ? filteredActivities : currentActivities).map((activity) => (
                        <tr key={activity.id}>
                          <td className="font-medium">#{activity.id}</td>
                          <td>{activity.tanod}</td>
                          <td>
                            {activity.time !== 'Not specified' ? new Date(activity.time).toLocaleString() : '—'}
                          </td>
                          <td title={activity.location}>
                            {activity.location}
                          </td>
                          <td>
                            <span className={`status-badge ${getStatusClass(activity.action)}`}>
                              {activity.action}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="no-data">
                          {isLoading ? "Loading..." : "No patrol activities found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination for Patrol Activities */}
              {totalPages > 1 && (
                <div className="pagination-container no-print">
                  <div className="pagination-mobile">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="btn btn-pagination"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="btn btn-pagination"
                    >
                      Next
                    </button>
                  </div>
                  <div className="pagination-desktop">
                    <div className="pagination-info">
                      <p>
                        Showing <span className="font-medium">{startIndex + 1}</span>
                        {' '}to <span className="font-medium">{Math.min(endIndex, filteredActivities.length)}</span>
                        {' '}of <span className="font-medium">{filteredActivities.length}</span>
                        {' '}results
                      </p>
                    </div>
                    <div className="pagination-nav">
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="btn btn-pagination nav-btn"
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`btn btn-pagination page-btn ${
                            currentPage === pageNumber ? 'active' : ''
                          }`}
                        >
                          {pageNumber}
                        </button>
                      ))}
                      
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="btn btn-pagination nav-btn"
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatrolLogs;