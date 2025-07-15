import React from 'react';
import VirtualizedUserList from '../VirtualizedUserList';
import ReceivedRequestsTab from "./ReceivedRequestsTab";
import SentRequestsTab from "./SentRequestsTab";
import FriendsTab from "./FriendsTab";
import type { User } from '../../../types/auth';

interface ContentAreaProps {
  activeTab: "users" | "received" | "sent" | "friends";
  onUserClick: (user: User) => void;
}

const ContentArea: React.FC<ContentAreaProps> = ({ activeTab, onUserClick }) => {
  return (
    <section className="flex-1 min-h-0">
      {activeTab === "users" && (
        <VirtualizedUserList onUserClick={onUserClick} />
      )}
      {activeTab === "received" && <ReceivedRequestsTab />}
      {activeTab === "sent" && <SentRequestsTab />}
      {activeTab === "friends" && <FriendsTab />}
    </section>
  );
};

export default ContentArea;
