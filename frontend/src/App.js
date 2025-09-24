import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Favorites from './components/Favorites';
import History from './components/History';
import Login from "./components/Login";
import { GoogleOAuthProvider } from '@react-oauth/google';
import TranslatorHome from './components/Translator/TranslatorHome';
import ImageList from './components/ImageList';
import VoiceHome from './components/Translator/VoiceHome';
import VoiceHistory from './components/VoiceHistory';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const App = () => {

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<TranslatorHome />} />
          <Route path="/login"element={<Login />}/>
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/history" element={<History />} />
          <Route path="/imageTranslator" element={< ImageList/>} />
          <Route path="/voicehome" element={<VoiceHome />} />
          <Route path="/voicehistory" element={<VoiceHistory />} />
       
        </Routes>
      </div>
    </Router>
  );
};

export default App;
