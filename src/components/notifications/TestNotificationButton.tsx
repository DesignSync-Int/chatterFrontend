import { useAuthStore } from '../../store/auth.store';

const TestNotificationButton = () => {
  const addNotification = useAuthStore(state => state.addNotification);

  const handleTestMessageNotification = () => {
    addNotification({
      type: 'message',
      title: 'New Message',
      message: 'Test User: Hello! This is a test message.',
      fromUser: {
        _id: 'test-user-123',
        name: 'Test User'
      }
    });
  };

  const handleTestOnlineNotification = () => {
    addNotification({
      type: 'user_online',
      title: 'User Online',
      message: 'John Doe is now online',
      fromUser: {
        _id: 'john-doe-456',
        name: 'John Doe'
      }
    });
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleTestMessageNotification}
        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
      >
        Test Message
      </button>
      <button
        onClick={handleTestOnlineNotification}
        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
      >
        Test Online
      </button>
    </div>
  );
};

export default TestNotificationButton;
