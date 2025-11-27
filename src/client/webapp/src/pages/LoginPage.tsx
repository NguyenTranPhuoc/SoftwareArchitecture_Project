import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div className="h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-xl font-bold mb-2 text-center">Zalo Clone</h1>
        <p className="text-xs text-slate-500 text-center mb-6">
          {mode === "login"
            ? "Đăng nhập bằng số điện thoại hoặc email."
            : "Đăng ký tài khoản mới."}
        </p>

        <div className="flex mb-4 border rounded-full overflow-hidden text-sm">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 ${
              mode === "login" ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 ${
              mode === "register" ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            Đăng ký
          </button>
        </div>

        <form className="space-y-3 text-sm">
          <div>
            <label className="block mb-1 text-slate-600 text-xs">
              Số điện thoại hoặc email
            </label>
            <input
              className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-slate-600 text-xs">
              Mật khẩu
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {mode === "register" && (
            <div className="text-xs text-slate-500">
              Hệ thống sẽ gửi mã xác thực qua SMS hoặc email (mock sau).
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate("/app/chats")}
            className="w-full mt-3 py-2 bg-blue-600 text-white rounded-md text-sm"
          >
            {mode === "login" ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>

        <div className="mt-3 text-center text-xs text-blue-600 cursor-pointer">
          Quên mật khẩu?
        </div>
      </div>
    </div>
  );
}
