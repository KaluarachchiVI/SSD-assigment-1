import React, { useState, useEffect } from 'react';
import { getHistory, deleteHistoryEntry, clearHistory, saveBookmark } from '../services/api';
import Sidebar from './Nav/Sidebar';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/solid';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // Import the auto table plugin for jsPDF

const History = ({ handleLogout }) => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarks, setBookmarks] = useState({});
  const [showColorPicker, setShowColorPicker] = useState({});
  const [activeTab, setActiveTab] = useState('All');
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const navigate = useNavigate();

  const currentUserId = Cookies.get('userId');
  const colors = ['red', 'blue', 'green', 'yellow', 'purple'];

  const colorClasses = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  const tabColorClasses = {
    all: 'bg-teal-500 text-white', // Teal for All
    unmarked: 'bg-gray-500 text-white', // Gray for Unmarked
  };

  const fetchHistory = async () => {
    try {
      const response = await getHistory();
      const userHistory = response.data.filter((entry) => entry.user === currentUserId);
      setHistory(userHistory);
    } catch (error) {
      console.error('Failed to fetch history', error);
    }
  };

  const loadBookmarksFromLocalStorage = () => {
    const storedBookmarks = localStorage.getItem('bookmarks');
    if (storedBookmarks) {
      setBookmarks(JSON.parse(storedBookmarks));
    }
  };

  useEffect(() => {
    loadBookmarksFromLocalStorage();
    fetchHistory();
  }, [currentUserId]);

  const handleEdit = (entry) => {
    navigate('/', { state: { initialText: entry.text } });
  };

  const handleDelete = async (id) => {
    try {
      await deleteHistoryEntry(id);
      await fetchHistory();
    } catch (error) {
      console.error('Failed to delete entry', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearHistory(currentUserId);
      await fetchHistory();
    } catch (error) {
      console.error('Failed to clear history', error);
    }
  };

  const handleBookmark = async (id, color) => {
    console.log('Saving bookmark:', { userId: currentUserId, entryId: id, color });

    setBookmarks((prev) => ({
      ...prev,
      [id]: color,
    }));

    localStorage.setItem('bookmarks', JSON.stringify({
      ...bookmarks,
      [id]: color,
    }));

    try {
      await saveBookmark({ userId: currentUserId, entryId: id, color });
    } catch (error) {
      console.error('Failed to save bookmark', error);
    }

    setShowColorPicker((prev) => ({
      ...prev,
      [id]: false,
    }));
  };

  const toggleColorPicker = (id) => {
    setShowColorPicker((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredHistory = history.filter(
    (entry) =>
      (entry.text && entry.text.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.translatedText && entry.translatedText.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categorizedHistory = filteredHistory.filter((entry) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unmarked') return !bookmarks[entry._id];
    return bookmarks[entry._id] === activeTab;
  });

  const generatePDFReport = () => {
    const pdf = new jsPDF();
    pdf.text('History Report (All)', 20, 20);
    pdf.autoTable({
      head: [['Created At', 'Text', 'Translated Text']],
      body: history.map((entry) => [
        new Date(entry.createdAt).toLocaleString(),
        entry.text,
        entry.translatedText,
      ]),
    });
    pdf.save('history_report_all.pdf');
  };
  
  const handleGenerateWeeklyReport = (weekSelection) => {
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    let startOfWeek, endOfWeek;

    if (weekSelection === '0') {
      startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDay);
      endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
    } else if (weekSelection === '1') {
      startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDay - 7);
      endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
    }

    // Filter the full history for the selected week
    const weeklyEntries = history.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= startOfWeek && entryDate <= endOfWeek;
    });

    if (weeklyEntries.length > 0) {
      const pdf = new jsPDF();
      pdf.text('Weekly Report (All)', 20, 20);
      pdf.autoTable({
        head: [['Created At', 'Text', 'Translated Text']],
        body: weeklyEntries.map((entry) => [
          new Date(entry.createdAt).toLocaleString(),
          entry.text,
          entry.translatedText,
        ]),
      });
      pdf.save('weekly_report_all.pdf');
    } else {
      alert('No entries found for the selected week.');
    }
  };

  const handleGenerateMonthlyReport = (month) => {
    const currentYear = new Date().getFullYear();

    // Filter the full history for the selected month
    const monthlyEntries = history.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      return entryDate.getFullYear() === currentYear && entryDate.getMonth() === parseInt(month);
    });

    if (monthlyEntries.length > 0) {
      const pdf = new jsPDF();
      pdf.text(`Monthly Report for ${month + 1}/${currentYear} (All)`, 20, 20);
      pdf.autoTable({
        head: [['Created At', 'Text', 'Translated Text']],
        body: monthlyEntries.map((entry) => [
          new Date(entry.createdAt).toLocaleString(),
          entry.text,
          entry.translatedText,
        ]),
      });
      pdf.save('monthly_report_all.pdf');
    } else {
      alert('No entries found for the selected month.');
    }
  };

  const handleGenerateCategoryReport = (category) => {
    // Filter the full history for the selected category
    const categoryEntries = history.filter((entry) => bookmarks[entry._id] === category);

    if (categoryEntries.length > 0) {
      const pdf = new jsPDF();
      pdf.text(`Report for ${category.charAt(0).toUpperCase() + category.slice(1)} Category (All)`, 20, 20);
      pdf.autoTable({
        head: [['Created At', 'Text', 'Translated Text']],
        body: categoryEntries.map((entry) => [
          new Date(entry.createdAt).toLocaleString(),
          entry.text,
          entry.translatedText,
        ]),
      });
      pdf.save(`${category}_report_all.pdf`);
    } else {
      alert(`No entries found for the ${category} category.`);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar handleLogout={handleLogout} />
      <div className="flex-1 p-8 bg-gray-100 overflow-auto ml-48 mt-16">
        <div className="container mx-auto p-4 bg-gray-100 min-h-screen ml-24 w-5/6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Translation History</h2>
            <div className="flex items-center">
              <button
                onClick={generatePDFReport}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none mr-4"
              >
                Generate Report
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowWeekDropdown(!showWeekDropdown)}
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  Weekly Reports
                </button>
                {showWeekDropdown && (
                  <div className="absolute z-10 bg-white shadow-lg p-2 rounded">
                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value={0}>Current Week</option>
                      <option value={1}>Last Week</option>
                    </select>
                    <button
                      onClick={() => {
                        handleGenerateWeeklyReport(selectedWeek);
                        setShowWeekDropdown(false);
                      }}
                      className="bg-green-500 text-white py-1 px-4 rounded mt-2 w-full"
                    >
                      Generate
                    </button>
                  </div>
                )}
              </div>

              <div className="relative ml-4">
                <button
                  onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                  className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
                >
                  Monthly Reports
                </button>
                {showMonthDropdown && (
                  <div className="absolute z-10 bg-white shadow-lg p-2 rounded">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    >
                      {Array.from({ length: 12 }, (_, index) => (
                        <option key={index} value={index}>
                          {new Date(0, index).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        handleGenerateMonthlyReport(selectedMonth);
                        setShowMonthDropdown(false);
                      }}
                      className="bg-yellow-500 text-white py-1 px-4 rounded mt-2 w-full"
                    >
                      Generate
                    </button>
                  </div>
                )}
              </div>

              <div className="relative ml-4">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Custom Category Reports
                </button>
                {showCategoryDropdown && (
                  <div className="absolute z-10 bg-white shadow-lg p-2 rounded">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          handleGenerateCategoryReport(color);
                          setShowCategoryDropdown(false);
                        }}
                        className={`block w-full text-left py-1 px-2 hover:bg-gray-200 ${colorClasses[color]}`}
                      >
                        {color.charAt(0).toUpperCase() + color.slice(1)} Category
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex">
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4 p-2 border rounded w-full"
            />
            <button
              onClick={handleClearAll}
              className="text-red-500 hover:text-red-700 focus:outline-none"
            >
              Clear All
            </button>
          </div>

          {/* Tab Bar for Category Selection */}
          <div className="flex mb-4 space-x-2">
            <button
              className={`flex items-center px-4 py-2 rounded-t-lg ${activeTab === 'All' ? tabColorClasses.all : 'bg-gray-200'}`}
              onClick={() => setActiveTab('All')}
            >
              All
            </button>
            <button
              className={`flex items-center px-4 py-2 rounded-t-lg ${activeTab === 'Unmarked' ? tabColorClasses.unmarked : 'bg-gray-200'}`}
              onClick={() => setActiveTab('Unmarked')}
            >
              Unmarked
            </button>
            {colors.map((color) => (
              <button
                key={color}
                className={`flex items-center px-4 py-2 rounded-t-lg ${activeTab === color ? `${colorClasses[color]} text-white` : 'bg-gray-200'}`}
                onClick={() => setActiveTab(color)}
              >
                <span className={`h-4 w-4 rounded-full ${colorClasses[color]} mr-2`} />
              </button>
            ))}
          </div>

          {/* History List */}
          <div id="history-content">
            <ul className="space-y-4">
              {categorizedHistory.length > 0 ? (
                categorizedHistory.map((entry) => (
                  <li
                    key={entry._id}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-start"
                  >
                    {/* Bookmark Section */}
                    <div className="flex items-center space-x-2 mr-4">
                      {showColorPicker[entry._id] ? (
                        colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleBookmark(entry._id, color)}
                            className={`h-5 w-5 rounded-full ${colorClasses[color]} hover:bg-${color}-700 focus:outline-none`}
                          />
                        ))
                      ) : (
                        <div
                          className={`h-5 w-5 rounded-full ${bookmarks[entry._id] ? colorClasses[bookmarks[entry._id]] : 'bg-gray-300'}`}
                          onClick={() => toggleColorPicker(entry._id)}
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {entry.text}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="text-blue-500 hover:text-blue-700 focus:outline-none"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(entry._id)}
                            className="ml-4 text-red-500 hover:text-red-700 focus:outline-none"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">{`→ ${entry.translatedText}`}</div>
                      <div className="text-xs text-gray-500 mt-2">{`${new Date(entry.createdAt).toLocaleString()}`}</div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-gray-600">No history found for this user.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
