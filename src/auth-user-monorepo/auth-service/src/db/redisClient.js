// auth-service/src/db/redisClient.js
const { createClient } = require("redis");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

async function connectRedis() {
  if (redisClient.isReady) {
    return;
  }
  try {
    await redisClient.connect();
    console.log("Auth-service connected to Redis.");
  } catch (err) {
    console.error("Auth-service could not connect to Redis:", err);
    process.exit(1); // Exit if Redis connection fails
  }
}

// Function to convert TTL string (e.g., "7d") to seconds
const parseTTLToSeconds = (ttl) => {
  if (!ttl) return 0;
  const last = ttl.slice(-1);
  const num = parseInt(ttl.slice(0, -1), 10);
  if (last === "s") return num;
  if (last === "m") return num * 60;
  if (last === "h") return num * 60 * 60;
  if (last === "d") return num * 24 * 60 * 60;
  return parseInt(ttl, 10);
};

module.exports = { 
  redisClient, 
  connectRedis,
  parseTTLToSeconds 
};