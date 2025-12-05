import axios from 'axios';

const USER_BASE_URL = import.meta.env.VITE_USER_URL || 'http://localhost:3002/users';

// Create axios instance with auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export interface FriendProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  email?: string;
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
  const response = await axios.get(`${USER_BASE_URL}/search`, {
    params: { q: query },
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * Send friend request to a user
 */
export async function sendFriendRequest(userId: string): Promise<void> {
  await axios.post(
    `${USER_BASE_URL}/friends/request/${userId}`,
    {},
    { headers: getAuthHeaders() }
  );
}

/**
 * Get list of friends (accepted)
 */
export async function getFriends(): Promise<FriendProfile[]> {
  const response = await axios.get(`${USER_BASE_URL}/friends`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * Get pending friend requests (incoming)
 */
export async function getPendingRequests(): Promise<FriendRequest[]> {
  const response = await axios.get(`${USER_BASE_URL}/friends/pending`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  await axios.put(
    `${USER_BASE_URL}/friends/accept/${friendshipId}`,
    {},
    { headers: getAuthHeaders() }
  );
}

/**
 * Reject or remove a friend
 */
export async function rejectOrRemoveFriend(friendshipId: string): Promise<void> {
  await axios.delete(`${USER_BASE_URL}/friends/reject/${friendshipId}`, {
    headers: getAuthHeaders(),
  });
}

/**
 * Get friend statistics
 */
export async function getFriendStats(): Promise<FriendStats> {
  const response = await axios.get(`${USER_BASE_URL}/stats`, {
    headers: getAuthHeaders(),
  });
  return response.data;
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
