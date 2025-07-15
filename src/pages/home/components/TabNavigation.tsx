import React from 'react';

interface TabNavigationProps {
  activeTab: "users" | "received" | "sent" | "friends";
  onTabChange: (tab: "users" | "received" | "sent" | "friends") => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <section className="mb-6">
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-lg">
        <button
          onClick={() => onTabChange("users")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === "users"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          All Users
        </button>
        <button
          onClick={() => onTabChange("received")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === "received"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Received
        </button>
        <button
          onClick={() => onTabChange("sent")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === "sent"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Sent
        </button>
        <button
          onClick={() => onTabChange("friends")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === "friends"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Friends
        </button>
      </div>
    </section>
  );
};

export default TabNavigation;
