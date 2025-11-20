import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BASE_URL } from '../config';

const VerifyEmail = () => {
  const [message, setMessage] = useState('Verifying your email...');
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (token) {
        try {
          const response = await fetch(`${BASE_URL}/verify-email?token=${token}`);
          const data = await response.json();
          setMessage(data.message);
        } catch (error) {
          setMessage('An error occurred during email verification. Please try again.');
        }
      } else {
        setMessage('Invalid verification link.');
      }
    };

    verifyEmail();
  }, [location]);

  return (
    <div>
      <h2>Email Verification</h2>
      <p>{message}</p>
    </div>
  );
};

export default VerifyEmail;
