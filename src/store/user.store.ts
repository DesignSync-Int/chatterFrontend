import { create } from "zustand";

import type { User, UserState } from "../types/auth";

export const useUserStore = create<UserState>()((set) => ({
  setCurrentUser: (user: User) => set({ currentUser: user }),
  currentRecipient: null,
  setCurrentRecipient: (user: User | null) => set({ currentRecipient: user }),
  resetCurrentUser: () => set({ currentUser: undefined }),
}));

export default useUserStore;
