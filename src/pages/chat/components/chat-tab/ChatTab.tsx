import { useState, useEffect, useRef } from 'react';
import useUserStore from '../../../../store/user.store.ts';
import MessageItem from './MessageItem.tsx';
import type { Message } from '../../../../types/messages.ts';
import useChatStore from '../../../../store/messages.store.ts';
import { getTimeDifferenceInSeconds, formatTimestamp } from '../../../../utils/time.ts';
import { TimeConfig } from '../../../../config.ts';
import type { User } from '../../../../types/auth.ts';
import { validateField } from "../../../../utils/validation.ts";
import { censorText } from "../../../../utils/messageCensorship.ts";
import { z } from "zod";

interface ChatTabProps {
  recipient: User;
}

const ChatTab = ({ recipient }: ChatTabProps) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageError, setMessageError] = useState("");
  const [censorshipWarning, setCensorshipWarning] = useState("");
  const currentUser = useUserStore((state) => state.currentUser);
  const {
    messages,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
    sendMessage,
  } = useChatStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);

  const recipientMessages = messages[recipient._id] || [];

  // Message validation schema
  const messageSchema = z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message must be less than 1000 characters")
    .refine(
      (val) => val.trim().length > 0,
      "Message cannot be just whitespace"
    );

  const handleMessageSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate message
    const validation = validateField(messageSchema, currentMessage);
    if (!validation.isValid) {
      setMessageError(validation.error || "Invalid message");
      return;
    }

    if (!recipient || !currentMessage.trim()) return;

    // Apply censorship
    const censorshipResult = censorText(currentMessage.trim());

    // Check if message should be blocked
    if (censorshipResult.shouldBlock) {
      setMessageError("Message blocked due to inappropriate content");
      setCensorshipWarning(censorshipResult.warningMessage || "");
      return;
    }

    // Show warning if content was modified
    if (censorshipResult.warningMessage) {
      setCensorshipWarning(censorshipResult.warningMessage);
      setTimeout(() => setCensorshipWarning(""), 3000);
    }

    // Use censored text for sending
    const messageToSend = censorshipResult.censoredText;

    setCurrentMessage("");
    setMessageError("");

    try {
      await sendMessage({
        content: messageToSend,
        senderId: `${currentUser?._id}`,
        recipientId: `${recipient._id}`,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessageError("Failed to send message. Please try again.");
    }
  };

  const renderMessageItem = (message: Message, index: number) => {
    const timeDifference = getTimeDifferenceInSeconds(
      message.updatedAt || message.createdAt,
      recipientMessages[index - 1]?.updatedAt ||
        recipientMessages[index - 1]?.createdAt
    );

    return (
      <div
        key={message.updatedAt || message.createdAt}
        data-testid={`message-item-${index}`}
      >
        {timeDifference >= TimeConfig.majoreTime && (
          <div className="flex justify-center text-xs text-gray-500 my-[6px]">
            {formatTimestamp(message.updatedAt || message.createdAt)}
          </div>
        )}
        <MessageItem
          message={message}
          isNotRecent={timeDifference > TimeConfig.minorTime}
          type={message.senderId === currentUser?._id ? "sent" : "received"}
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
  }, [
    recipient._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
    recipient,
  ]);

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
    <div className="flex flex-col h-full">
      <div
        className="flex-1 overflow-y-auto p-2 pb-20"
        ref={chatContentRef}
        id="chat-content"
      >
        {recipientMessages.map((message, index) =>
          renderMessageItem(message, index)
        )}
      </div>

      <div
        className="border-t border-gray-300 p-2 bg-white flex-shrink-0"
        id="chat-input"
      >
        {messageError && (
          <div className="text-red-600 text-sm mb-1 px-2">{messageError}</div>
        )}
        {censorshipWarning && (
          <div className="text-yellow-600 text-sm mb-1 px-2 bg-yellow-50 rounded p-1">
            ⚠️ {censorshipWarning}
          </div>
        )}
        <form onSubmit={handleMessageSend} className="flex gap-2">
          <input
            type="text"
            placeholder={`Message ${recipient?.name || ""}`}
            className={`flex-1 rounded-full border-[8px] px-[12px] py-[8px] ${
              messageError
                ? "border-red-300 focus:border-red-500"
                : "border-[#cfcfcf] focus:border-blue-300"
            }`}
            value={currentMessage}
            onChange={(e) => {
              setCurrentMessage(e.target.value);
              // Clear errors and warnings when user starts typing
              if (messageError) {
                setMessageError("");
              }
              if (censorshipWarning) {
                setCensorshipWarning("");
              }
            }}
            maxLength={1000}
          />
        </form>
      </div>
    </div>
  );
};

export default ChatTab;
