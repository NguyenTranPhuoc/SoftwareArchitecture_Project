// auth-service/src/services/authService.js
const User = require("../models/User");
// const RefreshToken = require("../models/RefreshToken"); // <-- REMOVE THIS
const { hashPassword, comparePassword, generateRandomToken } = require("../../../common/src/utils/password");
const { signAccessToken } = require("../../../common/src/utils/jwt");
const config = require("../../../common/src/config");
const { redisClient, parseTTLToSeconds } = require("../db/redisClient"); // <-- ADD THIS

const createUser = async ({ email, password, full_name }) => {
  const password_hash = await hashPassword(password);
  // Create verification token (logic from controller, moved here)
  const crypto = require("crypto");
  const verification_token = crypto.randomBytes(32).toString("hex");

  const user = await User.create({
    email,
    password_hash,
    full_name,
    verification_token,
    is_verified: false // Explicitly set to false
  });

  // Send verification email
  const emailService = require("./emailService");
  emailService.sendVerificationEmail(user.email, user.verification_token)
    .catch(console.error);

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

module.exports = { 
  createUser, 
  findUserByEmail, 
  authenticate, 
  generateTokensForUser, 
  rotateRefreshToken, 
  revokeRefreshToken 
};