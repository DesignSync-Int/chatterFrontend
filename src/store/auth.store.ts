import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import io from "socket.io-client";
import type {
  AuthStore,
  User,
  LoginData,
  SignupData,
  UpdateProfileData,
  UpdateUserInfoData,
} from "../types/auth";
import type { Notification } from "../types/notifications";
import { BasePath } from "../config";
import { TokenStorage } from "../utils/tokenStorage";
import {
  clearUserSession,
  isUserLoggedOut,
  setLogoutFlag,
} from "../utils/sessionCleanup";
import useChatStore from "./messages.store";

interface AuthStoreFun extends AuthStore {
  socket: any;
  notifications: Notification[];
  checkAuth: () => Promise<void>;
  signup: (data: SignupData) => Promise<User | null>;
  login: (data: LoginData) => Promise<User | null>;
  logout: () => Promise<void>;
  checkUser: () => Promise<User | null>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  updateUserInfo: (data: UpdateUserInfoData) => Promise<void>;
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
      const res: any = await axiosInstance.get("/auth/check");
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
      const res: any = await axiosInstance.post("/auth/signup", data);
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
      const res: any = await axiosInstance.post("/auth/login", data);
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
      console.log("Starting logout process...");

      get().disconnectSocket();

      await axiosInstance.post("/auth/logout");

      clearUserSession();
      TokenStorage.removeToken();

      set({ authUser: null, onlineUsers: [], notifications: [] });

      setLogoutFlag();

      console.log("Logout successful");
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);

      clearUserSession();
      TokenStorage.removeToken();
      get().disconnectSocket();

      set({ authUser: null, onlineUsers: [], notifications: [] });

      setLogoutFlag();

      toast.error("Logout completed (with errors)");
    }
  },

  checkUser: async () => {
    try {
      if (isUserLoggedOut()) {
        console.log("Skipping user check - user just logged out");
        return null;
      }

      const token = TokenStorage.getToken();
      if (!token) {
        console.log("No token found - user not authenticated");
        return null;
      }

      const res: any = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      return res.data ?? null;
    } catch (error: any) {
      console.error("Error in checkUser:", error);

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
      const res: any = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error in updateProfile:", error);
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  updateUserInfo: async (data: UpdateUserInfoData) => {
    set({ isUpdatingProfile: true });
    try {
      const res: any = await axiosInstance.put("/auth/update-info", data);
      set({ authUser: res.data });
      toast.success("Profile information updated successfully");
    } catch (error: any) {
      console.error("Error in updateUserInfo:", error);
      toast.error(
        error.response?.data?.message || "Failed to update profile information"
      );
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BasePath, {
      auth: {
        userId: authUser._id,
      },
    } as any);
    socket.connect();

    set({ socket });

    socket.on("getOnlineUsers", (userIds: string[]) => {
      const previousOnlineUsers = get().onlineUsers;
      set({ onlineUsers: userIds });

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

    socket.on("newMessage", async (messageData: any) => {
      if (messageData.senderId !== authUser._id) {
        const chatStore = useChatStore.getState();
        let senderUser = chatStore.users.find(
          (user: any) => user._id === messageData.senderId
        );
        let senderName = senderUser?.name || messageData.senderName;

        if (!senderName && messageData.senderId) {
          try {
            const response = await axiosInstance.get(
              `/users/${messageData.senderId}`
            );
            senderUser = response.data as User;
            senderName = senderUser?.name;
          } catch (error) {
            console.error("Failed to fetch sender info:", error);
          }
        }

        senderName = senderName || "Someone";

        get().addNotification({
          type: "message",
          title: "New Message",
          message: `${senderName}: ${messageData.content || messageData.message || "New message"}`,
          fromUser: {
            _id: messageData.senderId,
            name: senderName,
            profile: messageData.senderProfile || senderUser?.profile,
          },
        });
      }
    });

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

    socket.on("friendRequestReceived", (requestData: any) => {
      if ((window as any).friendRequestStoreHandlers) {
        (window as any).friendRequestStoreHandlers.handleNewFriendRequest(
          requestData
        );
      }
    });

    socket.on("friendRequestAccepted", (requestData: any) => {
      // Handle in friend request store via window reference
      if ((window as any).friendRequestStoreHandlers) {
        (window as any).friendRequestStoreHandlers.handleRequestAccepted(
          requestData
        );
      }
    });

    console.log("Socket connected with notifications enabled");
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket && socket.connected) {
      console.log("Disconnecting socket...");

      socket.emit("logout");

      socket.disconnect();

      set({ socket: null });

      console.log("Socket disconnected");
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
      notifications: [notification, ...state.notifications.slice(0, 49)],
    }));

    toast(notification.message, {
      icon:
        notification.type === "message"
          ? "MSG"
          : notification.type === "user_online"
            ? "●"
            : "●",
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
