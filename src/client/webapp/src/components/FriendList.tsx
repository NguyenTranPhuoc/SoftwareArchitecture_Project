import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useChatStore, type UserProfile } from "../store/chatStore";
import { userApi } from "../services/userApi";

// API functions
async function fetchFriends(): Promise<UserProfile[]> {
  // TODO: Implement real API call when endpoint is ready
  // For now, return empty array since you're a new user
  return [];
}

async function removeFriend(friendId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log("Removing friend:", friendId);
  // TODO: Implement real API call when endpoint is ready
}

interface FriendListProps {
  searchQuery: string;
  sortBy: string;
  filterBy: string;
}

export default function FriendList({
  searchQuery,
  sortBy,
  filterBy,
}: FriendListProps) {
  const queryClient = useQueryClient();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: fetchFriends,
  });

  const removeFriendMutation = useMutation({
    mutationFn: removeFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      setOpenMenuId(null);
    },
  });

  // Filter friends
  let filteredFriends = friends.filter((friend) =>
    friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort friends
  if (sortBy.includes("Tên (A-Z)")) {
    filteredFriends.sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    );
  } else if (sortBy.includes("Tên (Z-A)")) {
    filteredFriends.sort((a, b) =>
      b.displayName.localeCompare(a.displayName)
    );
  }

  // Group friends by first letter
  const groupedFriends = filteredFriends.reduce((acc, friend) => {
    const firstLetter = friend.displayName.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(friend);
    return acc;
  }, {} as Record<string, UserProfile[]>);

  const sortedGroups = Object.keys(groupedFriends).sort();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId) {
        const menuElement = menuRefs.current[openMenuId];
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const handleRemoveFriend = (friendId: string) => {
    removeFriendMutation.mutate(friendId);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {filteredFriends.length === 0 ? (
        <div className="text-center text-slate-500 py-8 text-sm">
          Không tìm thấy bạn bè nào
        </div>
      ) : (
        <>
          {/* New Friends Section */}
          {searchQuery === "" && groupedFriends["Đ"] && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                Bạn mới
              </div>
              {groupedFriends["Đ"].map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  isMenuOpen={openMenuId === friend.id}
                  onMenuToggle={() =>
                    setOpenMenuId(openMenuId === friend.id ? null : friend.id)
                  }
                  onRemoveFriend={handleRemoveFriend}
                  menuRef={(el) => (menuRefs.current[friend.id] = el)}
                />
              ))}
            </div>
          )}

          {/* Alphabetical Sections */}
          {sortedGroups.map((letter) => {
            if (letter === "Đ" && searchQuery === "") return null; // Already shown in "Bạn mới"
            return (
              <div key={letter} className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
                  {letter}
                </div>
                {groupedFriends[letter].map((friend) => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    isMenuOpen={openMenuId === friend.id}
                    onMenuToggle={() =>
                      setOpenMenuId(openMenuId === friend.id ? null : friend.id)
                    }
                    onRemoveFriend={handleRemoveFriend}
                    menuRef={(el) => (menuRefs.current[friend.id] = el)}
                  />
                ))}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

interface FriendCardProps {
  friend: UserProfile;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onRemoveFriend: (friendId: string) => void;
  menuRef: (el: HTMLDivElement | null) => void;
}

function FriendCard({
  friend,
  isMenuOpen,
  onMenuToggle,
  onRemoveFriend,
  menuRef,
}: FriendCardProps) {
  return (
    <div className="relative px-3 py-2 hover:bg-slate-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 rounded-full bg-slate-300 flex items-center justify-center text-sm font-semibold">
            {friend.displayName.charAt(0)}
          </div>
          <div className="text-sm">{friend.displayName}</div>
        </div>
        <button
          onClick={onMenuToggle}
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full"
        >
          ⋮
        </button>
      </div>

      {/* Action Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[180px]"
        >
          <button
            onClick={() => {
              // TODO: View information
              onMenuToggle();
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
          >
            Xem thông tin
          </button>
          <button
            onClick={() => {
              // TODO: Categorize
              onMenuToggle();
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between"
          >
            <span>Phân loại</span>
            <span>→</span>
          </button>
          <button
            onClick={() => {
              // TODO: Set reminder name
              onMenuToggle();
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
          >
            Đặt tên gợi nhớ
          </button>
          <button
            onClick={() => {
              // TODO: Block
              onMenuToggle();
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
          >
            Chặn người này
          </button>
          <button
            onClick={() => {
              onRemoveFriend(friend.id);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 text-red-600"
          >
            Xóa bạn
          </button>
        </div>
      )}
    </div>
  );
}

