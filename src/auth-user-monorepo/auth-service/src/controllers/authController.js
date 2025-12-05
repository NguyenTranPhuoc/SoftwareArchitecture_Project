const { body, validationResult } = require("express-validator");
const authService = require("../services/authService");
const rateLimit = require("express-rate-limit");
const config = require("../../../common/src/config");
const User = require("../models/User");
const loginLimiter = rateLimit({ windowMs: config.rateLimit.loginWindowMs, max: config.rateLimit.loginMax, message: { error: "Too many login attempts, please try again later" } });

const register = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
  async (req, res) => {
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      
      const { email, password, full_name } = req.body;
      const existing = await authService.findUserByEmail(email);
      if (existing) return res.status(409).json({ error: "Email already registered" });
      
      await authService.createUser({ email, password, full_name });
      
      return res.status(201).json({ 
        message: "Registration successful. You can now log in." 
      });

    } catch (error) {
      console.error("Error in /register controller:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
];

const login = [
  loginLimiter,
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    try {
      const { email, password } = req.body;
      const user = await authService.authenticate(email, password);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const tokens = await authService.generateTokensForUser(user);
      return res.status(200).json(tokens);

    } catch (error) {
      // Catch custom error from authService
      if (error.message === "Account not verified. Please check your email.") {
        return res.status(403).json({ error: error.message });
      }
      console.error("Login Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
];

const refresh = [
  body("refresh_token").notEmpty().withMessage("refresh_token is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { refresh_token } = req.body;
      
      const rotatedTokens = await authService.rotateRefreshToken(refresh_token);

      if (!rotatedTokens) {
        return res.status(401).json({ error: "Invalid or expired refresh token" });
      }
      return res.status(200).json(rotatedTokens);

    } catch (error) {
      console.error("Refresh Token Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
];

const logout = [
  // (no change)
  body("refresh_token").notEmpty().withMessage("refresh_token is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { refresh_token } = req.body;
    await authService.revokeRefreshToken(refresh_token);
    return res.status(204).send();
  }
];

const verifyEmail = async (req, res) => {
  const { token } = req.params;
  
  try {
    const user = await User.findOne({ where: { verification_token: token } });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification token." });
    }

    // Verify the user
    await user.update({
      is_verified: true,
      verification_token: null // Delete token so it can't be reused
    });

    // Return a simple HTML page
    return res.status(200).send("<h1>Email verified successfully!</h1><p>You can now log in.</p>");

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const getStats = async (req, res) => {
  try {
    // Count all users in the database
    const totalUsers = await User.count();
    
    // You could add more stats here, like verified vs. unverified
    const verifiedUsers = await User.count({ where: { is_verified: true } });

    return res.status(200).json({
      total_users: totalUsers,
      verified_users: verifiedUsers,
      unverified_users: totalUsers - verifiedUsers,
    });

  } catch (error) {
    console.error("Error in getStats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { register, login, refresh, logout, verifyEmail, getStats};
