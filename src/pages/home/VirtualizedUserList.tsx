import EnhancedUserCard from "../../components/user-card/EnhancedUserCard.tsx";
import { useFriendRequestStore } from "../../store/friendRequest.store.ts";
import useUserStore from "../../store/user.store.ts";
import { useChatStore } from "../../store/messages.store.ts";
import { useAuthStore } from "../../store/auth.store.ts";
import { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { Search } from "lucide-react";
import type { User } from "../../types/auth.ts";

interface VirtualizedUserListProps {
  onUserClick: (user: User) => void;
}

const VirtualizedUserList = ({ onUserClick }: VirtualizedUserListProps) => {
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentRecipient = useUserStore(
    (state) => state.setCurrentRecipient
  );
  const { getUsers, users, setSelectedUser } = useChatStore();
  const { friends, receivedRequests, sentRequests, getFriends, getReceivedRequests, getSentRequests } = useFriendRequestStore();
  const onlineUsers = useAuthStore((state) => state.onlineUsers);

  // Virtualization states
  const [searchTerm, setSearchTerm] = useState("");
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const [itemsPerRow, setItemsPerRow] = useState(5);

  // Fixed virtualization settings
  const itemHeight = 140; // Height of each user card row
  const overscan = 5; // Number of extra items to render outside viewport
  const maxUsers = 5000; // Maximum users to process at once
  const enableVirtualization = true; // Always enabled

  const containerRef = useRef<HTMLDivElement>(null);

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

  // Filter and limit users with priority sorting
  const filteredUsers = useMemo(() => {
    const allUsers =
      users?.filter((user) => user._id !== currentUser?._id) || [];

    const filtered = searchTerm.trim()
      ? allUsers.filter((user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allUsers;

    // Create sets for quick lookup
    const friendIds = new Set(friends.map((friend: any) => friend._id));
    const pendingReceivedIds = new Set(receivedRequests.map((req: any) => req.sender._id));
    const pendingSentIds = new Set(sentRequests.map((req: any) => req.receiver._id));

    // Sort users by priority: Friends > Pending Requests > Others
    const sortedUsers = filtered.sort((a, b) => {
      // Priority scoring: 3 = friends, 2 = pending requests, 1 = others
      const getPriority = (user: any) => {
        if (friendIds.has(user._id)) return 3;
        if (pendingReceivedIds.has(user._id) || pendingSentIds.has(user._id)) return 2;
        return 1;
      };

      const priorityA = getPriority(a);
      const priorityB = getPriority(b);

      // Sort by priority first, then by name within same priority
      if (priorityA !== priorityB) {
        return priorityB - priorityA; // Higher priority first
      }
      return a.name.localeCompare(b.name); // Alphabetical within same priority
    });

    // Limit users to prevent memory issues
    return sortedUsers.slice(0, maxUsers);
  }, [users, currentUser?._id, searchTerm, maxUsers, friends, receivedRequests, sentRequests]);

  // Calculate virtualization parameters
  const totalRows = Math.ceil(filteredUsers.length / itemsPerRow);
  const startRow = enableVirtualization
    ? Math.floor(scrollTop / itemHeight)
    : 0;
  const endRow = enableVirtualization
    ? Math.min(
        startRow + Math.ceil(containerHeight / itemHeight) + overscan,
        totalRows
      )
    : totalRows;

  // Get visible users
  const visibleUsers = useMemo(() => {
    if (!enableVirtualization) {
      return filteredUsers;
    }

    const startIndex = startRow * itemsPerRow;
    const endIndex = endRow * itemsPerRow;
    const visible = filteredUsers.slice(startIndex, endIndex);

    // Debug logging
    console.log("Virtualization Debug:", {
      scrollTop,
      startRow,
      endRow,
      startIndex,
      endIndex,
      totalUsers: filteredUsers.length,
      visibleCount: visible.length,
      itemsPerRow,
      containerHeight,
      itemHeight: itemHeight,
    });

    return visible;
  }, [
    filteredUsers,
    startRow,
    endRow,
    itemsPerRow,
    enableVirtualization,
    scrollTop,
    containerHeight,
    itemHeight,
  ]);

  // Calculate container dimensions and responsive grid
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newHeight = rect.height || 600;
        setContainerHeight(newHeight);

        // Calculate items per row based on container width
        const containerWidth = rect.width || 800;
        const itemWidth = 200; // Approximate width of each user card
        const gap = 16; // Gap between items
        const newItemsPerRow = Math.max(
          1,
          Math.floor((containerWidth + gap) / (itemWidth + gap))
        );
        setItemsPerRow(newItemsPerRow);

        console.log("Container dimensions updated:", {
          height: newHeight,
          width: containerWidth,
          itemsPerRow: newItemsPerRow,
        });
      }
    };

    // Initial measurement
    updateDimensions();

    // Update on window resize
    window.addEventListener("resize", updateDimensions);

    // Use ResizeObserver for more accurate container size tracking
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && "ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateDimensions);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  // Handle scroll for virtualization
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Load friend request data for sorting
  useEffect(() => {
    getFriends();
    getReceivedRequests();
    getSentRequests();
  }, [getFriends, getReceivedRequests, getSentRequests]);

  const totalHeight = enableVirtualization ? totalRows * itemHeight : "auto";
  const offsetY = enableVirtualization ? startRow * itemHeight : 0;

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* Header with search */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold">
          Users
          {filteredUsers.length > 0 && (
            <span className="text-sm text-gray-500 font-normal">
              ({filteredUsers.length}
              {filteredUsers.length >= maxUsers ? "+" : ""})
            </span>
          )}
        </h2>

        <div className="flex items-center gap-3">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Virtualized users container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
        onScroll={handleScroll}
      >
        <div
          style={{
            height: totalHeight,
            position: "relative",
          }}
        >
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: enableVirtualization ? "absolute" : "static",
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${itemsPerRow}, minmax(0, 1fr))`,
              }}
            >
              {visibleUsers.map((user) => (
                <div
                  key={user._id}
                  className="relative"
                  style={{ height: itemHeight - 16 }} // Account for gap
                >
                  <EnhancedUserCard 
                    user={user} 
                    onChatClick={() => messageUser(user)}
                  />
                  {isUserOnline(user._id) && (
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status info */}
      <div className="mt-4 text-xs text-gray-500 flex justify-between items-center flex-shrink-0">
        <span>
          Showing {visibleUsers.length} of {filteredUsers.length} users
        </span>
        {filteredUsers.length >= maxUsers && (
          <span className="text-amber-600">
            ⚠️ Showing only {maxUsers} users. Use search to find specific users.
          </span>
        )}
      </div>

      {/* No users message */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? (
            <>
              <p>No users match "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm("")}
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

export default VirtualizedUserList;
