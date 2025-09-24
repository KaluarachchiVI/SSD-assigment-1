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
  allowedHeaders: ['Content-Type', 'csrf-token'], // <-- include csrf-token
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

// Cookie parser
app.use(cookieParser());
app.use(csrf({ cookie: { httpOnly: false, sameSite: 'lax' } }));


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

// Route definitions with rate limiting
app.use('/auth', authLimiter, authRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/history', historyRoutes);
app.use('/imageSave', uploadLimiter, imageRoutes);
app.use('/voiceHistory', voiceHistoryRoutes);


// new user Routes
app.use("/api/users", userRoute);

// Add a base route to confirm server is running
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Allow sending the token to the frontend
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
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




