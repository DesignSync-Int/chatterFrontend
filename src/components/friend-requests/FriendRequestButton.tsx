import React, { useState, useEffect } from 'react';
import { UserPlus, MessageCircle } from 'lucide-react';
import { useFriendRequestStore } from '../../store/friendRequest.store';
import type { FriendshipStatus } from '../../types/friendRequest';
import type { User } from '../../types/auth';

interface FriendRequestButtonProps {
  user: User;
  onChatClick?: () => void;
}

const FriendRequestButton: React.FC<FriendRequestButtonProps> = ({ user, onChatClick }) => {
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus | null>(null);
  const [message, setMessage] = useState('');
  const [showMessageInput, setShowMessageInput] = useState(false);
  
  const {
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    checkFriendshipStatus,
    isLoading,
  } = useFriendRequestStore();

  useEffect(() => {
    const loadFriendshipStatus = async () => {
      const status = await checkFriendshipStatus(user._id);
      setFriendshipStatus(status);
    };
    
    loadFriendshipStatus();
  }, [user._id, checkFriendshipStatus]);

  const handleSendRequest = async () => {
    try {
      await sendFriendRequest(user._id, message);
      setMessage('');
      setShowMessageInput(false);
      // Refresh status
      const status = await checkFriendshipStatus(user._id);
      setFriendshipStatus(status);
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  const handleAcceptRequest = async () => {
    if (friendshipStatus?.requestId) {
      try {
        await acceptFriendRequest(friendshipStatus.requestId);
        // Refresh status
        const status = await checkFriendshipStatus(user._id);
        setFriendshipStatus(status);
      } catch (error) {
        console.error('Failed to accept friend request:', error);
      }
    }
  };

  const handleDeclineRequest = async () => {
    if (friendshipStatus?.requestId) {
      try {
        await declineFriendRequest(friendshipStatus.requestId);
        // Refresh status
        const status = await checkFriendshipStatus(user._id);
        setFriendshipStatus(status);
      } catch (error) {
        console.error('Failed to decline friend request:', error);
      }
    }
  };

  if (!friendshipStatus) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  // If they are friends, show chat button
  if (friendshipStatus.status === 'friends') {
    return (
      <button
        onClick={onChatClick}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <MessageCircle className="h-4 w-4" />
        <span>Chat</span>
      </button>
    );
  }

  // If there's a pending request
  if (friendshipStatus.status === 'pending') {
    if (friendshipStatus.requestType === 'sent') {
      return (
        <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
          Request Sent
        </span>
      );
    } else {
      // Received request
      return (
        <div className="flex space-x-2">
          <button
            onClick={handleAcceptRequest}
            disabled={isLoading}
            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm"
          >
            Accept
          </button>
          <button
            onClick={handleDeclineRequest}
            disabled={isLoading}
            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm"
          >
            Decline
          </button>
        </div>
      );
    }
  }

  // No relationship - show add friend button
  return (
    <div className="space-y-2">
      {!showMessageInput ? (
        <button
          onClick={() => setShowMessageInput(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Friend</span>
        </button>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Add a message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            maxLength={100}
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSendRequest}
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
            >
              {isLoading ? 'Sending...' : 'Send Request'}
            </button>
            <button
              onClick={() => {
                setShowMessageInput(false);
                setMessage('');
              }}
              className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendRequestButton;
