import toast from "react-hot-toast";
import io from "socket.io-client";
import { create } from "zustand";

import { BasePath } from "../config";
import { axiosInstance } from "../lib/axios";
import type {
  AuthStore,
  User,
  LoginData,
  SignupData,
  UpdateProfileData,
  UpdateUserInfoData,
} from "../types/auth";
import type { Notification } from "../types/notifications";
import {
  clearUserSession,
  isUserLoggedOut,
  setLogoutFlag,
} from "../utils/sessionCleanup";
import { TokenStorage } from "../utils/tokenStorage";

import useChatStore from "./messages.store";

// extend the base AuthStore with additional functions
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
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
}

// main auth store using zustand
export const useAuthStore = create<AuthStoreFun>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  notifications: [], // array to hold user notifications

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

      console.log("Logout successful");
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);

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
        console.log("Skipping user check - user just logged out");
        return null;
      }

      // Check if we have a token
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
      console.log("Updating user info with data:", data);
      const res: any = await axiosInstance.put("/auth/update-info", data);
      console.log("Update response:", res.data);
      set({ authUser: res.data });
      toast.success("Profile information updated successfully");
    } catch (error: any) {
      console.error("Error in updateUserInfo:", error);
      toast.error(
        error.response?.data?.message || "Failed to update profile information",
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

    // Listen for online users
    socket.on("getOnlineUsers", (userIds: string[]) => {
      const previousOnlineUsers = get().onlineUsers;
      set({ onlineUsers: userIds });

      // Check for newly online users
      const newlyOnlineUsers = userIds.filter(
        (id) => !previousOnlineUsers.includes(id) && id !== authUser._id,
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
    socket.on("newMessage", async (messageData: any) => {
      if (messageData.senderId !== authUser._id) {
        // Get sender's name from users store or use fallback
        const chatStore = useChatStore.getState();
        let senderUser = chatStore.users.find(
          (user: any) => user._id === messageData.senderId,
        );
        let senderName = senderUser?.name || messageData.senderName;

        // If we don't have the sender's info, try to get it from the API
        if (!senderName && messageData.senderId) {
          try {
            const response = await axiosInstance.get(
              `/users/${messageData.senderId}`,
            );
            senderUser = response.data as User;
            senderName = senderUser?.name;
          } catch (error) {
            console.error("Failed to fetch sender info:", error);
          }
        }

        // Final fallback
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

    // Listen for friend request events
    socket.on("friendRequestReceived", (requestData: any) => {
      // Handle in friend request store via window reference
      if ((window as any).friendRequestStoreHandlers) {
        (window as any).friendRequestStoreHandlers.handleNewFriendRequest(
          requestData,
        );
      }
    });

    socket.on("friendRequestAccepted", (requestData: any) => {
      // Handle in friend request store via window reference
      if ((window as any).friendRequestStoreHandlers) {
        (window as any).friendRequestStoreHandlers.handleRequestAccepted(
          requestData,
        );
      }
    });

    console.log("Socket connected with notifications enabled");
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket && socket.connected) {
      console.log("Disconnecting socket...");

      // Emit logout event to notify server
      socket.emit("logout");

      // Disconnect the socket
      socket.disconnect();

      // Clear socket reference
      set({ socket: null });

      console.log("Socket disconnected");
    }
  },

  addNotification: (
    notificationData: Omit<Notification, "id" | "timestamp" | "read">,
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
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    }));
  },

  clearAllNotifications: () => {
    set({ notifications: [] });
  },
}));
