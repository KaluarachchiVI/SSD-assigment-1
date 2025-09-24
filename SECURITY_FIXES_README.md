## Security Hardening Report

This document summarizes 7 vulnerabilities found (via ZAP by Checkmarx) and how they were fixed in this codebase. Each item includes a brief description, the applied fix, and code locations.

### 1) Content Security Policy (CSP) not set / insecure directives
- Issue: ZAP flagged missing CSP and later CSP problems (wildcards, `'unsafe-inline'`, and directives with no fallback).
- Risk: XSS, data injection, untrusted resource loading.
- Fix: Added a strict CSP via Helmet and explicitly defined element directives. Removed `'unsafe-inline'` and wildcards; added `form-action`, `worker-src`, `manifest-src`, `media-src`, `frame-ancestors`, and `object-src 'none'`.
- Code:
```53:79:backend/middleware/security.js
// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      styleSrcElem: ["'self'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      scriptSrcElem: ["'self'"],
      connectSrc: ["'self'", "https://api.mymemory.translated.net"],
      workerSrc: ["'self'"],
      manifestSrc: ["'self'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://accounts.google.com"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'no-referrer' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  xPoweredBy: false,
  noSniff: true,
  xssFilter: true
});
```
- Applied globally:
```24:26:backend/server.js
// Security headers (must be first)
app.use(securityHeaders);
```

### 2) Cross-Domain Misconfiguration (Overly permissive CORS)
- Issue: ZAP reported permissive cross-domain configuration.
- Risk: Unauthorized cross-origin requests, token leakage.
- Fix: Implemented allowlist-based CORS with explicit 403 error handling for disallowed origins.
- Code:
```76:103:backend/middleware/security.js
// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'];
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
```
```105:116:backend/middleware/security.js
// Error handling for CORS
const corsErrorHandler = (err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({
      error: 'CORS policy violation',
      code: 'CORS_ERROR',
      details: 'Origin not allowed'
    });
  } else {
    next(err);
  }
};
```
```30:33:backend/server.js
// CORS configuration
app.use(cors(corsOptions));
app.use(corsErrorHandler);
```

### 3) Missing Anti-clickjacking header
- Issue: No protection against framing.
- Risk: Clickjacking attacks.
- Fix: Enforced `frame-ancestors 'none'` in CSP; for dev, also added `X-Frame-Options: DENY` meta in the frontend template.
- Code:
```66:69:backend/middleware/security.js
      objectSrc: ['none'],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
```
```18:21:frontend/public/index.html
<meta http-equiv="Content-Security-Policy" content="... frame-ancestors 'none' ...">
<meta http-equiv="X-Frame-Options" content="DENY">
```

### 4) X-Content-Type-Options header missing
- Issue: Browser could MIME-sniff responses.
- Risk: Content-type confusion → XSS/drive-by downloads.
- Fix: Enabled `noSniff` via Helmet and mirrored with a dev meta tag.
- Code:
```78:81:backend/middleware/security.js
  xPoweredBy: false,
  noSniff: true,
  xssFilter: true
```
```20:21:frontend/public/index.html
<meta http-equiv="X-Content-Type-Options" content="nosniff">
```

### 5) Server leaks information via X-Powered-By
- Issue: `X-Powered-By` reveals Express stack.
- Risk: Easier fingerprinting for targeted exploits.
- Fix: Disabled header at app level and via Helmet.
- Code:
```24:26:backend/server.js
// Security headers (must be first)
app.use(securityHeaders);
```
```26:26:backend/server.js
app.disable('x-powered-by');
```
```78:79:backend/middleware/security.js
  xPoweredBy: false,
```

### 6) Missing Referrer-Policy
- Issue: Referrers may leak sensitive paths/queries to external sites.
- Risk: Information disclosure.
- Fix: Set `Referrer-Policy: no-referrer`.
- Code:
```71:77:backend/middleware/security.js
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'no-referrer' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
```
```21:21:frontend/public/index.html
<meta http-equiv="Referrer-Policy" content="no-referrer">
```

### 7) Missing Strict-Transport-Security (HSTS)
- Issue: No HSTS policy defined.
- Risk: SSL stripping on insecure transport.
- Fix: Enabled HSTS via Helmet (effective when served over HTTPS in production).
- Code:
```71:77:backend/middleware/security.js
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'no-referrer' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
```

---

## OAuth/OpenID Connect Feature
- Implemented Google OAuth endpoints and mounted them under `/google`.
- Endpoints:
  - `GET /google/auth/google` → redirect to consent screen
  - `GET /google/oauth2callback` → handles token exchange
- Code:
```18:42:backend/config/googleAuth.js
// Generate the URL for the user to authorize the app
router.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
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
    res.send('Authorization successful!');
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.status(500).send('Authentication failed.');
  }
});
```
```87:91:backend/server.js
// Mount Google OAuth routes
const googleAuthRouter = require('./config/googleAuth');
app.use('/google', googleAuthRouter);
```

---

## Verification Steps
1) Restart backend and frontend.
2) Check response headers on `http://localhost:8175/`:
   - `content-security-policy`, `x-frame-options` (dev), `x-content-type-options: nosniff`, `referrer-policy`, `strict-transport-security` (HTTPS), and no `x-powered-by`.
3) Re-run ZAP against `http://localhost:8175` and confirm CSP alerts are resolved (no wildcard, no unsafe-inline, and no missing-fallback directives).
4) Test disallowed origins receive 403 JSON from CORS error handler.

Notes:
- HSTS is only effective under HTTPS; deploy behind TLS for production.
- If new external resources are added (CDNs, APIs), update CSP and CORS allowlists accordingly.

