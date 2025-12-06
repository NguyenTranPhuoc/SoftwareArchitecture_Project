const USER_BASE_URL = import.meta.env.VITE_USER_URL || 'http://localhost:3002/users';

// Helper function for authenticated requests
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const url = `${USER_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export interface FriendProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  email?: string;
  phone_number?: string;
  friendship_id?: string;
}

export interface FriendRequest {
  friendship_id: string;
  id: string;
  full_name: string;
  avatar_url?: string;
}

export interface FriendStats {
  total_active_friendships: number;
  pending_friend_requests: number;
}

/**
 * Search users by name or email
 */
export async function searchUsers(query: string): Promise<FriendProfile[]> {
  return fetchWithAuth<FriendProfile[]>(`/search?q=${encodeURIComponent(query)}`);
}

/**
 * Send friend request to a user
 */
export async function sendFriendRequest(userId: string): Promise<void> {
  await fetchWithAuth<void>(`/friends/request/${userId}`, {
    method: 'POST',
  });
}

/**
 * Get list of friends (accepted)
 */
export async function getFriends(): Promise<FriendProfile[]> {
  return fetchWithAuth<FriendProfile[]>('/friends');
}

/**
 * Get pending friend requests (incoming)
 */
export async function getPendingRequests(): Promise<FriendRequest[]> {
  return fetchWithAuth<FriendRequest[]>('/friends/pending');
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  await fetchWithAuth<void>(`/friends/accept/${friendshipId}`, {
    method: 'PUT',
  });
}

/**
 * Reject or remove a friend
 */
export async function rejectOrRemoveFriend(friendshipId: string): Promise<void> {
  await fetchWithAuth<void>(`/friends/reject/${friendshipId}`, {
    method: 'DELETE',
  });
}

/**
 * Get friend statistics
 */
export async function getFriendStats(): Promise<FriendStats> {
  return fetchWithAuth<FriendStats>('/stats');
}

const friendApi = {
  searchUsers,
  sendFriendRequest,
  getFriends,
  getPendingRequests,
  acceptFriendRequest,
  rejectOrRemoveFriend,
  getFriendStats,
};

export default friendApi;
