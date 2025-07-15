import type { User } from '../../types/auth';
import {
  getAvatarUrl,
  getDefaultAvatar,
  generateSimpleAvatar,
} from "../../utils/avatar";

const UserCard = ({ user, onClick }: { user: User; onClick?: () => void }) => {
  const avatarUrl = getAvatarUrl(user);

  // Debug logging (remove in production)
  console.log(`UserCard for ${user.name}:`, {
    hasProfile: !!user.profile,
    profileUrl: user.profile,
    generatedAvatar: avatarUrl,
  });

  return (
    <div
      className={`flex flex-col items-center gap-2 ${onClick ? "cursor-pointer" : ""}`}
      data-cy="user-card"
      {...(onClick ? { onClick } : {})}
    >
      <img
        className="w-10 h-10 rounded-full"
        src={avatarUrl}
        alt={`${user.name}'s profile picture`}
        onError={(e) => {
          console.log(
            `Avatar failed to load for ${user.name}, trying simple avatar`
          );
          // First try simple avatar, then default
          const simpleAvatar = generateSimpleAvatar(user.name);
          e.currentTarget.src = simpleAvatar;
          e.currentTarget.onerror = () => {
            console.log(`Simple avatar also failed, using default`);
            e.currentTarget.src = getDefaultAvatar();
          };
        }}
      />
      <div className="font-semibold text-center">{user.name}</div>
    </div>
  );
};

export default UserCard;
