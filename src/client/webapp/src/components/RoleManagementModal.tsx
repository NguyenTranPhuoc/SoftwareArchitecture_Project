import { useState } from "react";
import { useChatStore, type UserProfile, type MemberRole } from "../store/chatStore";

interface RoleManagementModalProps {
  conversationId: string;
  type: "deputy" | "owner";
  onClose: () => void;
  onSuccess: () => void;
}

export default function RoleManagementModal({
  conversationId,
  type,
  onClose,
  onSuccess,
}: RoleManagementModalProps) {
  const conversations = useChatStore((s) => s.conversations);
  const me = useChatStore((s) => s.me);
  const setMemberRole = useChatStore((s) => s.setMemberRole);
  const transferOwnership = useChatStore((s) => s.transferOwnership);
  const getMemberRole = useChatStore((s) => s.getMemberRole);

  const conv = conversations.find((c) => c.id === conversationId);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  if (!conv || conv.type !== "group") return null;

  // Get members excluding current user and owner (for owner transfer)
  const availableMembers = conv.members.filter((m) => {
    if (m.id === me.id) return false;
    if (type === "owner") {
      // For owner transfer, exclude current owner
      return getMemberRole(conversationId, m.id) !== "owner";
    }
    return true;
  });

  // Filter by search
  const filteredMembers = availableMembers.filter((member) => {
    const query = searchQuery.toLowerCase();
    const memberName = member.displayName || member.full_name || '';
    return memberName.toLowerCase().includes(query);
  });

  const isDeputy = (memberId: string) =>
    getMemberRole(conversationId, memberId) === "deputy";

  const handleToggleMember = (memberId: string) => {
    if (type === "owner") {
      // For owner transfer, only one can be selected
      setSelectedMembers([memberId]);
    } else {
      // For deputy, multiple can be selected
      setSelectedMembers((prev) => {
        const isSelected = prev.includes(memberId);
        if (isSelected) {
          return prev.filter((id) => id !== memberId);
        } else {
          return [...prev, memberId];
        }
      });
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers((prev) => prev.filter((id) => id !== memberId));
  };

  const handleConfirm = () => {
    if (selectedMembers.length === 0) return;

    if (type === "owner") {
      transferOwnership(conversationId, selectedMembers[0]);
    } else {
      // Set selected members as deputies
      selectedMembers.forEach((memberId) => {
        setMemberRole(conversationId, memberId, "deputy");
      });
    }
    onSuccess();
  };

  const maxSelection = type === "owner" ? 1 : 4;
  const title =
    type === "owner"
      ? "Chuyển quyền trưởng nhóm"
      : "Điều chỉnh phó nhóm";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Member List */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                <span className="text-slate-400">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm thành viên"
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            {/* Member List */}
            <div className="flex-1 overflow-y-auto p-2">
              {filteredMembers.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                  Không tìm thấy thành viên
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const isSelected = selectedMembers.includes(member.id);
                  const isCurrentlyDeputy = isDeputy(member.id);

                  return (
                    <button
                      key={member.id}
                      onClick={() => handleToggleMember(member.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-sm font-semibold">
                        {(member.displayName || member.full_name || '?').charAt(0)}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium">
                          {member.displayName || member.full_name}
                        </div>
                        {isCurrentlyDeputy && (
                          <div className="text-xs text-slate-500">Phó nhóm</div>
                        )}
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "bg-blue-500 border-blue-500"
                            : "border-slate-300"
                        }`}
                      >
                        {isSelected && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel - Selected Members */}
          <div className="w-64 border-l border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <div className="text-sm font-semibold">
                Đã chọn {selectedMembers.length}/{maxSelection}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {selectedMembers.map((memberId) => {
                const member = conv.members.find((m) => m.id === memberId);
                if (!member) return null;
                return (
                  <div
                    key={memberId}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-semibold">
                      {(member.displayName || member.full_name || '?').charAt(0)}
                    </div>
                    <div className="flex-1 text-sm truncate">
                      {member.displayName || member.full_name}
                    </div>
                    <button
                      onClick={() => handleRemoveMember(memberId)}
                      className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center hover:bg-blue-600"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedMembers.length === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedMembers.length > 0
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

