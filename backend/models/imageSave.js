const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  user: {
    type: String,
  },
  originalText: {
    type: String,
  },
  translatedText: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ImageSave', ImageSchema);
