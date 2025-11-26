import { useState } from "react";
import { useChatStore } from "../store/chatStore";
import SearchBar from "../components/SearchBar";
import FriendList from "../components/FriendList";
import FriendRequestsView from "../components/FriendRequestsView";
import GroupsListView from "../components/GroupsListView";
import RecentSearch from "../components/RecentSearch";
import SearchResult from "../components/SearchResult";

type ViewType = "friends" | "groups" | "friend-requests" | "group-invitations";

export default function ContactsPage() {
  const [currentView, setCurrentView] = useState<ViewType>("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Tên (A-Z)");
  const [filterBy, setFilterBy] = useState("Tất cả");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const conversations = useChatStore((s) => s.conversations);

  // Calculate friend count from conversations
  const friendCount = (() => {
    const friendSet = new Set<string>();
    conversations.forEach((c) =>
      c.members.forEach((m) => {
        if (m.id !== "me") friendSet.add(m.id);
      })
    );
    return friendSet.size;
  })();

  const navItems = [
    {
      key: "friends" as ViewType,
      label: "Danh sách bạn bè",
      icon: "👥",
    },
    {
      key: "groups" as ViewType,
      label: "Danh sách nhóm và cộng đồng",
      icon: "👥",
    },
    {
      key: "friend-requests" as ViewType,
      label: "Lời mời kết bạn",
      icon: "👤",
    },
    {
      key: "group-invitations" as ViewType,
      label: "Lời mời vào nhóm và cộng đồng",
      icon: "👥",
    },
  ];

  const renderMainContent = () => {
    switch (currentView) {
      case "friends":
        return (
          <>
            <div className="h-14 border-b border-slate-200 flex items-center px-4 justify-between">
              <div className="font-semibold text-sm">Danh sách bạn bè</div>
            </div>

            <div className="p-4 border-b border-slate-200">
              <div className="text-sm font-semibold mb-3">
                Bạn bè ({friendCount})
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm bạn"
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
                  <option>↑↓ Tên (A-Z)</option>
                  <option>↑↓ Tên (Z-A)</option>
                </select>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-100 text-sm outline-none border border-slate-200 flex items-center gap-2"
                >
                  <option>🔽 Tất cả</option>
                  <option>Khách hàng</option>
                  <option>Gia đình</option>
                  <option>Công việc</option>
                  <option>Bạn bè</option>
                </select>
              </div>
            </div>

            <FriendList
              searchQuery={searchQuery}
              sortBy={sortBy}
              filterBy={filterBy}
            />
          </>
        );
      case "groups":
        return <GroupsListView />;
      case "friend-requests":
        return <FriendRequestsView />;
      case "group-invitations":
        return (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Lời mời vào nhóm và cộng đồng (Chưa có)
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex bg-white">
      {/* Left Sidebar Navigation */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-white">
        <SearchBar onOpenSearch={() => setIsSearchOpen(true)} />
        {!isSearchOpen ? (
          <div className="flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = currentView === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setCurrentView(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-100 ${
                    isActive ? "bg-blue-50 text-blue-600" : "text-slate-700"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        ) : searchQuery.trim() === "" ? (
          <RecentSearch
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onClose={() => {
              setIsSearchOpen(false);
              setSearchQuery("");
            }}
          />
        ) : (
          <SearchResult
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onClose={() => {
              setIsSearchOpen(false);
              setSearchQuery("");
            }}
          />
        )}
      </div>

      <div className="flex-1 flex flex-col">{renderMainContent()}</div>
    </div>
  );
}
