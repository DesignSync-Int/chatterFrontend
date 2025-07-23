import { create } from "zustand";

import type { User } from "../types/auth.ts";

interface ChatWindow {
  user: User;
  minimized: boolean;
}

interface ChatWindowStore {
  openChats: ChatWindow[];
  openChat: (user: User) => void;
  closeChat: (id: string) => void;
  toggleMinimize: (id: string) => void;
}

export const useChatWindowsStore = create<ChatWindowStore>((set) => ({
  openChats: [],
  openChat: (user) =>
    set((state) => {
      const existing = state.openChats.find(
        (chat) => chat.user._id === user._id,
      );

      if (existing) {
        return {
          openChats: [
            ...state.openChats.filter((chat) => chat.user._id !== user._id),
            { ...existing, minimized: false },
          ],
        };
      }

      return {
        openChats: [...state.openChats, { user, minimized: false }],
      };
    }),

  closeChat: (id) =>
    set((state) => ({
      openChats: state.openChats.filter((chat) => chat.user._id !== id),
    })),

  toggleMinimize: (id) =>
    set((state) => ({
      openChats: state.openChats.map((chat) =>
        chat.user._id === id ? { ...chat, minimized: !chat.minimized } : chat,
      ),
    })),
}));
