const express = require("express");
const router = express.Router();
const controller = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);

// Email verification (legacy)
router.get("/verify-email/:token", controller.verifyEmail);

// Phone verification (new)
router.post("/verify-phone", controller.verifyPhone);
router.post("/resend-code", controller.resendCode);

router.get("/stats", authMiddleware, controller.getStats);

module.exports = router;
