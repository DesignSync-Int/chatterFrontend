import UserCard from "../../components/user-card/UserCard.tsx";
import useUserStore from "../../store/user.store.ts";
import { useChatStore } from "../../store/messages.store.ts";
import { useAuthStore } from "../../store/auth.store.ts";
import { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { Search, Settings } from "lucide-react";
import type { User } from "../../types/auth.ts";

interface VirtualizedUserListProps {
  onUserClick: (user: User) => void;
}

const VirtualizedUserList = ({ onUserClick }: VirtualizedUserListProps) => {
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentRecipient = useUserStore((state) => state.setCurrentRecipient);
  const { getUsers, users, setSelectedUser } = useChatStore();
  const onlineUsers = useAuthStore((state) => state.onlineUsers);

  // Virtualization states
  const [searchTerm, setSearchTerm] = useState("");
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const [itemsPerRow, setItemsPerRow] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  
  // Performance settings (optimized defaults)
  const [settings, setSettings] = useState({
    itemHeight: 140, // Height of each user card row
    overscan: 5, // Number of extra items to render outside viewport
    maxUsers: 5000, // Maximum users to process at once (increased default)
    enableVirtualization: true, // Always enabled now
  });

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

  // Filter and limit users
  const filteredUsers = useMemo(() => {
    const allUsers = users?.filter((user) => user._id !== currentUser?._id) || [];
    
    const filtered = searchTerm.trim()
      ? allUsers.filter((user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allUsers;

    // Limit users to prevent memory issues
    return filtered.slice(0, settings.maxUsers);
  }, [users, currentUser?._id, searchTerm, settings.maxUsers]);

  // Calculate virtualization parameters
  const totalRows = Math.ceil(filteredUsers.length / itemsPerRow);
  const startRow = settings.enableVirtualization 
    ? Math.floor(scrollTop / settings.itemHeight)
    : 0;
  const endRow = settings.enableVirtualization
    ? Math.min(startRow + Math.ceil(containerHeight / settings.itemHeight) + settings.overscan, totalRows)
    : totalRows;

  // Get visible users
  const visibleUsers = useMemo(() => {
    if (!settings.enableVirtualization) {
      return filteredUsers;
    }

    const startIndex = startRow * itemsPerRow;
    const endIndex = endRow * itemsPerRow;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, startRow, endRow, itemsPerRow, settings.enableVirtualization]);

  // Calculate container dimensions and responsive grid
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerHeight(rect.height || 600);
        
        // Calculate items per row based on container width
        const containerWidth = rect.width || 800;
        const itemWidth = 200; // Approximate width of each user card
        const gap = 16; // Gap between items
        const newItemsPerRow = Math.max(1, Math.floor((containerWidth + gap) / (itemWidth + gap)));
        setItemsPerRow(newItemsPerRow);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Handle scroll for virtualization
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const totalHeight = settings.enableVirtualization ? totalRows * settings.itemHeight : 'auto';
  const offsetY = settings.enableVirtualization ? startRow * settings.itemHeight : 0;

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* Header with search and settings */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold">
          Users 
          {filteredUsers.length > 0 && (
            <span className="text-sm text-gray-500 font-normal">
              ({filteredUsers.length}{filteredUsers.length >= settings.maxUsers ? '+' : ''})
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

          {/* Settings button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Display Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border flex-shrink-0">
          <h3 className="text-sm font-semibold mb-3">Display Settings</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Max Users to Load</label>
              <input
                type="number"
                value={settings.maxUsers}
                onChange={(e) => setSettings(prev => ({ ...prev, maxUsers: Number(e.target.value) }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                min="100"
                max="10000"
                step="100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Item Height</label>
              <input
                type="number"
                value={settings.itemHeight}
                onChange={(e) => setSettings(prev => ({ ...prev, itemHeight: Number(e.target.value) }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                min="100"
                max="300"
                step="10"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Overscan</label>
              <input
                type="number"
                value={settings.overscan}
                onChange={(e) => setSettings(prev => ({ ...prev, overscan: Number(e.target.value) }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                min="0"
                max="20"
              />
            </div>
          </div>
        </div>
      )}

      {/* Virtualized users container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto"
        onScroll={handleScroll}
      >
        <div 
          style={{ 
            height: totalHeight,
            position: 'relative'
          }}
        >
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: settings.enableVirtualization ? 'absolute' : 'static',
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
                  className="relative bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  onClick={() => messageUser(user)}
                  style={{ height: settings.itemHeight - 16 }} // Account for gap
                >
                  <UserCard user={user} />
                  {isUserOnline(user._id) && (
                    <div className="mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium text-center">
                      <span className="text-green-500">●</span> Online
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
        {filteredUsers.length >= settings.maxUsers && (
          <span className="text-amber-600">
            ⚠️ Showing only {settings.maxUsers} users. Use search to find specific users.
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
