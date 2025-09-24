// middlewares/csrf.js
const csrf = require('csurf');

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  },
});

module.exports = csrfProtection;
