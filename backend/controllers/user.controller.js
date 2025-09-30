const Users = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER new user
const registerUser = async (req, res) => {
  try {
    

    const { email, fullName, password } = req.body;

    // 1. Check if user already exists
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save new user
    const newUser = await Users.create({
      email,
      fullName,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Register failed", error: error.message });
    
  }
};

// LOGIN user
const loginUser = async (req, res) => {
  try {

    console.log("req.body:", req.body);
    const csrfHeader =
      req.headers['x-csrf-token'] ||
      req.headers['csrf-token'] ||
      req.headers['x-xsrf-token'] ||
      req.headers['xsrf-token'];
    console.log("csrf header (any):", csrfHeader);
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Create JWT (payload aligned with middlewares expecting userId)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 4. Save JWT in cookie
    res.cookie("token", token, {
      httpOnly: true,               // not accessible via JS
      secure: process.env.NODE_ENV === "production", // only HTTPS in prod
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,       // 1 hour
    });

    // Return token in response as well so frontend can store it
    res.json({ 
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, fullName: user.fullName }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// LOGOUT user
const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser
};
