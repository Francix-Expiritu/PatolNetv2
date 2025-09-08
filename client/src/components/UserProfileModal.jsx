import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../config';

const UserProfileModal = ({ isOpen, onClose, userProfile, onSave }) => {
  const [formData, setFormData] = useState({
    image: '',
    imageFile: null,
    fullName: userProfile?.NAME || '',
    username: userProfile?.USERNAME || localStorage.getItem('username') || '',
    password: '',
    address: userProfile?.ADDRESS || '',
    email: userProfile?.EMAIL || ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        image: userProfile.IMAGE ? `${BASE_URL}/uploads/${userProfile.IMAGE}` : '',
        imageFile: null,
        fullName: userProfile.NAME || '',
        username: userProfile.USERNAME || localStorage.getItem('username') || '',
        password: '',
        address: userProfile.ADDRESS || '',
        email: userProfile.EMAIL || ''
      });
    }
  }, [userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: e.target.result,
          imageFile: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    console.log('Saving profile data:', formData);
    
    const username = localStorage.getItem('username');
    if (!username) {
      alert('Error: No username found. Please log in again.');
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      const originalData = {
        name: userProfile?.NAME || '',
        username: userProfile?.USERNAME || '',
        address: userProfile?.ADDRESS || '',
        email: userProfile?.EMAIL || ''
      };

      if (formData.fullName.trim() && formData.fullName.trim() !== originalData.name) {
        formDataToSend.append('name', formData.fullName.trim());
      }
      
      if (formData.username.trim() && formData.username.trim() !== originalData.username) {
        formDataToSend.append('username', formData.username.trim());
      }
      
      if (formData.password.trim()) {
        formDataToSend.append('password', formData.password.trim());
      }
      
      if (formData.address.trim() && formData.address.trim() !== originalData.address) {
        formDataToSend.append('address', formData.address.trim());
      }
      
      if (formData.email.trim() && formData.email.trim() !== originalData.email) {
        formDataToSend.append('email', formData.email.trim());
      }
      
      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
      }

      const hasChanges = Array.from(formDataToSend.keys()).length > 0;
      if (!hasChanges) {
        alert('No changes detected.');
        onClose();
        return;
      }

      console.log('FormData to send:', Array.from(formDataToSend.entries()));

      const response = await fetch(`${BASE_URL}/api/user/${username}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('Profile updated successfully:', result);
        
        if (formData.username.trim() && formData.username.trim() !== originalData.username) {
          localStorage.setItem('username', formData.username.trim());
        }
        
        if (result.image) {
          localStorage.setItem('userImage', result.image);
        }
        
        if (onSave) {
          onSave();
        }
        
        alert('Profile updated successfully!');
        onClose();
      } else {
        console.error('Failed to update profile:', result);
        alert(result.message || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">User Profile</h2>
          <button 
            onClick={onClose}
            className="modal-close-btn"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="modal">
          <div className="modal-form">
            <div className="image-upload-section">
              <div className="image-preview-container">
                <div className="image-preview">
                  {formData.image ? (
                    <img 
                      src={formData.image} 
                      alt="Profile" 
                      className="profile-image"
                    />
                  ) : (
                    <svg className="default-avatar-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <label htmlFor="image-upload" className="upload-label">
                  Change Picture
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter full name (leave empty to keep current)"
              />
            </div>

            <div className="form-field">
              <label className="field-label">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter username (leave empty to keep current)"
              />
            </div>

            <div className="form-field">
              <label className="field-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter new password (leave blank to keep current)"
              />
            </div>

            <div className="form-field">
              <label className="field-label">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className="form-textarea"
                placeholder="Enter address (leave empty to keep current)"
              />
            </div>

            <div className="form-field">
              <label className="field-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter email address (leave empty to keep current)"
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="save-btn"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
