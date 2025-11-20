const bcrypt = require("bcrypt");
const crypto = require("crypto");
const config = require("../config");

const hashPassword = (password) => bcrypt.hash(password, config.bcrypt.saltRounds || 10);
const comparePassword = (password, hash) => bcrypt.compare(password, hash);
const generateRandomToken = (size = 64) => crypto.randomBytes(size).toString("hex");
const hashToken = (token) => bcrypt.hash(token, config.bcrypt.saltRounds || 10);
const compareToken = (token, tokenHash) => bcrypt.compare(token, tokenHash);

module.exports = { hashPassword, comparePassword, generateRandomToken, hashToken, compareToken };
