import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authApi } from "../services/authApi";
import { useChatStore } from "../store/chatStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register" | "verify">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const setCurrentUser = useChatStore((state) => state.setCurrentUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });

      // Handle snake_case response from auth service
      const accessToken =
        (response as any).access_token || response.accessToken;
      const refreshToken =
        (response as any).refresh_token || response.refreshToken;

      if (accessToken) {
        // Store tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken || "");

        // Decode JWT to get user info
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        const user = {
          id: payload.sub,
          email: payload.email,
          username: payload.email.split("@")[0],
          displayName: payload.email.split("@")[0],
        };

        // Store user info
        localStorage.setItem("user", JSON.stringify(user));

        // Update chat store with current user (as GroupMember)
        setCurrentUser({
          id: user.id,
          full_name: user.displayName,
          email: user.email,
          phone_number: "",
          avatar_url: undefined,
          displayName: user.displayName,
          phoneNumber: "",
          isFriend: true,
          role: "member",
        });

        navigate("/app/chats");
      }
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await authApi.register({
        email,
        password,
        username,
        displayName,
        phone_number: phoneNumber,
      });
      setError("");
      setSuccess(
        (response as any).message ||
          "Đăng ký thành công! Vui lòng nhập mã xác thực."
      );
      // Clear password for security
      setPassword("");
      // Switch to verification mode
      setMode("verify");
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Xác thực thất bại");
      }

      setSuccess("Xác thực thành công! Đang chuyển sang đăng nhập...");
      setTimeout(() => {
        setMode("login");
        setSuccess("");
        setVerificationCode("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Xác thực thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gửi lại mã thất bại");
      }

      setSuccess("Mã xác thực mới đã được gửi!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Gửi lại mã thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-xl font-bold mb-2 text-center">Zalo Clone</h1>
        <p className="text-xs text-slate-500 text-center mb-6">
          {mode === "login" && "Đăng nhập bằng email."}
          {mode === "register" && "Đăng ký tài khoản mới."}
          {mode === "verify" && "Nhập mã xác thực đã gửi đến SĐT của bạn."}
        </p>

        {mode !== "verify" && (
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
        )}

        {error && (
          <div className="mb-3 p-2 bg-red-100 text-red-600 text-xs rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-3 p-3 bg-green-100 text-green-700 text-xs rounded">
            ✅ {success}
          </div>
        )}

        {mode === "verify" ? (
          <form onSubmit={handleVerify} className="space-y-3 text-sm">
            <div>
              <label className="block mb-1 text-slate-600 text-xs">
                Mã xác thực (6 chữ số)
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                placeholder="Nhập mã 6 số"
                required
                maxLength={6}
                className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500 text-center text-2xl tracking-widest"
              />
              <p className="mt-1 text-xs text-slate-500">
                Kiểm tra SĐT: {phoneNumber || "chưa nhập"}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full mt-3 py-2 bg-blue-600 text-white rounded-md text-sm disabled:bg-blue-300"
            >
              {loading ? "Đang xác thực..." : "Xác thực"}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="w-full py-2 text-blue-600 text-xs hover:underline disabled:text-gray-400"
            >
              Gửi lại mã xác thực
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
              className="w-full py-2 text-slate-600 text-xs hover:underline"
            >
              Quay lại đăng nhập
            </button>
          </form>
        ) : (
          <form
            onSubmit={mode === "login" ? handleLogin : handleRegister}
            className="space-y-3 text-sm"
          >
            <div>
              <label className="block mb-1 text-slate-600 text-xs">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 text-slate-600 text-xs">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {mode === "register" && (
              <>
                <div>
                  <label className="block mb-1 text-slate-600 text-xs">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-600 text-xs">
                    Tên hiển thị
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-600 text-xs">
                    Số điện thoại (Tùy chọn)
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+84901234567"
                    className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Nhập SĐT để nhận mã xác thực qua SMS
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-2 bg-blue-600 text-white rounded-md text-sm disabled:bg-blue-300"
            >
              {loading
                ? "Đang xử lý..."
                : mode === "login"
                ? "Đăng nhập"
                : "Đăng ký"}
            </button>
          </form>
        )}

        <div className="mt-3 text-center text-xs text-blue-600 cursor-pointer">
          Quên mật khẩu?
        </div>
      </div>
    </div>
  );
}
