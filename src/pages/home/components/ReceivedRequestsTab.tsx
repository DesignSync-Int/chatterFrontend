import { Check, X, Clock } from "lucide-react";
import React, { useEffect } from "react";

import { useFriendRequestStore } from "../../../store/friendRequest.store";
import type { FriendRequest } from "../../../types/friendRequest";

const ReceivedRequestsTab: React.FC = () => {
  const {
    receivedRequests,
    isLoading,
    getReceivedRequests,
    acceptFriendRequest,
    declineFriendRequest,
  } = useFriendRequestStore();

  useEffect(() => {
    getReceivedRequests();
  }, [getReceivedRequests]);

  const handleAccept = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await declineFriendRequest(requestId);
    } catch (error) {
      console.error("Failed to decline friend request:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FB406C]"></div>
          <span>Loading received requests...</span>
        </div>
      </div>
    );
  }

  if (receivedRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No pending requests
        </h3>
        <p className="text-gray-500">
          You don't have any pending friend requests.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Received Requests ({receivedRequests.length})
      </h3>
      {receivedRequests.map((request: FriendRequest) => (
        <div
          key={request._id}
          className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#FB406C] rounded-full flex items-center justify-center text-white font-semibold">
                {request.sender.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {request.sender.name}
                </p>
                <p className="text-sm text-gray-500">Friend Request</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleAccept(request._id)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-[#FB406C] hover:bg-[#fb406cd9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FB406C]"
              >
                <Check className="w-4 h-4 mr-1" />
                Accept
              </button>
              <button
                onClick={() => handleDecline(request._id)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <X className="w-4 h-4 mr-1" />
                Decline
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReceivedRequestsTab;
