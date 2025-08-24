import React from "react";

import type { User } from "../../../types/auth";
import LazyLoadUserList from "../VirtualizedUserList";

import FriendsTab from "./FriendsTab";
import ReceivedRequestsTab from "./ReceivedRequestsTab";
import SentRequestsTab from "./SentRequestsTab";

interface ContentAreaProps {
  activeTab: "users" | "received" | "sent" | "friends";
  onUserClick: (user: User) => void;
}

const ContentArea: React.FC<ContentAreaProps> = ({
  activeTab,
  onUserClick,
}) => {
  return (
    <section className="flex-1 min-h-0">
      {activeTab === "users" && <LazyLoadUserList onUserClick={onUserClick} />}
      {activeTab === "received" && <ReceivedRequestsTab />}
      {activeTab === "sent" && <SentRequestsTab />}
      {activeTab === "friends" && <FriendsTab />}
    </section>
  );
};

export default ContentArea;
