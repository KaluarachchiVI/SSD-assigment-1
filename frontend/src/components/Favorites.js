import React, { useState, useEffect } from 'react';
import { getFavorites, deleteFavorite } from '../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import Sidebar from './Nav/Sidebar';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); //item coun page
  const [startDate, setStartDate] = useState(null); // State for DatePicker
  const [endDate, setEndDate] = useState(null); // State for DatePicker

  // Fetch favorites from the API when the component loads
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await getFavorites();
        setFavorites(response.data);
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      }
    };

    fetchFavorites();
  }, []);

  // Handle select and deselect of an individual item
  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Handle select/deselect all items
  const handleSelectAll = () => {
    if (selectedItems.length === filteredFavorites.length) {
      setSelectedItems([]); // Deselect all
    } else {
      const allItemIds = filteredFavorites.map((fav) => fav._id);
      setSelectedItems(allItemIds); // Select all
    }
  };

  // Handle delete selected items
  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedItems.map((id) => deleteFavorite(id)));
      setFavorites(favorites.filter((fav) => !selectedItems.includes(fav._id)));
      setSelectedItems([]);
    } catch (error) {
      console.error('Failed to delete selected items:', error);
      alert('Failed to delete selected items. Please try again.');
    }
  };

  // Handle search filtering
  const filteredFavorites = favorites.filter((fav) => {
    const matchesSearchTerm = fav.text
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesDateRange =
      (!startDate || new Date(fav.createdAt) >= startDate) &&
      (!endDate || new Date(fav.createdAt) <= endDate);

    return matchesSearchTerm && matchesDateRange;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFavorites.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredFavorites.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 px-8 pt-3 bg-gray-100 overflow-auto ml-60">
        <div className="min-h-60 bg-gray-100 text-black p-4 ml-10">
          <h2 className="text-3xl font-bold mb-2 text-center">
            Manage Favorites
          </h2>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search favorites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 mb-4 border ml-28 border-gray-300 rounded-lg w-10/12 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
          />

          {/* Date Picker Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4 ml-16">
            <div>
              <label className="block text-sm font-bold mb-2">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="p-2 border border-gray-300 rounded-md w-full"
                isClearable
                placeholderText="Select start date"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                className="p-2 border border-gray-300 rounded-md w-full"
                isClearable
                placeholderText="Select end date"
              />
            </div>
          </div>

          {/* Select All and Delete Selected Buttons */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleSelectAll}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105"
            >
              {selectedItems.length === currentItems.length
                ? 'Deselect All'
                : 'Select All'}
            </button>
            {selectedItems.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105"
              >
                Delete Selected ({selectedItems.length})
              </button>
            )}
          </div>

          {/* Favorites Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-4xl">
            {currentItems.map((fav) => (
              // Favorites card
              <div
                key={fav._id}
                className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 relative group border-l-8 border-yellow-500"
              >
                <input
                  type="checkbox"
                  className="absolute top-3 left-3 w-5 h-5 text-blue-600 focus:ring-0 group-hover:scale-110 transition-transform duration-200"
                  checked={selectedItems.includes(fav._id)}
                  onChange={() => handleSelectItem(fav._id)}
                />

                <div className="flex flex-col space-y-2 p-2 m-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {fav.text} -{' '}
                    <span className="text-gray-600">{fav.translatedText}</span>
                  </span>

                  <span className="text-sm text-gray-600">
                    Added on {moment(fav.createdAt).format('MMMM Do, YYYY')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`p-3 rounded-lg focus:outline-none ${
                  currentPage === index + 1
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                } transition-transform transform hover:scale-105`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
