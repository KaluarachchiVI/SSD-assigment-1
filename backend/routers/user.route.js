const express = require("express");
const csrfProtection = require('../middleware/csrf');

const { 
  registerUser, 
  loginUser, 
  logoutUser 
} = require("../controllers/user.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

// Public routes
router.post("/register", csrfProtection, registerUser);
router.post("/login", csrfProtection, loginUser);

// Protected routes (require authentication)
router.post("/logout", authMiddleware, logoutUser);
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "Profile data", user: req.user });
});

module.exports = router;