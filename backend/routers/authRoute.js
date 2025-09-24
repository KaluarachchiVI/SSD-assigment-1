const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const authController = require('../controllers/authController');

// Google OAuth login
router.post('/google', [
  body('idToken')
    .notEmpty()
    .withMessage('ID token is required')
    .isString()
    .withMessage('ID token must be a string'),
  handleValidationErrors
], authController.googleLogin);

// Logout
router.post('/logout', authController.logout);

// Get current user profile (protected route)
router.get('/profile', authenticateToken, authController.getProfile);

// Refresh token (protected route)
router.post('/refresh', authenticateToken, authController.refreshToken);

module.exports = router;
