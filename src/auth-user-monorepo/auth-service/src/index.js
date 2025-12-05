const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();
const config = require("../../common/src/config");
const db = require("../../common/src/db/sequelize");
const authRoutes = require("./routes/authRoutes");
const { connectRedis } = require("./db/redisClient");
const User = require("./models/User");

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors({ 
  origin: config.cors.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

db.connect()
  .then(async () => {
    console.log("Auth-service connected to PostgreSQL");
    // Sync tables
    await User.sync({ alter: true });
    console.log("Auth models synced.");
    await connectRedis();
  })
  .catch(err => console.error("Failed to connect or sync auth models:", err));

app.use("/auth", authRoutes);
app.get("/", (req, res) => res.json({ service: "auth-service", status: "ok" }));
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

app.listen(PORT, () => console.log(`Auth-service listening on port ${PORT}`));