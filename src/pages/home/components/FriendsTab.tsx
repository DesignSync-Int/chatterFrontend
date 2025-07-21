import React, { useEffect } from 'react';
import { Users, MessageCircle, Trash2 } from 'lucide-react';
import { useFriendRequestStore } from '../../../store/friendRequest.store';
import { useChatWindowsStore } from '../../../store/chatWindows.store';
import type { User } from '../../../types/auth';

interface Friend {
  _id: string;
  name: string;
  profile?: string;
}

const FriendsTab: React.FC = () => {
  const {
    friends,
    isLoading,
    getFriends,
    removeFriend,
  } = useFriendRequestStore();

  const { openChat } = useChatWindowsStore();

  useEffect(() => {
    getFriends();
  }, [getFriends]);

  const handleRemoveFriend = async (friendId: string) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      try {
        await removeFriend(friendId);
      } catch (error) {
        console.error('Failed to remove friend:', error);
      }
    }
  };

  const handleStartChat = (friend: Friend) => {
    // Convert friend to User type for the chat
    const user: User = {
      _id: friend._id,
      name: friend.name,
      profile: friend.profile,
    };
    openChat(user);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span>Loading friends...</span>
        </div>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No friends yet</h3>
        <p className="text-gray-500">Start by sending friend requests to other users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Your Friends ({friends.length})
      </h3>
      {friends.map((friend: Friend) => (
        <div
          key={friend._id}
          className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#FB406C] rounded-full flex items-center justify-center text-white font-semibold">
                {friend.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{friend.name}</p>
                <p className="text-sm text-gray-500">Friend</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleStartChat(friend)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Chat
              </button>
              <button
                onClick={() => handleRemoveFriend(friend._id)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendsTab;
