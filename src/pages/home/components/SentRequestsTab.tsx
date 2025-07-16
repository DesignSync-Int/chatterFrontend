import React, { useEffect } from 'react';
import { Clock, X } from 'lucide-react';
import { useFriendRequestStore } from '../../../store/friendRequest.store';
import type { FriendRequest } from '../../../types/friendRequest';

const SentRequestsTab: React.FC = () => {
  const {
    sentRequests,
    isLoading,
    getSentRequests,
    declineFriendRequest,
  } = useFriendRequestStore();

  useEffect(() => {
    getSentRequests();
  }, [getSentRequests]);

  const handleCancel = async (requestId: string) => {
    if (window.confirm('Are you sure you want to cancel this friend request?')) {
      try {
        await declineFriendRequest(requestId);
      } catch (error) {
        console.error('Failed to cancel friend request:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span>Loading sent requests...</span>
        </div>
      </div>
    );
  }

  if (sentRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No sent requests</h3>
        <p className="text-gray-500">You haven't sent any friend requests yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sent Requests ({sentRequests.length})
      </h3>
      {sentRequests.map((request: FriendRequest) => (
        <div
          key={request._id}
          className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                {request.receiver.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{request.receiver.name}</p>
                <p className="text-sm text-gray-500">Request Pending</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Clock className="w-3 h-3 mr-1" />
                Pending
              </span>
              <button
                onClick={() => handleCancel(request._id)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SentRequestsTab;
