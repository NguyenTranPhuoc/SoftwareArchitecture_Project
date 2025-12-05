import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import friendApi, { type FriendProfile } from "../services/friendApi";

export default function AddFriendView() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setTimeout(() => setDebouncedQuery(value), 500);
  };

  // Search users
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["user-search", debouncedQuery],
    queryFn: () => friendApi.searchUsers(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: (userId: string) => friendApi.sendFriendRequest(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const handleSendRequest = (user: FriendProfile) => {
    if (confirm(`Gửi lời mời kết bạn đến ${user.full_name}?`)) {
      sendRequestMutation.mutate(user.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="h-14 border-b border-slate-200 flex items-center px-4">
        <div className="font-semibold text-sm flex items-center gap-2">
          <span>🔍</span>
          <span>Thêm bạn</span>
        </div>
      </div>

      {/* Search Box */}
      <div className="p-4 border-b border-slate-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
        <div className="text-xs text-slate-500 mt-2">
          Nhập ít nhất 2 ký tự để tìm kiếm
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {debouncedQuery.length < 2 ? (
          <div className="text-center text-slate-500 py-8">
            Nhập tên hoặc email để tìm kiếm bạn bè
          </div>
        ) : searchResults.length === 0 && !isLoading ? (
          <div className="text-center text-slate-500 py-8">
            Không tìm thấy người dùng
          </div>
        ) : (
          <div className="space-y-3">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random`}
                  alt={user.full_name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-900 truncate">
                    {user.full_name}
                  </div>
                  {user.email && (
                    <div className="text-xs text-slate-500 truncate">
                      {user.email}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleSendRequest(user)}
                  disabled={sendRequestMutation.isPending}
                  className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendRequestMutation.isPending ? "Đang gửi..." : "Kết bạn"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
