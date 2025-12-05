import { useState } from "react";
import FriendRequestsView from "../components/FriendRequestsView";
import FriendsListView from "../components/FriendsListView";
import AddFriendView from "../components/AddFriendView";
import GroupsListView from "../components/GroupsListView";

type ViewType = "friends" | "groups" | "friend-requests" | "group-invitations" | "add-friend";

export default function ContactsPage() {
  const [currentView, setCurrentView] = useState<ViewType>("friends");

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
      key: "add-friend" as ViewType,
      label: "Thêm bạn",
      icon: "🔍",
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
        return <FriendsListView />;
      case "groups":
        return <GroupsListView />;
      case "friend-requests":
        return <FriendRequestsView />;
      case "add-friend":
        return <AddFriendView />;
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
      </div>

      <div className="flex-1 flex flex-col">{renderMainContent()}</div>
    </div>
  );
}
