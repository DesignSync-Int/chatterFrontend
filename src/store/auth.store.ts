import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import type { AxiosResponse } from 'axios';
import type { Socket } from 'socket.io-client';
import type {
  AuthStore,
  User,
  LoginData,
  SignupData,
  UpdateProfileData,
} from "../types/auth";
import type { Notification } from '../types/notifications';
import { BasePath } from '../config';
import { TokenStorage } from '../utils/tokenStorage';
import {
  clearUserSession,
  isUserLoggedOut,
  setLogoutFlag,
} from "../utils/sessionCleanup";

interface AuthStoreFun extends AuthStore {
  socket: Socket | null;
  notifications: Notification[];
  checkAuth: () => Promise<void>;
  signup: (data: SignupData) => Promise<User | null>;
  login: (data: LoginData) => Promise<User | null>;
  logout: () => Promise<void>;
  checkUser: () => Promise<User | null>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
}

export const useAuthStore = create<AuthStoreFun>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  notifications: [],

  checkAuth: async () => {
    try {
      const res: AxiosResponse<User> = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error: unknown) {
      console.error("Error in checkAuth:", error);
      set({ authUser: null });
      get().disconnectSocket();
      window.location.href = "/";
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data: SignupData) => {
    set({ isSigningUp: true });
    try {
      const res: AxiosResponse<User> = await axiosInstance.post(
        "/auth/signup",
        data
      );
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Signup failed");
      return null;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data: LoginData) => {
    set({ isLoggingIn: true });
    try {
      const res: AxiosResponse<User> = await axiosInstance.post(
        "/auth/login",
        data
      );
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
      return null;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      console.log("🚪 Starting logout process...");

      // First disconnect socket to appear offline to other users
      get().disconnectSocket();

      // Call backend logout to clear server-side session/cookie FIRST
      await axiosInstance.post("/auth/logout");

      // Clear all user session data thoroughly
      clearUserSession();
      TokenStorage.removeToken();

      // Clear auth store state
      set({ authUser: null, onlineUsers: [], notifications: [] });

      // Set logout flag to prevent auto-login
      setLogoutFlag();

      console.log("✅ Logout successful");
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("❌ Logout error:", error);

      // Even if backend fails, clear everything aggressively
      clearUserSession();
      TokenStorage.removeToken();
      get().disconnectSocket();

      // Clear auth store state
      set({ authUser: null, onlineUsers: [], notifications: [] });

      // Set logout flag
      setLogoutFlag();

      toast.error("Logout completed (with errors)");
    }
  },

  checkUser: async () => {
    try {
      // Check if user just logged out
      if (isUserLoggedOut()) {
        console.log("🚪 Skipping user check - user just logged out");
        return null;
      }

      // Check if we have a token
      const token = TokenStorage.getToken();
      if (!token) {
        console.log("🚪 No token found - user not authenticated");
        return null;
      }

      const res: AxiosResponse<User> = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      return res.data ?? null;
    } catch (error: any) {
      console.error("Error in checkUser:", error);

      // Clear any stale tokens on 401 or other auth errors
      if (error.response?.status === 401) {
        TokenStorage.removeToken();
        set({ authUser: null });
      }

      return null;
    }
  },

  updateProfile: async (data: UpdateProfileData) => {
    set({ isUpdatingProfile: true });
    try {
      const res: AxiosResponse<User> = await axiosInstance.put(
        "/auth/update-profile",
        data
      );
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error in updateProfile:", error);
      toast.error(error.response?.data?.message || "Profile update failed");
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

    // Listen for online users
    socket.on("getOnlineUsers", (userIds: string[]) => {
      const previousOnlineUsers = get().onlineUsers;
      set({ onlineUsers: userIds });

      // Check for newly online users
      const newlyOnlineUsers = userIds.filter(
        (id) => !previousOnlineUsers.includes(id) && id !== authUser._id
      );

      newlyOnlineUsers.forEach((userId) => {
        get().addNotification({
          type: "user_online",
          title: "User Online",
          message: `Someone is now online`,
          fromUser: {
            _id: userId,
            name: "Friend",
          },
        });
      });
    });

    // Listen for new messages
    socket.on("newMessage", (messageData: any) => {
      if (messageData.senderId !== authUser._id) {
        // Note: We'll handle chat window checking in the notification panel component
        get().addNotification({
          type: "message",
          title: "New Message",
          message: `${messageData.senderName || "Someone"}: ${messageData.content || messageData.message || "New message"}`,
          fromUser: {
            _id: messageData.senderId,
            name: messageData.senderName || "Unknown",
            profile: messageData.senderProfile,
          },
        });
      }
    });

    // Listen for user offline
    socket.on("userDisconnected", (userData: any) => {
      if (userData.userId !== authUser._id) {
        get().addNotification({
          type: "user_offline",
          title: "User Offline",
          message: `${userData.userName || "A friend"} went offline`,
          fromUser: {
            _id: userData.userId,
            name: userData.userName || "User",
          },
        });
      }
    });

    console.log("🔌 Socket connected with notifications enabled");
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket && socket.connected) {
      console.log("🔌 Disconnecting socket...");

      // Emit logout event to notify server
      socket.emit("logout");

      // Disconnect the socket
      socket.disconnect();

      // Clear socket reference
      set({ socket: null });

      console.log("✅ Socket disconnected");
    }
  },

  addNotification: (
    notificationData: Omit<Notification, "id" | "timestamp" | "read">
  ) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    set((state) => ({
      notifications: [notification, ...state.notifications.slice(0, 49)], // Keep max 50 notifications
    }));

    // Show toast notification
    toast(notification.message, {
      icon:
        notification.type === "message"
          ? "💬"
          : notification.type === "user_online"
            ? "🟢"
            : "🔴",
      duration: 4000,
    });
  },

  markNotificationAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      ),
    }));
  },

  clearAllNotifications: () => {
    set({ notifications: [] });
  },
}));
