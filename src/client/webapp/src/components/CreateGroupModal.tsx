import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useChatStore, type UserProfile } from "../store/chatStore";

// Mock friends data (in real app, this would come from API)
const MOCK_FRIENDS: UserProfile[] = [
  {
    id: "u1",
    displayName: "Thành Trung",
    phoneNumber: "0902344758",
    isFriend: true,
  },
  {
    id: "u2",
    displayName: "Hoàng Đặng Trung Kiên",
    phoneNumber: "0900000002",
    isFriend: true,
  },
  {
    id: "u3",
    displayName: "UAV Pilots Club",
    phoneNumber: "0900000003",
    isFriend: true,
  },
  {
    id: "u4",
    displayName: "Phan Thị Chín",
    phoneNumber: "0900000004",
    isFriend: true,
  },
  {
    id: "u5",
    displayName: "Huỳnh Như",
    phoneNumber: "0900000005",
    isFriend: true,
  },
  {
    id: "u6",
    displayName: "Amyra Nguyễn",
    phoneNumber: "0900000006",
    isFriend: true,
  },
  {
    id: "u7",
    displayName: "Anh Thạch",
    phoneNumber: "0900000007",
    isFriend: true,
  },
  {
    id: "u8",
    displayName: "Anh Thư",
    phoneNumber: "0900000008",
    isFriend: true,
  },
  {
    id: "u9",
    displayName: "Anh Tuấn",
    phoneNumber: "0900000009",
    isFriend: true,
  },
  {
    id: "u10",
    displayName: "Ann",
    phoneNumber: "0900000010",
    isFriend: true,
  },
  {
    id: "u11",
    displayName: "Bách",
    phoneNumber: "0900000011",
    isFriend: true,
  },
];

// Mock API to fetch friends list
async function fetchFriends(): Promise<UserProfile[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return MOCK_FRIENDS;
}

interface CreateGroupModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateGroupModal({
  onClose,
  onSuccess,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Tất cả");
  const [selectedMembers, setSelectedMembers] = useState<UserProfile[]>([]);
  const createGroup = useChatStore((s) => s.createGroup);

  // Fetch friends list using useQuery
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: fetchFriends,
  });

  // Filter friends based on search query
  const filteredFriends = friends.filter((friend) => {
    const query = searchQuery.toLowerCase();
    return (
      friend.displayName.toLowerCase().includes(query) ||
      friend.phoneNumber?.includes(query)
    );
  });

  // Group friends by first letter for display
  const groupedFriends = filteredFriends.reduce((acc, friend) => {
    const firstLetter = friend.displayName.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(friend);
    return acc;
  }, {} as Record<string, UserProfile[]>);

  const sortedGroups = Object.keys(groupedFriends).sort();

  const handleToggleMember = (member: UserProfile) => {
    setSelectedMembers((prev) => {
      const isSelected = prev.some((m) => m.id === member.id);
      if (isSelected) {
        return prev.filter((m) => m.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const handleCreateGroup = () => {
    if (selectedMembers.length < 2) return;

    const name = groupName.trim() || `Nhóm ${selectedMembers.length + 1} người`;
    createGroup(name, selectedMembers);
    onSuccess();
  };

  const canCreate = selectedMembers.length >= 2;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Tạo nhóm</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Contact List */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Group Name Input */}
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                  📷
                </div>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Nhập tên nhóm..."
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                <span className="text-slate-400">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nhập tên, số điện thoại, hoặc danh sách số điện thoại"
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-2 border-b border-slate-200 flex gap-2 overflow-x-auto">
              {[
                "Tất cả",
                "Khách hàng",
                "Gia đình",
                "Công việc",
                "Bạn bè",
                "Trả lời sau",
              ].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    selectedFilter === filter
                      ? "bg-blue-500 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-slate-500">
                  Đang tải...
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  Không tìm thấy bạn bè
                </div>
              ) : (
                <>
                  {/* Recent Chats Section */}
                  {searchQuery === "" && (
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                        Trò chuyện gần đây
                      </div>
                      {friends.slice(0, 2).map((friend) => {
                        const isSelected = selectedMembers.some(
                          (m) => m.id === friend.id
                        );
                        return (
                          <button
                            key={friend.id}
                            onClick={() => handleToggleMember(friend)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg"
                          >
                            <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-sm font-semibold">
                              {friend.displayName.charAt(0)}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-sm font-medium">
                                {friend.displayName}
                              </div>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? "bg-blue-500 border-blue-500"
                                  : "border-slate-300"
                              }`}
                            >
                              {isSelected && (
                                <span className="text-white text-xs">✓</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Alphabetical Sections */}
                  {sortedGroups.map((letter) => (
                    <div key={letter} className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                        {letter}
                      </div>
                      {groupedFriends[letter].map((friend) => {
                        const isSelected = selectedMembers.some(
                          (m) => m.id === friend.id
                        );
                        return (
                          <button
                            key={friend.id}
                            onClick={() => handleToggleMember(friend)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg"
                          >
                            <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-sm font-semibold">
                              {friend.displayName.charAt(0)}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-sm font-medium">
                                {friend.displayName}
                              </div>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? "bg-blue-500 border-blue-500"
                                  : "border-slate-300"
                              }`}
                            >
                              {isSelected && (
                                <span className="text-white text-xs">✓</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Right Panel - Selected Members */}
          <div className="w-64 border-l border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <div className="text-sm font-semibold">
                Đã chọn {selectedMembers.length}/100
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {selectedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-semibold">
                    {member.displayName.charAt(0)}
                  </div>
                  <div className="flex-1 text-sm truncate">
                    {member.displayName}
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center hover:bg-blue-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
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
            onClick={handleCreateGroup}
            disabled={!canCreate}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              canCreate
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Tạo nhóm
          </button>
        </div>
      </div>
    </div>
  );
}
