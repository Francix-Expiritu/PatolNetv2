import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../config';

import './Accounts.css';
import MainSidebarWrapper from './MainSidebarWrapper'; 
import AddAccountModal from './Modals/AddAccountModal';
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

  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(() => {
      fetchUsers();
    }, 3000);
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
        alert('Account updated successfully!');
        fetchUsers();
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
  };

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
        alert('Account deleted successfully!');
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
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      account.USER?.toLowerCase().includes(searchLower) ||
      account.EMAIL?.toLowerCase().includes(searchLower) ||
      account.NAME?.toLowerCase().includes(searchLower) ||
      String(account.ID).includes(searchLower);

    if (filter === 'All') return matchesSearch;
    return matchesSearch && account.ROLE === filter;
  });

  return (
    <div className="admin-layout">
      <MainSidebarWrapper />

      <main className="admin-content">
        <div className="accounts-content-wrapper">
          <div className="accounts-page-header">
            <h1 className="accounts-page-title">User Accounts Management</h1>
            <p className="accounts-page-subtitle">Manage system users, assign roles and permissions</p>
          </div>

          <div className="accounts-table-card">
            <div className="accounts-table-controls">
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="accounts-search-input"
              />
              
              <div className="accounts-controls-right">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="accounts-filter-select"
                >
                  <option value="All">All Types</option>
                  <option value="Resident">Resident</option>
                  <option value="Tanod">Tanod</option>
                  <option value="Admin">Admin</option>
                </select>
                
                <button
                  onClick={() => {
                    setShowForm(!showForm);
                    setShowEditForm(false);
                  }}
                  className="accounts-refresh-btn"
                >
                  {showForm ? 'Cancel' : 'Add Account'}
                </button>
              </div>
            </div>

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

            <div className="accounts-table-container">
              <table className="accounts-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>ACCOUNT</th>
                    <th>STATUS</th>
                    <th>TYPE</th>
                    <th>EMAIL</th>
                    <th>ADDRESS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((account) => (
                      <tr key={account.ID}>
                        <td className="accounts-id-cell">#{String(account.ID).padStart(5, '0')}</td>
                        <td className="accounts-name">{account.NAME || account.USER}</td>
                        <td>
                          <span className={`accounts-status-badge ${account.STATUS === 'Active' || account.STATUS === 'Verified' ? 'accounts-status-active' : 
                            account.STATUS === 'Pending' ? 'accounts-status-pending' : 'accounts-status-inactive'}`}>
                            {account.STATUS}
                          </span>
                        </td>
                        <td>{account.ROLE}</td>
                        <td className="accounts-email-text">{account.EMAIL || 'Not assigned'}</td>
                        <td className="accounts-address-text">
                          {account.ADDRESS
                            ? account.ADDRESS.length > 20
                              ? account.ADDRESS.slice(0, 20) + '...'
                              : account.ADDRESS
                            : 'Not assigned'}
                        </td>
                        <td>
                          <div className="accounts-action-buttons">
                            <button 
                              onClick={() => handleEditClick(account)}
                              className="accounts-edit-btn"
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteAccount(account.ID)}
                              className="accounts-delete-btn"
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="accounts-no-data">
                        No accounts found matching your search criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Accounts;