import conversationModel, { IConversation } from '../models/conversationModel';
import messageModel, { IMessage } from '../models/messageModel';
import { getRedisClient } from '../utils/database';

export class ChatService {
  private readonly CONVERSATION_CACHE_PREFIX = 'conversation:';
  private readonly USER_CONVERSATIONS_PREFIX = 'user:conversations:';
  private readonly UNREAD_COUNT_PREFIX = 'unread:';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  /**
   * Create a new conversation (direct or group)
   */
  async createConversation(
    participants: string[],
    type: 'direct' | 'group',
    createdBy: string,
    name?: string,
    avatar?: string
  ): Promise<IConversation> {
    // For direct conversations, check if one already exists
    if (type === 'direct' && participants.length === 2) {
      const existing = await conversationModel.findDirectConversation(
        participants[0],
        participants[1]
      );
      if (existing) {
        return existing;
      }
    }

    const conversation = await conversationModel.createConversation({
      participants,
      type,
      name,
      avatar,
      createdBy,
    });

    // Cache the new conversation
    await this.cacheConversation(conversation);

    // Invalidate user conversations cache for all participants
    await this.invalidateUserConversationsCache(participants);

    return conversation;
  }

  /**
   * Get conversation by ID with Redis caching
   */
  async getConversation(conversationId: string): Promise<IConversation | null> {
    const redis = getRedisClient();
    const cacheKey = this.CONVERSATION_CACHE_PREFIX + conversationId;

    // Try to get from cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // If not in cache, get from database
    const conversation = await conversationModel.findConversationById(conversationId);
    if (conversation) {
      await this.cacheConversation(conversation);
    }

    return conversation;
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string): Promise<IConversation[]> {
    const redis = getRedisClient();
    const cacheKey = this.USER_CONVERSATIONS_PREFIX + userId;

    // Try to get from cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get from database
    const conversations = await conversationModel.findConversationsByUserId(userId);

    // Cache the result
    if (conversations.length > 0) {
      await redis.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(conversations));
    }

