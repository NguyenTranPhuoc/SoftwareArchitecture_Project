import { create } from "zustand";
import api from "../services/api";

export type MessageType = "text" | "image" | "file" | "video" | "sticker";

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  isFriend?: boolean;
}

export interface FileMetadata {
  filename: string;
  size: number; // in bytes
  mimeType: string;
  url?: string; // URL after upload
  thumbnailUrl?: string; // For images
  uploadProgress?: number; // 0-100
  isUploading?: boolean;
  isOnCloud?: boolean; // "Đã có trên Cloud"
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  createdAt: string;
  isOwn?: boolean;
  fileMetadata?: FileMetadata;
  replyTo?: string; // ID of the message being replied to
  isRecalled?: boolean; // True if message was recalled
  isDeletedForMe?: boolean; // True if deleted for current user
  reactions?: MessageReaction[]; // Array of reactions
}

export type ConversationType = "direct" | "group";

export type MemberRole = "owner" | "deputy" | "member";

export interface GroupMember extends UserProfile {
  role: MemberRole;
}

export interface Conversation {
  id: string;
  name: string;
  type: ConversationType;
  lastMessagePreview: string;
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
  members: UserProfile[];
  // For groups only
  memberRoles?: Record<string, MemberRole>; // userId -> role
}

interface ChatState {
  me: UserProfile;
  conversations: Conversation[];
  messages: Message[];
  selectedConversationId?: string;
  isLoading: boolean;
  error: string | null;

  // Initialization
  initialize: () => Promise<void>;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;

  // UI State
  selectConversation: (id: string) => void;
  isInfoPanelOpen: boolean;
  toggleInfoPanel: () => void;

  // Messaging
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  sendFileMessage: (
    conversationId: string,
    file: File,
    type: "image" | "file" | "video",
    sendWSMessage?: (payload: {
      type: "message:send:file";
      conversationId: string;
      content: string;
      messageType: "image" | "file" | "video";
      fileMetadata: {
        filename: string;
        size: number;
        mimeType: string;
        url: string;
        thumbnailUrl?: string;
      };
    }) => void
  ) => Promise<void>;
  updateMessageUploadProgress: (messageId: string, progress: number) => void;
  completeMessageUpload: (
    messageId: string,
    url: string,
    thumbnailUrl?: string
  ) => void;
  receiveMessage: (msg: Message) => void;

  // Conversations
  startDirectConversation: (user: UserProfile) => void;
  createGroup: (name: string, members: UserProfile[]) => Promise<void>;
  addMembers: (conversationId: string, members: UserProfile[]) => void;
  removeMember: (conversationId: string, memberId: string) => void;

  // Group Management
  setMemberRole: (
    conversationId: string,
    memberId: string,
    role: MemberRole
  ) => void;
  transferOwnership: (conversationId: string, newOwnerId: string) => void;
  getMemberRole: (conversationId: string, memberId: string) => MemberRole;
  isGroupOwner: (conversationId: string) => boolean;

  // Message Actions
  recallMessage: (messageId: string) => void;
  deleteMessageForMe: (messageId: string) => void;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  sendReply: (conversationId: string, content: string, replyToMessageId: string) => void;
}

// Use the same ObjectIds that were created in the database seed
const me: UserProfile = {
  id: "674612345678901234567890",
  displayName: "Như Nguyễn",
  phoneNumber: "0911735593",
  isFriend: true,
};

const mockFriends: UserProfile[] = [
  {
    id: "674612345678901234567891",
    displayName: "Thành Trung",
    phoneNumber: "0902344758",
    isFriend: true,
  },
  {
    id: "674612345678901234567892",
    displayName: "Hoàng Đặng Trung Kiên",
    phoneNumber: "0900000002",
    isFriend: true,
  },
  {
    id: "674612345678901234567893",
    displayName: "UAV Pilots Club",
    phoneNumber: "0900000003",
    isFriend: true,
  },
];

// Mock conversations - will be replaced by API data
const mockConversations: Conversation[] = [];

// Mock messages - will be replaced by API data
const mockMessages: Message[] = [];

// File validation constants
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  ...ALLOWED_IMAGE_TYPES,
];

