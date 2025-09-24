import React, { useState } from 'react';
import { voicetranslateText } from './VoicetranslateText';
import { voicetranslateText2 } from './VoicetranslateText2';
import TranslatorImage from './TranslatorImage';
import { addFavorite } from '../../services/api';
import { Filter } from 'bad-words';
import {
  MicrophoneIcon,
  SpeakerphoneIcon,
  ClipboardIcon,
  SwitchHorizontalIcon,
  HeartIcon,
} from '@heroicons/react/solid';
import Sidebar from '../Nav/Sidebar';

const VoiceHome = ({ user }) => {
  const [fromText, setFromText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [fromLang, setFromLang] = useState('en');
  const [toLang, setToLang] = useState('si');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Text');
  const filter = new Filter();

  // Function to handle translation
  const handleTranslateText = () => {
    voicetranslateText(
      fromText,
      fromLang,
      toLang,
      setLoading,
      setError,
      setTranslatedText,
      user
    );
  };

   // Function to handle translation
   const handleTranslateText2 = () => {
    voicetranslateText2(
      fromText,
      fromLang,
      toLang,
      setLoading,
      setError,
      setTranslatedText,
      user
    );
  };

  // Function to swap languages
  const handleLanguageSwap = () => {
    const temp = fromLang;
    setFromLang(toLang);
    setToLang(temp);
  };

  // Function to copy translated text to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    alert('Copied to clipboard!');
  };

  // Function to add translation to favorites
  const handleAddToFavorite = async () => {
    if (fromText && translatedText) {
      try {
        await addFavorite(fromText, translatedText, user);
        alert('Added to favorites!');
      } catch (error) {
        console.error('Failed to add to favorites:', error);
        alert('Failed to add to favorites. Please try again.');
      }
    } else {
      alert('Please translate the text before adding to favorites.');
    }
  };

  // Function to check for inappropriate language
  const handleTextChange = (e) => {
    const text = e.target.value;
    setFromText(text);
    if (filter.isProfane(text)) {
      setError('Inappropriate language detected.');
    } else {
      setError('');
    }
  };

  // Function for Text-to-Speech
  const handleTextToSpeech = () => {
    const speech = new SpeechSynthesisUtterance(translatedText);
    speech.lang = toLang === 'si' ? 'si-LK' : 'en-US'; // Adjust based on language
    window.speechSynthesis.speak(speech);
  };

  // Function for Speech-to-Text
const handleSpeechToText = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    setError('Speech Recognition is not supported in this browser.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = fromLang; // Set the language for speech recognition
  recognition.interimResults = false;

  recognition.onstart = () => {
    console.log('Speech recognition started');
    setLoading(true);
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setFromText(transcript);
    setLoading(false);
  };

  recognition.onerror = (event) => {
    setError(`Error occurred in recognition: ${event.error}`);
    setLoading(false);
  };

  recognition.start();
};



  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 bg-gray-100 overflow-auto">
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg p-6 md:p-8 mt-16 w-11/12">
          {/* Tab Selection */}
          <div className="flex border-b border-gray-300 mb-6">
            <button
              className={`flex-1 py-3 text-lg font-semibold ${
                activeTab === 'Text'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('Text')}
            >
              Text
            </button>
            <button
              className={`flex-1 py-3 text-lg font-semibold ${
                activeTab === 'Image'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('Image')}
            >
              Image
            </button>
          </div>

          {/* Text Translation Tab */}
          {activeTab === 'Text' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <textarea
                  value={fromText}
                  onChange={handleTextChange}
                  placeholder="Enter text here..."
                  className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                ></textarea>

                <div className="relative">
                  <textarea
                    value={translatedText}
                    readOnly
                    placeholder="Translation appears here..."
                    className="w-full h-48 p-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 focus:outline-none"
                  ></textarea>
                  <button
                    onClick={copyToClipboard}
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 transition duration-300"
                  >
                    <ClipboardIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Language Dropdowns */}
              <div className="flex items-center justify-between gap-4">
                <button
                  className="text-gray-600 hover:text-gray-800 transition duration-300"
                  onClick={handleSpeechToText}
                >
                  <MicrophoneIcon className="h-6 w-6" />
                </button>

                <select
                  value={fromLang}
                  onChange={(e) => setFromLang(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                >
                  <option value="en">English</option>
                  <option value="si">Sinhala</option>
                </select>

                <button
                  onClick={handleLanguageSwap}
                  className="text-gray-600 hover:text-gray-800 transition duration-300"
                >
                  <SwitchHorizontalIcon className="h-6 w-6" />
                </button>

                <select
                  value={toLang}
                  onChange={(e) => setToLang(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                >
                  <option value="si">Sinhala</option>
                  <option value="en">English</option>
                </select>

                <button
                  className="text-gray-600 hover:text-gray-800 transition duration-300"
                  onClick={handleTextToSpeech}
                >
                  <SpeakerphoneIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Translate Button */}
              <button
                onClick={handleTranslateText2}
                className={`w-full py-3 rounded-lg text-white font-semibold ${
                  loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
                } transition duration-300`}
                disabled={loading}
              >
                {loading ? 'Translating...' : 'Translate Text'}
              </button>

              <button
                onClick={handleTranslateText}
                className={`w-full py-3 rounded-lg text-white font-semibold ${
                  loading ? 'bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
                } transition duration-300`}
                disabled={loading}
              >
                save
              </button>

              {error && (
                <p className="text-red-500 text-center mt-2">{error}</p>
              )}

              {/* Add to Favorite Button */}
              <button
                onClick={handleAddToFavorite}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center mt-4"
              >
                <HeartIcon className="h-6 w-6 mr-2" />
                Add to Favorites
              </button>
            </div>
          )}

          {/* Image Translation Tab */}
          {activeTab === 'Image' && (
            <div>
              <TranslatorImage
                fromLang={fromLang}
                toLang={toLang}
                user={user}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceHome;
