import { useChatStore } from "../store/chatStore";

interface ManageGroupProps {
  conversationId: string;
  onBack: () => void;
  onOpenRoleModal: () => void;
}

export default function ManageGroup({
  conversationId,
  onBack,
  onOpenRoleModal,
}: ManageGroupProps) {
  const conversations = useChatStore((s) => s.conversations);
  const isGroupOwner = useChatStore((s) => s.isGroupOwner);

  const conv = conversations.find((c) => c.id === conversationId);
  const owner = isGroupOwner(conversationId);

  if (!conv || conv.type !== "group") return null;

  return (
    <div className="h-full flex flex-col border-l border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full"
        >
          ‹
        </button>
        <h2 className="text-lg font-semibold flex-1">Quản lý nhóm</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto text-sm">
        {owner ? (
          <>
            {/* Admin-only Features */}
            <div className="p-4 border-b border-slate-200">
              <div className="text-xs font-semibold text-slate-600 mb-2">
                🔒 Tính năng chỉ dành cho quản trị viên
              </div>
              <div className="text-xs text-slate-500 mb-3">
                Cho phép các thành viên trong nhóm:
              </div>
              <div className="space-y-2">
                {[
                  "Thay đổi tên & ảnh đại diện của nhóm",
                  "Ghim tin nhắn, ghi chú, bình chọn lên đầu hội thoại",
                  "Tạo mới ghi chú, nhắc hẹn",
                  "Tạo mới bình chọn",
                  "Gửi tin nhắn",
                ].map((feature, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-blue-500 rounded"
                    />
                    <span className="text-xs">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Group Settings */}
            <div className="p-4 border-b border-slate-200 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="text-xs">
                    Chế độ phê duyệt thành viên mới
                  </span>
                  <span className="text-slate-400">⑦</span>
                </div>
                <input type="checkbox" className="toggle" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="text-xs">
                    Đánh dấu tin nhắn từ trưởng/phó nhóm
                  </span>
                  <span className="text-slate-400">⑦</span>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="text-xs">
                    Cho phép thành viên mới đọc tin nhắn gần nhất
                  </span>
                  <span className="text-slate-400">⑦</span>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </label>
            </div>

            {/* Join Link */}
            <div className="p-4 border-b border-slate-200">
              <label className="flex items-center justify-between cursor-pointer mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs">
                    Cho phép dùng link tham gia nhóm
                  </span>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </label>
              <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2">
                <span className="text-xs flex-1 font-mono">
                  zalo.me/g/ldudre857
                </span>
                <button className="text-blue-500 hover:text-blue-600">
                  📋
                </button>
                <button className="text-blue-500 hover:text-blue-600">↗</button>
                <button className="text-blue-500 hover:text-blue-600">↻</button>
              </div>
            </div>

            {/* Group Management Actions */}
            <div className="p-4 border-b border-slate-200 space-y-2">
              <button className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-left">
                <span>👥</span>
                <span className="text-xs">Chặn khỏi nhóm</span>
              </button>
              <button
                onClick={onOpenRoleModal}
                className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-left"
              >
                <span>🔑</span>
                <span className="text-xs">Trưởng & phó nhóm</span>
              </button>
            </div>

            {/* Disband Group */}
            <div className="p-4">
              <button className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium">
                Giải tán nhóm
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Non-owner view - limited options */}
            <div className="p-4 border-b border-slate-200 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="text-xs">
                    Đánh dấu tin nhắn từ trưởng/phó nhóm
                  </span>
                  <span className="text-slate-400">⑦</span>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="text-xs">
                    Cho phép thành viên mới đọc tin nhắn gần nhất
                  </span>
                  <span className="text-slate-400">⑦</span>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
