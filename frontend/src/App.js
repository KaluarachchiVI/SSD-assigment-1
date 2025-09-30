import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Favorites from './components/Favorites';
import History from './components/History';
import Login from "./components/Auth/Login";
import { GoogleOAuthProvider } from '@react-oauth/google';
import TranslatorHome from './components/Translator/TranslatorHome';
import ImageList from './components/ImageList';
import VoiceHome from './components/Translator/VoiceHome';
import VoiceHistory from './components/VoiceHistory';
import Register from "./components/Auth/register";
import LoginPage from "./components/Auth/loginpage";
import axios from 'axios';
const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
if (!clientId) {
  console.error('REACT_APP_GOOGLE_CLIENT_ID is not set. Define it in frontend/.env and restart the dev server.');
}

const App = () => {
  // Fetch CSRF token when app loads
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        await axios.get('http://localhost:5000/api/csrf-token', { 
          withCredentials: true 
        });
        console.log('CSRF token fetched successfully');
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };

    fetchCsrfToken();
  }, []);

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/home" element={<TranslatorHome />} />
          <Route
            path="/login"
            element={
              <GoogleOAuthProvider clientId={clientId}>
                <Login />
              </GoogleOAuthProvider>
            }
          />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/history" element={<History />} />
          <Route path="/imageTranslator" element={< ImageList/>} />
          <Route path="/voicehome" element={<VoiceHome />} />
          <Route path="/voicehistory" element={<VoiceHistory />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<LoginPage />} />
       
        </Routes>
      </div>
    </Router>
  );
};

export default App;
