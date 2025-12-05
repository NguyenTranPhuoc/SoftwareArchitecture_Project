import { Router, Request, Response } from 'express';
import chatService from '../services/chatService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * POST /api/messages
 * Send a new message
 * Body: {
 *   conversationId: string,
 *   content: string,
 *   type?: 'text' | 'image' | 'file' | 'audio' | 'video',
 *   fileUrl?: string,
 *   fileName?: string,
 *   fileSize?: number,
 *   replyTo?: string
 * }
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      conversationId,
      content,
      type = 'text',
      fileUrl,
      fileName,
      fileSize,
      replyTo,
    } = req.body;

    // Get senderId from authenticated user
    const senderId = req.user!.id;

    // Validation
    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify conversation exists
    const conversation = await chatService.getConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // ✅ Verify sender is a participant (participants are now ObjectId[])
    const participantIds = conversation.participants.map(id => id.toString());
    if (!participantIds.includes(senderId)) {
      return res.status(403).json({ error: 'You are not a participant in this conversation' });
    }

    const message = await chatService.sendMessage(
      conversationId,
      senderId,
      content,
      type,
      fileUrl,
      fileName,
      fileSize,
      replyTo
    );

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/messages/:conversationId
 * Get messages for a conversation with pagination
 * Query params: limit (default: 50), skip (default: 0)
 */
router.get('/:conversationId', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;

    // Verify conversation exists
    const conversation = await chatService.getConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await chatService.getMessages(conversationId, limit, skip);

    res.status(200).json({
      success: true,
      data: messages,
      count: messages.length,
      pagination: {
        limit,
        skip,
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      error: 'Failed to fetch messages',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /api/messages/:messageId
 * Update a message
 * Body: { content: string }
 */
router.put('/:messageId', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const success = await chatService.updateMessage(messageId, content);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Message updated successfully',
      });
    } else {
      res.status(404).json({ error: 'Message not found or update failed' });
    }
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({
      error: 'Failed to update message',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/messages/:messageId
 * Delete a message (soft delete)
 */
router.delete('/:messageId', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;

    const success = await chatService.deleteMessage(messageId);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Message deleted successfully',
      });
    } else {
      res.status(404).json({ error: 'Message not found or delete failed' });
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      error: 'Failed to delete message',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/messages/:conversationId/read
 * Mark all messages in a conversation as read
 * Body: { userId: string }
 */
router.post('/:conversationId/read', async (req: Request, res: Response) => {
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

    // ✅ Verify user is a participant (participants are now ObjectId[])
    const participantIds = conversation.participants.map(id => id.toString());
    if (!participantIds.includes(userId)) {
      return res.status(403).json({ error: 'You are not a participant in this conversation' });
    }

    await chatService.markMessagesAsRead(conversationId, userId);

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      error: 'Failed to mark messages as read',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/messages/:messageId/reactions
 * Add a reaction to a message
 * Body: { emoji: string, userId: string }
 */
router.post('/:messageId/reactions', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { emoji, userId } = req.body;

    if (!emoji || !userId) {
      return res.status(400).json({ error: 'Emoji and user ID are required' });
    }

    const success = await chatService.addReaction(messageId, emoji, userId);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Reaction added successfully',
      });
    } else {
      res.status(404).json({ error: 'Message not found or reaction failed' });
    }
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({
      error: 'Failed to add reaction',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/messages/:messageId/reactions
 * Remove a reaction from a message
 * Body: { emoji: string, userId: string }
 */
router.delete('/:messageId/reactions', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { emoji, userId } = req.body;

    if (!emoji || !userId) {
      return res.status(400).json({ error: 'Emoji and user ID are required' });
    }

    const success = await chatService.removeReaction(messageId, emoji, userId);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Reaction removed successfully',
      });
    } else {
      res.status(404).json({ error: 'Message not found or reaction removal failed' });
    }
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({
      error: 'Failed to remove reaction',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/messages/:conversationId/search
 * Search messages in a conversation
 * Query params: q (search term), limit (default: 20)
 */
router.get('/:conversationId/search', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const searchTerm = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term (q) is required' });
    }

    // Verify conversation exists
    const conversation = await chatService.getConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await chatService.searchMessages(conversationId, searchTerm, limit);

    res.status(200).json({
      success: true,
      data: messages,
      count: messages.length,
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({
      error: 'Failed to search messages',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
