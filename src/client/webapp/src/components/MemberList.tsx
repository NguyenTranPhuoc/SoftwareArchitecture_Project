import { useState } from "react";
import { useChatStore, type MemberRole } from "../store/chatStore";
import AddMemberModal from "./AddMemberModal";

interface MemberListProps {
  conversationId: string;
  onBack: () => void;
  onManageGroup: () => void;
}

export default function MemberList({
  conversationId,
  onBack,
  onManageGroup,
}: MemberListProps) {
  const conversations = useChatStore((s) => s.conversations);
  const me = useChatStore((s) => s.me);
  const removeMember = useChatStore((s) => s.removeMember);
  const setMemberRole = useChatStore((s) => s.setMemberRole);
  const getMemberRole = useChatStore((s) => s.getMemberRole);
  const isGroupOwner = useChatStore((s) => s.isGroupOwner);

  const conv = conversations.find((c) => c.id === conversationId);
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  if (!conv || conv.type !== "group") return null;

  const owner = isGroupOwner(conversationId);

  const getRoleLabel = (role: MemberRole): string => {
    switch (role) {
      case "owner":
        return "Trưởng nhóm";
      case "deputy":
        return "Phó nhóm";
      default:
        return "";
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (window.confirm("Bạn có chắc muốn xóa thành viên này khỏi nhóm?")) {
      removeMember(conversationId, memberId);
      setMenuOpenFor(null);
    }
  };

  const handleAddDeputy = (memberId: string) => {
    setMemberRole(conversationId, memberId, "deputy");
    setMenuOpenFor(null);
  };

  const handleRemoveDeputy = (memberId: string) => {
    setMemberRole(conversationId, memberId, "member");
    setMenuOpenFor(null);
  };

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
        <h2 className="text-lg font-semibold flex-1">Thành viên</h2>
      </div>

      {/* Add Member Button */}
      <div className="p-4 border-b border-slate-200">
        <button
          onClick={() => setIsAddMemberOpen(true)}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium flex items-center justify-center gap-2"
        >
          <span>👤+</span>
          <span>Thêm thành viên</span>
        </button>
      </div>

      {/* Member List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-semibold">
            Danh sách thành viên ({conv.members.length})
          </div>
          {owner && (
            <button className="text-slate-400 hover:text-slate-600">⋯</button>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {conv.members.map((member) => {
            const role = getMemberRole(conversationId, member.id);
            const isMe = member.id === me.id;
            const canManage = owner && !isMe && role !== "owner";
            const showMenu = menuOpenFor === member.id;

            return (
              <div
                key={member.id}
                className="relative p-4 hover:bg-slate-50"
                onMouseEnter={() => setHoveredMemberId(member.id)}
                onMouseLeave={() => {
                  if (!showMenu) setHoveredMemberId(null);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-sm font-semibold relative">
                    {member.displayName.charAt(0)}
                    {isMe && role === "owner" && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-[8px]">
                        🔒
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {isMe ? "Bạn" : member.displayName}
                    </div>
                    {role !== "member" && (
                      <div className="text-xs text-slate-500">
                        {getRoleLabel(role)}
                      </div>
                    )}
                  </div>
                  {canManage && hoveredMemberId === member.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenFor(showMenu ? null : member.id);
                      }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ⋯
                    </button>
                  )}
                </div>

                {/* Dropdown Menu */}
                {showMenu && canManage && (
                  <div className="absolute right-4 top-12 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[180px]">
                    {role === "deputy" ? (
                      <button
                        onClick={() => handleRemoveDeputy(member.id)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        Gỡ phó nhóm
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddDeputy(member.id)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        Thêm phó nhóm
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 text-red-600"
                    >
                      Xóa khỏi nhóm
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <AddMemberModal
          conversationId={conversationId}
          onClose={() => setIsAddMemberOpen(false)}
          onSuccess={() => setIsAddMemberOpen(false)}
        />
      )}
    </div>
  );
}

