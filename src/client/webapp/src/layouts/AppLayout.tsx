// src/layouts/AppLayout.tsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import SidebarNav from "../components/SidebarNav";
import { useChatSocket } from "../hooks/useChatSocket";

export type AppOutletContext = {
  sendWSMessage: ReturnType<typeof useChatSocket>["sendWSMessage"];
};

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Chỉ gọi 1 lần ở đây → 1 WS connection cho toàn /app
  const { sendWSMessage } = useChatSocket();

  return (
    <div className="h-screen flex bg-slate-100 text-slate-900">
      <SidebarNav
        currentPath={location.pathname}
        onNavigate={(path) => navigate(path)}
      />
      <div className="flex-1 flex overflow-hidden">
        <Outlet context={{ sendWSMessage }} />
      </div>
    </div>
  );
}
