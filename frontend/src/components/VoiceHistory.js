import React, { useState, useEffect } from 'react';
import { getvoiceHistory, deletevoiceHistoryEntry, updatevoiceHistoryEntry, clearvoiceHistory } from '../services/api'; // Ensure updatevoiceHistoryEntry is defined
import Sidebar from './Nav/Sidebar';

const VoiceHistory = () => {
  const [voicehistory, setvoiceHistory] = useState([]);
  const [editId, setEditId] = useState(null); // Track which entry is being edited
  const [editText, setEditText] = useState(''); // Changed from editOriginalText to editText
  const [editTranslatedText, setEditTranslatedText] = useState('');
  const [loading, setLoading] = useState(false); // Optional: To show loading state during updates

  const fetchvoiceHistory = async () => {
    try {
      const response = await getvoiceHistory();
      setvoiceHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch voice history', error);
      window.alert('Failed to fetch voice history');
    }
  };

  useEffect(() => {
    fetchvoiceHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletevoiceHistoryEntry(id);
      await fetchvoiceHistory(); // Re-fetch voice history after successful deletion
      window.alert('Entry deleted successfully');
    } catch (error) {
      console.error('Failed to delete entry', error);
      window.alert('Failed to delete entry');
    }
  };

  const handleClearAll = async () => {
    try {
      await clearvoiceHistory();
      await fetchvoiceHistory(); // Re-fetch voice history after clearing all entries
      window.alert('All entries cleared successfully');
    } catch (error) {
      console.error('Failed to clear voice history', error);
      window.alert('Failed to clear voice history');
    }
  };

  const handleEdit = (entry) => {
    setEditId(entry._id); // Set the entry being edited
    setEditText(entry.text); // Pre-fill text
    setEditTranslatedText(entry.translatedText); // Pre-fill translated text
  };

  const handleUpdate = async (id) => {
    if (!editText || !editTranslatedText) {
      window.alert('Both fields are required');
      return;
    }

    try {
      setLoading(true); // Start loading
      await updatevoiceHistoryEntry(id, {
        text: editText, // Ensure the field name matches backend
        translatedText: editTranslatedText,
      });
      setEditId(null); // Close the edit form after successful update
      await fetchvoiceHistory(); // Re-fetch voice history after update
      window.alert('Entry updated successfully');
    } catch (error) {
      console.error('Failed to update entry', error);
      window.alert('Failed to update entry');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 bg-gray-200 overflow-auto ml-64">
        <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg min-h-screen">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Voice Translations
            </h2>
            <button
              onClick={handleClearAll}
              className="bg-red-500 text-white font-medium py-1 px-3 rounded-lg hover:bg-red-600 transition duration-300"
            >
              Clear All
            </button>
          </div>
          <ul className="space-y-6">
            {voicehistory.map((entry) => (
              <li
                key={entry._id}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col space-y-2"
              >
                {editId === entry._id ? (
                  // Edit form
                  <div className="space-y-2">
                    <div>
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="border p-2 rounded w-full"
                        placeholder="Original Text"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={editTranslatedText}
                        onChange={(e) => setEditTranslatedText(e.target.value)}
                        className="border p-2 rounded w-full"
                        placeholder="Translated Text"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdate(entry._id)}
                        className="bg-blue-500 text-white font-medium py-1 px-3 rounded-lg hover:bg-blue-600 transition duration-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="bg-gray-500 text-white font-medium py-1 px-3 rounded-lg hover:bg-gray-600 transition duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display entry details
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {entry.text}
                    </div>
                    <div className="text-sm text-gray-600">{`→ ${entry.translatedText}`}</div>
                    <div className="text-xs text-gray-500">{`${new Date(entry.createdAt).toLocaleString()}`}</div>
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="bg-yellow-500 text-white font-medium py-1 px-3 rounded-lg hover:bg-yellow-600 transition duration-300"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(entry._id)}
                    className="bg-red-500 text-white font-medium py-1 px-3 rounded-lg hover:bg-red-600 transition duration-300"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {loading && (
            <div className="mt-4 text-center text-blue-500">Updating...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceHistory;
