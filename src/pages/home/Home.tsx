import useUserStore from '../../store/user.store.ts';
import UserCard from '../../components/user-card/UserCard.tsx';
import UserList from './UserList.tsx';
import { useAuthStore } from '../../store/auth.store.ts';
import usePageStore from '../../store/page.store.ts';
import FloatingChatManager from '../chat/components/FloatingChatManager.tsx';
import { useChatWindowsStore } from '../../store/chatWindows.store';
import type { User } from '../../types/auth.ts';
import { useNavigate } from 'react-router-dom';
const Home = () => {
  const currentUser = useUserStore(state => state.currentUser);
  const setCurrentPage = usePageStore(state => state.setCurrentPage);
  const resetCurrentUser = useUserStore(state => state.resetCurrentUser);
  const { logout } = useAuthStore();
  const openChat = useChatWindowsStore(state => state.openChat);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      resetCurrentUser();
      console.log('Logged out successfully');
      setCurrentPage('login');
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="text-center py-8 px-4 bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Chatter</h1>
          <p className="text-gray-600 max-w-md">
            Connect and chat with your friends in a simple and elegant way.
          </p>
        </div>
      </header>
      <main className="p-6 flex-grow flex flex-col gap-6">
        <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            {currentUser && <UserCard user={currentUser} />}
            <div className="text-sm text-gray-500">Currently logged in</div>
            <div className="flex-grow text-right">
              <button className="text-sm text-blue-500 hover:underline" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <UserList onUserClick={(user: User) => openChat(user)} />
        </section>
      </main>
      <FloatingChatManager />
    </div>
  );
};

export default Home;
