import { useState, useEffect, useRef } from 'react';
import useUserStore from '../../../../store/user.store.ts';
import MessageItem from './MessageItem.tsx';
import type { Message } from '../../../../types/messages.ts';
import useChatStore from '../../../../store/messages.store.ts';
import { getTimeDifferenceInSeconds, formatTimestamp } from '../../../../utils/time.ts';
import { TimeConfig } from '../../../../config.ts';
import type { User } from '../../../../types/auth.ts';

interface ChatTabProps {
  recipient: User;
}

const ChatTab = ({ recipient }: ChatTabProps) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const currentUser = useUserStore(state => state.currentUser);
  const { messages, getMessages, subscribeToMessages, unsubscribeFromMessages, sendMessage } =
    useChatStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);

  const recipientMessages = messages[recipient._id] || [];
  const handleMessageSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!recipient || !currentMessage.trim()) return;

    setCurrentMessage('');

    try {
      await sendMessage({
        content: currentMessage.trim(),
        senderId: `${currentUser?._id}`,
        recipientId: `${recipient._id}`,
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const renderMessageItem = (message: Message, index: number) => {
    const timeDifference = getTimeDifferenceInSeconds(
      message.updatedAt || message.createdAt,
      recipientMessages[index - 1]?.updatedAt || recipientMessages[index - 1]?.createdAt
    );

    return (
      <div key={message.updatedAt || message.createdAt} data-testid={`message-item-${index}`}>
        {timeDifference >= TimeConfig.majoreTime && (
          <div className="flex justify-center text-xs text-gray-500 my-[6px]">
            {formatTimestamp(message.updatedAt || message.createdAt)}
          </div>
        )}
        <MessageItem
          message={message}
          isNotRecent={timeDifference > TimeConfig.minorTime}
          type={message.senderId === currentUser?._id ? 'sent' : 'received'}
        />
      </div>
    );
  };

  useEffect(() => {
    getMessages(recipient._id);
    subscribeToMessages(recipient);
    return () => {
      unsubscribeFromMessages(recipient._id);
    };
  }, [recipient._id, getMessages, subscribeToMessages, unsubscribeFromMessages, recipient]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (chatContentRef.current) {
        chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
      }
    };
    const frame = requestAnimationFrame(() => {
      setTimeout(scrollToBottom, 10);
    });
    return () => cancelAnimationFrame(frame);
  }, [recipientMessages.length]);

  return (
    <div className="max-h-96 overflow-y-auto" ref={chatContentRef}>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="flex-1 overflow-y-auto relative"
          id="chat-content"
          style={{ paddingBottom: '90px' }}
        >
          {recipientMessages.map((message, index) => renderMessageItem(message, index))}
        </div>

        <div
          className="border-t border-gray-300 p-2 bg-white"
          id="chat-input"
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%' }}
        >
          <form onSubmit={handleMessageSend} className="flex gap-2">
            <input
              type="text"
              placeholder={`Message ${recipient?.name || ''}`}
              className="flex-1 rounded-full border-[8px] border-[#cfcfcf] px-[12px] py-[8px]"
              value={currentMessage}
              onChange={e => setCurrentMessage(e.target.value)}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatTab;
