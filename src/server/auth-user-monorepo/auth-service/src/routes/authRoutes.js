const express = require("express");
const router = express.Router();
const controller = require("../controllers/authController");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);
router.get("/verify-email/:token", controller.verifyEmail);

const authMiddleware = require("../middlewares/authMiddleware");
router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);
router.get("/verify-email/:token", controller.verifyEmail);
router.get("/stats", authMiddleware, controller.getStats);

module.exports = router;
