import { ChevronLeft, Ellipsis } from 'lucide-react';
import usePageStore from '../../../../store/page.store.ts';
import useUserStore from '../../../../store/user.store.ts';
import { useAuthStore } from '../../../../store/auth.store.ts';
import { useEffect } from 'react';
import type { User } from '../../../../types/auth';
import { useNavigate, useParams } from 'react-router-dom';

const Header = () => {
  const setCurrentPage = usePageStore(state => state.setCurrentPage);
  const currentRecipient = useUserStore(state => state.currentRecipient);
  const currentUser = useUserStore(state => state.currentUser);
  const { checkUser } = useAuthStore();
  const setCurrentUser = useUserStore(state => state.setCurrentUser);
  const navigate = useNavigate();
  const { recipientId } = useParams();

  useEffect(() => {
    checkUser()
      .then((user: User | null) => {
        if (user) {
          setCurrentUser(user);
          console.log('Logged in successfully');
          setCurrentPage(currentUser?.name ? 'chat' : 'home');
          navigate(recipientId ? `/chat/${recipientId}` : '/home');

          useAuthStore.getState().connectSocket();
        } else {
          console.error('Login failed: No user returned');
        }
      })
      .catch(error => {
        console.error('Login failed:', error);
      });
  }, [checkUser, currentUser?.name, navigate, recipientId, setCurrentPage, setCurrentUser]);

  if (!currentRecipient || !currentUser) {
    return null;
  }

  return (
    <div className="flex justify-between p-[20px]">
      <ChevronLeft onClick={() => setCurrentPage('home')} className="cursor-pointer" />
      <Ellipsis className="cursor-pointer" />
    </div>
  );
};

export default Header;
