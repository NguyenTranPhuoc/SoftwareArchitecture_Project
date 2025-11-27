import { useChatStore } from "../store/chatStore";
import { useState } from "react";

export default function GroupsListView() {
  const conversations = useChatStore((s) => s.conversations);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Hoạt động (mới – cũ)");
  const [filterBy, setFilterBy] = useState("Tất cả");

  // Filter groups only
  const groups = conversations.filter((c) => c.type === "group");

  // Filter by search query
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="h-14 border-b border-slate-200 flex items-center px-4 justify-between">
        <div className="font-semibold text-sm flex items-center gap-2">
          <span>👥</span>
          <span>Danh sách nhóm và cộng đồng</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full">
            🔍
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full">
            👤
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full">
            👥
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-slate-200">
        <div className="text-sm font-semibold mb-3">
          Nhóm và cộng đồng ({filteredGroups.length})
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Tìm kiếm..."
              className="w-full px-3 py-2 rounded-lg bg-slate-100 text-sm outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-100 text-sm outline-none border border-slate-200"
          >
            <option>↑↓ Hoạt động (mới – cũ)</option>
            <option>↑↓ Hoạt động (cũ – mới)</option>
            <option>↑↓ Tên (A-Z)</option>
            <option>↑↓ Tên (Z-A)</option>
          </select>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-100 text-sm outline-none border border-slate-200 flex items-center gap-2"
          >
            <option>🔽 Tất cả</option>
            <option>Nhóm</option>
            <option>Cộng đồng</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredGroups.length === 0 ? (
          <div className="text-center text-slate-500 py-8 text-sm">
            Không tìm thấy nhóm nào
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="px-4 py-3 flex items-center justify-between hover:bg-slate-50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-sm font-semibold">
                    {group.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{group.name}</div>
                    <div className="text-xs text-slate-500">
                      {group.members.length} thành viên
                    </div>
                  </div>
                </div>
                <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full">
                  ⋮
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

