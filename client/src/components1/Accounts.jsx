import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../config';

import './Accounts.css';
import MainSidebarWrapper from './MainSidebarWrapper'; 
import AddAccountModal from './Modals/AddAccountModal'; // Import the new modal component
import EditAccountModal from './Modals/EditAccountModal';

function Accounts() {
  const [accounts, setAccounts] = useState([]);

  const [editAccount, setEditAccount] = useState({
    id: null,
    type: '',
    name: '',
    username: '',
    email: '',
    address: '',
    status: ''
  });

  const [showForm, setShowForm] = useState(false); // This now controls the AddAccountModal
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');

  // Fetch users data from database
  useEffect(() => {
  // Initial fetch
  fetchUsers();
  
  // Set up interval for automatic refresh every 3 seconds
  const interval = setInterval(() => {
    fetchUsers();
  }, 3000);
  
  // Cleanup interval on component unmount
  return () => clearInterval(interval);
}, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/users`);
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditAccount((prev) => ({ ...prev, [name]: value }));
  };

  // Improved handleEditAccount function for the frontend

const handleEditAccount = async (e) => {
  e.preventDefault();
  if (!editAccount.name || !editAccount.username) return;
  
  try {
    const response = await fetch(`${BASE_URL}/api/users/${editAccount.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: editAccount.username,
        role: editAccount.type,
        name: editAccount.name,
        email: editAccount.email || '',
        address: editAccount.address || '',
        status: editAccount.status
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Show success message
      alert('Account updated successfully!');
      
      // Refresh the user list
      fetchUsers();
      
      // Reset form and close
      setEditAccount({
        id: null,
        type: '',
        name: '',
        username: '',
        email: '',
        status: ''
      });
      setShowEditForm(false);
    } else {
      alert(data.message || 'Failed to update account');
    }
  } catch (error) {
    console.error("Failed to update account:", error);
    alert('Failed to update account. Please try again.');
  }
}

  const handleEditClick = (account) => {
    setEditAccount({
      id: account.ID,
      type: account.ROLE,
      name: account.NAME || '',
      username: account.USER,
      email: account.EMAIL || '',
      address: account.ADDRESS || '',
      status: account.STATUS
    });
    setShowEditForm(true);
  };

  const handleDeleteAccount = async (accountId) => {
  if (!window.confirm('Are you sure you want to delete this account?')) {
    return;
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/users/${accountId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Show success message
      alert('Account deleted successfully!');
      
      // Refresh the user list
      fetchUsers();
    } else {
      alert(data.message || 'Failed to delete account');
    }
  } catch (error) {
    console.error("Failed to delete account:", error);
    alert('Failed to delete account. Please try again.');
  }
};

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch =
      account.USER?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.EMAIL?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'All') return matchesSearch;
    return matchesSearch && account.ROLE === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Replace the hardcoded header with the Navbar component */}
      <MainSidebarWrapper />

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <svg className="mr-2 h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    User Accounts Management
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage system users, assign roles and permissions
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <button
                    onClick={() => {
                      setShowForm(!showForm);
                      setShowEditForm(false);
                    }}
                    className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      showForm ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    {showForm ? (
                      <>
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        Cancel
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Add Account
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Add Account Modal */}
              <AddAccountModal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onAccountAdded={fetchUsers}
              />

              <EditAccountModal
                isOpen={showEditForm}
                onClose={() => setShowEditForm(false)}
                editAccount={editAccount}
                handleEditInputChange={handleEditInputChange}
                handleEditAccount={handleEditAccount}
              />

              <div className="mt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 mb-4">
                  <div className="w-full md:w-64 flex items-center relative">
                    <svg className="h-4 w-4 absolute left-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search accounts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-3 py-2 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <div className="relative inline-block text-left">
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="All">All Types</option>
                        <option value="Resident">Resident</option>
                        <option value="Tanod">Tanod</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                ID
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                ACCOUNT
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                USER
                              </th>
                              
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                TYPE
                              </th>
                              <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  EMAIL
                                </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                ADDRESS
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                STATUS
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAccounts.length > 0 ? (
                              filteredAccounts.map((account) => (
                                <tr key={account.ID} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    #{account.ID}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-10 w-10">
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                          {account.ROLE === 'Tanod' ? (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                            </svg>
                                          ) : (
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                            </svg>
                                          )}
                                        </div>
                                      </div>
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{account.NAME || account.USER}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {account.USER}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      account.ROLE === 'Tanod' 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : account.ROLE === 'Admin'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      {account.ROLE}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {account.EMAIL || '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {account.ADDRESS
                                        ? account.ADDRESS.length > 15
                                          ? account.ADDRESS.slice(0, 15) + '...'
                                          : account.ADDRESS
                                        : '-'}
                                    </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      account.STATUS === 'Active' || account.STATUS === 'Verified'
                                        ? 'bg-green-100 text-green-800' 
                                        : account.STATUS === 'Pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {account.STATUS}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                      onClick={() => handleEditClick(account)}
                                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 mr-2"
                                    >
                                      <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                      </svg>
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteAccount(account.ID)}
                                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                                    >
                                      <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                  No accounts found matching your search criteria
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Accounts;