import { useState, useEffect } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { useChatStore } from "../store/chatStore";
import api from "../services/api";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import ChatInfoPanel from "../components/ChatInfoPanel";
import RecentSearch from "../components/RecentSearch";
import SearchResult from "../components/SearchResult";
import type { AppOutletContext } from "../layouts/AppLayout";

export default function ChatsPage() {
  const [searchParams] = useSearchParams();
  const socketMethods = useOutletContext<AppOutletContext>();
  const me = useChatStore((s) => s.me);
  const selectedId = useChatStore((s) => s.selectedConversationId);
  const selectConversation = useChatStore((s) => s.selectConversation);
  const conversations = useChatStore((s) => s.conversations);
  const setConversations = useChatStore((s) => s.setConversations);
  const isInfoPanelOpen = useChatStore((s) => s.isInfoPanelOpen);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  // Load conversations from API on mount
  useEffect(() => {
    const loadConversations = async () => {
      if (!me.id) return;
      
      setIsLoadingConversations(true);
      try {
        const response: any = await api.getConversations(me.id);
        const conversationsData = response.data || response;
        
        // Transform API response to match store format
        const formattedConversations = conversationsData.map((conv: any) => ({
          id: conv._id,
          name: conv.name || 'Chat',
          type: conv.type,
          lastMessagePreview: '',
          unreadCount: 0,
          members: conv.participants || [],
        }));
        
        // Merge with existing conversations to preserve newly created ones
        const existingConvIds = new Set(formattedConversations.map((c: any) => c.id));
        const newConversations = conversations.filter(c => !existingConvIds.has(c.id));
        
        setConversations([...formattedConversations, ...newConversations]);
        
        // Join all conversations via socket to receive real-time messages
        if (socketMethods) {
          formattedConversations.forEach((conv: any) => {
            console.log('Joining conversation:', conv.id);
            socketMethods.joinConversation(conv.id);
          });
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    loadConversations();
  }, [me.id, socketMethods]); // Add socketMethods to dependencies

  // Check for conversation parameter in URL and select it
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversationId !== selectedId) {
      // Always select the conversation from URL, even if not loaded yet
      selectConversation(conversationId);
    } else if (!conversationId && selectedId) {
      // Clear selection if no conversation in URL
      selectConversation(undefined);
    }
  }, [searchParams.get('conversation')]); // Only depend on the URL parameter

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
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="h-14 border-b border-slate-200 bg-white px-4 flex items-center">
              <h2 className="font-semibold text-lg">Tin nhắn</h2>
            </div>
            {/* Conversation list in main area */}
            <div className="flex-1 overflow-y-auto bg-white">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  Đang tải cuộc trò chuyện...
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex-col items-center justify-center h-full flex text-center px-6 text-slate-400">
                  <p className="text-lg font-semibold mb-2">Chưa có cuộc trò chuyện nào</p>
                  <p className="text-sm">Bắt đầu trò chuyện với bạn bè của bạn</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const peer = conv.type === 'direct' 
                    ? conv.members.find(m => m.id !== me.id)
                    : null;
                  
                  return (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv.id)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center text-base font-semibold">
                          {conv.name.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm truncate">
                            {conv.name}
                          </span>
                          <span className="text-xs text-slate-400">11:31</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-slate-500 truncate flex-1">
                            {conv.lastMessagePreview || 'Bắt đầu cuộc trò chuyện'}
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
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
