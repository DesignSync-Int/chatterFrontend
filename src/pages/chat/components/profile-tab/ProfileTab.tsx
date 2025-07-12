import useUserStore from '../../../../store/user.store.ts';
import UserCard from '../../../../components/user-card/UserCard.tsx';

const ProfileTab = () => {
  const currentRecipient = useUserStore(state => state.currentRecipient);

  return (
    <div className="text-center py-7 flex flex-col gap-4">
      {currentRecipient && <UserCard user={currentRecipient} />}
      <p>This tab is a placeholder - no improvements are needed.</p>
    </div>
  );
};

export default ProfileTab;
