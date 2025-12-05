const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  // CHANGE: Config for Sequelize/Postgres
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    name: process.env.DB_NAME,
    dialect: process.env.DB_DIALECT || 'postgres',
  },
  jwt: {
    secret: process.env.JWT_SECRET || "change-me",
    accessTokenTTL: process.env.ACCESS_TOKEN_TTL || "15m",
    refreshTokenTTL: process.env.REFRESH_TOKEN_TTL || "7d",
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
  },
  cors: {
    allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || "*").split(","),
  },
  rateLimit: {
    loginWindowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || "60000", 10),
    loginMax: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || "5", 10),
  },
};
