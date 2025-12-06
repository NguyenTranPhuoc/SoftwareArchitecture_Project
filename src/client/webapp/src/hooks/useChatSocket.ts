// src/hooks/useChatSocket.ts
import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useChatStore } from "../store/chatStore";
import type { Message } from "../store/chatStore";

export function useChatSocket() {
  const me = useChatStore((s) => s.me);
  const receiveMessage = useChatStore((s) => s.receiveMessage);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to Socket.IO server
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:6000", {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      // Join user room
      socket.emit("user:join", me.id);
    });

    // Handle new messages
    socket.on("message:new", (data: any) => {
      try {
        const msg: Message = {
          id: data._id?.toString() || data.id,
          conversationId: data.conversationId?.toString() || data.conversationId,
          senderId: data.senderId?.toString() || data.senderId,
          content: data.content,
          type: data.type || "text",
          createdAt: data.createdAt,
          isOwn: (data.senderId?.toString() || data.senderId) === me.id,
          fileMetadata: data.fileUrl ? {
            filename: data.fileName || "file",
            size: data.fileSize || 0,
            mimeType: data.type === "image" ? "image/jpeg" : "application/octet-stream",
            url: data.fileUrl,
            thumbnailUrl: data.thumbnailUrl || data.fileUrl, // Use fileUrl as fallback if no separate thumbnail
            isOnCloud: true,
            isUploading: false,
            uploadProgress: 100,
          } : undefined,
        };

        if (data.replyTo) {
          msg.replyTo = data.replyTo?.toString() || data.replyTo;
        }

        receiveMessage(msg);
      } catch (err) {
        console.error("Error processing message:new", err);
      }
    });

    // Handle message updates
    socket.on("message:updated", (data: { messageId: string; content: string }) => {
      console.log("Message updated:", data);
      // TODO: Update message in store
    });

    // Handle message deletions
    socket.on("message:deleted", (data: { messageId: string }) => {
      console.log("Message deleted:", data);
      // TODO: Remove message from store
    });

    // Handle reactions
    socket.on("reaction:added", (data: { messageId: string; emoji: string; userId: string }) => {
      console.log("Reaction added:", data);
      // TODO: Add reaction to message in store
    });

    socket.on("reaction:removed", (data: { messageId: string; emoji: string; userId: string }) => {
      console.log("Reaction removed:", data);
      // TODO: Remove reaction from message in store
    });

    // Handle typing indicators
    socket.on("typing:start", (data: { conversationId: string; userId: string; userName: string }) => {
      console.log("User typing:", data);
      const { setTypingUser } = useChatStore.getState();
      setTypingUser(data.conversationId, data.userId, data.userName);
    });

    socket.on("typing:stop", (data: { conversationId: string; userId: string }) => {
      console.log("User stopped typing:", data);
      const { removeTypingUser } = useChatStore.getState();
      removeTypingUser(data.conversationId, data.userId);
    });

    // Handle user online/offline
    socket.on("user:online", (data: { userId: string }) => {
      console.log("User online:", data);
      const { setUserOnline } = useChatStore.getState();
      setUserOnline(data.userId);
    });

    socket.on("user:offline", (data: { userId: string }) => {
      console.log("User offline:", data);
      const { setUserOffline } = useChatStore.getState();
      setUserOffline(data.userId);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on("error", (error: any) => {
      console.error("Socket error:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, [me.id, receiveMessage]);

  // Send a text message
  const sendMessage = useCallback((data: {
    conversationId: string;
    content: string;
    replyTo?: string;
  }) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      console.warn("Socket not connected");
      return;
    }

    socket.emit("message:send", {
      conversationId: data.conversationId,
      senderId: useChatStore.getState().me.id,
      content: data.content,
      type: "text",
      replyTo: data.replyTo,
    });
  }, []);

  // Send a file/image message
  const sendFileMessage = useCallback((data: {
    conversationId: string;
    content: string;
    type: "image" | "file";
    fileUrl: string;
    fileName: string;
    fileSize: number;
    thumbnailUrl?: string;
  }) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      console.warn("Socket not connected");
      return;
    }

    socket.emit("message:send", {
      conversationId: data.conversationId,
      senderId: useChatStore.getState().me.id,
      content: data.content,
      type: data.type,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
    });
  }, []);

  // Join a conversation room
  const joinConversation = useCallback((conversationId: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    socket.emit("conversation:join", conversationId);
  }, []);

  // Leave a conversation room
  const leaveConversation = useCallback((conversationId: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    socket.emit("conversation:leave", conversationId);
  }, []);

  // Mark messages as read
  const markMessagesAsRead = useCallback((conversationId: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    socket.emit("messages:read", {
      conversationId,
      userId: useChatStore.getState().me.id,
    });
  }, []);

  // Add reaction
  const addReaction = useCallback((messageId: string, emoji: string, conversationId: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    socket.emit("reaction:add", {
      messageId,
      conversationId,
      emoji,
      userId: useChatStore.getState().me.id,
    });
  }, []);

  // Remove reaction
  const removeReaction = useCallback((messageId: string, emoji: string, conversationId: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    socket.emit("reaction:remove", {
      messageId,
      conversationId,
      emoji,
      userId: useChatStore.getState().me.id,
    });
  }, []);

  // Update message
  const updateMessage = useCallback((messageId: string, content: string, conversationId: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    socket.emit("message:update", {
      messageId,
      conversationId,
      content,
    });
  }, []);

  // Delete message
  const deleteMessage = useCallback((messageId: string, conversationId: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    socket.emit("message:delete", {
      messageId,
      conversationId,
    });
  }, []);

  // Start typing indicator
  const startTyping = useCallback((conversationId: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    const me = useChatStore.getState().me;
    socket.emit("typing:start", {
      conversationId,
      userId: me.id,
      userName: me.displayName,
    });
  }, []);

  // Stop typing indicator
  const stopTyping = useCallback((conversationId: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    socket.emit("typing:stop", {
      conversationId,
      userId: useChatStore.getState().me.id,
    });
  }, []);

  return {
    sendMessage,
    sendFileMessage,
    joinConversation,
    leaveConversation,
    markMessagesAsRead,
    addReaction,
    removeReaction,
    updateMessage,
    deleteMessage,
    startTyping,
    stopTyping,
  };
}
