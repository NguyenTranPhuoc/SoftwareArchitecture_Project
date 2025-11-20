const jwt = require("jsonwebtoken");
const config = require("../config");

const signAccessToken = (payload) => jwt.sign(payload, config.jwt.secret, { algorithm: "HS256", expiresIn: config.jwt.accessTokenTTL });
const signRefreshToken = (payload) => jwt.sign(payload, config.jwt.secret, { algorithm: "HS256", expiresIn: config.jwt.refreshTokenTTL });

const verifyToken = (token) => {
  try { return jwt.verify(token, config.jwt.secret, { algorithms: ["HS256"] }); }
  catch { return null; }
};

module.exports = { signAccessToken, signRefreshToken, verifyToken };
