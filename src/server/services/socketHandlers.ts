import { Server, Socket } from 'socket.io';
import chatService from './chatService';
import { getRedisClient } from '../utils/database';

// Store active user connections in Redis for distributed systems
const ONLINE_USERS_PREFIX = 'online:';
const USER_SOCKET_PREFIX = 'socket:';

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join user to their personal room
    socket.on('user:join', async (userId: string) => {
      try {
        socket.data.userId = userId;
        socket.join(`user:${userId}`);

        // Mark user as online in Redis
        const redis = getRedisClient();
        await redis.set(`${ONLINE_USERS_PREFIX}${userId}`, 'true', { EX: 3600 });
        await redis.set(`${USER_SOCKET_PREFIX}${userId}`, socket.id, { EX: 3600 });

        // Get user's conversations and join them
        const conversations = await chatService.getUserConversations(userId);
        for (const conversation of conversations) {
          if (conversation._id) {
            socket.join(`conversation:${conversation._id.toString()}`);
          }
        }

        // Notify user's contacts that they're online
        socket.broadcast.emit('user:online', { userId });

        console.log(`User ${userId} joined with socket ${socket.id}`);
      } catch (error) {
        console.error('Error in user:join:', error);
        socket.emit('error', { message: 'Failed to join' });
      }
    });

    // Join a conversation room
    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave a conversation room
    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Send a message
    socket.on('message:send', async (data: {
      conversationId: string;
      senderId: string;
      content: string;
      type?: 'text' | 'image' | 'file' | 'audio' | 'video';
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      replyTo?: string;
    }) => {
      try {
        const {
          conversationId,
          senderId,
          content,
          type = 'text',
          fileUrl,
          fileName,
          fileSize,
          replyTo,
        } = data;

        // Send message through service
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

        // Broadcast message to all participants in the conversation
        io.to(`conversation:${conversationId}`).emit('message:new', message);

        // Send typing stopped event
        io.to(`conversation:${conversationId}`).emit('typing:stop', {
          conversationId,
          userId: senderId,
        });

        console.log(`Message sent in conversation ${conversationId}`);
      } catch (error) {
        console.error('Error in message:send:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing:start', (data: { conversationId: string; userId: string; userName: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('typing:start', {
        conversationId: data.conversationId,
        userId: data.userId,
        userName: data.userName,
      });
    });

    socket.on('typing:stop', (data: { conversationId: string; userId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('typing:stop', {
        conversationId: data.conversationId,
        userId: data.userId,
      });
    });

    // Mark messages as read
    socket.on('messages:read', async (data: { conversationId: string; userId: string }) => {
      try {
        const { conversationId, userId } = data;

        await chatService.markMessagesAsRead(conversationId, userId);

        // Notify other participants that messages were read
        socket.to(`conversation:${conversationId}`).emit('messages:read', {
          conversationId,
          userId,
          timestamp: new Date(),
        });

        console.log(`Messages marked as read in conversation ${conversationId} by user ${userId}`);
      } catch (error) {
        console.error('Error in messages:read:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Add reaction to a message
    socket.on('reaction:add', async (data: {
      messageId: string;
      conversationId: string;
      emoji: string;
      userId: string;
    }) => {
      try {
        const { messageId, conversationId, emoji, userId } = data;

        const success = await chatService.addReaction(messageId, emoji, userId);

        if (success) {
          // Broadcast reaction to all participants
          io.to(`conversation:${conversationId}`).emit('reaction:added', {
            messageId,
            emoji,
            userId,
          });
        }
      } catch (error) {
        console.error('Error in reaction:add:', error);
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    // Remove reaction from a message
    socket.on('reaction:remove', async (data: {
      messageId: string;
      conversationId: string;
      emoji: string;
      userId: string;
    }) => {
      try {
        const { messageId, conversationId, emoji, userId } = data;

        const success = await chatService.removeReaction(messageId, emoji, userId);

        if (success) {
          // Broadcast reaction removal to all participants
          io.to(`conversation:${conversationId}`).emit('reaction:removed', {
            messageId,
            emoji,
            userId,
          });
        }
      } catch (error) {
        console.error('Error in reaction:remove:', error);
        socket.emit('error', { message: 'Failed to remove reaction' });
      }
    });

    // Update message
    socket.on('message:update', async (data: {
      messageId: string;
      conversationId: string;
      content: string;
    }) => {
      try {
        const { messageId, conversationId, content } = data;

        const success = await chatService.updateMessage(messageId, content);

        if (success) {
          // Broadcast message update to all participants
          io.to(`conversation:${conversationId}`).emit('message:updated', {
            messageId,
            content,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('Error in message:update:', error);
        socket.emit('error', { message: 'Failed to update message' });
      }
    });

    // Delete message
    socket.on('message:delete', async (data: {
      messageId: string;
      conversationId: string;
    }) => {
      try {
        const { messageId, conversationId } = data;

        const success = await chatService.deleteMessage(messageId);

        if (success) {
          // Broadcast message deletion to all participants
          io.to(`conversation:${conversationId}`).emit('message:deleted', {
            messageId,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('Error in message:delete:', error);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // Handle user disconnect
    socket.on('disconnect', async () => {
      try {
        const userId = socket.data.userId;

        if (userId) {
          // Mark user as offline in Redis
          const redis = getRedisClient();
          await redis.del(`${ONLINE_USERS_PREFIX}${userId}`);
          await redis.del(`${USER_SOCKET_PREFIX}${userId}`);

          // Notify user's contacts that they're offline
          socket.broadcast.emit('user:offline', { userId });

          console.log(`User ${userId} disconnected (socket ${socket.id})`);
        } else {
          console.log(`Socket ${socket.id} disconnected`);
        }
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });

    // Check if user is online
    socket.on('user:check-online', async (userId: string, callback) => {
      try {
        const redis = getRedisClient();
        const isOnline = await redis.exists(`${ONLINE_USERS_PREFIX}${userId}`);
        callback({ userId, isOnline: isOnline === 1 });
      } catch (error) {
        console.error('Error checking online status:', error);
        callback({ userId, isOnline: false });
      }
    });

    // Get online users for a conversation
    socket.on('conversation:online-users', async (conversationId: string, callback) => {
      try {
        const conversation = await chatService.getConversation(conversationId);
        if (!conversation) {
          return callback({ error: 'Conversation not found' });
        }

        const redis = getRedisClient();
        const onlineUsers: string[] = [];

        for (const participantId of conversation.participants) {
          const isOnline = await redis.exists(`${ONLINE_USERS_PREFIX}${participantId}`);
          if (isOnline === 1) {
            onlineUsers.push(participantId);
          }
        }

        callback({ conversationId, onlineUsers });
      } catch (error) {
        console.error('Error getting online users:', error);
        callback({ error: 'Failed to get online users' });
      }
    });
  });

  return io;
}
