import type React from "react";
import { useChatStore, type UserProfile } from "../store/chatStore";

interface RecentSearchProps {
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
}

export default function RecentSearch({
  query,
  onQueryChange,
  onClose,
}: RecentSearchProps) {
  const conversations = useChatStore((s) => s.conversations);
  const me = useChatStore((s) => s.me);
  const startDirectConversation = useChatStore(
    (s) => s.startDirectConversation
  );

  // lấy danh sách user từ các cuộc hội thoại (trừ mình) – coi như "Tìm gần đây"
  const recentUsers: UserProfile[] = [];
  const map = new Map<string, UserProfile>();

  conversations.forEach((c) => {
    c.members.forEach((u) => {
      if (u.id === me.id) return;
      if (!map.has(u.id)) {
        map.set(u.id, u);
        recentUsers.push(u);
      }
    });
  });

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onQueryChange(e.target.value);
  };

  const handleClickUser = (u: UserProfile) => {
    startDirectConversation(u);
    // CHÚ Ý: không gọi onClose ở đây → panel search vẫn mở
  };

  return (
    <div className="h-full flex flex-col">
      {/* Thanh search + nút Đóng (hình 2 & 3 dùng chung) */}
      <div className="p-3 border-b border-slate-200 flex items-center gap-2">
        <input
          autoFocus
          placeholder="Tìm kiếm"
          className="flex-1 px-3 py-2 rounded-full bg-slate-100 text-sm outline-none"
          value={query}
          onChange={handleInputChange}
        />
        <button
          onClick={onClose}
          className="text-sm text-sky-600 hover:text-sky-700"
        >
          Đóng
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-3 pt-3 pb-2 text-xs text-slate-500">
          Tìm gần đây
        </div>

        {recentUsers.map((u) => (
          <button
            key={u.id}
            onClick={() => handleClickUser(u)}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-100 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-slate-300" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{u.displayName}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
