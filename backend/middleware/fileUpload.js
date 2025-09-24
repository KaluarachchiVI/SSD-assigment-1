const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES 
    ? process.env.ALLOWED_FILE_TYPES.split(',')
    : ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 1 // Only allow one file at a time
  },
  fileFilter: fileFilter
});

// Middleware to handle file upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        code: 'FILE_TOO_LARGE',
        maxSize: process.env.MAX_FILE_SIZE || '5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        code: 'TOO_MANY_FILES',
        maxFiles: 1
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: error.message,
      code: 'INVALID_FILE_TYPE',
      allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });
  }

  next(error);
};

// Middleware to validate base64 image data
const validateBase64Image = (req, res, next) => {
  if (req.body.image) {
    const base64Data = req.body.image;
    
    // Check if it's a valid base64 string
    if (!/^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(base64Data)) {
      return res.status(400).json({
        error: 'Invalid base64 image format',
        code: 'INVALID_BASE64_FORMAT',
        expectedFormat: 'data:image/[type];base64,[data]'
      });
    }

    // Check file size (base64 is ~33% larger than binary)
    const sizeInBytes = (base64Data.length * 3) / 4;
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;
    
    if (sizeInBytes > maxSize) {
      return res.status(400).json({
        error: 'Image file too large',
        code: 'IMAGE_TOO_LARGE',
        maxSize: `${Math.round(maxSize / 1024 / 1024)}MB`
      });
    }

    // Extract and validate MIME type
    const mimeType = base64Data.split(';')[0].split(':')[1];
    const allowedTypes = process.env.ALLOWED_FILE_TYPES 
      ? process.env.ALLOWED_FILE_TYPES.split(',')
      : ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(mimeType)) {
      return res.status(400).json({
        error: 'Invalid image type',
        code: 'INVALID_IMAGE_TYPE',
        allowedTypes: allowedTypes
      });
    }
  }
  
  next();
};

module.exports = {
  upload,
  handleUploadError,
  validateBase64Image
};
