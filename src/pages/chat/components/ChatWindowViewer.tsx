import React from "react";

import { useDraggable } from "../../../hooks/useDraggable";
import { useChatWindowsStore } from "../../../store/chatWindows.store";
import { useUserStore } from "../../../store/user.store";
import type { User } from "../../../types/auth.ts";

import ChatTab from "./chat-tab/ChatTab";

interface ChatWindowProps {
  user: User;
  index: number;
  hidden?: boolean;
}

const ChatWindow = ({ user, index, hidden }: ChatWindowProps) => {
  const { closeChat, toggleMinimize } = useChatWindowsStore();
  const setCurrentRecipient = useUserStore((s) => s.setCurrentRecipient);

  // Initialize draggable with initial position based on index
  // Position windows in bottom-right corner with queue spacing
  const initialPosition = React.useMemo(() => {
    const CHAT_WIDTH = 320; // w-80 = 320px
    const CHAT_HEIGHT = 384; // h-96 = 384px
    const BOTTOM_MARGIN = 16; // Distance from bottom
    const RIGHT_MARGIN = 16; // Distance from right edge
    const QUEUE_SPACING = 340; // Space between windows (width + gap)

    // Calculate x position, ensuring it doesn't go off-screen
    const desiredX =
      window.innerWidth - RIGHT_MARGIN - QUEUE_SPACING * (index + 1);
    const minX = 0;
    const maxX = window.innerWidth - CHAT_WIDTH;

    // Calculate y position, ensuring it stays at bottom
    const desiredY = window.innerHeight - CHAT_HEIGHT - BOTTOM_MARGIN;
    const minY = 0;
    const maxY = window.innerHeight - CHAT_HEIGHT;

    return {
      x: Math.max(minX, Math.min(desiredX, maxX)),
      y: Math.max(minY, Math.min(desiredY, maxY)),
    };
  }, [index]);

  const { elementRef, position, isDragging, updatePosition } =
    useDraggable(initialPosition);

  // Update position when index changes (when other windows are closed)
  React.useEffect(() => {
    if (!isDragging) {
      updatePosition?.(initialPosition);
    }
  }, [initialPosition, isDragging, updatePosition]);

  React.useEffect(() => {
    setCurrentRecipient(user);
  }, [user, setCurrentRecipient]);

  if (hidden) return null;

  return (
    <div
      ref={elementRef}
      className={`fixed w-80 h-96 bg-white shadow-lg rounded border z-50 flex flex-col ${isDragging ? "cursor-grabbing" : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        userSelect: isDragging ? "none" : "auto",
      }}
    >
      <div
        className="flex justify-between items-center p-2 bg-gray-100 border-b cursor-grab hover:bg-gray-200 select-none flex-shrink-0"
        data-drag-handle
      >
        <span className="font-medium">Chat: {user.name}</span>
        <div>
          <button
            onClick={() => toggleMinimize(user._id)}
            className="mr-2 hover:bg-gray-300 px-2 py-1 rounded"
          >
            _
          </button>
          <button
            onClick={() => closeChat(user._id)}
            className="hover:bg-gray-300 px-2 py-1 rounded"
          >
            ×
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <ChatTab key={user._id} recipient={user} />
      </div>
    </div>
  );
};

export default ChatWindow;
