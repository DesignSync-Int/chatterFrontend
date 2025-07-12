import ChatWindow from './ChatWindowViewer';
import { useChatWindowsStore } from '../../../store/chatWindows.store';
import { useEffect, useState } from 'react';
import './FloatingChatDropdown.css';

const CHAT_WIDTH = 340;
const SIDE_PADDING = 32;

export const FloatingChatManager = () => {
  const { openChats, openChat } = useChatWindowsStore();
  const visibleChats = openChats.filter(chat => !chat.minimized);
  const minimizedChats = openChats.filter(chat => chat.minimized);

  const [maxWindows, setMaxWindows] = useState(3);
  const [showDropdown, setShowDropdown] = useState(false);
  const chatsToShow = visibleChats.slice(-maxWindows);
  const overflowedChats = visibleChats.slice(0, visibleChats.length - chatsToShow.length);
  const hiddenChats = [...minimizedChats, ...overflowedChats];
  const hiddenChatsCount = hiddenChats.length;

  useEffect(() => {
    const calculateMax = () => {
      const available = window.innerWidth - SIDE_PADDING;
      const count = Math.floor(available / CHAT_WIDTH);
      setMaxWindows(count);
    };

    calculateMax();
    window.addEventListener('resize', calculateMax);
    return () => window.removeEventListener('resize', calculateMax);
  }, []);

  return (
    <>
      {chatsToShow.map((chat, index) => (
        <ChatWindow key={chat.user._id} user={chat.user} index={index} hidden={chat.minimized} />
      ))}
      {hiddenChatsCount > 0 && (
        <div
          className="fixed bottom-4 w-16 h-12 bg-gray-200 text-center text-sm rounded shadow-lg flex items-center justify-center cursor-pointer z-50"
          style={{ right: `${16 + chatsToShow.length * CHAT_WIDTH}px` }}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          +{hiddenChatsCount}
          {showDropdown && (
            <div className="chat-dropdown">
              {hiddenChats.map(chat => (
                <div
                  key={chat.user._id}
                  className="chat-dropdown-item"
                  onClick={() => {
                    openChat(chat.user);
                    setShowDropdown(false);
                  }}
                >
                  {chat.user.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingChatManager;
