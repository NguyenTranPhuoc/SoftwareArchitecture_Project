// User API service for user profile management
const USER_BASE_URL = import.meta.env.VITE_USER_URL || 'http://localhost:3002/users';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  avatar_url?: string;
  date_of_birth?: string;
}

class UserApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${USER_BASE_URL}${endpoint}`;
    
    // Get auth token from localStorage
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }

    return data as T;
  }

  async getProfile(userId: string): Promise<UserProfile> {
    return this.request<UserProfile>(`/${userId}`, {
      method: 'GET',
    });
  }

  async updateProfile(userId: string, data: UpdateProfileRequest): Promise<UserProfile> {
    return this.request<UserProfile>(`/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async searchUsers(query: string): Promise<UserProfile[]> {
    return this.request<UserProfile[]>(`/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    });
  }
}

export const userApi = new UserApiService();
