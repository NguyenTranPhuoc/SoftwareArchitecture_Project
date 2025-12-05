// API service for making HTTP requests to the backend
const API_BASE_URL = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.success === false) {
      throw new Error(data.error || 'API request failed');
    }

    return data.data || data;
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
