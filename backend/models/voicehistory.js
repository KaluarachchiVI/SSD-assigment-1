const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the voice history schema
const voicehistorySchema = new Schema({
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

module.exports = mongoose.model('voiceHistory', voicehistorySchema);