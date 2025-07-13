export type User = {
  _id: string;
  name: string;
  profile?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type UserState = {
  currentUser?: User;
  setCurrentUser: (user: User) => void;
  currentRecipient: User | null;
  setCurrentRecipient: (user: User | null) => void;
  resetCurrentUser: () => void;
};

export interface AuthStore {
  authUser: User | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  onlineUsers: string[];
}

export interface LoginData {
  name: string;
  password: string;
}

export interface SignupData {
  name: string;
  password: string;
  profile?: string;
}

export interface UpdateProfileData {
  name?: string;
  profile?: string;
}
