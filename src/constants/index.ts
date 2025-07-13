// Application constants
export const APP_CONFIG = {
  NAME: 'Chatter',
  TAGLINE: 'Connect back with your friends in a simple way',
  DEFAULT_AVATAR: '/default-avatar.png',
} as const;

export const UI_CONSTANTS = {
  TOAST_DURATION: 4000,
  CHAT_WINDOW_WIDTH: 340,
  SIDE_PADDING: 32,
  MAX_CHAT_WINDOWS: 3,
  MAX_NOTIFICATIONS: 50,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    CHECK: '/auth/check',
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    UPDATE_PROFILE: '/auth/update-profile',
  },
  MESSAGES: {
    USERS: '/messages/users',
    HISTORY: (userId: string) => `/messages/${userId}`,
    SEND: (recipientId: string) => `/messages/send/${recipientId}`,
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH_STORAGE: 'auth-storage',
  JUST_LOGGED_OUT: 'justLoggedOut',
} as const;
