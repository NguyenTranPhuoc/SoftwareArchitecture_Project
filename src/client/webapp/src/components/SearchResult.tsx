import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useChatStore, type UserProfile } from "../store/chatStore";

// mock API kết quả
const EXTRA_USERS: UserProfile[] = [
  {
    id: "ux1",
    displayName: "Thanh Xuan",
    phoneNumber: "0123456789",
    isFriend: false,
  },
];

// mock API
async function apiSearchUser(phone: string): Promise<UserProfile | null> {
  const normalized = phone.replace(/\s+/g, "");
  await new Promise((r) => setTimeout(r, 200)); // mô phỏng delay

  return EXTRA_USERS.find((u) => u.phoneNumber === normalized) ?? null;
}

interface SearchResultProps {
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
}

export default function SearchResult({
  query,
  onQueryChange,
  onClose,
}: SearchResultProps) {
  const startDirectConversation = useChatStore(
    (s) => s.startDirectConversation
  );

  const hasQuery = query.trim().length > 0;

  // --------------------------------------------------
  //  useQuery gọi API search
  // --------------------------------------------------
  const { data: result, isLoading } = useQuery({
    queryKey: ["search-user", query],
    queryFn: () => apiSearchUser(query),
    enabled: hasQuery, // chỉ gọi API khi có query
  });

  // --------------------------------------------------
  //  useMutation cho startDirectConversation
  // --------------------------------------------------
  const mutation = useMutation({
    mutationFn: async (user: UserProfile) => {
      // sau này bạn thay bằng API tạo conversation
      startDirectConversation(user);
    },
  });

  const handleSelect = () => {
    if (!result) return;
    mutation.mutate(result);
  };

  return (
    <div className="h-full flex flex-col">
      {/* HEADER SEARCH */}
      <div className="p-3 border-b border-slate-200 flex items-center gap-2">
        <input
          autoFocus
          placeholder="Tìm kiếm"
          className="flex-1 px-3 py-2 rounded-full bg-slate-100 text-sm outline-none"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <button
          onClick={onClose}
          className="text-sm text-sky-600 hover:text-sky-700"
        >
          Đóng
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 pt-3 pb-2 text-xs text-slate-500">
          Tìm bạn qua số điện thoại:
        </div>

        {/* LOADING */}
        {isLoading && hasQuery && (
          <div className="px-3 py-3 text-xs text-slate-400">
            Đang tìm kiếm...
          </div>
        )}

        {/* FOUND */}
        {!isLoading && hasQuery && result && (
          <button
            onClick={handleSelect}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-100 text-left"
            disabled={mutation.isPending}
          >
            <div className="w-10 h-10 rounded-full bg-slate-300" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{result.displayName}</span>
              <span className="text-xs text-slate-500">
                {result.phoneNumber}
              </span>
            </div>
          </button>
        )}

        {/* NOT FOUND */}
        {!isLoading && hasQuery && !result && (
          <div className="px-3 py-3 text-xs text-slate-400">
            Không tìm thấy người dùng với "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
