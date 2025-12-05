import { useChatStore } from "../store/chatStore";
import { useState, useEffect } from "react";
import { userApi } from "../services/userApi";
import type { UserProfile } from "../services/userApi";

export default function ProfilePage() {
  const me = useChatStore((s) => s.me);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      
      const data = await userApi.getProfile(me.id);
      setProfile(data);
      setFullName(data.full_name || "");
      // Convert ISO date to YYYY-MM-DD format for input[type="date"]
      setDateOfBirth(data.date_of_birth ? data.date_of_birth.split('T')[0] : "");
    } catch (err: any) {
      setError(err.message || "Không thể tải thông tin");
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setError("");
      
      // Prepare update data - only include non-empty fields
      const updateData: any = {};
      if (fullName && fullName.trim()) {
        updateData.full_name = fullName.trim();
      }
      if (dateOfBirth && dateOfBirth.trim()) {
        // Convert date to ISO8601 format (YYYY-MM-DD → ISO string)
        updateData.date_of_birth = new Date(dateOfBirth).toISOString();
      }
      
      // Try to update via API
      const updated = await userApi.updateProfile(me.id, updateData);
      setProfile(updated);
      setFullName(updated.full_name || "");
      setDateOfBirth(updated.date_of_birth ? updated.date_of_birth.split('T')[0] : "");
      setIsEditing(false);
      alert("Cập nhật thành công!");
    } catch (err: any) {
      setError(err.message || "Cập nhật thất bại");
      console.error("Update error:", err);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      {loading ? (
        <div className="text-slate-500">Đang tải...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-md">
          <div className="flex flex-col items-center mb-4">
            <div className="w-20 h-20 rounded-full bg-yellow-300 mb-3" />
            <div className="font-semibold text-lg">
              {profile?.full_name || me.displayName}
            </div>
            <div className="text-xs text-slate-500 mt-1">Thông tin tài khoản</div>
          </div>

          {error && (
            <div className="mb-3 p-2 bg-red-100 text-red-600 text-xs rounded">
              {error}
            </div>
          )}

        <div className="mt-6 space-y-4 text-sm">
          {isEditing ? (
            <>
              <EditRow
                label="Họ và tên"
                value={fullName}
                onChange={setFullName}
                placeholder="Nhập họ tên"
              />
              <EditRow
                label="Ngày sinh"
                value={dateOfBirth}
                onChange={setDateOfBirth}
                type="date"
              />
            </>
          ) : (
            <>
              <InfoRow label="Họ và tên" value={profile?.full_name || "Chưa cập nhật"} />
              <InfoRow
                label="Ngày sinh"
                value={
                  profile?.date_of_birth
                    ? new Date(profile.date_of_birth).toLocaleDateString("vi-VN")
                    : "Chưa cập nhật"
                }
              />
            </>
          )}
          <InfoRow label="Email" value={profile?.email || me.displayName} />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
              >
                Lưu
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
            >
              Cập nhật
            </button>
          )}
        </div>
      </div>
      )}
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

function EditRow(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-500">{props.label}</span>
      <input
        type={props.type || "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        className="px-2 py-1 border rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}
