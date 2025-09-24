import React from 'react';
import { addHistory } from '../../services/api';

export const voicetranslateText2 = async (
  text,
  fromLang,
  toLang,
  setLoading,
  setError,
  setTranslatedText,
  user
) => {
  if (!text.trim() || !fromLang || !toLang) {
    setError('Please enter text and select both languages.');
    return;
  }

  setLoading(true);
  setError('');

  const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=${fromLang}|${toLang}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (
      data.responseStatus === 403 ||
      data.responseData.translatedText === ''
    ) {
      setError('Invalid language pair specified or unsupported translation.');
      setTranslatedText('');
    } else {
      const translatedText = data.responseData.translatedText;
      setTranslatedText(translatedText);

      if (text && translatedText) {
        try {
          await addHistory(text, translatedText, user);
          alert('Translation added to  history!');
        } catch (error) {
          console.error('Failed to add to voice History:', error);
          alert('Failed to add to voice History. Please try again.');
        }
      }
    }
  } catch (error) {
    console.error('Error fetching voice translation:', error);
    setError('An error occurred while fetching the voice translation.');
  } finally {
    setLoading(false);
  }
};
