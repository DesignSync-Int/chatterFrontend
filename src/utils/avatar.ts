/**
 * Utility functions for handling user avatars
 */

// List of avatar services that provide random avatars
const AVATAR_SERVICES = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=',
  'https://api.dicebear.com/7.x/personas/svg?seed=',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=',
  'https://api.dicebear.com/7.x/bottts/svg?seed=',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=',
];

// Local fallback colors for simple avatar generation
const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
  '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
];

/**
 * Generate a simple color-based avatar URL as fallback
 * @param seed - A string to use as seed for color selection
 * @returns A data URL for a simple colored circle avatar
 */
export const generateSimpleAvatar = (seed: string): string => {
  const colorIndex = Math.abs(seed.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % AVATAR_COLORS.length;
  const color = AVATAR_COLORS[colorIndex];
  const initials = seed.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="50" fill="${color}"/>
    <text x="50" y="50" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="30" font-weight="bold" fill="white">${initials}</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Generate a random avatar URL based on user's name or ID
 * @param seed - A string to use as seed for consistent avatar generation (usually user name or ID)
 * @returns A URL to a random avatar image
 */
export const generateRandomAvatar = (seed: string): string => {
  if (!seed) {
    seed = Math.random().toString(36).substring(7);
  }
  
  // Create a simple hash to select service consistently
  const hash = seed.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const serviceIndex = Math.abs(hash) % AVATAR_SERVICES.length;
  const selectedService = AVATAR_SERVICES[serviceIndex];
  
  // Use the seed to generate a consistent avatar for the same user
  return `${selectedService}${encodeURIComponent(seed)}`;
};

/**
 * Get the appropriate avatar URL for a user
 * @param user - User object with optional profile field
 * @returns A URL to the user's avatar (either their profile pic or a random avatar)
 */
export const getAvatarUrl = (user: { name: string; profile?: string; _id?: string }): string => {
  // If user has a profile picture, use it
  if (user.profile && user.profile.trim()) {
    return user.profile;
  }
  
  // Generate a random avatar using user ID or name as seed
  const seed = user._id || user.name;
  return generateRandomAvatar(seed);
};

/**
 * Get fallback avatar URL for error cases
 * @returns Default avatar URL
 */
export const getDefaultAvatar = (): string => {
  return '/default-avatar.png';
};
