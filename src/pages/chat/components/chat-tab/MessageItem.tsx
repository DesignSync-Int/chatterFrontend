import type { MessageProps } from '../../../../types/messages.ts';

const MessageItem = ({ message, type, isNotRecent }: MessageProps) => {
  return type === 'sent' ? (
    <div className="flex flex-col items-start">
      <div
        className={`self-start text-black px-4 py-2 rounded-2xl shadow ${
          isNotRecent ? 'mt-[20px]' : 'mt-[8px]'
        } max-w-[60%] w-fit m-[10px]`}
        style={{ backgroundColor: '#F0F4FC' }}
      >
        {message.content}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-start space-y-2">
      <div
        className={`self-end text-white px-4 py-2 rounded-2xl shadow ${
          isNotRecent ? 'mt-[20px]' : 'mt-[8px]'
        } max-w-[60%] w-fit m-[10px]"`}
        style={{ backgroundColor: '#FB3F6B' }}
      >
        {message.content}
      </div>
    </div>
  );
};

export default MessageItem;
