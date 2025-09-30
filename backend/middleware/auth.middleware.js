const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Check for token in Authorization header first, then in cookies
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies.token;

  console.log('Auth Middleware - Request Headers:', req.headers);
  console.log('Auth Middleware - Found token:', !!token);
  console.log('Auth Middleware - Token source:', authHeader ? 'Authorization header' : 'Cookie');

  if (!token) {
    console.log('Auth Middleware - No token found');
    return res.status(401).json({ message: "No token, auth denied" });
  }

  try {
    console.log('Auth Middleware - Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth Middleware - Token decoded successfully:', { userId: decoded.userId });
    req.user = decoded; // attach user info to request
    next();
  } catch (error) {
    console.error('Auth Middleware - Token verification failed:', error.message);
    res.status(401).json({ message: "Token invalid", error: error.message });
  }
};

module.exports = { authMiddleware };