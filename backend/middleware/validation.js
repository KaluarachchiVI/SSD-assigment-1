const { body, param, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const xss = require('xss');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      })),
      code: 'VALIDATION_ERROR'
    });
  }
  next();
};

// Sanitize HTML input
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // First sanitize HTML
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [],
          allowedAttributes: {}
        });
        // Then escape XSS
        req.body[key] = xss(req.body[key]);
      }
    });
  }
  next();
};

// Translation validation rules
const validateTranslation = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Text must be between 1 and 5000 characters')
    .escape(),
  body('translatedText')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Translated text must be between 1 and 5000 characters')
    .escape(),
  body('user')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('User field must be between 1 and 100 characters')
    .escape(),
  body('createdAt')
    .optional()
    .isISO8601()
    .withMessage('CreatedAt must be a valid ISO 8601 date')
    .toDate(),
  handleValidationErrors
];

// Image upload validation rules
const validateImageUpload = [
  body('user')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('User field must be between 1 and 100 characters')
    .escape(),
  body('originalText')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Original text must be less than 5000 characters')
    .escape(),
  body('translatedText')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Translated text must be less than 5000 characters')
    .escape(),
  body('image')
    .isBase64()
    .withMessage('Image must be valid base64 data'),
  body('createdAt')
    .optional()
    .isISO8601()
    .withMessage('CreatedAt must be a valid ISO 8601 date')
    .toDate(),
  handleValidationErrors
];

// Bookmark validation rules
const validateBookmark = [
  body('userId')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('UserId must be between 1 and 100 characters')
    .escape(),
  body('entryId')
    .trim()
    .isMongoId()
    .withMessage('EntryId must be a valid MongoDB ObjectId'),
  body('color')
    .optional()
    .trim()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color code'),
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Language validation
const validateLanguage = [
  body('fromLang')
    .isIn(['en', 'si'])
    .withMessage('From language must be either "en" or "si"'),
  body('toLang')
    .isIn(['en', 'si'])
    .withMessage('To language must be either "en" or "si"'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  sanitizeInput,
  validateTranslation,
  validateImageUpload,
  validateBookmark,
  validateObjectId,
  validateLanguage
};
