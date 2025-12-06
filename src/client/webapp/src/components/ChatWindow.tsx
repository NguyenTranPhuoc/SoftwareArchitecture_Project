// src/components/ChatWindow.tsx
import { useChatStore, validateFile, type Message } from "../store/chatStore";
import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import type { AppOutletContext } from "../layouts/AppLayout";
import MessageBubbleWithInteractions from "./MessageBubbleWithInteractions";
import ReplyContext from "./ReplyContext";
import api from "../services/api";

export default function ChatWindow() {
  const {
    conversations,
    selectedConversationId,
    messages,
    me,
    sendFileMessage,
    setMessages,
    recallMessage,
    deleteMessageForMe,
    addReaction,
  } = useChatStore();
  const isInfoPanelOpen = useChatStore((s) => s.isInfoPanelOpen);
  const toggleInfoPanel = useChatStore((s) => s.toggleInfoPanel);

  // Get socket methods from context
  const socketMethods = useOutletContext<AppOutletContext>();

  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Load messages when conversation is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversationId) return;
      
      setIsLoadingMessages(true);
      try {
        const response: any = await api.getMessages(selectedConversationId, 100, 0);
        const messagesData = response.data || response;
        
        // Transform API response to match store format
        const formattedMessages: Message[] = messagesData.map((msg: any) => ({
          id: msg._id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          content: msg.content,
          type: msg.type || 'text',
          createdAt: msg.createdAt,
          isOwn: msg.senderId === me.id,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
          fileSize: msg.fileSize,
          thumbnailUrl: msg.thumbnailUrl,
          isRecalled: msg.isDeleted,
          reactions: msg.reactions || [],
          replyTo: msg.replyTo,
        }));
        
        // Merge with existing messages (keep real-time messages that aren't in DB yet)
        const existingRealtimeMessages = messages.filter(
          m => m.conversationId === selectedConversationId && 
               !formattedMessages.some(fm => fm.id === m.id)
        );
        
        setMessages([...formattedMessages, ...existingRealtimeMessages]);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedConversationId, me.id, setMessages]);

  const conv = conversations.find((c) => c.id === selectedConversationId);
  const convMessages = messages.filter(
    (m) => m.conversationId === selectedConversationId && !m.isDeletedForMe
  );

  if (!conv) return null;

  const peer =
    conv.type === "direct"
      ? conv.members.find((m) => m.id !== me.id)
      : undefined;

  const handleSend = () => {
    if (!text.trim()) return;

    if (replyingTo) {
      // Send reply via Socket.IO
      socketMethods.sendMessage({
        conversationId: conv.id,
        content: text.trim(),
        replyTo: replyingTo.id,
      });
      setReplyingTo(null);
    } else {
      // Send normal message
      socketMethods.sendMessage({
        conversationId: conv.id,
        content: text.trim(),
      });
    }
    setText("");
  };

  const handleRecall = (messageId: string) => {
    recallMessage(messageId);
    socketMethods.deleteMessage(messageId, conv.id);
  };

  const handleDeleteForMe = (messageId: string) => {
    deleteMessageForMe(messageId);
    // For "delete for me", we just update local state
    // The backend deleteMessage does a soft delete for everyone
  };

  const handleReact = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
    socketMethods.addReaction(messageId, emoji, conv.id);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conv) return;

    const validation = validateFile(file, "file");
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      // Upload to GCS
      const response = await api.uploadFile(file);
      
      // Send message with uploaded file URL
      socketMethods.sendFileMessage({
        conversationId: conv.id,
        content: `📎 ${file.name}`,
        type: 'file',
        fileUrl: response.fileUrl,
        fileName: file.name,
        fileSize: file.size,
      });
    } catch (error) {
      console.error('File upload failed:', error);
      alert('Không thể tải lên tệp. Vui lòng thử lại.');
    }
    
    e.target.value = ""; // Reset input
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conv) return;

    const validation = validateFile(file, "image");
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      // Upload to GCS
      const response = await api.uploadImage(file);
      
      // Send message with uploaded image URL
      socketMethods.sendFileMessage({
        conversationId: conv.id,
        content: '🖼️ Hình ảnh',
        type: 'image',
        fileUrl: response.imageUrl,
        fileName: file.name,
        fileSize: file.size,
        thumbnailUrl: response.thumbnail,
      });
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Không thể tải lên hình ảnh. Vui lòng thử lại.');
    }
    
    e.target.value = ""; // Reset input
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageButtonClick = () => {
    imageInputRef.current?.click();
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conv) return;

    const validation = validateFile(file, "video");
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      // Upload to GCS
      const response = await api.uploadVideo(file);
      
      // Send message with uploaded video URL
      socketMethods.sendFileMessage({
        conversationId: conv.id,
        content: "🎥 Video",
        type: "video" as any,
        fileUrl: response.videoUrl,
        fileName: file.name,
        fileSize: file.size,
      });
    } catch (error) {
      console.error('Video upload failed:', error);
      alert('Không thể tải lên video. Vui lòng thử lại.');
    }
    
    e.target.value = "";
  };

  const handleVideoButtonClick = () => {
    videoInputRef.current?.click();
  };

  const handleStickerClick = (sticker: string) => {
    socketMethods.sendMessage({
      conversationId: conv.id,
      content: sticker,
    });
    setShowStickerPicker(false);
  };

  const commonStickers = ["😀", "😂", "❤️", "👍", "🎉", "😍", "😊", "🔥", "💯", "✨", "👏", "🙏", "💪", "😎", "🤔", "😢", "😡", "🤣", "😘", "🥰"];

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="h-14 border-b border-slate-200 flex items-center px-4 justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-300" />
          <div>
            <div className="font-semibold text-sm">{conv.name}</div>
            <div className="text-xs text-slate-400">
              {conv.type === "group"
                ? `${conv.members.length} thành viên`
                : peer?.isFriend === false
                ? "Người lạ"
                : "Bạn bè"}
            </div>
          </div>
        </div>

        {conv.type === "direct" && peer && peer.isFriend === false && (
          <div className="px-4 py-2 text-xs bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span>Gửi yêu cầu kết bạn tới {peer.displayName}</span>
            <button className="px-3 py-1 rounded-full bg-blue-500 text-white text-xs">
              Gửi kết bạn
            </button>
          </div>
        )}

        <div className="flex gap-3 text-slate-500 text-lg items-center">
          <button title="Danh sách thành viên">👥</button>
          <button title="Gọi video">📹</button>
          <button title="Tìm kiếm trong trò chuyện">🔍</button>
          <button
            title="Thông tin hội thoại"
            onClick={toggleInfoPanel}
            className={`w-7 h-7 border rounded-md flex items-center justify-center text-sm
              ${
                isInfoPanelOpen
                  ? "bg-blue-50 border-blue-400"
                  : "hover:bg-slate-100"
              }
            `}
          >
            ▣
          </button>
        </div>
      </div>

      {/* LIST MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 bg-[#ebecf0]">
        {convMessages.map((m) => (
          <MessageBubbleWithInteractions
            key={m.id}
            message={m}
            me={me}
            allMessages={messages}
            allMembers={conv.members}
            onDownload={handleDownload}
            onReply={(msg) => setReplyingTo(msg)}
            onShare={() => {}}
            onCopy={() => {}}
            onPin={() => {}}
            onMark={() => {}}
            onSelectMultiple={() => {}}
            onViewDetails={() => {}}
            onSaveToCloud={() => {}}
            onCreateReminder={() => {}}
            onRecall={handleRecall}
            onDeleteForMe={handleDeleteForMe}
            onReact={handleReact}
          />
        ))}
      </div>

      {/* REPLY CONTEXT */}
      {replyingTo && (
        <ReplyContext
          message={replyingTo}
          senderName={
            conv.members.find((m) => m.id === replyingTo.senderId)
              ?.displayName || "Unknown"
          }
          onClose={() => setReplyingTo(null)}
        />
      )}

      {/* STICKER PICKER */}
      {showStickerPicker && (
        <div className="border-t border-slate-200 bg-white p-3">
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {commonStickers.map((sticker, idx) => (
              <button
                key={idx}
                onClick={() => handleStickerClick(sticker)}
                className="text-2xl hover:bg-slate-100 w-10 h-10 rounded flex items-center justify-center"
              >
                {sticker}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="h-16 border-t border-slate-200 px-4 flex items-center gap-3 bg-white relative">
        <button
          title="Sticker/Emoji"
          onClick={() => setShowStickerPicker(!showStickerPicker)}
          className={`text-xl ${showStickerPicker ? 'bg-slate-100' : ''} hover:bg-slate-100 px-2 py-1 rounded`}
        >
          😊
        </button>
        <button title="Ảnh" onClick={handleImageButtonClick} className="text-xl hover:bg-slate-100 px-2 py-1 rounded">
          🖼️
        </button>
        <button title="Video" onClick={handleVideoButtonClick} className="text-xl hover:bg-slate-100 px-2 py-1 rounded">
          🎥
        </button>
        <button title="Tài liệu" onClick={handleFileButtonClick} className="text-xl hover:bg-slate-100 px-2 py-1 rounded">
          📎
        </button>

        <input
          type="file"
          ref={imageInputRef}
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleImageSelect}
          className="hidden"
        />
        <input
          type="file"
          ref={videoInputRef}
          accept="video/mp4,video/webm,video/ogg,video/quicktime"
          onChange={handleVideoSelect}
          className="hidden"
        />
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
          onChange={handleFileSelect}
          className="hidden"
        />

        <input
          className="flex-1 px-3 py-2 rounded-full bg-slate-100 text-sm outline-none"
          placeholder={`Nhập @, tin nhắn tới ${conv.name}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button title="Gửi" className="text-2xl" onClick={handleSend}>
          👍
        </button>
      </div>
    </div>
  );
}
