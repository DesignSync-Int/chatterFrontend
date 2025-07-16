import React from 'react';
import NotificationPanel from "../../../components/notifications/NotificationPanel";

const HomeHeader: React.FC = () => {
  return (
    <header className="text-center py-8 px-4 bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
      <div className="flex flex-col items-center gap-3 relative">
        {/* Notification panel in top right */}
        <div className="absolute top-0 right-0">
          <NotificationPanel />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Chatter
        </h1>
        <p className="text-gray-600 max-w-md">
          Connect back with your friends in a simple way.
        </p>
      </div>
    </header>
  );
};

export default HomeHeader;
