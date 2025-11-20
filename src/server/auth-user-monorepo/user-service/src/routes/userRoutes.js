const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../common/src/middleware/auth");
const controller = require("../controllers/userController");

router.get("/stats", authMiddleware, controller.getStats);
router.get("/me", authMiddleware, controller.getMe);
router.patch("/me", authMiddleware, controller.updateMe);
router.get("/search", authMiddleware, controller.searchUsers);
router.get("/friends", authMiddleware, controller.getMyFriends);
router.get("/friends/pending", authMiddleware, controller.getPendingRequests);
router.post("/friends/request/:userId", authMiddleware, controller.sendFriendRequest);
router.put("/friends/accept/:friendshipId", authMiddleware, controller.acceptFriendRequest);
router.delete("/friends/reject/:friendshipId", authMiddleware, controller.rejectOrRemoveFriend);
router.get("/:id", controller.getPublicProfile);

module.exports = router;