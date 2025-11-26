import { create } from "zustand";

export type MessageType = "text" | "image" | "file";

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
  selectConversation: (id: string) => void;
  isInfoPanelOpen: boolean;
  toggleInfoPanel: () => void;
  sendMessage: (conversationId: string, content: string) => void;
  sendFileMessage: (
    conversationId: string,
    file: File,
    type: "image" | "file",
    sendWSMessage?: (payload: {
      type: "message:send:file";
      conversationId: string;
      content: string;
      messageType: "image" | "file";
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
  startDirectConversation: (user: UserProfile) => void;
  createGroup: (name: string, members: UserProfile[]) => void;
  addMembers: (conversationId: string, members: UserProfile[]) => void;
  removeMember: (conversationId: string, memberId: string) => void;
  setMemberRole: (
    conversationId: string,
    memberId: string,
    role: MemberRole
  ) => void;
  transferOwnership: (conversationId: string, newOwnerId: string) => void;
  getMemberRole: (conversationId: string, memberId: string) => MemberRole;
  isGroupOwner: (conversationId: string) => boolean;
  recallMessage: (messageId: string) => void;
  deleteMessageForMe: (messageId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  sendReply: (conversationId: string, content: string, replyToMessageId: string) => void;
}

const me: UserProfile = {
  id: "me",
  displayName: "Như Nguyễn",
  phoneNumber: "0911735593",
  isFriend: true,
};

const mockFriends: UserProfile[] = [
  {
    id: "u1",
    displayName: "Thành Trung",
    phoneNumber: "0902344758",
    isFriend: true,
  },
  {
    id: "u2",
    displayName: "Hoàng Đặng Trung Kiên",
    phoneNumber: "0900000002",
    isFriend: true,
  },
  {
    id: "u3",
    displayName: "UAV Pilots Club",
    phoneNumber: "0900000003",
    isFriend: true,
  },
];

const mockConversations: Conversation[] = [
  {
    id: "c1",
    name: "UAV Pilots Club",
    type: "group",
    lastMessagePreview: "Z chủ nhật này anh hẹn...",
    unreadCount: 2,
    isPinned: true,
    members: [me, mockFriends[0], mockFriends[1]],
  },
  {
    id: "c2",
    name: "Thành Trung",
    type: "direct",
    lastMessagePreview: "Zalo chỉ hiển thị tin nhắn từ...",
    unreadCount: 0,
    members: [me, mockFriends[0]],
  },
];

const mockMessages: Message[] = [
  {
    id: "m1",
    conversationId: "c1",
    senderId: "u1",
    content: "@Minh Anh Lê Đỗ e xin tuần sau...",
    type: "text",
    createdAt: "2025-11-15T11:31:00",
  },
  {
    id: "m2",
    conversationId: "c1",
    senderId: "me",
    content: "Ok nè 😊",
    type: "text",
    createdAt: "2025-11-15T11:35:00",
    isOwn: true,
  },
];

// File validation constants
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
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
  "application/vnd.adobe.illustrator",
  "application/postscript",
  ...ALLOWED_IMAGE_TYPES,
];

// File validation utilities
export function validateFile(
  file: File,
  type: "image" | "file"
): { valid: boolean; error?: string } {
  const maxSize = type === "image" ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
  const allowedTypes =
    type === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_FILE_TYPES;

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
      error: `Định dạng file không được hỗ trợ. ${
        type === "image" ? "Chỉ chấp nhận JPEG, PNG, GIF." : ""
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

// Simulate file upload with progress
async function simulateFileUpload(
  file: File,
  onProgress: (progress: number) => void
): Promise<{ url: string; thumbnailUrl?: string }> {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        // Create object URL for the file (simulating server URL)
        const url = URL.createObjectURL(file);

        // For images, create thumbnail
        let thumbnailUrl: string | undefined;
        if (file.type.startsWith("image/")) {
          thumbnailUrl = url; // In real app, this would be a separate thumbnail URL
        }

        resolve({ url, thumbnailUrl });
      } else {
        onProgress(progress);
      }
    }, 100);
  });
}

export const useChatStore = create<ChatState>((set) => ({
  me,
  conversations: mockConversations,
  messages: mockMessages,
  selectedConversationId: "",
  selectConversation: (id: string) => set({ selectedConversationId: id }),
  isInfoPanelOpen: false,

  toggleInfoPanel: () => set((s) => ({ isInfoPanelOpen: !s.isInfoPanelOpen })),

  sendMessage: (conversationId, content) =>
    set((state) => {
      const newMsg: Message = {
        id: crypto.randomUUID(),
        conversationId,
        senderId: state.me.id,
        content,
        type: "text",
        createdAt: new Date().toISOString(),
        isOwn: true,
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

    // Simulate upload with progress
    try {
      const { url, thumbnailUrl } = await simulateFileUpload(
        file,
        (progress) => {
          useChatStore
            .getState()
            .updateMessageUploadProgress(messageId, progress);
        }
      );

      // Generate thumbnail for images
      let finalThumbnailUrl = thumbnailUrl;
      if (type === "image" && !finalThumbnailUrl) {
        finalThumbnailUrl = URL.createObjectURL(file);
      }

      useChatStore
        .getState()
        .completeMessageUpload(messageId, url, finalThumbnailUrl);

      // Send message to server via WebSocket
      if (sendWSMessage) {
        sendWSMessage({
          type: "message:send:file",
          conversationId,
          content: type === "image" ? "📷" : "📎",
          messageType: type,
          fileMetadata: {
            filename: file.name,
            size: file.size,
            mimeType: file.type,
            url,
            thumbnailUrl: finalThumbnailUrl,
          },
        });
      }
    } catch (error) {
      console.error("Upload failed:", error);
      // Handle error - could update message to show error state
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

  createGroup: (name, members) =>
    set((state) => {
      // Create group conversation with current user + selected members
      const allMembers = [state.me, ...members];

      // Initialize member roles: current user is owner, others are members
      const memberRoles: Record<string, MemberRole> = {
        [state.me.id]: "owner",
      };
      members.forEach((m) => {
        memberRoles[m.id] = "member";
      });

      const newGroup: Conversation = {
        id: crypto.randomUUID(),
        name: name.trim() || `Nhóm ${allMembers.length} người`,
        type: "group",
        lastMessagePreview: "",
        unreadCount: 0,
        members: allMembers,
        memberRoles,
      };

      // Create a system message for group creation
      const systemMessage: Message = {
        id: crypto.randomUUID(),
        conversationId: newGroup.id,
        senderId: state.me.id,
        content: `${members
          .map((m) => m.displayName)
          .join(", ")} được bạn thêm vào nhóm`,
        type: "text",
        createdAt: new Date().toISOString(),
        isOwn: true,
      };

      return {
        conversations: [newGroup, ...state.conversations],
        selectedConversationId: newGroup.id,
        messages: [...state.messages, systemMessage],
      };
    }),

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

  addReaction: (messageId, emoji) =>
    set((state) => ({
      messages: state.messages.map((m) => {
        if (m.id !== messageId) return m;
        const existingReactions = m.reactions || [];
        // Check if user already reacted with this emoji
        const userReactionIndex = existingReactions.findIndex(
          (r) => r.userId === state.me.id && r.emoji === emoji
        );
        if (userReactionIndex >= 0) {
          // Remove reaction if already exists
          return {
            ...m,
            reactions: existingReactions.filter((_, i) => i !== userReactionIndex),
          };
        }
        // Add new reaction
        return {
          ...m,
          reactions: [
            ...existingReactions,
            {
              emoji,
              userId: state.me.id,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }),
    })),

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
