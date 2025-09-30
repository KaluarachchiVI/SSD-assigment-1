const express = require("express");

const { 
  registerUser, 
  loginUser, 
  logoutUser 
} = require("../controllers/user.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

// Public routes (global CSRF applies)
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes (require authentication)
router.post("/logout", authMiddleware, logoutUser);
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "Profile data", user: req.user });
});

module.exports = router;