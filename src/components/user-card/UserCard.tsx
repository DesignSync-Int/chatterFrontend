import type { User } from '../../types/auth';

const UserCard = ({ user, onClick }: { user: User; onClick?: () => void }) => {
  return (
    <div
      className="flex gap-2.5 items-center justify-center cursor-pointer"
      {...(onClick ? { onClick } : {})}
    >
      <img
        className="w-10 h-auto rounded-full"
        src={user.profile || "/default-avatar.png"}
        alt={`${user.name}'s profile picture`}
        onError={(e) => {
          e.currentTarget.src = "/default-avatar.png";
        }}
      />
      <div className="font-semibold">{user.name}</div>
    </div>
  );
};

export default UserCard;
