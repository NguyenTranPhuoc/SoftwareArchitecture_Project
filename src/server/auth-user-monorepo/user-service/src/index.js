const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();
const config = require("../../common/src/config");
// CHANGE: Import sequelize
const db = require("../../common/src/db/sequelize");
const userRoutes = require("./routes/userRoutes");

// CHANGE: Import models to sync
const User = require("./models/User");
const Friendship = require("./models/Friendship"); // NEW FEATURE

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: config.cors.allowedOrigins }));

// CHANGE: Connect and sync models
db.connect()
  .then(async () => {
    console.log("User-service connected to PostgreSQL");
    // Sync tables
    await User.sync({ alter: true });
    await Friendship.sync({ alter: true }); 
    console.log("User models synced.");
  })
  .catch(err => console.error("Failed to connect or sync user models:", err));

app.use("/users", userRoutes);
app.get("/", (req, res) => res.json({ service: "user-service", status: "ok" }));
const PORT = process.env.USER_SERVICE_PORT || 3002;

app.listen(PORT, () => console.log(`User-service listening on port ${PORT}`));