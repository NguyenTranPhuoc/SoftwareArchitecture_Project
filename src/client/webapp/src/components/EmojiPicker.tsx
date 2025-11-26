import { useEffect, useRef } from "react";

interface EmojiPickerProps {
  position: { x: number; y: number };
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

export default function EmojiPicker({
  position,
  onSelect,
  onClose,
}: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="fixed bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-2 flex gap-1"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => {
            onSelect(emoji);
            onClose();
          }}
          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded text-lg"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
