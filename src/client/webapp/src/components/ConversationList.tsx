import { useChatStore } from "../store/chatStore";
import SearchBar from "./SearchBar";

interface ConversationListProps {
  onOpenSearch: () => void;
}

export default function ConversationList({
  onOpenSearch,
}: ConversationListProps) {
  const conversations = useChatStore((s) => s.conversations);
  const selectedId = useChatStore((s) => s.selectedConversationId);
  const selectConversation = useChatStore((s) => s.selectConversation);
  const isUserOnline = useChatStore((s) => s.isUserOnline);
  const me = useChatStore((s) => s.me);

  return (
    <div className="h-full flex flex-col">
      <SearchBar onOpenSearch={onOpenSearch} />

      {/* Danh sách hội thoại */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => {
          const active = conv.id === selectedId;
          // For direct chats, find the other user
          const peer = conv.type === 'direct' 
            ? conv.members.find(m => m.id !== me.id)
            : null;
          const isOnline = peer ? isUserOnline(peer.id) : false;
          
          return (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={`w-full flex items-start gap-3 px-3 py-3 text-left hover:bg-slate-100
                ${active ? "bg-sky-100" : ""}`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-sm font-semibold">
                  {conv.name.charAt(0)}
                </div>
                {/* Online status indicator for direct chats */}
                {conv.type === 'direct' && isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm truncate">
                    {conv.name}
                  </span>
                  <span className="text-[10px] text-slate-400">11:31</span>
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {conv.lastMessagePreview}
                </div>
              </div>
              {conv.unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {conv.unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
