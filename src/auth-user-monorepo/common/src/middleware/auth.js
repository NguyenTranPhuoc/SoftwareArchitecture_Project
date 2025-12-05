const { verifyToken } = require("../utils/jwt");

module.exports = (req, res, next) => {
  const auth = req.headers["authorization"] || "";
  if (!auth.startsWith("Bearer ")) return res.status(401).json({ error: "Missing or invalid Authorization header" });
  const token = auth.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid or expired access token" });
  req.user = { id: payload.sub, email: payload.email, roles: payload.roles || [] };
  next();
};
