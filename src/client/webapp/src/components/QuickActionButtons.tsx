import { useState, useRef } from "react";
import EmojiPicker from "./EmojiPicker";

interface QuickActionButtonsProps {
  messageId: string;
  isOwn: boolean;
  onReply: () => void;
  onShare: () => void;
  onMenu: () => void;
  onReact: (emoji: string) => void;
}

export default function QuickActionButtons({
  messageId,
  isOwn,
  onReply,
  onShare,
  onMenu,
  onReact,
}: QuickActionButtonsProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({
    x: 0,
    y: 0,
  });
  const reactButtonRef = useRef<HTMLButtonElement>(null);

  const handleReactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reactButtonRef.current) {
      const rect = reactButtonRef.current.getBoundingClientRect();
      setEmojiPickerPosition({
        x: rect.left - 200,
        y: rect.top + 20,
      });
      setShowEmojiPicker(true);
    }
  };

  return (
    <div className="relative flex items-center w-full">
      <div className="absolute flex items-center top-1/3 -translate-x-[200%]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReply();
          }}
          className="w-7 h-7 flex items-center justify-center rounded-full text-slate-600"
          title="Trả lời"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
          className="w-7 h-7 flex items-center justify-center rounded-full text-slate-600"
          title="Chia sẻ"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMenu();
          }}
          className="w-7 h-7 flex items-center justify-center rounded-full text-slate-600"
          title="Tùy chọn"
        >
          <span className="text-xs">⋮</span>
        </button>
      </div>
      <button
        ref={reactButtonRef}
        onClick={handleReactClick}
        className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 rounded-full text-slate-600"
        title="Phản ứng"
      >
        👍
      </button>
      {showEmojiPicker && (
        <EmojiPicker
          position={emojiPickerPosition}
          onSelect={onReact}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
}
