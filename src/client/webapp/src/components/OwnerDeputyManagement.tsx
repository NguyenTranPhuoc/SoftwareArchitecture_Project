import { useChatStore } from "../store/chatStore";

interface OwnerDeputyManagementProps {
  conversationId: string;
  onBack: () => void;
  onOpenRoleModal: (type: "deputy" | "owner") => void;
}

export default function OwnerDeputyManagement({
  conversationId,
  onBack,
  onOpenRoleModal,
}: OwnerDeputyManagementProps) {
  const conversations = useChatStore((s) => s.conversations);
  const me = useChatStore((s) => s.me);
  const getMemberRole = useChatStore((s) => s.getMemberRole);

  const conv = conversations.find((c) => c.id === conversationId);

  if (!conv || conv.type !== "group") return null;

  // Find the owner
  const owner = conv.members.find(
    (m) => getMemberRole(conversationId, m.id) === "owner"
  );

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
        <h2 className="text-lg font-semibold flex-1">Trưởng & phó nhóm</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Owner Section */}
        {owner && (
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center text-sm font-semibold">
                {owner.displayName.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-semibold">{owner.displayName}</div>
                <div className="text-xs text-slate-500">Trưởng nhóm</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-4 space-y-3">
          <button
            onClick={() => onOpenRoleModal("deputy")}
            className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold text-left"
          >
            Thêm phó nhóm
          </button>
          <button
            onClick={() => onOpenRoleModal("owner")}
            className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold text-left"
          >
            Chuyển quyền trưởng nhóm
          </button>
        </div>
      </div>
    </div>
  );
}

