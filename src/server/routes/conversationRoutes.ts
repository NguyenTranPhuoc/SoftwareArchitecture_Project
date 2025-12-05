import { Router, Request, Response } from 'express';
import chatService from '../services/chatService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * POST /api/conversations
 * Create a new conversation (direct or group)
 * Body: { participants: string[], type: 'direct' | 'group', name?: string, avatar?: string }
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { participants, type, name, avatar } = req.body;

    // Get userId from authenticated user
    const createdBy = req.user!.id;

    // Validation
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ error: 'Participants array is required' });
    }

    if (!type || !['direct', 'group'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "direct" or "group"' });
    }

    if (type === 'direct' && participants.length !== 2) {
      return res.status(400).json({ error: 'Direct conversations must have exactly 2 participants' });
    }

    if (type === 'group' && participants.length < 2) {
      return res.status(400).json({ error: 'Group conversations must have at least 2 participants' });
    }

    if (type === 'group' && !name) {
      return res.status(400).json({ error: 'Group conversations must have a name' });
    }

    const conversation = await chatService.createConversation(
      participants,
      type,
      createdBy,
      name,
      avatar
    );

    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      error: 'Failed to create conversation',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/conversations
 * Get all conversations for the authenticated user
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    // Get userId from authenticated user
    const userId = req.user!.id;

    const conversations = await chatService.getUserConversations(userId);

    res.status(200).json({
      success: true,
      data: conversations,
      count: conversations.length,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      error: 'Failed to fetch conversations',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/conversations/:conversationId
 * Get conversation details by ID
 */
router.get('/:conversationId', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    const conversation = await chatService.getConversation(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      error: 'Failed to fetch conversation',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/conversations/:conversationId/participants
 * Add a participant to a group conversation
 * Body: { userId: string }
 */
router.post('/:conversationId/participants', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Verify conversation exists and is a group
    const conversation = await chatService.getConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.type !== 'group') {
      return res.status(400).json({ error: 'Can only add participants to group conversations' });
    }

    const success = await chatService.addParticipant(conversationId, userId);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Participant added successfully',
      });
    } else {
      res.status(500).json({ error: 'Failed to add participant' });
    }
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({
      error: 'Failed to add participant',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/conversations/:conversationId/participants/:userId
 * Remove a participant from a group conversation
 */
router.delete('/:conversationId/participants/:userId', async (req: Request, res: Response) => {
  try {
    const { conversationId, userId } = req.params;

    // Verify conversation exists and is a group
    const conversation = await chatService.getConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.type !== 'group') {
      return res.status(400).json({ error: 'Can only remove participants from group conversations' });
    }

    const success = await chatService.removeParticipant(conversationId, userId);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Participant removed successfully',
      });
    } else {
      res.status(500).json({ error: 'Failed to remove participant' });
    }
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({
      error: 'Failed to remove participant',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/conversations/:conversationId/unread
 * Get unread message count for a conversation
 * Query params: userId
 */
router.get('/:conversationId/unread', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    // TODO: Get userId from authentication middleware
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const count = await chatService.getUnreadCount(userId, conversationId);

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      error: 'Failed to get unread count',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * ✅ NEW: POST /api/conversations/:conversationId/archive
 * Archive conversation for a user
 * Body: { userId: string }
 */
router.post('/:conversationId/archive', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Verify conversation exists
    const conversation = await chatService.getConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Verify user is a participant
    const participantIds = conversation.participants.map(id => id.toString());
    if (!participantIds.includes(userId)) {
      return res.status(403).json({ error: 'You are not a participant in this conversation' });
    }

    const success = await chatService.archiveConversation(conversationId, userId);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Conversation archived successfully',
      });
    } else {
      res.status(500).json({ error: 'Failed to archive conversation' });
    }
  } catch (error) {
    console.error('Error archiving conversation:', error);
    res.status(500).json({
      error: 'Failed to archive conversation',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * ✅ NEW: POST /api/conversations/:conversationId/unarchive
 * Unarchive conversation for a user
 * Body: { userId: string }
 */
router.post('/:conversationId/unarchive', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Verify conversation exists
    const conversation = await chatService.getConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const success = await chatService.unarchiveConversation(conversationId, userId);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Conversation unarchived successfully',
      });
    } else {
      res.status(500).json({ error: 'Failed to unarchive conversation' });
    }
  } catch (error) {
    console.error('Error unarchiving conversation:', error);
    res.status(500).json({
      error: 'Failed to unarchive conversation',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * ✅ NEW: GET /api/conversations/with-messages/:userId
 * Get user conversations with last message details (uses $lookup aggregation)
 * This returns conversations with full last message object instead of just reference
 */
router.get('/with-messages/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const conversations = await chatService.getUserConversationsWithLastMessage(userId);

    res.status(200).json({
      success: true,
      data: conversations,
      count: conversations.length,
    });
  } catch (error) {
    console.error('Error fetching conversations with messages:', error);
    res.status(500).json({
      error: 'Failed to fetch conversations with messages',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
