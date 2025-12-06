import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useChatStore, type UserProfile } from "../store/chatStore";
import friendApi, {
  sendFriendRequest,
  type FriendProfile,
} from "../services/friendApi";

const Mock_friend_profile: FriendProfile[] = [
  {
    id: "1",
    full_name: "John Doe",
    email: "john.doe@example.com",
    phone_number: "1234567890",
    avatar_url: "https://via.placeholder.com/150",
  },
];

interface AddFriendModalProps {
  onClose: () => void;
}

export default function AddFriendModal({ onClose }: AddFriendModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+84");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const queryClient = useQueryClient();

  // Search user by phone number - only runs when searchQuery is set (via button click)
  const { data: searchResult, isLoading: isSearching } = useQuery({
    queryKey: ["user-search", searchQuery],
    queryFn: () => friendApi.searchUsers(searchQuery),
    // queryFn: () => Mock_friend_profile, // TODO: remove this
    enabled: searchQuery.trim().length > 0,
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: (userId: string) => friendApi.sendFriendRequest(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const handleSearch = () => {
    if (phoneNumber.trim().length > 0) {
      // Trigger the search by setting searchQuery
      setSearchQuery(phoneNumber);
    }
  };

  const handleSendRequest = (user: FriendProfile) => {
    if (confirm(`Gửi lời mời kết bạn đến ${user.full_name}?`)) {
      sendRequestMutation.mutate(user.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Thêm bạn</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Phone Number Input */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
              >
                <option value="+84">🇻🇳 (+84)</option>
                <option value="+1">🇺🇸 (+1)</option>
                <option value="+86">🇨🇳 (+86)</option>
              </select>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  // Clear previous search result when input changes
                  setSearchQuery("");
                }}
                placeholder="Số điện thoại"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Search Result */}
          {searchQuery.trim().length > 0 && (
            <div className="mb-6">
              {isSearching ? (
                <div className="text-center text-slate-500 py-4">
                  Đang tìm kiếm...
                </div>
              ) : searchResult && searchResult.length > 0 ? (
                <div className="space-y-3">
                  {searchResult.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-sm font-semibold">
                        {user.full_name?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {user.full_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {user.email || user.phone_number || ""}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendRequest(user)}
                        disabled={sendRequestMutation.isPending}
                        className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50"
                      >
                        {sendRequestMutation.isPending
                          ? "Đang gửi..."
                          : "Kết bạn"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-500 py-4">
                  Không tìm thấy người dùng
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSearch}
            disabled={phoneNumber.trim().length === 0 || isSearching}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              phoneNumber.trim().length > 0 && !isSearching
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isSearching ? "Đang tìm kiếm..." : "Tìm kiếm"}
          </button>
        </div>
      </div>
    </div>
  );
}
