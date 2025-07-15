import React from 'react';
import UserCard from "../../../components/user-card/UserCard";
import type { User } from "../../../types/auth";

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
  return (
    <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-2">
        <UserCard user={user} />
        <div className="text-sm text-gray-500">Currently logged in</div>
        <div className="flex-grow text-right flex gap-2 items-center justify-end">
          <button
            className="text-sm text-blue-500 hover:underline"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </section>
  );
};

export default UserProfile;
