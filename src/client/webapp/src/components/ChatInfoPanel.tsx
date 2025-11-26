import { useState } from "react";
import { useChatStore } from "../store/chatStore";
import AddMemberModal from "./AddMemberModal";
import MemberList from "./MemberList";
import ManageGroup from "./ManageGroup";
import OwnerDeputyManagement from "./OwnerDeputyManagement";
import RoleManagementModal from "./RoleManagementModal";

type InfoPanelView = "info" | "members" | "manage" | "owner-deputy";

export default function ChatInfoPanel() {
  const { conversations, selectedConversationId } = useChatStore();
  const conv = conversations.find((c) => c.id === selectedConversationId);
  const [view, setView] = useState<InfoPanelView>("info");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleModalType, setRoleModalType] = useState<"deputy" | "owner">(
    "deputy"
  );

  if (!conv) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
        Thông tin hội thoại
      </div>
    );
  }

  const isGroup = conv.type === "group";

  // Handle view changes
  if (view === "members") {
    return (
      <>
        <MemberList
          conversationId={conv.id}
          onBack={() => setView("info")}
          onManageGroup={() => setView("manage")}
        />
        {isRoleModalOpen && (
          <RoleManagementModal
            conversationId={conv.id}
            type={roleModalType}
            onClose={() => setIsRoleModalOpen(false)}
            onSuccess={() => setIsRoleModalOpen(false)}
          />
        )}
      </>
    );
  }

  if (view === "manage") {
    return (
      <>
        <ManageGroup
          conversationId={conv.id}
          onBack={() => setView("info")}
          onOpenRoleModal={() => setView("owner-deputy")}
        />
        {isRoleModalOpen && (
          <RoleManagementModal
            conversationId={conv.id}
            type={roleModalType}
            onClose={() => setIsRoleModalOpen(false)}
            onSuccess={() => setIsRoleModalOpen(false)}
          />
        )}
      </>
    );
  }

  if (view === "owner-deputy") {
    return (
      <>
        <OwnerDeputyManagement
          conversationId={conv.id}
          onBack={() => setView("manage")}
          onOpenRoleModal={(type) => {
            setRoleModalType(type);
            setIsRoleModalOpen(true);
          }}
        />
        {isRoleModalOpen && (
          <RoleManagementModal
            conversationId={conv.id}
            type={roleModalType}
            onClose={() => setIsRoleModalOpen(false)}
            onSuccess={() => setIsRoleModalOpen(false)}
          />
        )}
      </>
    );
  }

  // Default info view
  return (
    <div className="h-full flex flex-col border-l border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="w-16 h-16 rounded-full bg-slate-300 mx-auto mb-2" />
        <div className="text-center font-semibold text-sm">{conv.name}</div>
        <div className="text-center text-xs text-slate-400">
          {isGroup ? "Nhóm" : "Tin nhắn 1-1"}
        </div>

        <div className="mt-3 flex justify-center gap-2 text-xs">
          <button className="px-3 py-1 border rounded-full">
            Tắt thông báo
          </button>
          <button className="px-3 py-1 border rounded-full">
            Ghim hội thoại
          </button>
          {isGroup && (
            <>
              <button
                onClick={() => setIsAddMemberOpen(true)}
                className="px-3 py-1 border rounded-full"
                title="Thêm thành viên"
              >
                👤+
              </button>
              <button
                onClick={() => setView("manage")}
                className="px-3 py-1 border rounded-full"
                title="Quản lý nhóm"
              >
                ⚙️
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto text-sm">
        {isGroup ? (
          <>
            {/* Group Members Section */}
            <Section
              title={`Thành viên nhóm`}
              onClick={() => setView("members")}
              clickable
            >
              <div className="flex items-center gap-2">
                <span>👥</span>
                <span>{conv.members.length} thành viên</span>
              </div>
            </Section>

            {/* Group News Feed */}
            <Section title="Bảng tin nhóm">
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span>🕐</span>
                  <span>Danh sách nhắc hẹn</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📄</span>
                  <span>Ghi chú, ghim, bình chọn</span>
                </div>
              </div>
            </Section>

            {/* Photos/Videos */}
            <Section title="Ảnh/Video">
              <div className="text-xs text-slate-400">
                Chưa có Ảnh/Video được chia sẻ từ sau 15/11/2025
              </div>
            </Section>

            {/* Files */}
            <Section title="File">
              <div className="text-xs text-slate-400">
                Chưa có File được chia sẻ từ sau 15/11/2025
              </div>
            </Section>

            {/* Links */}
            <Section title="Link">
              <div className="text-xs text-slate-400">
                Chưa có Link được chia sẻ từ sau 15/11/2025
              </div>
            </Section>

            {/* Security Settings */}
            <Section title="Thiết lập bảo mật">
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between">
                  <span>Tin nhắn tự xoá</span>
                  <span>Không bao giờ</span>
                </div>
                <div className="flex justify-between">
                  <span>Ẩn trò chuyện</span>
                  <span>Off</span>
                </div>
              </div>
            </Section>
          </>
        ) : (
          <>
            {/* Direct conversation sections */}
            <Section title="Ảnh/Video">
              <div className="text-xs text-slate-400">
                Chưa có Ảnh/Video được chia sẻ
              </div>
            </Section>

            <Section title="File">
              <div className="text-xs text-slate-400">
                Chưa có File được chia sẻ
              </div>
            </Section>

            <Section title="Link">
              <div className="text-xs text-slate-400">
                Chưa có Link được chia sẻ
              </div>
            </Section>

            <Section title="Thiết lập bảo mật">
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between">
                  <span>Tin nhắn tự xoá</span>
                  <span>Không bao giờ</span>
                </div>
                <div className="flex justify-between">
                  <span>Ẩn trò chuyện</span>
                  <span>Off</span>
                </div>
              </div>
            </Section>
          </>
        )}
      </div>

      {/* Modals */}
      {isAddMemberOpen && (
        <AddMemberModal
          conversationId={conv.id}
          onClose={() => setIsAddMemberOpen(false)}
          onSuccess={() => setIsAddMemberOpen(false)}
        />
      )}

      {isRoleModalOpen && (
        <RoleManagementModal
          conversationId={conv.id}
          type={roleModalType}
          onClose={() => setIsRoleModalOpen(false)}
          onSuccess={() => setIsRoleModalOpen(false)}
        />
      )}
    </div>
  );
}

function Section({
  title,
  children,
  onClick,
  clickable,
}: {
  title: string;
  children: React.ReactNode;
  onClick?: () => void;
  clickable?: boolean;
}) {
  return (
    <div
      className={`border-b border-slate-100 px-4 py-3 ${
        clickable ? "cursor-pointer hover:bg-slate-50" : ""
      }`}
      onClick={onClick}
    >
      <div className="font-semibold text-xs mb-2 flex items-center justify-between">
        <span>{title}</span>
        {clickable && <span className="text-slate-400">›</span>}
      </div>
      {children}
    </div>
  );
}
