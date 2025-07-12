import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './auth.store';
import type { AxiosResponse } from 'axios';
import type { User } from '../types/auth';
import type { Message, ChatStore } from '../types/messages';

interface ChatStoreFun extends Omit<ChatStore, 'messages'> {
  messages: Record<string, Message[]>;
  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  sendMessage: (messageData: {
    content: string;
    senderId?: string;
    recipientId: string;
  }) => Promise<void>;
  subscribeToMessages: (recipient: User) => void;
  unsubscribeFromMessages: (recipientId: string) => void;
  setSelectedUser: (selectedUser: User | null) => void;
}

const messageListeners: { [recipientId: string]: (msg: Message) => void } = {};

export const useChatStore = create<ChatStoreFun>((set, get) => ({
  messages: {},
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res: AxiosResponse<User[]> = await axiosInstance.get('/messages/users');
      set({ users: res.data });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const res: AxiosResponse<Message[]> = await axiosInstance.get(`/messages/${userId}`);
      set(state => ({
        messages: {
          ...state.messages,
          [userId]: res.data || [],
        },
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch messages');
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async messageData => {
    const { messages } = get();
    try {
      const res: AxiosResponse<Message> = await axiosInstance.post(
        `/messages/send/${messageData.recipientId}`,
        messageData
      );

      set(state => ({
        messages: {
          ...state.messages,
          [messageData.recipientId]: [...(state.messages[messageData.recipientId] || []), res.data],
        },
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  },

  subscribeToMessages: (recipient: User) => {
    const recipientId = recipient._id;
    if (!recipientId || messageListeners[recipientId]) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) {
      toast.error('Socket connection is not available');
      return;
    }

    const handler = (newMessage: Message) => {
      const isRelevant =
        newMessage.senderId === recipientId || newMessage.recipientId === recipientId;

      if (!isRelevant) return;

      set(state => ({
        messages: {
          ...state.messages,
          [recipientId]: [...(state.messages[recipientId] || []), newMessage],
        },
      }));
    };

    socket.on('newMessage', handler);
    messageListeners[recipientId] = handler;
  },

  unsubscribeFromMessages: (recipientId: string) => {
    const socket = useAuthStore.getState().socket;
    const handler = messageListeners[recipientId];
    if (socket && handler) {
      socket.off('newMessage', handler);
      delete messageListeners[recipientId];
    }
  },

  setSelectedUser: (selectedUser: User | null) => set({ selectedUser }),
}));

export default useChatStore;
