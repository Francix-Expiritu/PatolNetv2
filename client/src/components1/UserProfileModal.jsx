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

  // Styles
  const styles = {
    modalBackdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContainer: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      width: '100%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'hidden',
      animation: 'modalSlideIn 0.3s ease'
    },
    modalHeader: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: '700',
      margin: 0
    },
    modalCloseBtn: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '28px',
      cursor: 'pointer',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      lineHeight: 1
    },
    modal: {
      maxHeight: 'calc(90vh - 100px)',
      overflowY: 'auto'
    },
    modalForm: {
      padding: '32px'
    },
    imageUploadSection: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '32px'
    },
    imagePreviewContainer: {
      textAlign: 'center'
    },
    imagePreview: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      border: '4px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      overflow: 'hidden',
      background: '#f9fafb',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    profileImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    defaultAvatarIcon: {
      width: '60px',
      height: '60px',
      color: '#9ca3af'
    },
    uploadLabel: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      display: 'inline-block',
      border: 'none'
    },
    fileInput: {
      display: 'none'
    },
    formField: {
      marginBottom: '20px'
    },
    fieldLabel: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px'
    },
    formInput: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
      outline: 'none'
    },
    formTextarea: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
      resize: 'vertical',
      outline: 'none',
      minHeight: '80px'
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '32px'
    },
    cancelBtn: {
      padding: '12px 24px',
      background: '#f3f4f6',
      color: '#374151',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'all 0.2s ease'
    },
    saveBtn: {
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'all 0.2s ease'
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}
      </style>
      <div 
        style={styles.modalBackdrop}
        onClick={handleBackdropClick}
      >
        <div style={styles.modalContainer}>
          <div style={styles.modalHeader}>
            <h2 style={styles.modalTitle}>User Profile</h2>
            <button 
              onClick={onClose}
              style={styles.modalCloseBtn}
              type="button"
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'rotate(90deg)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'none';
                e.target.style.transform = 'rotate(0deg)';
              }}
            >
              ×
            </button>
          </div>

          <div style={styles.modal}>
            <div style={styles.modalForm}>
              <div style={styles.imageUploadSection}>
                <div style={styles.imagePreviewContainer}>
                  <div 
                    style={styles.imagePreview}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#667eea';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {formData.image ? (
                      <img 
                        src={formData.image} 
                        alt="Profile" 
                        style={styles.profileImage}
                      />
                    ) : (
                      <svg style={styles.defaultAvatarIcon} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <label 
                    htmlFor="image-upload" 
                    style={styles.uploadLabel}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    Change Picture
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={styles.fileInput}
                  />
                </div>
              </div>

              <div style={styles.formField}>
                <label style={styles.fieldLabel}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  placeholder="Enter full name (leave empty to keep current)"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={styles.formField}>
                <label style={styles.fieldLabel}>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  placeholder="Enter username (leave empty to keep current)"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={styles.formField}>
                <label style={styles.fieldLabel}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  placeholder="Enter new password (leave blank to keep current)"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={styles.formField}>
                <label style={styles.fieldLabel}>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  style={styles.formTextarea}
                  placeholder="Enter address (leave empty to keep current)"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={styles.formField}>
                <label style={styles.fieldLabel}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  placeholder="Enter email address (leave empty to keep current)"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={onClose}
                  style={styles.cancelBtn}
                  onMouseOver={(e) => {
                    e.target.style.background = '#e5e7eb';
                    e.target.style.borderColor = '#d1d5db';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#f3f4f6';
                    e.target.style.borderColor = '#e5e7eb';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  style={styles.saveBtn}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfileModal;