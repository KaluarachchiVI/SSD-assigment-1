const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  user: {
    type: String,
  },
  text: {
    type: String,
    required: true,
  },
  translatedText: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Favorite', FavoriteSchema);
