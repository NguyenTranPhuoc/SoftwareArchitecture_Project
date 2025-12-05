// src/layouts/AppLayout.tsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import SidebarNav from "../components/SidebarNav";
import { useChatSocket } from "../hooks/useChatSocket";
import { useChatStore } from "../store/chatStore";

export type AppOutletContext = ReturnType<typeof useChatSocket>;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize socket connection once for the entire app
  const socketMethods = useChatSocket();

  // Initialize store data from backend
  const initialize = useChatStore((s) => s.initialize);
  const isLoading = useChatStore((s) => s.isLoading);

  useEffect(() => {
    console.log('[AppLayout] Initializing chat store...');
    initialize().catch((error) => {
      console.error('[AppLayout] Failed to initialize:', error);
    });
  }, [initialize]);

  return (
    <div className="h-screen flex bg-slate-100 text-slate-900">
      <SidebarNav
        currentPath={location.pathname}
        onNavigate={(path) => navigate(path)}
      />
      <div className="flex-1 flex overflow-hidden">
        <Outlet context={socketMethods} />
      </div>
    </div>
  );
}
