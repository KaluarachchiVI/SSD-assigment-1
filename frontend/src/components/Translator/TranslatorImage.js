import React, { useState, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import { translateText } from './translateText';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TranslatorImage = ({ fromLang, toLang, user }) => {
  const [imageBase64, setImageBase64] = useState('');
  const [fromText, setFromText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const navigate = useNavigate();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      convertToBase64(file);
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      convertToBase64(file);
    }
  };

  const convertToBase64 = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
      extractTextFromImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const extractTextFromImage = (base64Image) => {
    setLoading(true);
    Tesseract.recognize(base64Image, 'eng', { logger: (m) => console.log(m) })
      .then(({ data: { text } }) => {
        setFromText(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to extract text from the image.');
        setLoading(false);
      });
  };

  const handleTranslateImageText = () => {
    translateText(
      fromText,
      fromLang,
      toLang,
      setLoading,
      setError,
      setTranslatedText,
      user
    );
  };

  const handleSave = async () => {
    if (!imageBase64) {
      setError('No image selected.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/imageSave/add',
        {
          user: user, // Pass user info as needed
          image: imageBase64,
          originalText: fromText,
          translatedText: translatedText,
          createdAt: new Date(),
        }
      );
      console.log(response.data);
      navigate('/imageTranslator');
    } catch (err) {
      console.error(err);
      setError('Failed to save the data.');
    }
  };


  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div
        className={`border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 ${
          isDragOver ? 'bg-gray-100 border-blue-500' : 'bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer text-center block text-gray-600 hover:text-gray-800"
        >
          Drag and drop an image here or click to upload
        </label>
      </div>
      {loading && <p>Loading...</p>}

      <textarea
        value={fromText}
        placeholder="Extracted text from image"
        className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none"
        readOnly
      />

      <button
        onClick={handleTranslateImageText}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
      >
        Translate Image Text
      </button>

      {translatedText && (
        <div className="mt-4">
          <p className="text-lg font-semibold">Translated Text:</p>
          <p className="mt-2">{translatedText}</p>
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <button
        onClick={handleSave}
        className="bg-green-500 text-white py-2 ml-10 px-4 rounded hover:bg-green-600 transition duration-200 mt-4"
      >
        Save
      </button>
    </div>
  );
};

export default TranslatorImage;
