import { useEffect, useRef, useState } from "react";
import { type Message } from "../store/chatStore";

interface MessageInteractionMenuProps {
  message: Message;
  isOwn: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onReply: () => void;
  onShare: () => void;
  onCopy: () => void;
  onPin: () => void;
  onMark: () => void;
  onSelectMultiple: () => void;
  onViewDetails: () => void;
  onSaveToCloud: () => void;
  onCreateReminder: () => void;
  onRecall: () => void;
  onDeleteForMe: () => void;
}

export default function MessageInteractionMenu({
  message,
  isOwn,
  position,
  onClose,
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
}: MessageInteractionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const otherOptionsRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        (!otherOptionsRef.current ||
          !otherOptionsRef.current.contains(event.target as Node))
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <>
      <div
        ref={menuRef}
        className="fixed bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[200px]"
        style={{ left: `${position.x - 180}px`, top: `${position.y}px` }}
      >
        <button
          onClick={onReply}
          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
        >
          <span>💬</span>
          <span>Trả lời</span>
        </button>
        <button
          onClick={onShare}
          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
        >
          <span>➡️</span>
          <span>Chia sẻ</span>
        </button>
        <button
          onClick={onCopy}
          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
        >
          <span>📄</span>
          <span>Copy tin nhắn</span>
        </button>
        <button
          onClick={onPin}
          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
        >
          <span>📌</span>
          <span>Ghim tin nhắn</span>
        </button>
        <button
          onClick={onMark}
          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
        >
          <span>⭐</span>
          <span>Đánh dấu tin nhắn</span>
        </button>
        <button
          onClick={onSelectMultiple}
          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
        >
          <span>☰</span>
          <span>Chọn nhiều tin nhắn</span>
        </button>
        <button
          onClick={onViewDetails}
          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
        >
          <span>ℹ️</span>
          <span>Xem chi tiết</span>
        </button>
        <div className="relative">
          <button
            onMouseEnter={() => setShowOtherOptions(true)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span>⚙️</span>
              <span>Tuỳ chọn khác</span>
            </div>
            <span>→</span>
          </button>
          {showOtherOptions && (
            <div
              ref={otherOptionsRef}
              className="absolute right-full top-0 mr-1 bg-white border border-slate-200 rounded-lg shadow-lg min-w-[180px]"
              onMouseLeave={() => setShowOtherOptions(false)}
            >
              <button
                onClick={onSaveToCloud}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <span>☁️</span>
                <span>Lưu vào Cloud của tôi</span>
              </button>
              <button
                onClick={onCreateReminder}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <span>🕐</span>
                <span>Tạo nhắc hẹn</span>
              </button>
            </div>
          )}
        </div>
        {isOwn && (
          <>
            <div className="border-t border-slate-200 my-1" />
            <button
              onClick={onRecall}
              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-red-600"
            >
              <span>↩️</span>
              <span>Thu hồi</span>
            </button>
            <button
              onClick={onDeleteForMe}
              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-red-600"
            >
              <span>🗑️</span>
              <span>Xóa chỉ ở phía tôi</span>
            </button>
          </>
        )}
      </div>
    </>
  );
}
