import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'; // You might need to install this: npm install jwt-decode
import { useNavigate } from 'react-router-dom';

// Your client ID
const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

// Function to calculate age from birthdate
const calculateAge = (birthdate) => {
  const birthDate = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust age if the birth month or date hasn't occurred yet this year
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

// Login Component
const Login = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = async (credentialResponse) => {
    // The 'credential' field contains the ID Token.
    const idToken = credentialResponse.credential;
    console.log("Received ID Token:", idToken);
    
    // You can decode it on the frontend to get basic user info if needed
    const decoded = jwtDecode(idToken);
    console.log("Decoded Token:", decoded);

    try {
      // **This is the crucial step: send the ID Token to your backend**
      const response = await fetch('http://localhost:8175/auth/google', { // Ensure the port matches your server.js
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: idToken }), // The backend expects an object with an 'idToken' key
      });

      if (!response.ok) {
        throw new Error('Backend authentication failed');
      }

      const data = await response.json();
      console.log('Backend Response:', data);
      
      navigate('/');

    } catch (error) {
      console.error('Login Failed:', error);
    }
  };

  const handleLoginError = () => {
    console.log('Login Failed');
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
      />
    </div>
  );
};

export default Login;
