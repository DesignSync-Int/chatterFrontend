import UserCard from '../../components/user-card/UserCard.tsx';
import Button from '../../components/button/Button.tsx';
import useUserStore from '../../store/user.store.ts';
import { useChatStore } from '../../store/messages.store.ts';
import { useEffect } from 'react';
import type { User } from '../../types/auth.ts';

const UserList = ({ onUserClick }: { onUserClick: (user: User) => void }) => {
  const currentUser = useUserStore(state => state.currentUser);
  const setCurrentRecipient = useUserStore(state => state.setCurrentRecipient);
  const { getUsers, users, setSelectedUser } = useChatStore();

  const messageUser = (user: User) => {
    if (user) {
      setCurrentRecipient(user);
      setSelectedUser({
        _id: user._id,
        name: user.name,
      });
      onUserClick(user);
    }
  };

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        <h2 className="text-lg font-semibold mb-4">Message Someone</h2>
        <div className="flex flex-col gap-2.5">
          {users?.map(user => (
            <div className="flex items-center" key={user._id}>
              <UserCard user={user} />
              <div className="ml-auto">
                <Button onClick={() => messageUser(user)} disabled={user._id === currentUser?._id}>
                  Message
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserList;
