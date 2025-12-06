// Auth API service for authentication
// Use relative URL to work with nginx proxy in production
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_URL || '/auth';

interface AuthResponse {
  success?: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    username: string;
    displayName: string;
  };
}

class AuthApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${AUTH_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }

    return data as T;
  }

  async register(data: {
    email: string;
    password: string;
    username: string;
    displayName: string;
    phone_number?: string;
  }) {
    return this.request<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(refreshToken: string) {
    return this.request<AuthResponse>('/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async refresh(refreshToken: string) {
    return this.request<AuthResponse>('/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }
}

export const authApi = new AuthApiService();
