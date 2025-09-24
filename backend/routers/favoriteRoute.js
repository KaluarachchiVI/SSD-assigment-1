const express = require('express');
const router = express.Router();
const Favorite = require('../models/favorite');
const { authenticateToken, checkResourceOwnership } = require('../middleware/auth');
const { validateTranslation, sanitizeInput, validateObjectId } = require('../middleware/validation');

// Add to favorites
router.post('/add', 
  authenticateToken,
  sanitizeInput,
  validateTranslation,
  async (req, res) => {
    try {
      const { text, translatedText, createdAt } = req.body;
      const userId = req.user.id;

      const newFavorite = new Favorite({
        user: userId,
        text,
        translatedText,
        createdAt: createdAt || new Date(),
      });

      await newFavorite.save();
      res.status(201).json({
        success: true,
        message: 'Favorite added successfully',
        favorite: {
          id: newFavorite._id,
          text: newFavorite.text,
          translatedText: newFavorite.translatedText,
          createdAt: newFavorite.createdAt
        }
      });
    } catch (error) {
      console.error('Add favorite error:', error);
      res.status(500).json({
        error: 'Failed to add favorite',
        code: 'ADD_FAVORITE_ERROR'
      });
    }
  }
);

// Get user's favorites
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const favorites = await Favorite.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Favorite.countDocuments({ user: userId });

    res.json({
      success: true,
      favorites,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      error: 'Failed to fetch favorites',
      code: 'GET_FAVORITES_ERROR'
    });
  }
});

// Update a favorite
router.put('/update/:id', 
  authenticateToken,
  validateObjectId,
  sanitizeInput,
  validateTranslation,
  async (req, res) => {
    try {
      const favoriteId = req.params.id;
      const userId = req.user.id;
      const { text, translatedText } = req.body;

      // Check if favorite exists and belongs to user
      const favorite = await Favorite.findOne({ _id: favoriteId, user: userId });
      if (!favorite) {
        return res.status(404).json({ 
          error: 'Favorite not found or access denied',
          code: 'FAVORITE_NOT_FOUND'
        });
      }

      const updatedFavorite = await Favorite.findByIdAndUpdate(
        favoriteId,
        { text, translatedText },
        { new: true, runValidators: true }
      );

      res.status(200).json({ 
        success: true,
        message: 'Favorite updated successfully',
        favorite: {
          id: updatedFavorite._id,
          text: updatedFavorite.text,
          translatedText: updatedFavorite.translatedText,
          createdAt: updatedFavorite.createdAt
        }
      });
    } catch (error) {
      console.error('Update favorite error:', error);
      res.status(500).json({ 
        error: 'Failed to update favorite',
        code: 'UPDATE_FAVORITE_ERROR'
      });
    }
  }
);

// Delete a favorite
router.delete('/delete/:id', 
  authenticateToken,
  validateObjectId,
  async (req, res) => {
    try {
      const favoriteId = req.params.id;
      const userId = req.user.id;

      const deletedFavorite = await Favorite.findOneAndDelete({ 
        _id: favoriteId, 
        user: userId 
      });

      if (!deletedFavorite) {
        return res.status(404).json({ 
          error: 'Favorite not found or access denied',
          code: 'FAVORITE_NOT_FOUND'
        });
      }

      res.status(200).json({ 
        success: true,
        message: 'Favorite deleted successfully'
      });
    } catch (error) {
      console.error('Delete favorite error:', error);
      res.status(500).json({ 
        error: 'Failed to delete favorite',
        code: 'DELETE_FAVORITE_ERROR'
      });
    }
  }
);

// Get a specific favorite by ID
router.get('/get/:id', 
  authenticateToken,
  validateObjectId,
  async (req, res) => {
    try {
      const favoriteId = req.params.id;
      const userId = req.user.id;

      const favorite = await Favorite.findOne({ 
        _id: favoriteId, 
        user: userId 
      }).select('-__v');

      if (!favorite) {
        return res.status(404).json({ 
          error: 'Favorite not found or access denied',
          code: 'FAVORITE_NOT_FOUND'
        });
      }

      res.status(200).json({ 
        success: true,
        message: 'Favorite fetched successfully',
        favorite: {
          id: favorite._id,
          text: favorite.text,
          translatedText: favorite.translatedText,
          createdAt: favorite.createdAt
        }
      });
    } catch (error) {
      console.error('Get favorite error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch favorite',
        code: 'GET_FAVORITE_ERROR'
      });
    }
  }
);

module.exports = router;
