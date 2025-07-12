import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import type { AxiosResponse } from 'axios';
import type { Socket } from 'socket.io-client';
import type { AuthStore, User } from '../types/auth';
import { BasePath } from '../config';

interface AuthStoreFun extends AuthStore {
  socket: Socket | null;
  checkAuth: () => Promise<void>;
  signup: (data: Record<string, any>) => Promise<User | null>;
  login: (data: Record<string, any>) => Promise<User | null>;
  logout: () => Promise<void>;
  checkUser: () => Promise<User | null>;
  updateProfile: (data: Record<string, any>) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useAuthStore = create<AuthStoreFun>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      console.log(
        'checkAuth: Making request to:',
        `${import.meta.env.VITE_BASE_URL || 'http://localhost:4001'}/api/auth/check`
      );
      const res: AxiosResponse<User> = await axiosInstance.get('/auth/check');
      console.log('checkAuth: Success, user:', res.data);
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error: unknown) {
      console.error('Error in checkAuth:', error);
      console.log('checkAuth: Failed, redirecting to login');
      set({ authUser: null });
      get().disconnectSocket();
      window.location.href = '/login';
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data: Record<string, any>) => {
    set({ isSigningUp: true });
    try {
      const res: AxiosResponse<User> = await axiosInstance.post('/auth/signup', data);
      set({ authUser: res.data });
      toast.success('Account created successfully');
      get().connectSocket();
      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Signup failed');
      return null;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data: Record<string, any>) => {
    set({ isLoggingIn: true });
    try {
      console.log(
        'login: Making request to:',
        `${import.meta.env.VITE_BASE_URL || 'http://localhost:4001'}/api/auth/login`
      );
      const res: AxiosResponse<User> = await axiosInstance.post('/auth/login', data);
      console.log('login: Success, user:', res.data);
      set({ authUser: res.data });
      toast.success('Logged in successfully');
      get().connectSocket();
      return res.data;
    } catch (error: any) {
      console.error('login: Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Login failed');
      return null;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ authUser: null });
      toast.success('Logged out successfully');
      get().disconnectSocket();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Logout failed');
    }
  },

  checkUser: async () => {
    try {
      const res: AxiosResponse<User> = await axiosInstance.get('/auth/check');
      set({ authUser: res.data });
      return res.data ?? null;
    } catch (error: any) {
      console.error('Error in checkUser:', error);
      toast.error(error.response?.data?.message || 'User check failed');
      return null;
    }
  },

  updateProfile: async (data: Record<string, any>) => {
    set({ isUpdatingProfile: true });
    try {
      const res: AxiosResponse<User> = await axiosInstance.put('/auth/update-profile', data);
      set({ authUser: res.data });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error in updateProfile:', error);
      toast.error(error.response?.data?.message || 'Profile update failed');
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket: Socket = io(BasePath, {
      auth: {
        userId: authUser._id,
      },
      withCredentials: true,
    });
    socket.connect();

    set({ socket });

    socket.on('getOnlineUsers', (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket && socket.connected) socket.disconnect();
  },
}));
