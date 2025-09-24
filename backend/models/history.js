const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the history schema
const historySchema = new Schema({
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

module.exports = mongoose.model('History', historySchema);

