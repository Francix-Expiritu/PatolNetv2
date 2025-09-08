import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests
import { BASE_URL } from '../config';



const User = ({ onLogout }) => {
  const [userData, setUserData] = useState(null); // Initialize userData state
  const [loading, setLoading] = useState(true); // Initialize loading state



  // Get username from URL params or localStorage - adjust as needed
  const username = new URLSearchParams(window.location.search).get('username') || localStorage.getItem('username'); // Get username from localStorage if not in URL

  const emergencyContacts = {
    barangay: "+639123456789",
  };

  useEffect(() => {
    const fetchUserData = async () => { // Define fetchUserData inside useEffect
      try {
        const response = await axios.get(`${BASE_URL}/api/user/${username}`); // Use axios and BASE_URL
        if (response.status === 200) {
          setUserData(response.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username]); // Removed fetchUserData from dependency array as it's defined inside



  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading user data...</div>;
  }

  if (!userData) {
    return <div className="min-h-screen flex items-center justify-center">Failed to load user data.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto text-center">
          {/* Header Section */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-3">
            Welcome back, {username}
          </h1>
          <p className="text-gray-600 font-medium mb-10">
            Your community safety network
          </p>

          {/* Under Development Section */}
          <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-28 h-28 text-indigo-500 mb-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376a11.959 11.959 0 002.577 3.884A11.959 11.959 0 0012 
                21c2.652 0 5.1-.863 7.071-2.318a11.96 11.96 0 
                002.577-3.884M15 9v3.75m-6 0h6"
              />
            </svg>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Page Under Development
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
              We're working hard to bring you this feature soon. Please check
              back later!
            </p>

            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition">
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;