import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useChatStore, type UserProfile } from "../store/chatStore";

// Mock API data
const MOCK_RECENT_RESULTS: UserProfile[] = [
  {
    id: "r1",
    displayName: "Như Nguyễn",
    phoneNumber: "0911735593",
    isFriend: false,
  },
  {
    id: "r2",
    displayName: "Thanh Xuan",
    phoneNumber: "0902344758",
    isFriend: false,
  },
  {
    id: "r3",
    displayName: "Chín Phan",
    phoneNumber: "0963631874",
    isFriend: false,
  },
];

const MOCK_SUGGESTIONS: UserProfile[] = [
  {
    id: "s1",
    displayName: "Anh Thư Lê",
    phoneNumber: "0900000123",
    isFriend: false,
  },
  {
    id: "s2",
    displayName: "Bảo Tiên",
    phoneNumber: "0900000456",
    isFriend: false,
  },
  {
    id: "s3",
    displayName: "Châu",
    phoneNumber: "0900000789",
    isFriend: false,
  },
];

// Mock API functions
async function searchUserByPhone(phone: string): Promise<UserProfile | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const normalized = phone.replace(/\s+/g, "");
  
  // Check in recent results
  const found = MOCK_RECENT_RESULTS.find(
    (u) => u.phoneNumber?.replace(/\s+/g, "") === normalized
  );
  if (found) return found;
  
  // Mock: if phone matches pattern, return a user
  if (normalized.length >= 9) {
    return {
      id: `search-${normalized}`,
      displayName: `User ${normalized.slice(-4)}`,
      phoneNumber: normalized,
      isFriend: false,
    };
  }
  
  return null;
}

async function sendFriendRequest(userId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  // In real app, this would call the API
  console.log("Sending friend request to:", userId);
}

interface AddFriendModalProps {
  onClose: () => void;
}

export default function AddFriendModal({ onClose }: AddFriendModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+84");
  const queryClient = useQueryClient();

  // Search user by phone number
  const { data: searchResult, isLoading: isSearching } = useQuery({
    queryKey: ["search-user-phone", phoneNumber],
    queryFn: () => searchUserByPhone(phoneNumber),
    enabled: phoneNumber.trim().length > 0,
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      onClose();
    },
  });

  // Send friend request to suggestion
  const sendSuggestionMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["friend-suggestions"] });
    },
  });

  const handleSearch = () => {
    if (searchResult) {
      sendRequestMutation.mutate(searchResult.id);
    }
  };

  const handleSendToSuggestion = (userId: string) => {
    sendSuggestionMutation.mutate(userId);
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
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Số điện thoại"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Recent Results */}
          {phoneNumber.trim().length === 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Kết quả gần nhất
              </h3>
              <div className="space-y-3">
                {MOCK_RECENT_RESULTS.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-yellow-300 flex items-center justify-center text-sm font-semibold">
                      {user.displayName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{user.displayName}</div>
                      <div className="text-xs text-slate-500">
                        {user.phoneNumber}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Result */}
          {phoneNumber.trim().length > 0 && (
            <div className="mb-6">
              {isSearching ? (
                <div className="text-center text-slate-500 py-4">
                  Đang tìm kiếm...
                </div>
              ) : searchResult ? (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-sm font-semibold">
                    {searchResult.displayName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {searchResult.displayName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {searchResult.phoneNumber}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-4">
                  Không tìm thấy người dùng
                </div>
              )}
            </div>
          )}

          {/* Friend Suggestions */}
          {phoneNumber.trim().length === 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Có thể bạn quen
              </h3>
              <div className="space-y-3">
                {MOCK_SUGGESTIONS.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-sm font-semibold">
                        {user.displayName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {user.displayName}
                        </div>
                        <div className="text-xs text-slate-500">
                          Từ gợi ý kết bạn
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendToSuggestion(user.id)}
                      disabled={sendSuggestionMutation.isPending}
                      className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      {sendSuggestionMutation.isPending ? "Đang gửi..." : "Kết bạn"}
                    </button>
                  </div>
                ))}
              </div>
              <button className="text-sm text-blue-600 hover:underline mt-2">
                Xem thêm
              </button>
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
            disabled={!searchResult || sendRequestMutation.isPending}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              searchResult && !sendRequestMutation.isPending
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {sendRequestMutation.isPending ? "Đang gửi..." : "Tìm kiếm"}
          </button>
        </div>
      </div>
    </div>
  );
}

