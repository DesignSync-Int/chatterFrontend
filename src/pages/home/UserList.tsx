import UserCard from '../../components/user-card/UserCard.tsx';
import Button from '../../components/button/Button.tsx';
import useUserStore from '../../store/user.store.ts';
import { useChatStore } from '../../store/messages.store.ts';
import { useAuthStore } from '../../store/auth.store.ts';
import { useEffect, useCallback, useMemo } from "react";
import type { User } from '../../types/auth.ts';

const UserList = ({ onUserClick }: { onUserClick: (user: User) => void }) => {
  const currentUser = useUserStore(state => state.currentUser);
  const setCurrentRecipient = useUserStore(state => state.setCurrentRecipient);
  const { getUsers, users, setSelectedUser } = useChatStore();
  const onlineUsers = useAuthStore(state => state.onlineUsers);

  const messageUser = useCallback(
    (user: User) => {
      if (user) {
        setCurrentRecipient(user);
        setSelectedUser({
          _id: user._id,
          name: user.name,
        });
        onUserClick(user);
      }
    },
    [setCurrentRecipient, setSelectedUser, onUserClick]
  );

  const isUserOnline = useCallback(
    (userId: string) => {
      return onlineUsers.includes(userId);
    },
    [onlineUsers]
  );

  const filteredUsers = useMemo(() => {
    return users?.filter((user) => user._id !== currentUser?._id) || [];
  }, [users, currentUser?._id]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex-1">
        <h2 className="text-lg font-semibold mb-4">Message Someone</h2>
        <div className="flex flex-col gap-2.5">
          {filteredUsers.map((user) => (
            <div className="flex items-center" key={user._id}>
              <UserCard user={user} onClick={() => messageUser(user)} />
              {isUserOnline(user._id) && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                  <span className="text-green-500">●</span> Live
                </span>
              )}
              <div className="ml-auto">
                <Button onClick={() => messageUser(user)} disabled={false}>
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
