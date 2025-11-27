import { useState } from "react";
import AddFriendModal from "./AddFriendModal";
import CreateGroupModal from "./CreateGroupModal";

interface SearchBarProps {
  onOpenSearch: () => void;
}

export default function SearchBar({ onOpenSearch }: SearchBarProps) {
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  return (
    <>
      <div className="p-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="flex-1 px-3 py-2 rounded-full bg-slate-100 text-sm outline-none text-left flex items-center gap-2"
          >
            <span className="text-slate-400">🔍</span>
            <span className="text-slate-500">Tìm kiếm</span>
          </button>
          <button
            onClick={() => setIsAddFriendOpen(true)}
            className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full"
            title="Thêm bạn"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </button>
          <button
            onClick={() => setIsCreateGroupOpen(true)}
            className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full"
            title="Tạo nhóm"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </button>
        </div>
      </div>

      {isAddFriendOpen && (
        <AddFriendModal onClose={() => setIsAddFriendOpen(false)} />
      )}

      {isCreateGroupOpen && (
        <CreateGroupModal
          onClose={() => setIsCreateGroupOpen(false)}
          onSuccess={() => setIsCreateGroupOpen(false)}
        />
      )}
    </>
  );
}
