import api from './authService';

// Use the authenticated API instance
const API = api;


// translation history
export const getHistory = () => API.get('/history');
export const addHistory = (text, translatedText, user) =>
  API.post('/history/add', { text, translatedText, user });
export const deleteHistoryEntry = (id) => API.delete(`/history/delete/${id}`);
export const clearHistory = async () => {
  return API.delete('/history/clear');
};

export const saveBookmark = async ({ userId, entryId, color }) => {
  const response = await API.post(`/bookmarks`, {
    userId,
    entryId,
    color,
  });
  return response.data;
};

// Get Bookmarks for a user
export const getBookmarks = async (userId) => {
  const response = await API.get(`/bookmarks/${userId}`);
  return response.data;
};


// translation voicehistory
export const getvoiceHistory = () => API.get('/voicehistory');
export const addvoiceHistory = (text, translatedText, user) =>
  API.post('/voicehistory/add', { text, translatedText, user });
export const deletevoiceHistoryEntry = (id) => API.delete(`/voicehistory/delete/${id}`);
export const clearvoiceHistory = async () => {
  return API.delete('/voicehistory/clear');
};
// Add this update function
export const updatevoiceHistoryEntry = (id, updatedData) => {
  return API.put(`/voicehistory/update/${id}`, updatedData);
};

// API calls for the Favorites feature
export const getFavorites = () => API.get('/favorites/');
export const addFavorite = (text, translatedText, user) =>
  API.post('/favorites/add', { text, translatedText, user });
export const deleteFavorite = (id) => API.delete(`/favorites/delete/${id}`);
