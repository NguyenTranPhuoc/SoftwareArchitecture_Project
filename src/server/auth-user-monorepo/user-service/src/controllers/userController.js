const { body, validationResult } = require("express-validator");
const User = require("../models/User");
// NEW FEATURE: Import Friendship and Op
const Friendship = require("../models/Friendship");
const { Op } = require("sequelize");

const getMe = async (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  // CHANGE: Use 'findByPk'
  const user = await User.findByPk(userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.status(200).json(user.toSafeObject());
};

const updateMe = [
  // (validators unchanged)
  body("email").optional().isEmail().withMessage("Invalid email"),
  body("full_name").optional().isString(),
  body("avatar_url").optional().isString().withMessage("Invalid avatar_url"), 
  body("date_of_birth").optional().isISO8601().toDate(),
  async (req, res) => {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    const updates = {};
    const fields = ["email", "full_name", "avatar_url", "date_of_birth"];
    for (let f of fields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }
    
    try {

      // 1. Find the user first
      const user = await User.findByPk(userId);
      if (!user) {
        // This is the correct 404
        return res.status(404).json({ error: "User not found" });
      }

      // 2. If there are no actual updates, just return the current user
      if (Object.keys(updates).length === 0) {
        return res.status(200).json(user.toSafeObject());
      }
      
      // 3. If updates exist, apply them
      const updatedUser = await user.update(updates);
      return res.status(200).json(updatedUser.toSafeObject());
      
    } catch (err) {
      // 11000 (mongo) -> 23505 (postgres unique violation)
      // Fix database-specific error check
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: "Email already in use" });
      }
      console.error("Error in updateMe:", err); // Log the error for debugging
      return res.status(500).json({ error: "Internal server error" });
    }
  }
];

const getPublicProfile = async (req, res) => {
  const id = req.params.id;
  // CHANGE: Use 'findByPk'
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ error: "User not found" });
  // Use user.id
  const publicProfile = { id: user.id, full_name: user.full_name, avatar_url: user.avatar_url };
  return res.status(200).json(publicProfile);
};

// --- NEW FEATURE: FRIENDS LOGIC ---

const sendFriendRequest = async (req, res) => {
  const requester_id = req.user.id;
  const addressee_id = req.params.userId;

  if (requester_id === addressee_id) {
    return res.status(400).json({ error: "Cannot add yourself" });
  }

  try {
    // Check if relationship already exists (either way)
    const existing = await Friendship.findOne({
      where: {
        [Op.or]: [
          { requester_id, addressee_id },
          { requester_id: addressee_id, addressee_id: requester_id }
        ]
      }
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ error: "You are already friends" });
      }
      return res.status(400).json({ error: "Friend request already sent" });
    }

    const friendship = await Friendship.create({
      requester_id,
      addressee_id,
      status: 'pending'
    });
    return res.status(201).json(friendship);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const acceptFriendRequest = async (req, res) => {
  const myUserId = req.user.id;
  const friendshipId = req.params.friendshipId;

  try {
    const request = await Friendship.findOne({
      where: {
        id: friendshipId,
        addressee_id: myUserId, // Only the addressee can accept
        status: 'pending'
      }
    });

    if (!request) {
      return res.status(404).json({ error: "Pending request not found" });
    }

    await request.update({ status: 'accepted' });
    return res.status(200).json(request);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const rejectOrRemoveFriend = async (req, res) => {
  const myUserId = req.user.id;
  const friendshipId = req.params.friendshipId;

  try {
    // Must be the requester or addressee
    const friendship = await Friendship.findOne({
      where: {
        id: friendshipId,
        [Op.or]: [
          { requester_id: myUserId },
          { addressee_id: myUserId }
        ]
      }
    });

    if (!friendship) {
      return res.status(404).json({ error: "Friendship not found" });
    }

    // If 'pending' and user is addressee -> this is a reject
    // If 'accepted' (by anyone) -> this is an unfriend
    // If 'pending' and user is requester -> this is a cancel
    await friendship.destroy();
    return res.status(204).send(); // 204 No Content
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getMyFriends = async (req, res) => {
  const myUserId = req.user.id;
  try {
    const friendships = await Friendship.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [
          { requester_id: myUserId },
          { addressee_id: myUserId }
        ]
      },
      // Include info for both users
      include: [
        { model: User, as: 'Requester', attributes: ['id', 'full_name', 'avatar_url'] },
        { model: User, as: 'Addressee', attributes: ['id', 'full_name', 'avatar_url'] }
      ]
    });

    // Filter to return only the "friend's" info
    const friends = friendships.map(f => {
      const friendUser = f.requester_id === myUserId ? f.Addressee : f.Requester;
      return {
        friendship_id: f.id, // Return friendship_id to allow 'unfriend'
        ...friendUser.toJSON()
      };
    });

    return res.status(200).json(friends);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getPendingRequests = async (req, res) => {
  const myUserId = req.user.id;
  try {
    // Find 'pending' requests where I am the addressee
    const requests = await Friendship.findAll({
      where: {
        status: 'pending',
        addressee_id: myUserId
      },
      include: [
        { model: User, as: 'Requester', attributes: ['id', 'full_name', 'avatar_url'] }
      ]
    });

    // Format the list nicely
    const pendingList = requests.map(r => ({
      friendship_id: r.id,
      ...r.Requester.toJSON()
    }));

    return res.status(200).json(pendingList);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getStats = async (req, res) => {
  try {
    // Count all "accepted" friendships
    const totalFriendships = await Friendship.count({
      where: { status: 'accepted' }
    });

    // Count pending requests
    const pendingRequests = await Friendship.count({
      where: { status: 'pending' }
    });

    return res.status(200).json({
      total_active_friendships: totalFriendships,
      pending_friend_requests: pendingRequests
    });

  } catch (error) {
    console.error("Error in getStats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query; 

    if (!q) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { email: { [Op.iLike]: `%${q}%` } },
          { full_name: { [Op.iLike]: `%${q}%` } }
        ]
      },
      attributes: ['id', 'full_name', 'avatar_url', 'email'],
      limit: 20
    });

    return res.status(200).json(users);
  } catch (err) {
    console.error("Error searching users:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getMe,
  updateMe,
  getPublicProfile,
  // NEW FEATURE
  sendFriendRequest,
  acceptFriendRequest,
  rejectOrRemoveFriend,
  getMyFriends,
  getPendingRequests,
  getStats,
  searchUsers
};
