const { google } = require('googleapis');
const express = require('express');
const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/cloud-translation',
  'https://www.googleapis.com/auth/cloud-vision',
  'https://www.googleapis.com/auth/cloud-speech',
  'https://www.googleapis.com/auth/cloud-text-to-speech',
];

// Generate the URL for the user to authorize the app
router.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request a refresh token
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

// Handle the OAuth2 callback and exchange the code for tokens
router.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    // Store tokens for future use, e.g., in a database
    res.send('Authorization successful!');
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.status(500).send('Authentication failed.');
  }
});

module.exports = router;
