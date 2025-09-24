import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ImageList() {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSavedItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/imageSave/'); // Adjust the URL as needed
        setSavedItems(response.data);
      } catch (err) {
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedItems();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      {savedItems.map((item) => (
        <div
          key={item._id}
          className="p-4 border border-gray-300 rounded-lg shadow-md"
        >
          <div className="mb-4 w-52  border-r-black m-5">
            <img
              src={`${item.image}`} 
              alt="Saved"
              className="w-52 h-52 rounded-lg"
            />
          </div>
          <div className="mb-2">
            <p className="font-bold">Original Text:</p>
            <p>{item.originalText}</p>
          </div>
          <div>
            <p className="font-bold">Translated Text:</p>
            <p>{item.translatedText}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ImageList;
