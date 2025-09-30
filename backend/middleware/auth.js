const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Google users
const Users = require('../models/user.model'); // Local users

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const headerToken = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    const cookieToken = (req.cookies && (req.cookies.token || req.cookies.authToken)) || null;
    const token = headerToken || cookieToken;

    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to load user from either model; if not found, proceed with decoded userId
    let user = null;
    if (decoded.userId) {
      user = await User.findById(decoded.userId);
      if (!user) {
        user = await Users.findById(decoded.userId);
      }
    }

    req.user = user
      ? { id: user._id, email: user.email, googleId: user.googleId }
      : { id: decoded.userId || decoded.id };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token.',
        code: 'INVALID_TOKEN'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during authentication.',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware to check if user owns the resource
const checkResourceOwnership = (resourceUserIdField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    // For routes with :id parameter, we need to check the resource
    if (req.params.id) {
      // This will be handled in the route handler after fetching the resource
      req.checkOwnership = true;
      req.resourceUserIdField = resourceUserIdField;
    }
    
    next();
  };
};

// Optional authentication (for public routes that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user) {
        req.user = {
          id: user._id,
          email: user.email,
          googleId: user.googleId
        };
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

module.exports = {
  authenticateToken,
  checkResourceOwnership,
  optionalAuth
};
