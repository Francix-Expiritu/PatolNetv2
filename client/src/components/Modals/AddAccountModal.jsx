import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Lock,
  Mail,
  MapPin,
  Shield,
  CheckCircle,
  Eye,
  EyeOff,
  Save,
  Activity,
  Key,
} from "lucide-react";
import { BASE_URL } from '../../config';

const AddAccountModal = ({ isOpen, onClose, onAccountAdded }) => {
  const [newAccount, setNewAccount] = useState({
    role: "Resident",
    name: "",
    username: "",
    email: "",
    password: "",
    address: "",
    status: "Pending",
    verificationCode: "",
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
      // Reset all state on close
      setNewAccount({
        role: "Resident", name: "", username: "", email: "",
        password: "", address: "", status: "Pending", verificationCode: "",
      });
      setIsVerifying(false);
      setIsCodeVerified(false);
      setVerificationMessage("");
      setIsSubmitting(false);
      setShowPassword(false);
    }, 300);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendVerificationEmail = async () => {
    if (!newAccount.email) {
      alert("Please enter an email address.");
      return;
    }

    setIsVerifying(true);
    setVerificationMessage("");

    try {
      const response = await fetch(`${BASE_URL}/pre-register-send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newAccount.email }),
      });

      const data = await response.json();

      if (data.success) {
        setVerificationMessage("Verification code sent to your email.");
      } else {
        setVerificationMessage(data.message || "Failed to send verification email.");
      }
    } catch (error) {
      console.error("Failed to send verification email:", error);
      setVerificationMessage("Failed to send verification email. Please try again.");
    }

    setIsVerifying(false);
  };

  const handleVerifyCode = async () => {
    if (!newAccount.email || !newAccount.verificationCode) {
      alert("Please enter your email and verification code.");
      return;
    }

    setIsVerifying(true);
    setVerificationMessage("");

    try {
      const response = await fetch(`${BASE_URL}/pre-register-verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newAccount.email, code: newAccount.verificationCode }),
      });

      const data = await response.json();

      if (data.success) {
        setIsCodeVerified(true);
        setVerificationMessage("Email verified successfully!");
      } else {
        setIsCodeVerified(false);
        setVerificationMessage(data.message || "Failed to verify code.");
      }
    } catch (error) {
      console.error("Failed to verify code:", error);
      setVerificationMessage("Failed to verify code. Please try again.");
    }

    setIsVerifying(false);
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!isCodeVerified) {
      alert("Please verify your email before creating an account.");
      return;
    }

    if (!newAccount.name || !newAccount.username || !newAccount.password || !newAccount.email || !newAccount.address) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const registerResponse = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAccount),
      });

      const registerData = await registerResponse.json();

      if (registerData.success) {
        onAccountAdded();
        handleClose();
      } else {
        alert(registerData.message || "Failed to create account");
      }
    } catch (error) {
      console.error("Failed to create account:", error);
      alert("Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !isVisible) return null;

  const modalStyles = {
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '1rem',
      opacity: isClosing ? 0 : 1,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    modal: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
      backdropFilter: 'blur(20px)', borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.3)', maxWidth: '600px',
      width: '100%', maxHeight: '90vh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      transform: isClosing ? 'scale(0.95) translateY(10px)' : 'scale(1) translateY(0)',
      opacity: isClosing ? 0 : 1,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1.5rem 2rem', position: 'relative',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      flexShrink: 0,
    },
    title: {
      color: 'white', fontSize: '1.5rem', fontWeight: '700',
      margin: 0, textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem',
      marginTop: '0.25rem',
    },
    body: {
      padding: '2rem', background: 'rgba(255, 255, 255, 0.8)',
      overflowY: 'auto', flex: '1 1 auto',
    },
    inputGroup: { marginBottom: '1.25rem' },
    label: {
      display: 'flex', alignItems: 'center', fontSize: '0.875rem',
      fontWeight: '600', color: '#374151', marginBottom: '0.5rem',
    },
    input: {
      width: '100%', padding: '0.875rem 1rem', fontSize: '1rem',
      border: '2px solid rgba(209, 213, 219, 0.8)', borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', outline: 'none',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    inputFocus: {
      border: '2px solid #667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      background: 'white',
    },
    select: {
      width: '100%', padding: '0.875rem 1rem', fontSize: '1rem',
      border: '2px solid rgba(209, 213, 219, 0.8)', borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', outline: 'none',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: 'right 0.5rem center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '1.5em 1.5em',
      paddingRight: '2.5rem',
    },
    footer: {
      padding: '1.5rem 2rem', background: 'rgba(249, 250, 251, 0.9)',
      backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(229, 231, 235, 0.5)',
      display: 'flex', gap: '1rem', justifyContent: 'flex-end',
      flexShrink: 0,
    },
    saveButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white', border: 'none', borderRadius: '12px',
      padding: '0.875rem 2rem', fontSize: '0.875rem', fontWeight: '600',
      cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 6px -1px rgba(102, 126, 234, 0.3)',
      display: 'flex', alignItems: 'center', gap: '0.5rem',
    },
    cancelButton: {
      background: 'rgba(255, 255, 255, 0.9)', color: '#6b7280',
      border: '2px solid rgba(209, 213, 219, 0.8)', borderRadius: '12px',
      padding: '0.875rem 1.5rem', fontSize: '0.875rem', fontWeight: '600',
      cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    secondaryButton: {
      background: 'rgba(255, 255, 255, 0.8)', color: '#4f46e5',
      border: '2px solid #c7d2fe', borderRadius: '12px',
      padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: '600',
      cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap',
    },
    closeIcon: {
      position: 'absolute', top: '1rem', right: '1rem',
      background: 'rgba(255, 255, 255, 0.2)', border: 'none',
      borderRadius: '50%', width: '32px', height: '32px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', color: 'white',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 2,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.25rem',
    },
    fullSpan: {
      gridColumn: '1 / -1',
    },
    verificationMessage: {
      marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: '500',
      display: 'flex', alignItems: 'center',
    },
    passwordWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    passwordToggle: {
      position: 'absolute', right: '1rem', top: '50%',
      transform: 'translateY(-50%)', background: 'transparent',
      border: 'none', cursor: 'pointer', color: '#6b7280',
    }
  };

  const applyFocusStyles = (e) => Object.assign(e.target.style, modalStyles.inputFocus);
  const removeFocusStyles = (e) => {
    e.target.style.border = '2px solid rgba(209, 213, 219, 0.8)';
    e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
    e.target.style.background = 'rgba(255, 255, 255, 0.9)';
  };

  return (
    <div style={modalStyles.overlay} onClick={handleClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>Create New Account</h2>
          <p style={modalStyles.subtitle}>Fill in the details to register a new user.</p>
          <button
            style={modalStyles.closeIcon}
            onClick={handleClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAddAccount} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', overflow: 'hidden' }}>
          <div style={modalStyles.body}>
            <div style={modalStyles.grid}>
              <div style={modalStyles.inputGroup}>
                <label htmlFor="name" style={modalStyles.label}>
                  <User size={14} style={{ marginRight: '8px' }} /> Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={newAccount.name}
                  onChange={handleInputChange}
                  required
                  style={modalStyles.input}
                  onFocus={applyFocusStyles}
                  onBlur={removeFocusStyles}
                  placeholder="e.g., Juan Dela Cruz"
                />
              </div>

              <div style={modalStyles.inputGroup}>
                <label htmlFor="role" style={modalStyles.label}>
                  <Shield size={14} style={{ marginRight: '8px' }} /> Account Type
                </label>
                <select
                  id="role"
                  name="role"
                  value={newAccount.role}
                  onChange={handleInputChange}
                  style={modalStyles.select}
                  onFocus={applyFocusStyles}
                  onBlur={removeFocusStyles}
                >
                  <option value="Resident">Resident</option>
                  <option value="Tanod">Tanod</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div style={modalStyles.inputGroup}>
                <label htmlFor="username" style={modalStyles.label}>
                  <User size={14} style={{ marginRight: '8px' }} /> Username
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={newAccount.username}
                  onChange={handleInputChange}
                  required
                  style={modalStyles.input}
                  onFocus={applyFocusStyles}
                  onBlur={removeFocusStyles}
                  placeholder="Create a username"
                />
              </div>

              <div style={modalStyles.inputGroup}>
                <label htmlFor="password" style={modalStyles.label}>
                  <Lock size={14} style={{ marginRight: '8px' }} /> Password
                </label>
                <div style={modalStyles.passwordWrapper}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={newAccount.password}
                    onChange={handleInputChange}
                    required
                    style={modalStyles.input}
                    onFocus={applyFocusStyles}
                    onBlur={removeFocusStyles}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={modalStyles.passwordToggle}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ ...modalStyles.inputGroup, ...modalStyles.fullSpan }}>
                <label htmlFor="email" style={modalStyles.label}>
                  <Mail size={14} style={{ marginRight: '8px' }} /> Email Address
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={newAccount.email}
                    onChange={handleInputChange}
                    required
                    disabled={isCodeVerified}
                    style={{ ...modalStyles.input, flex: 1 }}
                    onFocus={applyFocusStyles}
                    onBlur={removeFocusStyles}
                    placeholder="your.email@example.com"
                  />
                  <button
                    type="button"
                    onClick={handleSendVerificationEmail}
                    disabled={isVerifying || isCodeVerified}
                    style={{
                      ...modalStyles.secondaryButton,
                      ...(isVerifying || isCodeVerified ? { opacity: 0.6, cursor: 'not-allowed' } : {})
                    }}
                  >
                    {isVerifying ? "Sending..." : "Send Code"}
                  </button>
                </div>
              </div>

              <div style={{ ...modalStyles.inputGroup, ...modalStyles.fullSpan }}>
                <label htmlFor="verificationCode" style={modalStyles.label}>
                  <Key size={14} style={{ marginRight: '8px' }} /> Verification Code
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    id="verificationCode"
                    type="text"
                    name="verificationCode"
                    value={newAccount.verificationCode}
                    onChange={handleInputChange}
                    required
                    disabled={isCodeVerified}
                    style={{ ...modalStyles.input, flex: 1 }}
                    onFocus={applyFocusStyles}
                    onBlur={removeFocusStyles}
                    placeholder="Enter code from email"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={isVerifying || isCodeVerified}
                    style={{
                      ...modalStyles.secondaryButton,
                      ...(isVerifying || isCodeVerified ? { opacity: 0.6, cursor: 'not-allowed' } : {})
                    }}
                  >
                    {isVerifying ? "Verifying..." : "Verify"}
                  </button>
                </div>
                {verificationMessage && (
                  <p style={{ ...modalStyles.verificationMessage, color: isCodeVerified ? '#16a34a' : '#dc2626' }}>
                    {isCodeVerified && <CheckCircle size={14} style={{ marginRight: '4px', flexShrink: 0 }} />}
                    {verificationMessage}
                  </p>
                )}
              </div>

              <div style={{ ...modalStyles.inputGroup, ...modalStyles.fullSpan }}>
                <label htmlFor="address" style={modalStyles.label}>
                  <MapPin size={14} style={{ marginRight: '8px' }} /> Address
                </label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={newAccount.address}
                  onChange={handleInputChange}
                  required
                  style={modalStyles.input}
                  onFocus={applyFocusStyles}
                  onBlur={removeFocusStyles}
                  placeholder="e.g., 123 Rizal St, Barangay Tignoan"
                />
              </div>

              <div style={modalStyles.inputGroup}>
                <label htmlFor="status" style={modalStyles.label}>
                  <Activity size={14} style={{ marginRight: '8px' }} /> Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={newAccount.status}
                  onChange={handleInputChange}
                  style={modalStyles.select}
                  onFocus={applyFocusStyles}
                  onBlur={removeFocusStyles}
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={modalStyles.footer}>
            <button
              type="button"
              onClick={handleClose}
              style={modalStyles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isCodeVerified || isSubmitting}
              style={{
                ...modalStyles.saveButton,
                ...(!isCodeVerified || isSubmitting ? { opacity: 0.6, cursor: 'not-allowed' } : {})
              }}
            >
              <Save size={18} />
              {isSubmitting ? "Saving..." : "Save Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;
