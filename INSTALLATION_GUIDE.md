# Installation and Setup Guide

## Quick Start

### 1. Clone the Repository
```bash
git clone [your-repo-url]
cd SPMY3S1
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your configuration
# Required variables:
# - MONGO_URI=mongodb://localhost:27017/translation_app
# - JWT_SECRET=your_super_secret_jwt_key_here
# - GOOGLE_CLIENT_ID=your_google_client_id_here
# - GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Start the backend server
npm start
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your configuration
# Required variables:
# - REACT_APP_API_URL=http://localhost:8175
# - REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here

# Start the frontend development server
npm start
```

### 4. Database Setup
```bash
# Make sure MongoDB is running
# Default connection: mongodb://localhost:27017/translation_app
```

## Google OAuth Setup

### 1. Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - `http://localhost:8175/auth/google/callback` (for backend)

### 2. Configure Environment Variables
Update both `.env` files with your Google OAuth credentials:
```env
# Backend .env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8175/auth/google/callback

# Frontend .env
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
```

## Security Testing

### 1. Run Security Scans
```bash
# Backend dependency check
cd backend
npm audit
npm audit fix

# Frontend dependency check
cd frontend
npm audit
npm audit fix
```

### 2. Manual Security Testing
Follow the `SECURITY_TESTING.md` guide for comprehensive security testing.

### 3. OWASP ZAP Testing
1. Download OWASP ZAP from [zaproxy.org](https://www.zaproxy.org/)
2. Configure target: `http://localhost:8175`
3. Run active scan
4. Review security findings

## Production Deployment

### 1. Environment Configuration
```env
# Production .env
NODE_ENV=production
MONGO_URI=mongodb://your-production-mongo-uri
JWT_SECRET=your_strong_production_secret
ALLOWED_ORIGINS=https://yourdomain.com
```

### 2. Security Considerations
- Use HTTPS in production
- Set strong JWT secrets
- Configure proper CORS origins
- Enable MongoDB authentication
- Use environment-specific configurations

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `ALLOWED_ORIGINS` in backend .env
   - Ensure frontend URL is included

2. **Authentication Issues**
   - Verify Google OAuth credentials
   - Check JWT secret configuration
   - Ensure MongoDB is running

3. **File Upload Issues**
   - Check file size limits
   - Verify allowed file types
   - Ensure proper base64 format

4. **Database Connection**
   - Verify MongoDB is running
   - Check connection string
   - Ensure database exists

### Debug Mode
```bash
# Backend debug
NODE_ENV=development npm start

# Frontend debug
REACT_APP_DEBUG=true npm start
```

## Security Features Implemented

✅ **Authentication & Authorization**
- JWT-based authentication
- User data isolation
- Protected API endpoints

✅ **Input Validation**
- Request validation
- XSS protection
- SQL injection prevention

✅ **Security Headers**
- Helmet.js configuration
- CORS protection
- Content Security Policy

✅ **Rate Limiting**
- API rate limiting
- Auth endpoint protection
- File upload limits

✅ **File Upload Security**
- File type validation
- Size limits
- Base64 validation

✅ **Error Handling**
- Secure error messages
- Request logging
- No information disclosure

## Next Steps

1. **Test the Application**
   - Run through all features
   - Verify security implementations
   - Test with different users

2. **Security Review**
   - Run OWASP ZAP scan
   - Review security logs
   - Test edge cases

3. **Documentation**
   - Update README with your group details
   - Create video demonstration
   - Prepare assignment report

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the security testing guide
3. Check console logs for errors
4. Verify environment configuration
