import { useState } from "react";
import { useChatStore } from "../store/chatStore";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import ChatInfoPanel from "../components/ChatInfoPanel";
import RecentSearch from "../components/RecentSearch";
import SearchResult from "../components/SearchResult";

export default function ChatsPage() {
  const selectedId = useChatStore((s) => s.selectedConversationId);
  const isInfoPanelOpen = useChatStore((s) => s.isInfoPanelOpen);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-1 h-full">
      <div className="w-80 border-r border-slate-200 flex flex-col bg-white">
        {!isSearchOpen ? (
          <ConversationList onOpenSearch={() => setIsSearchOpen(true)} />
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

      {/* Khung chat */}
      <div className="flex-1 flex flex-col bg-slate-50 border-r border-slate-200">
        {selectedId ? (
          <ChatWindow />
        ) : (
          <div className="flex-col items-center justify-center h-full flex text-center px-6">
            <p className="text-2xl font-semibold">Chào mừng đến với Zalo PC</p>
            <p>
              Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng người
              thân, bạn bè được tối ưu hoá cho máy tính của bạn.
            </p>
          </div>
        )}
      </div>

      {/* Panel bên phải: chỉ render nếu đang mở */}
      {isInfoPanelOpen && (
        <div className="w-80 bg-white">
          <ChatInfoPanel />
        </div>
      )}
    </div>
  );
}
