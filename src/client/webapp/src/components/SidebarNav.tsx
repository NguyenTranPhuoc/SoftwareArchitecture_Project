interface SidebarNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const navItems = [
  { key: "chats", label: "Tin nhắn", icon: "💬", path: "/app/chats" },
  { key: "contacts", label: "Danh bạ", icon: "👥", path: "/app/contacts" },
  { key: "settings", label: "Cài đặt", icon: "⚙️", path: "/app/profile" },
];

export default function SidebarNav({ currentPath, onNavigate }: SidebarNavProps) {
  return (
    <div className="w-16 bg-blue-600 flex flex-col items-center py-4 text-white">
      {/* Avatar user ở trên cùng */}
      <div className="mb-6">
        <div className="w-10 h-10 rounded-full bg-yellow-300 flex items-center justify-center text-lg font-bold">
          N
        </div>
      </div>

      {/* Icon menu */}
      <div className="flex-1 flex flex-col gap-4">
        {navItems.map((item) => {
          const active = currentPath.startsWith(item.path);
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.path)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl
                ${active ? "bg-white text-blue-600" : "hover:bg-blue-500"}
              `}
              title={item.label}
            >
              <span>{item.icon}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
