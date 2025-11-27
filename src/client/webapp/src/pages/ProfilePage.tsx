import { useChatStore } from "../store/chatStore";

export default function ProfilePage() {
  const me = useChatStore((s) => s.me);

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-md">
        <div className="flex flex-col items-center mb  -4">
          <div className="w-20 h-20 rounded-full bg-yellow-300 mb-3" />
          <div className="font-semibold text-lg">{me.displayName}</div>
          <div className="text-xs text-slate-500 mt-1">Thông tin tài khoản</div>
        </div>

        <div className="mt-6 space-y-4 text-sm">
          <InfoRow label="Giới tính" value="Nữ" />
          <InfoRow label="Ngày sinh" value="23 tháng 08, 2004" />
          <InfoRow label="Điện thoại" value={me.phoneNumber ?? ""} />
          <InfoRow label="Email" value="example@email.com" />
        </div>

        <div className="mt-6 flex justify-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow(props: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{props.label}</span>
      <span>{props.value}</span>
    </div>
  );
}