// File validation utilities
export function validateFile(
  file: File,
  type: "image" | "file" | "video"
): { valid: boolean; error?: string } {
  let maxSize: number;
  let allowedTypes: string[];

  switch (type) {
    case "image":
      maxSize = MAX_IMAGE_SIZE;
      allowedTypes = ALLOWED_IMAGE_TYPES;
      break;
    case "video":
      maxSize = MAX_VIDEO_SIZE;
      allowedTypes = ALLOWED_VIDEO_TYPES;
      break;
    default:
      maxSize = MAX_FILE_SIZE;
      allowedTypes = ALLOWED_FILE_TYPES;
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File quá lớn. Kích thước tối đa: ${maxSizeMB}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Định dạng file không được hỗ trợ. ${type === "image" ? "Chỉ chấp nhận JPEG, PNG, GIF, WebP." :
        type === "video" ? "Chỉ chấp nhận MP4, WebM, OGG." : ""
        }`,
    };
  }

  return { valid: true };
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Upload file to server (GCS) with progress tracking
async function uploadFileToServer(
  file: File,
  type: 'image' | 'video' | 'file',
  onProgress: (progress: number) => void
): Promise<{ url: string; thumbnailUrl?: string; filename: string; size: number; mimeType: string }> {
  const formData = new FormData();
  formData.append('file', file);

  // Determine endpoint based on type
  let endpoint = '/api/upload/file';
  if (type === 'image') endpoint = '/api/upload/image';
  else if (type === 'video') endpoint = '/api/upload/video';

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            resolve({
              url: response.url,
              thumbnailUrl: response.thumbnailUrl || response.url,
              filename: response.filename,
              size: response.size,
              mimeType: response.mimeType,
            });
          } else {
            reject(new Error(response.error || 'Upload failed'));
          }
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    // Get API URL from environment or use default
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    xhr.open('POST', `${API_URL}${endpoint}`);
    xhr.send(formData);
  });
}

export const useChatStore = create<ChatState>((set, get) => ({
  me,
  conversations: mockConversations,
  messages: mockMessages,
  selectedConversationId: "",
  isLoading: false,
  error: null,

  // Initialize the store with data from backend
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      await get().loadConversations();
      set({ isLoading: false });
    } catch (error) {
      console.error('[Store] Initialization failed:', error);
      set({ isLoading: false, error: 'Failed to load data' });
    }
  },

  // Load conversations from API
  loadConversations: async () => {
    try {
      const data: any = await api.getConversations(me.id);
      const conversations: Conversation[] = (data || []).map((conv: any) => ({
        id: conv._id?.toString() || conv.id,
        name: conv.name || 'Unnamed',
        type: conv.type || 'direct',
        lastMessagePreview: conv.lastMessage?.content || '',
        unreadCount: 0,
        isPinned: conv.isPinned || false,
        isMuted: conv.isMuted || false,
        members: [], // Will be populated if needed
        memberRoles: conv.memberRoles || {},
      }));
      set({ conversations });
    } catch (error) {
      console.error('[Store] Failed to load conversations:', error);
      throw error;
    }
  },

  // Load messages for a conversation from API
  loadMessages: async (conversationId: string) => {
    try {
      const data: any = await api.getMessages(conversationId, 50, 0);
      const messages: Message[] = (data || []).map((msg: any) => ({
        id: msg._id?.toString() || msg.id,
        conversationId: msg.conversationId?.toString() || conversationId,
        senderId: msg.senderId?.toString() || msg.senderId,
        content: msg.content,
        type: msg.type || 'text',
        createdAt: msg.createdAt,
        isOwn: (msg.senderId?.toString() || msg.senderId) === me.id,
        replyTo: msg.replyTo?.toString(),
        reactions: msg.reactions || [],
        fileMetadata: msg.fileUrl ? {
          filename: msg.fileName || 'file',
          size: msg.fileSize || 0,
          mimeType: msg.type === 'image' ? 'image/jpeg' : 'application/octet-stream',
          url: msg.fileUrl,
          isOnCloud: true,
        } : undefined,
      }));
      set({ messages });
    } catch (error) {
      console.error('[Store] Failed to load messages:', error);
      throw error;
    }
  },

  selectConversation: async (id: string) => {
    set({ selectedConversationId: id });
    // Load messages when conversation is selected
    try {
      await get().loadMessages(id);
    } catch (error) {
      console.error('[Store] Failed to load messages for conversation:', error);
    }
  },

  isInfoPanelOpen: false,
  toggleInfoPanel: () => set((s) => ({ isInfoPanelOpen: !s.isInfoPanelOpen })),

  // Send message with API integration
  sendMessage: async (conversationId, content) => {
    const tempId = crypto.randomUUID();
    const newMsg: Message = {
      id: tempId,
      conversationId,
      senderId: get().me.id,
      content,
      type: "text",
      createdAt: new Date().toISOString(),
      isOwn: true,
    };

    // Optimistic update
    set((state) => ({
      messages: [...state.messages, newMsg],
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessagePreview: content, unreadCount: 0 }
          : c
      ),
    }));

    try {
      // Send to backend
      const savedMessage: any = await api.sendMessage({
        conversationId,
        senderId: get().me.id,
        content,
        type: 'text',
      });

      // Update with server response
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === tempId
            ? {
              ...m,
              id: savedMessage._id?.toString() || savedMessage.id,
              createdAt: savedMessage.createdAt,
            }
            : m
        ),
      }));
    } catch (error) {
      console.error('[Store] Failed to send message:', error);
      // Remove optimistic message on error
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== tempId),
      }));
    }
  },

  sendFileMessage: async (conversationId, file, type, sendWSMessage) => {
    const messageId = crypto.randomUUID();
    const fileMetadata: FileMetadata = {
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      uploadProgress: 0,
      isUploading: true,
      isOnCloud: false,
    };

    const newMsg: Message = {
      id: messageId,
      conversationId,
      senderId: me.id,
      content: type === "image" ? "📷" : "📎",
      type,
      createdAt: new Date().toISOString(),
      isOwn: true,
      fileMetadata,
    };

    // Add message immediately with uploading state
    useChatStore.getState().updateMessageUploadProgress(messageId, 0);
    set((state) => ({
      messages: [...state.messages, newMsg],
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
            ...c,
            lastMessagePreview:
              type === "image" ? "📷 Đã gửi ảnh" : `📎 ${file.name}`,
            unreadCount: 0,
          }
          : c
      ),
    }));

    // Upload to GCS with progress
    try {
      // Determine upload type
      const uploadType: 'image' | 'video' | 'file' =
        type === 'image' ? 'image' :
          type === 'video' ? 'video' : 'file';

      const result = await uploadFileToServer(
        file,
        uploadType,
        (progress: number) => {
          useChatStore
            .getState()
            .updateMessageUploadProgress(messageId, progress);
        }
      );

      // Complete upload with GCS URL
      useChatStore
        .getState()
        .completeMessageUpload(messageId, result.url, result.thumbnailUrl);

      // Send message to server via WebSocket
      if (sendWSMessage) {
        sendWSMessage({
          type: "message:send:file",
          conversationId,
          content: type === "image" ? "📷" : type === "video" ? "🎥" : "📎",
          messageType: type,
          fileMetadata: {
            filename: result.filename,
            size: result.size,
            mimeType: result.mimeType,
            url: result.url,
            thumbnailUrl: result.thumbnailUrl,
          },
        });
      }
    } catch (error) {
      console.error("Upload failed:", error);
      // Show error to user
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Remove failed message
      set((state) => ({
        messages: state.messages.filter(m => m.id !== messageId),
      }));
    }
  },

  updateMessageUploadProgress: (messageId, progress) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId && m.fileMetadata
          ? {
            ...m,
            fileMetadata: { ...m.fileMetadata, uploadProgress: progress },
          }
          : m
      ),
    })),

  completeMessageUpload: (messageId, url, thumbnailUrl) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId && m.fileMetadata
          ? {
            ...m,
            fileMetadata: {
              ...m.fileMetadata,
              url,
              thumbnailUrl,
              uploadProgress: 100,
              isUploading: false,
              isOnCloud: true,
            },
          }
          : m
      ),
    })),

  receiveMessage: (msg) =>
    set((state) => {
      // First, check for duplicate by ID (in case server sends the same message twice)
      const existingById = state.messages.findIndex((m) => m.id === msg.id);
      if (existingById !== -1) {
        // Message already exists with this ID, don't add duplicate
        return state;
      }

      // Check if this is a duplicate of a message we just sent locally
      // (e.g., file/image messages that were added locally before server confirmation)
      if (
        msg.senderId === state.me.id &&
        (msg.type === "image" || msg.type === "file")
      ) {
        // Find a pending message with matching conversation, type, and filename
        // Match by filename and size to be more precise
        const pendingIndex = state.messages.findIndex(
          (m) =>
            m.conversationId === msg.conversationId &&
            m.senderId === state.me.id &&
            m.type === msg.type &&
            m.isOwn === true &&
            m.fileMetadata?.filename === msg.fileMetadata?.filename &&
            m.fileMetadata?.size === msg.fileMetadata?.size &&
            // Only match messages created within the last 30 seconds to avoid false matches
            new Date(m.createdAt).getTime() > Date.now() - 30000
        );

        if (pendingIndex !== -1) {
          // Update the existing pending message with the server's version
          // This replaces the local temporary message with the server's confirmed version
          const updatedMessages = [...state.messages];
          updatedMessages[pendingIndex] = msg;
          return { messages: updatedMessages };
        }
      }

      // New message from another user or not a duplicate, add it
      return {
        messages: [...state.messages, msg],
        conversations: state.conversations.map((c) =>
          c.id === msg.conversationId
            ? { ...c, lastMessagePreview: msg.content, unreadCount: 0 }
            : c
        ),
      };
    }),

  startDirectConversation: (user) =>
    set((state) => {
      const existing = state.conversations.find(
        (c) =>
          c.type === "direct" &&
          c.members.some((m) => m.id === user.id) &&
          c.members.some((m) => m.id === state.me.id)
      );

      if (existing) {
        return { selectedConversationId: existing.id };
      }

      const newConv: Conversation = {
        id: crypto.randomUUID(),
        name: user.displayName,
        type: "direct",
        lastMessagePreview: "",
        unreadCount: 0,
        members: [state.me, user],
      };

      return {
        conversations: [newConv, ...state.conversations],
        selectedConversationId: newConv.id,
      };
    }),

  createGroup: async (name, members) => {
    const allMembers = [get().me, ...members];
    const participantIds = allMembers.map(m => m.id);

    try {
      // Call API to create group
      const newGroup: any = await api.createConversation({
        participants: participantIds,
        type: 'group',
        name: name.trim() || `Nhóm ${allMembers.length} người`,
      });

      const groupConv: Conversation = {
        id: newGroup._id?.toString() || newGroup.id,
        name: newGroup.name,
        type: 'group',
        lastMessagePreview: '',
        unreadCount: 0,
        members: allMembers,
        memberRoles: {
          [get().me.id]: 'owner',
          ...Object.fromEntries(members.map(m => [m.id, 'member' as MemberRole])),
        },
      };

      set((state) => ({
        conversations: [groupConv, ...state.conversations],
        selectedConversationId: groupConv.id,
      }));

      // Load messages for the new conversation
      await get().loadMessages(groupConv.id);
    } catch (error) {
      console.error('[Store] Failed to create group:', error);
      throw error;
    }
  },

  addMembers: (conversationId, newMembers) =>
    set((state) => {
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (!conv || conv.type !== "group") return state;

      // Filter out members that are already in the group
      const existingMemberIds = new Set(conv.members.map((m) => m.id));
      const membersToAdd = newMembers.filter(
        (m) => !existingMemberIds.has(m.id)
      );

      if (membersToAdd.length === 0) return state;

      // Add new members with "member" role
      const updatedMemberRoles = { ...(conv.memberRoles || {}) };
      membersToAdd.forEach((m) => {
        updatedMemberRoles[m.id] = "member";
      });

      // Create system message
      const systemMessage: Message = {
        id: crypto.randomUUID(),
        conversationId,
        senderId: state.me.id,
        content: `${membersToAdd
          .map((m) => m.displayName)
          .join(", ")} được bạn thêm vào nhóm`,
        type: "text",
        createdAt: new Date().toISOString(),
        isOwn: true,
      };

      return {
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? {
              ...c,
              members: [...c.members, ...membersToAdd],
              memberRoles: updatedMemberRoles,
            }
            : c
        ),
        messages: [...state.messages, systemMessage],
      };
    }),

  removeMember: (conversationId, memberId) =>
    set((state) => {
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (!conv || conv.type !== "group") return state;
      if (memberId === state.me.id) return state; // Can't remove yourself

      const member = conv.members.find((m) => m.id === memberId);
      if (!member) return state;

      // Create system message
      const systemMessage: Message = {
        id: crypto.randomUUID(),
        conversationId,
        senderId: state.me.id,
        content: `${member.displayName} đã bị xóa khỏi nhóm`,
        type: "text",
        createdAt: new Date().toISOString(),
        isOwn: true,
      };

      const updatedMemberRoles = { ...(conv.memberRoles || {}) };
      delete updatedMemberRoles[memberId];

      return {
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? {
              ...c,
              members: c.members.filter((m) => m.id !== memberId),
              memberRoles: updatedMemberRoles,
            }
            : c
        ),
        messages: [...state.messages, systemMessage],
      };
    }),

  setMemberRole: (conversationId, memberId, role) =>
    set((state) => {
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (!conv || conv.type !== "group") return state;

      const updatedMemberRoles = { ...(conv.memberRoles || {}) };
      updatedMemberRoles[memberId] = role;

      return {
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, memberRoles: updatedMemberRoles }
            : c
        ),
      };
    }),

  transferOwnership: (conversationId, newOwnerId) =>
    set((state) => {
      const conv = state.conversations.find((c) => c.id === conversationId);
      if (!conv || conv.type !== "group") return state;

      const updatedMemberRoles = { ...(conv.memberRoles || {}) };
      // Old owner becomes member
      const oldOwnerId = Object.keys(updatedMemberRoles).find(
        (id) => updatedMemberRoles[id] === "owner"
      );
      if (oldOwnerId) {
        updatedMemberRoles[oldOwnerId] = "member";
      }
      // New owner
      updatedMemberRoles[newOwnerId] = "owner";

      return {
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, memberRoles: updatedMemberRoles }
            : c
        ),
      };
    }),

  getMemberRole: (conversationId, memberId) => {
    // This will be set after store creation
    return "member" as MemberRole;
  },

  isGroupOwner: (conversationId) => {
    // This will be set after store creation
    return false;
  },

  recallMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, isRecalled: true, content: "" } : m
      ),
    })),

  deleteMessageForMe: (messageId) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, isDeletedForMe: true } : m
      ),
    })),

  addReaction: async (messageId, emoji) => {
    const state = get();
    const message = state.messages.find(m => m.id === messageId);
    if (!message) return;

    const existingReactions = message.reactions || [];
    const userReactionIndex = existingReactions.findIndex(
      (r) => r.userId === state.me.id && r.emoji === emoji
    );

    // Optimistic update
    if (userReactionIndex >= 0) {
      // Remove reaction
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === messageId
            ? { ...m, reactions: m.reactions?.filter((_, i) => i !== userReactionIndex) }
            : m
        ),
      }));

      try {
        await api.removeReaction(messageId, emoji, state.me.id);
      } catch (error) {
        console.error('[Store] Failed to remove reaction:', error);
        // Rollback
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId ? { ...m, reactions: existingReactions } : m
          ),
        }));
      }
    } else {
      // Add reaction
      const newReaction = {
        emoji,
        userId: state.me.id,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === messageId
            ? { ...m, reactions: [...(m.reactions || []), newReaction] }
            : m
        ),
      }));

      try {
        await api.addReaction(messageId, emoji, state.me.id);
      } catch (error) {
        console.error('[Store] Failed to add reaction:', error);
        // Rollback
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId ? { ...m, reactions: existingReactions } : m
          ),
        }));
      }
    }
  },

  sendReply: (conversationId, content, replyToMessageId) =>
    set((state) => {
      const newMsg: Message = {
        id: crypto.randomUUID(),
        conversationId,
        senderId: state.me.id,
        content,
        type: "text",
        createdAt: new Date().toISOString(),
        isOwn: true,
        replyTo: replyToMessageId,
      };

      return {
        messages: [...state.messages, newMsg],
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, lastMessagePreview: content, unreadCount: 0 }
            : c
        ),
      };
    }),
}));

// Set the actual implementations after store is created
useChatStore.setState({
  getMemberRole: (conversationId: string, memberId: string): MemberRole => {
    const state = useChatStore.getState();
    const conv = state.conversations.find((c) => c.id === conversationId);
    if (!conv || conv.type !== "group" || !conv.memberRoles) {
      return "member";
    }
    return conv.memberRoles[memberId] || "member";
  },
  isGroupOwner: (conversationId: string): boolean => {
    const state = useChatStore.getState();
    const conv = state.conversations.find((c) => c.id === conversationId);
    if (!conv || conv.type !== "group" || !conv.memberRoles) {
      return false;
    }
    return conv.memberRoles[state.me.id] === "owner";
  },
});
