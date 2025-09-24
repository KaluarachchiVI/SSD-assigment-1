const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the bookmark schema
const bookmarkSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    entryId: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Bookmark', bookmarkSchema);
