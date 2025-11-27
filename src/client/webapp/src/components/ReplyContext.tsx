import { type Message } from "../store/chatStore";

interface ReplyContextProps {
  message: Message;
  senderName: string;
  onClose: () => void;
}

export default function ReplyContext({
  message,
  senderName,
  onClose,
}: ReplyContextProps) {
  const getPreviewText = () => {
    if (message.type === "image") return "📷 Đã gửi ảnh";
    if (message.type === "file" && message.fileMetadata)
      return `📎 ${message.fileMetadata.filename}`;
    return message.content;
  };

  return (
    <div className="px-4 py-2 border-b border-slate-200 bg-white flex items-center gap-2">
      <div className="w-1 bg-blue-500 rounded-full self-stretch" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-500 font-medium">{senderName}</div>
        <div className="text-xs text-slate-600 truncate">
          {getPreviewText()}
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600"
      >
        ✕
      </button>
    </div>
  );
}

