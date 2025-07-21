import React, { useState } from "react";
import UserCard from "../../../components/user-card/UserCard";
import NotificationPanel from "../../../components/notifications/NotificationPanel";
import ProfileModal from "./ProfileModal";
import { LogOut, User2 } from "lucide-react";
import type { User } from "../../../types/auth";

interface MergedHeaderProps {
  user: User;
  onLogout: () => void;
}

const MergedHeader: React.FC<MergedHeaderProps> = ({ user, onLogout }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  return (
    <header className="bg-gradient-to-br from-pink-50 via-rose-50 to-white border-b border-pink-100">
      <div className="px-6 py-8">
        {/* App title and notifications row */}
        <div className="flex items-start justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight mb-2">
              Chatter
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Connect back with your friends in a simple way.
            </p>
          </div>
          <div className="absolute top-6 right-6">
            <NotificationPanel />
          </div>
        </div>

        {/* Main user info card */}
        <div className="w-full">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <UserCard user={user} />
              </div>

              <div className="flex items-center gap-3">
                {/* welcome text - might remove this later if it looks cluttered */}
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-700">
                    Welcome back!
                  </p>
                  <p className="text-xs text-gray-500">
                    Ready to chat with friends
                  </p>
                </div>

                {/* profile button - using dedicated handler function */}
                <button
                  onClick={openProfileModal}
                  className="flex items-center gap-2 px-4 py-2 bg-[#FB406C] text-white hover:bg-[#fb406cd9] rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <User2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Profile</span>
                </button>

                {/* logout - should we add a confirmation dialog? for now direct logout is fine */}
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 hover:text-[#FB406C] hover:bg-pink-50 rounded-lg border border-gray-200 hover:border-pink-200 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileModal
        user={user}
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
      />
    </header>
  );
};

export default MergedHeader;
