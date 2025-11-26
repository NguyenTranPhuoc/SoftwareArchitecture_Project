import { useState, useRef } from "react";
import {
  type Message,
  type UserProfile,
  formatFileSize,
} from "../store/chatStore";
import QuickActionButtons from "./QuickActionButtons";
import MessageInteractionMenu from "./MessageInteractionMenu";

interface MessageBubbleWithInteractionsProps {
  message: Message;
  me: UserProfile;
  allMessages: Message[];
  allMembers: UserProfile[];
  onDownload: (url: string, filename: string) => void;
  onReply: (message: Message) => void;
  onShare: (message: Message) => void;
  onCopy: (message: Message) => void;
  onPin: (message: Message) => void;
  onMark: (message: Message) => void;
  onSelectMultiple: () => void;
  onViewDetails: (message: Message) => void;
  onSaveToCloud: (message: Message) => void;
  onCreateReminder: (message: Message) => void;
  onRecall: (messageId: string) => void;
  onDeleteForMe: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
}

export default function MessageBubbleWithInteractions({
  message,
  me,
  allMessages,
  allMembers,
  onDownload,
  onReply,
  onShare,
  onCopy,
  onPin,
  onMark,
  onSelectMultiple,
  onViewDetails,
  onSaveToCloud,
  onCreateReminder,
  onRecall,
  onDeleteForMe,
  onReact,
}: MessageBubbleWithInteractionsProps) {
  const isOwn = message.senderId === me.id || message.isOwn;
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const messageRef = useRef<HTMLDivElement>(null);

  // Don't render if deleted for me
  if (message.isDeletedForMe) return null;

  // Get replied message
  const repliedMessage = message.replyTo
    ? allMessages.find((m) => m.id === message.replyTo)
    : null;
  const repliedSender = repliedMessage
    ? allMembers.find((m) => m.id === repliedMessage.senderId)
    : null;

  // Get reactions summary
  const reactions = message.reactions || [];
  const reactionCount = reactions.length;
  const reactionGroups = reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) {
      acc[r.emoji] = [];
    }
    acc[r.emoji].push(r);
    return acc;
  }, {} as Record<string, typeof reactions>);
  const topReactions = Object.keys(reactionGroups)
    .sort((a, b) => reactionGroups[b].length - reactionGroups[a].length)
    .slice(0, 3);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    onCopy(message);
    setShowMenu(false);
  };

  const getPreviewText = (msg: Message) => {
    if (msg.type === "image") return "📷 Đã gửi ảnh";
    if (msg.type === "file" && msg.fileMetadata)
      return `📎 ${msg.fileMetadata.filename}`;
    return msg.content;
  };

  const renderMessageContent = () => {
    if (message.isRecalled) {
      return (
        <div
          className={`max-w-xs px-3 py-2 rounded-2xl text-sm italic ${
            isOwn
              ? "bg-blue-100 text-slate-500"
              : "bg-slate-100 text-slate-500 border border-slate-200"
          }`}
        >
          Tin nhắn đã được thu hồi
        </div>
      );
    }

    if (message.type === "image" && message.fileMetadata) {
      const {
        filename,
        thumbnailUrl,
        uploadProgress,
        isUploading,
        isOnCloud,
        url,
      } = message.fileMetadata;

      return (
        <div
          className={`max-w-xs rounded-2xl overflow-hidden ${
            isOwn ? "bg-blue-500" : "bg-white border border-slate-200"
          }`}
          onContextMenu={handleRightClick}
        >
          {isUploading &&
          uploadProgress !== undefined &&
          uploadProgress < 100 ? (
            <div className="px-3 py-2">
              <div className="text-xs text-white/80 mb-1">{filename}</div>
              <div className="w-full bg-white/20 rounded-full h-1.5 mb-1">
                <div
                  className="bg-white h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="text-xs text-white/60">
                {Math.round(uploadProgress)}%
              </div>
            </div>
          ) : thumbnailUrl ? (
            <div className="relative">
              <img
                src={thumbnailUrl}
                alt={filename}
                className="max-w-full h-auto object-cover cursor-pointer"
                style={{ maxHeight: "300px" }}
                onClick={() => url && onDownload(url, filename)}
              />
              {isOnCloud && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <span>☁️</span>
                  <span>Đã có trên Cloud</span>
                </div>
              )}
            </div>
          ) : (
            <div className="px-3 py-2 text-sm text-white">📷 {filename}</div>
          )}
          <div
            className={`px-3 py-1 text-xs ${
              isOwn ? "text-white/70" : "text-slate-500"
            }`}
          >
            {formatTime(message.createdAt)}
          </div>
        </div>
      );
    }

    if (message.type === "file" && message.fileMetadata) {
      const {
        filename,
        size,
        url,
        uploadProgress,
        isUploading,
        isOnCloud,
        mimeType,
      } = message.fileMetadata;

      const getFileIcon = () => {
        const lowerFilename = filename.toLowerCase();
        if (lowerFilename.endsWith(".pdf")) return "📄";
        if (lowerFilename.endsWith(".xlsx") || lowerFilename.endsWith(".xls")) {
          return (
            <span className="inline-flex items-center justify-center w-8 h-8 bg-green-500 text-white font-bold text-xs rounded">
              X
            </span>
          );
        }
        if (lowerFilename.endsWith(".doc") || lowerFilename.endsWith(".docx"))
          return "📝";
        if (lowerFilename.endsWith(".zip") || lowerFilename.endsWith(".rar"))
          return "📦";
        if (lowerFilename.endsWith(".ai") || lowerFilename.endsWith(".eps")) {
          return (
            <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white font-bold text-xs rounded">
              Ai
            </span>
          );
        }
        if (mimeType.includes("pdf")) return "📄";
        if (mimeType.includes("word") || mimeType.includes("document"))
          return "📝";
        if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) {
          return (
            <span className="inline-flex items-center justify-center w-8 h-8 bg-green-500 text-white font-bold text-xs rounded">
              X
            </span>
          );
        }
        if (mimeType.includes("zip") || mimeType.includes("rar")) return "📦";
        if (
          mimeType.includes("illustrator") ||
          mimeType.includes("postscript")
        ) {
          return (
            <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white font-bold text-xs rounded">
              Ai
            </span>
          );
        }
        return "📎";
      };

      return (
        <div
          className={`max-w-xs rounded-2xl px-3 py-2 ${
            isOwn
              ? "bg-blue-500 text-white"
              : "bg-white border border-slate-200"
          }`}
          onContextMenu={handleRightClick}
        >
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 flex items-center">
              {getFileIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{filename}</div>
              <div
                className={`text-xs mt-1 ${
                  isOwn ? "text-white/70" : "text-slate-500"
                }`}
              >
                {formatFileSize(size)}
                {isOnCloud && (
                  <span className="ml-2 flex items-center gap-1">
                    <span>☁️</span>
                    <span>Đã có trên Cloud</span>
                  </span>
                )}
              </div>
              {isUploading &&
                uploadProgress !== undefined &&
                uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-white/20 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          isOwn ? "bg-white" : "bg-blue-500"
                        }`}
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        isOwn ? "text-white/60" : "text-slate-400"
                      }`}
                    >
                      {Math.round(uploadProgress)}%
                    </div>
                  </div>
                )}
              {url && !isUploading && (
                <button
                  onClick={() => onDownload(url, filename)}
                  className={`mt-2 text-xs underline ${
                    isOwn ? "text-white/80" : "text-blue-500"
                  }`}
                >
                  Tải xuống
                </button>
              )}
            </div>
            {url && !isUploading && (
              <button
                onClick={() => onDownload(url, filename)}
                className={`flex-shrink-0 ${
                  isOwn ? "text-white/80" : "text-slate-500"
                }`}
                title="Tải xuống"
              >
                ⬇️
              </button>
            )}
          </div>
          <div
            className={`text-xs mt-1 ${
              isOwn ? "text-white/70" : "text-slate-500"
            }`}
          >
            {formatTime(message.createdAt)}
          </div>
        </div>
      );
    }

    // Text message
    return (
      <div
        className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
          isOwn ? "bg-blue-500 text-white" : "bg-white border border-slate-200"
        }`}
        onContextMenu={handleRightClick}
      >
        {message.content}
      </div>
    );
  };

  return (
    <div className={`w-full flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`group w-full flex ${
          isOwn ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`relative flex w-full ${
            isOwn ? "justify-end" : "justify-start"
          }`}
          ref={messageRef}
          onMouseEnter={() => setShowQuickActions(true)}
          onMouseLeave={() => setShowQuickActions(false)}
        >
          {!isOwn && (
            <div className="w-7 h-7 rounded-full bg-slate-300 mr-2 flex-shrink-0" />
          )}

          <div className="flex flex-col items-end gap-1">
            {/* Reply context */}
            {repliedMessage && repliedSender && (
              <div
                className={`max-w-xs px-3 py-1.5 rounded-lg text-xs border-l-4 ${
                  isOwn
                    ? "bg-blue-50 border-blue-500"
                    : "bg-blue-50 border-blue-500"
                }`}
              >
                <div className="font-semibold text-slate-700">
                  {repliedSender.displayName}
                </div>
                <div className="text-slate-600 truncate">
                  {getPreviewText(repliedMessage)}
                </div>
              </div>
            )}

            {/* Message content */}
            {renderMessageContent()}

            {/* Quick action buttons */}
            {showQuickActions && (
              <div className="absolute flex items-center gap-1 -bottom-4">
                <QuickActionButtons
                  messageId={message.id}
                  isOwn={isOwn || false}
                  onReply={() => onReply(message)}
                  onShare={() => onShare(message)}
                  onMenu={() => {
                    if (messageRef.current) {
                      const rect = messageRef.current.getBoundingClientRect();
                      setMenuPosition({
                        x: rect.right - 80,
                        y: rect.top + 20,
                      });
                      setShowMenu(true);
                    }
                  }}
                  onReact={(emoji) => onReact(message.id, emoji)}
                />
              </div>
            )}
          </div>

          {/* Interaction menu */}
          {showMenu && (
            <MessageInteractionMenu
              message={message}
              isOwn={isOwn || false}
              position={menuPosition}
              onClose={() => setShowMenu(false)}
              onReply={() => {
                onReply(message);
                setShowMenu(false);
              }}
              onShare={() => {
                onShare(message);
                setShowMenu(false);
              }}
              onCopy={handleCopy}
              onPin={() => {
                onPin(message);
                setShowMenu(false);
              }}
              onMark={() => {
                onMark(message);
                setShowMenu(false);
              }}
              onSelectMultiple={() => {
                onSelectMultiple();
                setShowMenu(false);
              }}
              onViewDetails={() => {
                onViewDetails(message);
                setShowMenu(false);
              }}
              onSaveToCloud={() => {
                onSaveToCloud(message);
                setShowMenu(false);
              }}
              onCreateReminder={() => {
                onCreateReminder(message);
                setShowMenu(false);
              }}
              onRecall={() => {
                onRecall(message.id);
                setShowMenu(false);
              }}
              onDeleteForMe={() => {
                onDeleteForMe(message.id);
                setShowMenu(false);
              }}
            />
          )}
        </div>

        {/* Reactions */}
        <div
          className={`flex relative ${isOwn ? "justify-end" : "justify-start"}`}
        >
          {reactionCount > 0 && (
            <div className="absolute flex items-center px-[6px] py-[2px] bg-white rounded-full border border-slate-200 shadow-sm w-fit bottom-[-18px] right-8">
              {topReactions.map((emoji) => (
                <span key={emoji} className="text-sm">
                  {emoji}
                </span>
              ))}
              {reactionCount > 0 && (
                <span className="text-xs text-slate-600 ml-1">
                  {reactionCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
