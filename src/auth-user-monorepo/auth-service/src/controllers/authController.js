const { body, validationResult } = require("express-validator");
const authService = require("../services/authService");
const rateLimit = require("express-rate-limit");
const config = require("../../../common/src/config");
const User = require("../models/User");
const loginLimiter = rateLimit({ windowMs: config.rateLimit.loginWindowMs, max: config.rateLimit.loginMax, message: { error: "Too many login attempts, please try again later" } });

const register = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
  body("phone_number").optional().isMobilePhone().withMessage("Invalid phone number"),
  async (req, res) => {
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      
      const { email, password, full_name, phone_number } = req.body;
      const existing = await authService.findUserByEmail(email);
      if (existing) return res.status(409).json({ error: "Email already registered" });
      
      await authService.createUser({ email, password, full_name, phone_number });
      
      return res.status(201).json({ 
        success: true,
        message: phone_number 
          ? "Đăng ký thành công! Mã xác thực đã được gửi đến số điện thoại của bạn."
          : "Đăng ký thành công! Vui lòng xác thực tài khoản.",
        messageEn: phone_number
          ? "Registration successful! Verification code sent to your phone."
          : "Registration successful! Please verify your account.",
        requiresVerification: true
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
        return res.status(403).json({ 
          error: "Tài khoản chưa được xác thực. Vui lòng kiểm tra email.",
          errorEn: error.message 
        });
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
      return res.status(400).send(`
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Xác thực thất bại</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error { color: #d32f2f; }
              a { color: #0068FF; text-decoration: none; }
            </style>
          </head>
          <body>
            <h1 class="error">❌ Xác thực thất bại</h1>
            <p>Link xác thực không hợp lệ hoặc đã hết hạn.</p>
            <p><a href="http://34.124.227.173:3000/login">Quay lại trang đăng nhập</a></p>
          </body>
        </html>
      `);
    }

    // Verify the user
    await user.update({
      is_verified: true,
      verification_token: null // Delete token so it can't be reused
    });

    // Return a success page and redirect
    return res.status(200).send(`
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Xác thực thành công</title>
          <meta http-equiv="refresh" content="3;url=http://34.124.227.173:3000/login">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .success { color: #4caf50; }
            a { color: #0068FF; text-decoration: none; }
          </style>
        </head>
        <body>
          <h1 class="success">✅ Xác thực email thành công!</h1>
          <p>Bạn có thể đăng nhập ngay bây giờ.</p>
          <p>Đang chuyển hướng đến trang đăng nhập trong 3 giây...</p>
          <p><a href="http://34.124.227.173:3000/login">Nhấp vào đây nếu không được chuyển hướng</a></p>
        </body>
      </html>
    `);

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

const verifyPhone = [
  body("email").isEmail().withMessage("Invalid email"),
  body("code").isLength({ min: 6, max: 6 }).withMessage("Code must be 6 digits"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, code } = req.body;
      await authService.verifyPhoneCode(email, code);

      return res.status(200).json({
        success: true,
        message: "Xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.",
        messageEn: "Verification successful! You can now log in."
      });

    } catch (error) {
      console.error("Error in verifyPhone:", error);
      if (error.message === "Invalid verification code") {
        return res.status(400).json({ error: "Mã xác thực không đúng" });
      }
      if (error.message === "Verification code expired") {
        return res.status(400).json({ error: "Mã xác thực đã hết hạn" });
      }
      return res.status(400).json({ error: error.message || "Xác thực thất bại" });
    }
  }
];

const resendCode = [
  body("email").isEmail().withMessage("Invalid email"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email } = req.body;
      await authService.resendVerificationCode(email);

      return res.status(200).json({
        success: true,
        message: "Mã xác thực mới đã được gửi đến số điện thoại của bạn.",
        messageEn: "New verification code sent to your phone."
      });

    } catch (error) {
      console.error("Error in resendCode:", error);
      return res.status(400).json({ error: error.message || "Gửi lại mã thất bại" });
    }
  }
];

module.exports = { register, login, refresh, logout, verifyEmail, verifyPhone, resendCode, getStats};