    return conversations;
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: 'text' | 'image' | 'file' | 'audio' | 'video' = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    replyTo?: string
  ): Promise<IMessage> {
    // Create the message
    const message = await messageModel.createMessage({
      conversationId,
      senderId,
      content,
      type,
      fileUrl,
      fileName,
      fileSize,
      replyTo,
    });

    // ✅ UPDATED: Use lastMessageId instead of embedding full object
    if (message._id) {
      await conversationModel.updateLastMessage(
        conversationId,
        message._id.toString(), // Pass message ID
        message.createdAt // Pass timestamp
      );
    }

    // Get conversation to invalidate caches
    const conversation = await conversationModel.findConversationById(conversationId);
    if (conversation) {
      // Invalidate conversation cache
      await this.invalidateConversationCache(conversationId);

      // ✅ Convert ObjectId[] to string[] for cache keys
      const participantIds = conversation.participants.map(id => id.toString());
      await this.invalidateUserConversationsCache(participantIds);

      // Update unread counts for all participants except sender
      for (const participantId of participantIds) {
        if (participantId !== senderId) {
          await this.incrementUnreadCount(participantId, conversationId);
        }
      }
    }

    return message;
  }

  /**
   * Get messages for a conversation with pagination
   */
  async getMessages(
    conversationId: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<IMessage[]> {
    return await messageModel.findMessagesByConversationId(conversationId, limit, skip);
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const count = await messageModel.markConversationMessagesAsRead(conversationId, userId);

    if (count > 0) {
      // Reset unread count in Redis
      await this.resetUnreadCount(userId, conversationId);
    }
  }

  /**
   * Update a message
   */
  async updateMessage(messageId: string, content: string): Promise<boolean> {
    return await messageModel.updateMessage(messageId, content);
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    return await messageModel.deleteMessage(messageId, true);
  }

  /**
   * Add a reaction to a message
   */
  async addReaction(messageId: string, emoji: string, userId: string): Promise<boolean> {
    return await messageModel.addReaction(messageId, emoji, userId);
  }

  /**
   * Remove a reaction from a message
   */
  async removeReaction(messageId: string, emoji: string, userId: string): Promise<boolean> {
    return await messageModel.removeReaction(messageId, emoji, userId);
  }

  /**
   * Get unread count for a user in a conversation
   */
  async getUnreadCount(userId: string, conversationId: string): Promise<number> {
    const redis = getRedisClient();
    const cacheKey = this.UNREAD_COUNT_PREFIX + userId + ':' + conversationId;

    const cached = await redis.get(cacheKey);
    if (cached !== null) {
      return parseInt(cached, 10);
    }

    // Get from database
    const count = await messageModel.getUnreadCount(conversationId, userId);
    await redis.setEx(cacheKey, this.CACHE_TTL, count.toString());

    return count;
  }

  /**
   * Get total unread count for a user across all conversations
   */
  async getTotalUnreadCount(userId: string): Promise<number> {
    const conversations = await this.getUserConversations(userId);
    let total = 0;

    for (const conversation of conversations) {
      if (conversation._id) {
        const count = await this.getUnreadCount(userId, conversation._id.toString());
        total += count;
      }
    }

    return total;
  }

  /**
   * Search messages in a conversation
   */
  async searchMessages(conversationId: string, searchTerm: string, limit: number = 20): Promise<IMessage[]> {
    return await messageModel.searchMessages(conversationId, searchTerm, limit);
  }

  /**
   * Add participant to group conversation
   */
  async addParticipant(conversationId: string, userId: string): Promise<boolean> {
    const success = await conversationModel.addParticipant(conversationId, userId);

    if (success) {
      await this.invalidateConversationCache(conversationId);
      await this.invalidateUserConversationsCache([userId]);
    }

    return success;
  }

  /**
   * Remove participant from group conversation
   */
  async removeParticipant(conversationId: string, userId: string): Promise<boolean> {
    const success = await conversationModel.removeParticipant(conversationId, userId);

    if (success) {
      await this.invalidateConversationCache(conversationId);
      await this.invalidateUserConversationsCache([userId]);
    }

    return success;
  }

  /**
   * ✅ NEW: Archive conversation for a user
   */
  async archiveConversation(conversationId: string, userId: string): Promise<boolean> {
    const success = await conversationModel.archiveConversation(conversationId, userId);

    if (success) {
      await this.invalidateConversationCache(conversationId);
      await this.invalidateUserConversationsCache([userId]);
    }

    return success;
  }

  /**
   * ✅ NEW: Unarchive conversation for a user
   */
  async unarchiveConversation(conversationId: string, userId: string): Promise<boolean> {
    const success = await conversationModel.unarchiveConversation(conversationId, userId);

    if (success) {
      await this.invalidateConversationCache(conversationId);
      await this.invalidateUserConversationsCache([userId]);
    }

    return success;
  }

  /**
   * ✅ NEW: Get conversation with last message details ($lookup)
   */
  async getConversationWithLastMessage(conversationId: string) {
    return await conversationModel.getConversationWithLastMessage(conversationId);
  }

  /**
   * ✅ NEW: Get user conversations with last message details ($lookup)
   */
  async getUserConversationsWithLastMessage(userId: string) {
    // Note: Skipping cache for this method since it uses aggregation
    return await conversationModel.getUserConversationsWithLastMessage(userId);
  }

  // Private helper methods for cache management

  private async cacheConversation(conversation: IConversation): Promise<void> {
    if (!conversation._id) return;

    const redis = getRedisClient();
    const cacheKey = this.CONVERSATION_CACHE_PREFIX + conversation._id.toString();
    await redis.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(conversation));
  }

  private async invalidateConversationCache(conversationId: string): Promise<void> {
    const redis = getRedisClient();
    const cacheKey = this.CONVERSATION_CACHE_PREFIX + conversationId;
    await redis.del(cacheKey);
  }

  private async invalidateUserConversationsCache(userIds: string[]): Promise<void> {
    const redis = getRedisClient();
    const keys = userIds.map(id => this.USER_CONVERSATIONS_PREFIX + id);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }

  private async incrementUnreadCount(userId: string, conversationId: string): Promise<void> {
    const redis = getRedisClient();
    const cacheKey = this.UNREAD_COUNT_PREFIX + userId + ':' + conversationId;
    await redis.incr(cacheKey);
    await redis.expire(cacheKey, this.CACHE_TTL);
  }

  private async resetUnreadCount(userId: string, conversationId: string): Promise<void> {
    const redis = getRedisClient();
    const cacheKey = this.UNREAD_COUNT_PREFIX + userId + ':' + conversationId;
    await redis.set(cacheKey, '0');
    await redis.expire(cacheKey, this.CACHE_TTL);
  }
}

export default new ChatService();
