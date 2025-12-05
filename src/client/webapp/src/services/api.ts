// API service for making HTTP requests to the backend
const API_BASE_URL = '/api';

// Enable debug logging
const DEBUG = true;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Export interfaces for type safety
export interface ConversationData {
  _id?: string;
  id?: string;
  participants: string[];
  type: 'direct' | 'group';
  name?: string;
  avatar?: string;
  lastMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageData {
  _id?: string;
  id?: string;
  conversationId: string;
  senderId: string;
  content: string;
  type?: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyTo?: string;
  createdAt?: string;
  reactions?: Array<{ emoji: string; userId: string; createdAt: string }>;
}

class ApiService {
  private log(method: string, endpoint: string, data?: any) {
    if (DEBUG) {
      console.log(`[API] ${method} ${endpoint}`, data || '');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const method = options.method || 'GET';
    
    this.log(method, endpoint, options.body);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success === false) {
        throw new Error(data.error || 'API request failed');
      }

      this.log(method, endpoint, `✓ Success`);
      return data.data || data;
    } catch (error) {
      console.error(`[API Error] ${method} ${endpoint}:`, error);
      throw error;
    }
  }

  // Conversations
  async getConversations(userId: string) {
    return this.request(`/conversations?userId=${userId}`);
  }

  async getConversation(conversationId: string) {
    return this.request(`/conversations/${conversationId}`);
  }

  async createConversation(data: {
    participants: string[];
    type: 'direct' | 'group';
    name?: string;
    avatar?: string;
  }) {
    return this.request('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Messages
  async getMessages(conversationId: string, limit: number = 50, skip: number = 0) {
    return this.request(`/messages/${conversationId}?limit=${limit}&skip=${skip}`);
  }

  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    content: string;
    type?: 'text' | 'image' | 'file';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    replyTo?: string;
  }) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    return this.request(`/messages/${conversationId}/read`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async addReaction(messageId: string, emoji: string, userId: string) {
    return this.request(`/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji, userId }),
    });
  }

  async removeReaction(messageId: string, emoji: string, userId: string) {
    return this.request(`/messages/${messageId}/reactions`, {
      method: 'DELETE',
      body: JSON.stringify({ emoji, userId }),
    });
  }

  async updateMessage(messageId: string, content: string) {
    return this.request(`/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteMessage(messageId: string) {
    return this.request(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
export default api;
