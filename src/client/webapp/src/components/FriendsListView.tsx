import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import friendApi, { type FriendProfile } from "../services/friendApi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/chatStore";
import api from "../services/api";

export default function FriendsListView() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const me = useChatStore((s) => s.me);

  // Fetch friends list
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: friendApi.getFriends,
  });

  // Remove friend mutation
  const removeFriendMutation = useMutation({
    mutationFn: (friendshipId: string) => friendApi.rejectOrRemoveFriend(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  // Create conversation mutation
  const createChatMutation = useMutation({
    mutationFn: async (friend: FriendProfile) => {
      const conversation: any = await api.createConversation({
        participants: [me.id, friend.id],
        type: 'direct',
      });
      return { conversation, friend };
    },
    onSuccess: ({ conversation, friend }) => {
      // Add conversation to chat store
      const chatStore = useChatStore.getState();
      const newConv = {
        id: conversation._id,
        name: friend.full_name,
        type: 'direct' as const,
        lastMessagePreview: '',
        unreadCount: 0,
        members: [
          me,
          {
            id: friend.id,
            displayName: friend.full_name,
            avatarUrl: friend.avatar_url,
            phoneNumber: friend.phone_number || '',
            isFriend: true,
          }
        ],
      };
      
      // Add to conversations properly using setConversations
      chatStore.setConversations([...chatStore.conversations, newConv]);
      chatStore.selectConversation(conversation._id);
      
      // Navigate to the chat page
      navigate(`/app/chats?conversation=${conversation._id}`);
    },
    onError: (error) => {
      console.error("Failed to create conversation:", error);
      alert("Không thể tạo cuộc trò chuyện. Vui lòng thử lại.");
    },
  });

  const handleStartChat = async (friend: FriendProfile) => {
    createChatMutation.mutate(friend);
  };

  const handleRemoveFriend = (friend: FriendProfile) => {
    if (friend.friendship_id && confirm(`Bạn có chắc muốn xóa ${friend.full_name} khỏi danh sách bạn bè?`)) {
      removeFriendMutation.mutate(friend.friendship_id);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="h-14 border-b border-slate-200 flex items-center px-4">
        <div className="font-semibold text-sm flex items-center gap-2">
          <span>👥</span>
          <span>Bạn bè ({friends.length})</span>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-200">
        <input
          type="text"
          placeholder="Tìm kiếm bạn bè..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="text-center text-slate-500 py-8">Đang tải...</div>
        ) : filteredFriends.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            {searchQuery ? "Không tìm thấy bạn bè" : "Chưa có bạn bè"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFriends.map((friend) => (
              <div
                key={friend.id}
                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={friend.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.full_name)}&background=random`}
                    alt={friend.full_name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-slate-900 truncate">
                      {friend.full_name}
                    </div>
                    {friend.email && (
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {friend.email}
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        onClick={() => handleStartChat(friend)}
                        disabled={createChatMutation.isPending}
                      >
                        {createChatMutation.isPending ? "Đang tạo..." : "Nhắn tin"}
                      </button>
                      <button
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-lg hover:bg-slate-200"
                        onClick={() => handleRemoveFriend(friend)}
                        disabled={removeFriendMutation.isPending}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
