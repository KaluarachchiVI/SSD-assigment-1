import React from 'react';
import { NavLink } from 'react-router-dom'; // Assuming you're using react-router for navigation

const Sidebar = () => {
  return (
    <div className="flex h-screen bg-gray-100 fixed">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Translator App</h1>
        </div>

        <nav className="mt-10">
          <ul>
            {/* Translator Link */}
            <li className="mb-6">
              <NavLink
                to="/"
                activeClassName="bg-blue-500 text-white"
                className="flex items-center px-6 py-3 hover:bg-blue-500 hover:text-white text-gray-800 transition-colors duration-200"
              >
                <span className="text-xl mr-4">🌐</span>
                <span className="text-lg">Translator</span>
              </NavLink>
            </li>

            {/* Favorites Link */}
            <li className="mb-6">
              <NavLink
                to="/favorites"
                activeClassName="bg-blue-500 text-white"
                className="flex items-center px-6 py-3 hover:bg-blue-500 hover:text-white text-gray-800 transition-colors duration-200"
              >
                <span className="text-xl mr-4">⭐</span>
                <span className="text-lg">Favorites</span>
              </NavLink>
            </li>

            {/* History Link */}
            <li className="mb-6">
              <NavLink
                to="/favorites"
                activeClassName="bg-blue-500 text-white"
                className="flex items-center px-6 py-3 hover:bg-blue-500 hover:text-white text-gray-800 transition-colors duration-200"
              >
                <span className="text-xl mr-4">📜</span>
                <span className="text-lg">Save Images</span>
              </NavLink>
            </li>

            {/* History Link */}
            <li className="mb-6">
              <NavLink
                to="/history"
                activeClassName="bg-blue-500 text-white"
                className="flex items-center px-6 py-3 hover:bg-blue-500 hover:text-white text-gray-800 transition-colors duration-200"
              >
                <span className="text-xl mr-4">📜</span>
                <span className="text-lg">Text / Image History</span>
              </NavLink>
            </li>


            {/* History Link Voice */}
             <li className="mb-6">
              <NavLink
                to="/voicehistory"
                activeClassName="bg-blue-500 text-white"
                className="flex items-center px-6 py-3 hover:bg-blue-500 hover:text-white text-gray-800 transition-colors duration-200"
              >
                <span className="text-xl mr-4">🎤</span>
                <span className="text-lg">Voice History</span>
              </NavLink>
            </li>



          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">{/* Your main content will go here */}</div>
    </div>
  );
};

export default Sidebar;
//<NavLink to="/voicehistory" activeClassName="active-link">