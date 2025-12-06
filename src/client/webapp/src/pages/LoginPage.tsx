import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { authApi } from "../services/authApi";
import { useChatStore } from "../store/chatStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
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
      const accessToken = (response as any).access_token || response.accessToken;
      const refreshToken = (response as any).refresh_token || response.refreshToken;
      
      if (accessToken) {
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken || '');
        
        // Decode JWT to get user info
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const user = {
          id: payload.sub,
          email: payload.email,
          username: payload.email.split('@')[0],
          displayName: payload.email.split('@')[0]
        };
        
        // Store user info
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update chat store with current user
        setCurrentUser({
          id: user.id,
          displayName: user.displayName,
          phoneNumber: '',
          isFriend: true
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
      const response = await authApi.register({ email, password, username, displayName });
      setError("");
      setSuccess((response as any).message || "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
      // Clear form
      setPassword("");
      setUsername("");
      setDisplayName("");
      // Switch to login mode after 3 seconds
      setTimeout(() => {
        setMode("login");
        setSuccess("");
      }, 5000);
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-xl font-bold mb-2 text-center">Zalo Clone</h1>
        <p className="text-xs text-slate-500 text-center mb-6">
          {mode === "login"
            ? "Đăng nhập bằng email."
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

        <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-3 text-sm">
          <div>
            <label className="block mb-1 text-slate-600 text-xs">
              Email
            </label>
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
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-2 bg-blue-600 text-white rounded-md text-sm disabled:bg-blue-300"
          >
            {loading ? "Đang xử lý..." : (mode === "login" ? "Đăng nhập" : "Đăng ký")}
          </button>
        </form>

        <div className="mt-3 text-center text-xs text-blue-600 cursor-pointer">
          Quên mật khẩu?
        </div>
      </div>
    </div>
  );
}
