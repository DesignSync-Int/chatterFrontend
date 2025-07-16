import LazyUserCard from "../../components/lazy-user-card/LazyUserCard.tsx";
import { useFriendRequestStore } from "../../store/friendRequest.store.ts";
import useUserStore from "../../store/user.store.ts";
import { useChatStore } from "../../store/messages.store.ts";
import { useAuthStore } from "../../store/auth.store.ts";
import { useEffect, useCallback, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { User } from "../../types/auth.ts";

interface LazyLoadUserListProps {
  onUserClick: (user: User) => void;
}

const LazyLoadUserList = ({ onUserClick }: LazyLoadUserListProps) => {
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentRecipient = useUserStore(
    (state) => state.setCurrentRecipient
  );
  const {
    getUsers,
    users,
    setSelectedUser,
    searchUsers,
    isUsersLoading,
    totalUsers,
  } = useChatStore();
  const {
    friends,
    receivedRequests,
    sentRequests,
    getFriends,
    getReceivedRequests,
    getSentRequests,
  } = useFriendRequestStore();
  const onlineUsers = useAuthStore((state) => state.onlineUsers);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounceTimer, setSearchDebounceTimer] =
    useState<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);

      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }

      const timer = setTimeout(() => {
        searchUsers(value);
      }, 300);

      setSearchDebounceTimer(timer);
    },
    [searchUsers, searchDebounceTimer]
  );

  const messageUser = useCallback(
    (user: User) => {
      if (user) {
        setCurrentRecipient(user);
        setSelectedUser({
          _id: user._id,
          name: user.name,
        });
        onUserClick(user);
      }
    },
    [setCurrentRecipient, setSelectedUser, onUserClick]
  );

  const isUserOnline = useCallback(
    (userId: string) => {
      return onlineUsers.includes(userId);
    },
    [onlineUsers]
  );

  const filteredUsers = useMemo(() => {
    const allUsers =
      users?.filter((user) => user._id !== currentUser?._id) || [];

    const friendIds = new Set(friends.map((friend: any) => friend._id));
    const pendingReceivedIds = new Set(
      receivedRequests.map((req: any) => req.sender._id)
    );
    const pendingSentIds = new Set(
      sentRequests.map((req: any) => req.receiver._id)
    );

    const sortedUsers = allUsers.sort((a, b) => {
      const getPriority = (user: any) => {
        if (friendIds.has(user._id)) return 3;
        if (pendingReceivedIds.has(user._id) || pendingSentIds.has(user._id))
          return 2;
        return 1;
      };

      const priorityA = getPriority(a);
      const priorityB = getPriority(b);

      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }
      return a.name.localeCompare(b.name);
    });

    return sortedUsers;
  }, [users, currentUser?._id, friends, receivedRequests, sentRequests]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

  // Load friend request data for sorting
  useEffect(() => {
    getFriends();
    getReceivedRequests();
    getSentRequests();
  }, [getFriends, getReceivedRequests, getSentRequests]);

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold">
          Users
          {filteredUsers.length > 0 && (
            <span className="text-sm text-gray-500 font-normal">
              ({filteredUsers.length})
              <span className="text-xs text-blue-600 ml-1">• Lazy loaded</span>
            </span>
          )}
        </h2>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {isUsersLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredUsers.map((user) => (
            <LazyUserCard
              key={user._id}
              user={user}
              onChatClick={() => messageUser(user)}
              isOnline={isUserOnline(user._id)}
              rootMargin="100px"
            />
          ))}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 flex justify-between items-center flex-shrink-0">
        <span>
          Showing {filteredUsers.length} users
          <span className="text-green-600 ml-2">
            • Lazy loading enabled (renders only visible tiles)
          </span>
        </span>
        <span>Total: {totalUsers} users</span>
      </div>

      {filteredUsers.length === 0 && !isUsersLoading && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? (
            <>
              <p>No users match "{searchTerm}"</p>
              <button
                onClick={() => handleSearchChange("")}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear search
              </button>
            </>
          ) : (
            <p>No users found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LazyLoadUserList;
