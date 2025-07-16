import React, { useState, useEffect } from 'react';
import { UserPlus, MessageCircle } from 'lucide-react';
import { useFriendRequestStore } from '../../store/friendRequest.store';
import AddFriendDialog from "./AddFriendDialog";
import type { FriendshipStatus } from '../../types/friendRequest';
import type { User } from '../../types/auth';

interface FriendRequestButtonProps {
  user: User;
  onChatClick?: () => void;
}

// this component handles all the different friend request states
// TODO: might want to refactor this later if it gets too complex
const FriendRequestButton: React.FC<FriendRequestButtonProps> = ({ user, onChatClick }) => {
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus | null>(null);
  const [showAddFriendDialog, setShowAddFriendDialog] = useState(false);

  const {
    acceptFriendRequest,
    declineFriendRequest,
    checkFriendshipStatus,
    isLoading,
  } = useFriendRequestStore();

  // load the current friendship status when component mounts or user changes
  useEffect(() => {
    async function loadStatus() {
      const status = await checkFriendshipStatus(user._id);
      setFriendshipStatus(status);
    }
    
    loadStatus();
  }, [user._id, checkFriendshipStatus]);

  // close dialog and refresh status - this pattern is repeated so maybe extract it?
  const handleDialogClose = async () => {
    setShowAddFriendDialog(false);
    const updatedStatus = await checkFriendshipStatus(user._id);
    setFriendshipStatus(updatedStatus);
  };

  // accept friend request handler
  const handleAcceptRequest = async () => {
    if (!friendshipStatus?.requestId) return;
    
    try {
      await acceptFriendRequest(friendshipStatus.requestId);
      // refresh the status after accepting
      const newStatus = await checkFriendshipStatus(user._id);
      setFriendshipStatus(newStatus);
    } catch (error) {
      // should probably show user-friendly error message here
      console.error("Failed to accept friend request:", error);
    }
  };

  // decline request handler
  const handleDeclineRequest = async () => {
    if (!friendshipStatus?.requestId) return;
    
    try {
      await declineFriendRequest(friendshipStatus.requestId);
      const status = await checkFriendshipStatus(user._id);
      setFriendshipStatus(status);
    } catch (error) {
      console.error("Failed to decline friend request:", error);
    }
  };

  // show loading skeleton while checking status
  if (!friendshipStatus) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  // they're already friends - show chat option
  if (friendshipStatus.status === "friends") {
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

  // handle pending requests
  if (friendshipStatus.status === "pending") {
    // we sent the request to them
    if (friendshipStatus.requestType === "sent") {
      return (
        <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
          Request Sent
        </span>
      );
    } else {
      // they sent request to us - show accept/decline buttons
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
    <>
      <button
        onClick={() => setShowAddFriendDialog(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <UserPlus className="h-4 w-4" />
        <span>Add Friend</span>
      </button>

      <AddFriendDialog
        user={user}
        isOpen={showAddFriendDialog}
        onClose={handleDialogClose}
      />
    </>
  );
};

export default FriendRequestButton;
