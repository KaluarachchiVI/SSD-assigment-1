import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
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

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log('Login Success', tokenResponse);

      // Fetch user's profile information using Google API
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      })
        .then((res) => res.json())
        .then((profile) => {
          console.log(profile);

          // Calculate age if the birthdate is available
          const age = profile.birthdate
            ? calculateAge(profile.birthdate)
            : null;

          // Redirect to Home page with user info (email, id, age)
          navigate('/', {
            state: { email: profile.email, id: profile.sub, age },
          });
        })
        .catch((err) => console.log(err));
    },
    onError: (error) => {
      console.log('Login Failed', error);
    },
    scope:
      'https://www.googleapis.com/auth/user.birthday.read', // Added scopes for profile and birthday
  });

  return (
    <div>
      <button onClick={() => login()}>Login with Google</button>
    </div>
  );
};

export default Login;
