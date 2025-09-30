const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

const { 
  generalLimiter, 
  authLimiter, 
  uploadLimiter, 
  translationLimiter,
  securityHeaders, 
  corsOptions, 
  corsErrorHandler,
  requestLogger,
  errorHandler 
} = require('./middleware/security');

const { authMiddleware } = require('./middleware/auth.middleware');

const userRoute = require("./routers/user.route.js");  // ✅ matches default


const app = express();

// Load environment variables from .env
dotenv.config();

// Security headers (must be first)
app.use(securityHeaders);

// Request logging
app.use(requestLogger);

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // frontend URL
  credentials: true,               // allow cookies
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'csrf-token',
    'CSRF-Token',
    'x-csrf-token',
    'X-XSRF-TOKEN',
    'x-xsrf-token'
  ],
}));

app.use(corsErrorHandler);

// Body parsing with size limits
app.use(bodyParser.json({ 
  limit: process.env.MAX_FILE_SIZE || '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(bodyParser.urlencoded({ 
  limit: process.env.MAX_FILE_SIZE || '10mb', 
  extended: true 
}));

// Cookie parser with secret for signed cookies
app.use(cookieParser(process.env.COOKIE_SECRET || 'your-secret-key'));

// CSRF Protection setup
const csrfProtection = csrf({
  cookie: {
    key: '_csrf',
    httpOnly: true, // More secure; handled by the server
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
  // Accept common CSRF header names
  value: (req) =>
    req.headers['x-csrf-token'] ||
    req.headers['csrf-token'] ||
    req.headers['x-xsrf-token'] ||
    req.headers['xsrf-token'],
});

// Apply CSRF protection to all routes
app.use(csrfProtection);

// Middleware to set the CSRF token cookie on every response
app.use((req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  next();
});

// Rate limiting
app.use(generalLimiter);

// MongoDB connection
const URL = process.env.MONGO_URI;

mongoose
  .connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit process if connection fails
  });

// Import routes
const authRoutes = require('./routers/authRoute');
const favoriteRoutes = require('./routers/favoriteRoute');
const historyRoutes = require('./routers/historyRoute');
const imageRoutes = require('./routers/imageRouter');
const voiceHistoryRoutes = require('./routers/voiceHistoryRoute');

// CSRF token endpoint for SPA refresh
app.get('/api/csrf-token', (req, res) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.json({ csrfToken: req.csrfToken() });
});

// Route definitions with rate limiting
app.use('/auth', authLimiter, authRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/history', authMiddleware, historyRoutes);
app.use('/imageSave', uploadLimiter, imageRoutes);
app.use('/voiceHistory', voiceHistoryRoutes);

// new user Routes
app.use("/api/users", authLimiter, userRoute);

// Add a base route to confirm server is running
app.get('/', (req, res) => {
  res.send('Server is running!');
});


// Error handling middleware (must be last)
app.use(errorHandler);

// Example route for fetching history
app.get('/api/history', async (req, res) => {
  try {
    // Fetch your history data from the database here
    const historyData = await getHistoryFromDatabase();

    // Set the Content-Type header for UTF-8 encoding
    res.set('Content-Type', 'application/json; charset=utf-8');

    // Send the response
    res.json(historyData);
  } catch (error) {
    console.error('Failed to fetch history:', error);
    res.status(500).json({ message: 'Error fetching history' });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is up and running on port: ${PORT}`);
});




