import useUserStore from "../../store/user.store.ts";
import PerformanceTestPanel from "../../components/developer/PerformanceTestPanel.tsx";
import { useAuthStore } from "../../store/auth.store.ts";
import usePageStore from "../../store/page.store.ts";
import FloatingChatManager from "../chat/components/FloatingChatManager.tsx";
import { useChatWindowsStore } from "../../store/chatWindows.store";
import MergedHeader from "./components/MergedHeader.tsx";
import TabNavigation from "./components/TabNavigation.tsx";
import ContentArea from "./components/ContentArea.tsx";
import type { User } from "../../types/auth.ts";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Home = () => {
  const [activeTab, setActiveTab] = useState<
    "users" | "received" | "sent" | "friends"
  >("users");
  const currentUser = useUserStore((state) => state.currentUser);
  const authUser = useAuthStore((state) => state.authUser);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const setCurrentPage = usePageStore((state) => state.setCurrentPage);
  const resetCurrentUser = useUserStore((state) => state.resetCurrentUser);
  const { logout, checkAuth } = useAuthStore();
  const openChat = useChatWindowsStore((state) => state.openChat);
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser && !currentUser) {
      console.log("Home: Setting currentUser from authUser");
      setCurrentUser(authUser);

      const { connectSocket } = useAuthStore.getState();
      connectSocket();
    } else if (!authUser && !currentUser) {
      console.log("Home: No user found, checking auth...");
      checkAuth();
    }
  }, [authUser, currentUser, setCurrentUser, checkAuth]);

  const displayUser = currentUser || authUser;

  if (isCheckingAuth && !authUser && !currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span>Loading your account...</span>
        </div>
      </div>
    );
  }

  if (!isCheckingAuth && !displayUser) {
    navigate("/");
    return null;
  }

  const handleLogout = async () => {
    try {
      console.log("Starting logout from Home component");

      await logout();

      resetCurrentUser();

      setCurrentPage("login");

      navigate("/", { replace: true });

      console.log("Logout completed from Home component");
    } catch (error) {
      console.error("Error during logout:", error);

      resetCurrentUser();
      setCurrentPage("login");
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {displayUser && (
        <MergedHeader user={displayUser} onLogout={handleLogout} />
      )}

      <main className="p-6 flex-grow flex flex-col gap-6">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <ContentArea
          activeTab={activeTab}
          onUserClick={(user: User) => openChat(user)}
        />
      </main>

      <FloatingChatManager />
      <PerformanceTestPanel />
    </div>
  );
};

export default Home;
