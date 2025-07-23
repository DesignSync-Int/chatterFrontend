import React from "react";

import type { User } from "../../types/auth";
import FriendRequestButton from "../friend-requests/FriendRequestButton";

interface EnhancedUserCardProps {
  user: User;
  onChatClick?: () => void;
  showFriendRequestButton?: boolean;
}

const EnhancedUserCard: React.FC<EnhancedUserCardProps> = ({
  user,
  onChatClick,
  showFriendRequestButton = true,
}) => {
  // Generate a color based on the user's name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-teal-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4 mb-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.profile ? (
            <img
              className="w-12 h-12 rounded-full object-cover"
              src={user.profile}
              alt={`${user.name}'s profile picture`}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const letterAvatar = e.currentTarget
                  .nextElementSibling as HTMLElement;
                if (letterAvatar) letterAvatar.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`w-12 h-12 rounded-full ${getAvatarColor(user.fullName || user.name)} flex items-center justify-center text-white font-bold text-lg ${user.profile ? "hidden" : ""}`}
          >
            {getInitials(user.fullName || user.name)}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {user.fullName || user.name}
          </h3>
          {user.fullName && user.fullName !== user.name && (
            <p className="text-sm text-gray-500 truncate">@{user.name}</p>
          )}
          {user.email && (
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          )}
        </div>
      </div>

      {/* Action Button - Moved below user info */}
      {showFriendRequestButton && (
        <div className="flex justify-center">
          <FriendRequestButton user={user} onChatClick={onChatClick} />
        </div>
      )}
    </div>
  );
};

export default EnhancedUserCard;
