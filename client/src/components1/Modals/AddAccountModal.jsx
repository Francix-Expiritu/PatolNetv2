import React, { useState } from "react";
import { X } from "lucide-react";
import "./AddAccountModal.css";
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
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

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

    try {
      const registerResponse = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAccount),
      });

      const registerData = await registerResponse.json();

      if (registerData.success) {
        onAccountAdded();
        onClose();
        setNewAccount({
          role: "Resident",
          name: "",
          username: "",
          email: "",
          password: "",
          address: "",
          status: "Pending",
          verificationCode: "",
        });
      } else {
        alert(registerData.message || "Failed to create account");
      }
    } catch (error) {
      console.error("Failed to create account:", error);
      alert("Failed to create account. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">Create New Account</h3>
          <button onClick={onClose} className="modal-close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form className="modal-form" onSubmit={handleAddAccount}>
          <div className="modal-grid">
            <div>
              <label className="modal-label">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={newAccount.name}
                onChange={handleInputChange}
                required
                className="modal-input"
              />
            </div>

            <div>
              <label className="modal-label">
                Account Type
              </label>
              <select
                name="role"
                value={newAccount.role}
                onChange={handleInputChange}
                className="modal-select"
              >
                <option value="Resident">Resident</option>
                <option value="Tanod">Tanod</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="modal-label">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={newAccount.username}
                onChange={handleInputChange}
                required
                className="modal-input"
              />
            </div>

            <div>
              <label className="modal-label">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={newAccount.password}
                onChange={handleInputChange}
                required
                className="modal-input"
              />
            </div>

            <div className="full-span">
              <label className="modal-label">
                Email Address
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  name="email"
                  value={newAccount.email}
                  onChange={handleInputChange}
                  required
                  className="modal-input"
                />
                <button
                  type="button"
                  onClick={handleSendVerificationEmail}
                  disabled={isVerifying}
                  className="btn-cancel"
                >
                  {isVerifying ? "Sending..." : "Send Code"}
                </button>
              </div>
            </div>

            <div className="full-span">
              <label className="modal-label">
                Verification Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="verificationCode"
                  value={newAccount.verificationCode}
                  onChange={handleInputChange}
                  required
                  className="modal-input"
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={isVerifying}
                  className="btn-cancel"
                >
                  {isVerifying ? "Verifying..." : "Verify"}
                </button>
              </div>
              {verificationMessage && <p className={`small-note ${isCodeVerified ? 'text-green-600' : 'text-red-600'}`}>{verificationMessage}</p>}
            </div>

            <div className="full-span">
              <label className="modal-label">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={newAccount.address}
                onChange={handleInputChange}
                required
                className="modal-input"
              />
            </div>

            <div>
              <label className="modal-label">
                Status
              </label>
              <select
                name="status"
                value={newAccount.status}
                onChange={handleInputChange}
                className="modal-select"
              >
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
            >
              Save Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;
