import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "../auth.store";
import { axiosInstance } from "../../lib/axios";

vi.mock("../../lib/axios");
vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
  })),
}));

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      authUser: null,
      isSigningUp: false,
      isLoggingIn: false,
      isUpdatingProfile: false,
      isCheckingAuth: true,
      onlineUsers: [],
      socket: null,
    });
  });

  it("should have default state", () => {
    const state = useAuthStore.getState();
    expect(state.authUser).toBeNull();
    expect(state.isSigningUp).toBe(false);
    expect(state.isLoggingIn).toBe(false);
    expect(state.isUpdatingProfile).toBe(false);
    expect(state.isCheckingAuth).toBe(true);
    expect(state.onlineUsers).toEqual([]);
    expect(state.socket).toBeNull();
  });

  it("should check authentication and update state", async () => {
    const mockAuthUser = { _id: "1", name: "John", profile: "profile.jpg" };
    (axiosInstance.get as any).mockResolvedValue({ data: mockAuthUser });

    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.authUser).toEqual(mockAuthUser);
    expect(state.isCheckingAuth).toBe(false);
  });

  it("should handle error during authentication check", async () => {
    (axiosInstance.get as any).mockRejectedValue(new Error("Auth failed"));

    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.authUser).toBeNull();
    expect(state.isCheckingAuth).toBe(false);
  });

  it("should sign up a user and update state", async () => {
    const mockAuthUser = { _id: "1", name: "John", profile: "profile.jpg" };
    (axiosInstance.post as any).mockResolvedValue({ data: mockAuthUser });

    await useAuthStore.getState().signup({ name: "John", password: "123456" });

    const state = useAuthStore.getState();
    expect(state.authUser).toEqual(mockAuthUser);
    expect(state.isSigningUp).toBe(false);
  });

  it("should handle error during signup", async () => {
    (axiosInstance.post as any).mockRejectedValue(new Error("Signup failed"));

    await useAuthStore.getState().signup({ name: "John", password: "123456" });

    const state = useAuthStore.getState();
    expect(state.authUser).toBeNull();
    expect(state.isSigningUp).toBe(false);
  });

  it("should log in a user and update state", async () => {
    const mockAuthUser = { _id: "1", name: "John", profile: "profile.jpg" };
    (axiosInstance.post as any).mockResolvedValue({ data: mockAuthUser });

    await useAuthStore.getState().login({ name: "John", password: "123456" });

    const state = useAuthStore.getState();
    expect(state.authUser).toEqual(mockAuthUser);
    expect(state.isLoggingIn).toBe(false);
  });

  it("should handle error during login", async () => {
    (axiosInstance.post as any).mockRejectedValue(new Error("Login failed"));

    await useAuthStore.getState().login({ name: "John", password: "123456" });

    const state = useAuthStore.getState();
    expect(state.authUser).toBeNull();
    expect(state.isLoggingIn).toBe(false);
  });

  it("should log out a user and update state", async () => {
    (axiosInstance.post as any).mockResolvedValue({});

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.authUser).toBeNull();
  });

  it("should handle error during logout", async () => {
    (axiosInstance.post as any).mockRejectedValue(new Error("Logout failed"));

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.authUser).toBeNull();
  });

  it("should connect socket", () => {
    useAuthStore.setState({
      authUser: { _id: "1", name: "John", profile: "profile.jpg" },
    });

    useAuthStore.getState().connectSocket();

    const state = useAuthStore.getState();
    expect(state.socket).not.toBeNull();
  });

  it("should disconnect socket", () => {
    const mockSocket = { disconnect: vi.fn(), connected: true };
    useAuthStore.setState({ socket: mockSocket as any });

    useAuthStore.getState().disconnectSocket();

    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});
