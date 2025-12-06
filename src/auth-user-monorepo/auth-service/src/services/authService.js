// auth-service/src/services/authService.js
const User = require("../models/User");
// const RefreshToken = require("../models/RefreshToken"); // <-- REMOVE THIS
const { hashPassword, comparePassword, generateRandomToken } = require("../../../common/src/utils/password");
const { signAccessToken } = require("../../../common/src/utils/jwt");
const config = require("../../../common/src/config");
const { redisClient, parseTTLToSeconds } = require("../db/redisClient"); // <-- ADD THIS

const createUser = async ({ email, password, full_name, phone_number }) => {
  const password_hash = await hashPassword(password);
  
  // Generate 6-digit verification code
  const smsService = require("./smsService");
  const verification_code = smsService.generateVerificationCode();
  const verification_code_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const user = await User.create({
    email,
    password_hash,
    full_name,
    phone_number,
    verification_code,
    verification_code_expires,
    is_verified: false // Require verification
  });

  // Send verification code via SMS
  if (phone_number) {
    try {
      await smsService.sendVerificationSMS(phone_number, verification_code);
      console.log("✅ Verification SMS sent to:", phone_number);
    } catch (error) {
      console.error("❌ Failed to send verification SMS:", error);
      // Don't fail registration if SMS fails
    }
  }

  return user;
};

const findUserByEmail = async (email) => User.findOne({ where: { email } });

const authenticate = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) return null;

  // Check if verified
  if (!user.is_verified) {
    throw new Error("Account not verified. Please check your email.");
  }
  
  const ok = await comparePassword(password, user.password_hash);
  if (!ok) return null;
  return user;
};

const generateTokensForUser = async (user) => {
  const payload = { sub: user.id.toString(), email: user.email, roles: [] };
  const access_token = signAccessToken(payload);
  const refresh_token = generateRandomToken(64); // This is the plain token

  // Store the new refresh token in Redis
  const key = `refresh_token:${refresh_token}`;
  const value = user.id.toString();
  const ttlInSeconds = parseTTLToSeconds(config.jwt.refreshTokenTTL || "7d");
  
  await redisClient.set(key, value, {
    EX: ttlInSeconds // Set expiry in seconds
  });
  
  const accessTokenTTLInSeconds = parseTTLToSeconds(config.jwt.accessTokenTTL || "15m");

  return { 
    access_token, 
    refresh_token, // Send plain token to user
    expires_in: accessTokenTTLInSeconds 
  };
};

const rotateRefreshToken = async (providedRefreshToken) => {
  const key = `refresh_token:${providedRefreshToken}`;
  
  // 1. Check if token exists in Redis
  const userId = await redisClient.get(key);
  if (!userId) {
    return null; // Token is invalid or expired
  }

  // 2. Delete the old token from Redis
  await redisClient.del(key);

  // 3. Find the user to generate new tokens
  const user = await User.findByPk(userId);
  if (!user) {
    return null; // User no longer exists
  }
  
  // 4. Generate and store new tokens
  return generateTokensForUser(user);
};

const revokeRefreshToken = async (refreshTokenPlain) => {
  const key = `refresh_token:${refreshTokenPlain}`;  
  const result = await redisClient.del(key);  
  return result > 0; // Returns true if a key was deleted
};

const verifyPhoneCode = async (email, code) => {
  const user = await User.findOne({ where: { email } });
  
  if (!user) {
    throw new Error("User not found");
  }

  if (user.is_verified) {
    throw new Error("Account already verified");
  }

  if (!user.verification_code || !user.verification_code_expires) {
    throw new Error("No verification code found");
  }

  // Check if code expired
  if (new Date() > user.verification_code_expires) {
    throw new Error("Verification code expired");
  }

  // Check if code matches
  if (user.verification_code !== code) {
    throw new Error("Invalid verification code");
  }

  // Verify the user
  await user.update({
    is_verified: true,
    verification_code: null,
    verification_code_expires: null
  });

  return user;
};

const resendVerificationCode = async (email) => {
  const user = await User.findOne({ where: { email } });
  
  if (!user) {
    throw new Error("User not found");
  }

  if (user.is_verified) {
    throw new Error("Account already verified");
  }

  if (!user.phone_number) {
    throw new Error("No phone number registered");
  }

  // Generate new code
  const smsService = require("./smsService");
  const verification_code = smsService.generateVerificationCode();
  const verification_code_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await user.update({
    verification_code,
    verification_code_expires
  });

  // Send new code
  await smsService.sendVerificationSMS(user.phone_number, verification_code);

  return user;
};

module.exports = { 
  createUser, 
  findUserByEmail, 
  authenticate, 
  generateTokensForUser, 
  rotateRefreshToken, 
  revokeRefreshToken,
  verifyPhoneCode,
  resendVerificationCode
};