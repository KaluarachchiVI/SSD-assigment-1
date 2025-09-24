const express = require('express');
const router = express.Router();
const ImageSave = require('../models/imageSave');
const { authenticateToken } = require('../middleware/auth');
const { validateImageUpload, sanitizeInput } = require('../middleware/validation');
const { validateBase64Image } = require('../middleware/fileUpload'); 

// Add new image save
router.post('/add', 
  authenticateToken,
  sanitizeInput,
  validateBase64Image,
  validateImageUpload,
  async (req, res) => {
    try {
      const { image, originalText, translatedText, createdAt } = req.body;
      const userId = req.user.id;

      const newSave = new ImageSave({
        user: userId,
        image, // Save Base64 image data
        originalText: originalText || '',
        translatedText: translatedText || '',
        createdAt: createdAt || new Date(),
      });

      await newSave.save();
      res.status(201).json({
        success: true,
        message: 'Image saved successfully',
        imageSave: {
          id: newSave._id,
          originalText: newSave.originalText,
          translatedText: newSave.translatedText,
          createdAt: newSave.createdAt
        }
      });
    } catch (error) {
      console.error('Add image save error:', error);
      res.status(500).json({
        error: 'Failed to save image',
        code: 'ADD_IMAGE_ERROR'
      });
    }
  }
);

// Get user's image saves
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const imageSaves = await ImageSave.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-image -__v'); // Exclude image data and version field

    const total = await ImageSave.countDocuments({ user: userId });

    res.json({
      success: true,
      imageSaves,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get image saves error:', error);
    res.status(500).json({
      error: 'Failed to fetch image saves',
      code: 'GET_IMAGE_SAVES_ERROR'
    });
  }
});

module.exports = router;
