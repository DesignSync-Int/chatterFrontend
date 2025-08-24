import type { User } from "../../types/auth";

const UserCard = ({ user, onClick }: { user: User; onClick?: () => void }) => {
  // Generate a color based on the user's name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-teal-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div
      className={`flex items-center gap-2 ${onClick ? "cursor-pointer" : ""}`}
      data-cy="user-card"
      {...(onClick ? { onClick } : {})}
    >
      <div className="relative">
        {user.profile ? (
          <img
            className="w-10 h-10 rounded-full object-cover"
            src={user.profile}
            alt={`${user.name}'s profile picture`}
            onError={(e) => {
              // Hide the image and show letter avatar on error
              e.currentTarget.style.display = "none";
              const letterAvatar = e.currentTarget
                .nextElementSibling as HTMLElement;
              if (letterAvatar) letterAvatar.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`w-10 h-10 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white font-bold text-sm ${user.profile ? "hidden" : ""}`}
        >
          {getInitials(user.fullName || user.name)}
        </div>
      </div>
      <div className="text-center">
        <div className="font-semibold">{user.fullName || user.name}</div>
        {user.fullName && user.fullName !== user.name && (
          <div className="text-xs text-gray-500">@{user.name}</div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
