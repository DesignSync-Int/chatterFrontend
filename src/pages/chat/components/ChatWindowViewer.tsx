
import React from 'react';
import ChatTab from './chat-tab/ChatTab';
import { useChatWindowsStore } from '../../../store/chatWindows.store';
import { useUserStore } from '../../../store/user.store';
import type { User } from '../../../types/auth.ts';

interface ChatWindowProps {
  user: User;
  index: number;
  hidden?: boolean;
}

const ChatWindow = ({ user, index, hidden }: ChatWindowProps) => {
  const { closeChat, toggleMinimize } = useChatWindowsStore();
  const setCurrentRecipient = useUserStore(s => s.setCurrentRecipient);

  React.useEffect(() => {
    setCurrentRecipient(user);
  }, [user, setCurrentRecipient]);

  if (hidden) return null; // you can also use CSS to animate/hide if preferred

  return (
    <div
      className="fixed bottom-4 w-80 bg-white shadow-lg rounded border z-50 m-2"
      style={{ right: `${16 + index * 340}px` }} // 320px + 20px gap
    >
      {' '}
      <div className="flex justify-between items-center p-2 bg-gray-100 border-b">
        <span className="font-medium">Chat: {user.name}</span>
        <div>
          <button onClick={() => toggleMinimize(user._id)} className="mr-2">
            _
          </button>
          <button onClick={() => closeChat(user._id)}>×</button>
        </div>
      </div>
      <ChatTab key={user._id} recipient={user} />
    </div>
  );
};

export default ChatWindow;
