import { useState } from 'react';
import ChatTab from './components/chat-tab/ChatTab.tsx';
import ProfileTab from './components/profile-tab/ProfileTab.tsx';
import Tabs from '../../components/tabs/Tabs.tsx';
import { useEffect, useRef } from 'react';

type TabId = 'chat' | 'profile';

const tabs = [
  { id: 'chat' as const, label: 'Chat' },
  { id: 'profile' as const, label: 'Profile' },
] as const;

const Chat = () => {
  const [activeTab, setActiveTab] = useState<TabId>('chat');
  const chatContentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleResize = () => {
      if (chatContentRef.current) {
        chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTab]);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, []);

  return (
    <div className="flex flex-col h-full w-full ">
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'chat' && <ChatTab />}
      {activeTab === 'profile' && <ProfileTab />}
    </div>
  );
};

export default Chat;
