import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChatStore } from '../messages.store';
import { axiosInstance } from '../../lib/axios';

vi.mock('../../lib/axios');
vi.mock('../auth.store');

describe('useChatStore', () => {
  beforeEach(() => {
    useChatStore.setState({
      messages: {},
      users: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,
    });
  });

  it('should have default state', () => {
    const state = useChatStore.getState();
    expect(state.messages).toEqual([]);
    expect(state.users).toEqual([]);
    expect(state.selectedUser).toBeNull();
    expect(state.isUsersLoading).toBe(false);
    expect(state.isMessagesLoading).toBe(false);
  });

  it('should fetch users and update state', async () => {
    const mockUsers = [
      { _id: '1', name: 'User1' },
      { _id: '2', name: 'User2' },
    ];
    (axiosInstance.get as any).mockResolvedValue({ data: mockUsers });

    await useChatStore.getState().getUsers();

    const state = useChatStore.getState();
    expect(state.users).toEqual(mockUsers);
    expect(state.isUsersLoading).toBe(false);
  });

  it('should handle error while fetching users', async () => {
    (axiosInstance.get as any).mockRejectedValue({
      response: { data: { message: 'Failed to fetch users' } },
    });

    await useChatStore.getState().getUsers();

    const state = useChatStore.getState();
    expect(state.users).toEqual([]);
    expect(state.isUsersLoading).toBe(false);
  });

  it('should fetch messages and update state', async () => {
    const mockMessages = [
      {
        _id: '1',
        senderId: '1',
        recipientId: '2',
        content: 'Hello',
        createdAt: '2025-07-04T00:00:00Z',
      },
    ];
    (axiosInstance.get as any).mockResolvedValue({ data: mockMessages });

    await useChatStore.getState().getMessages('1');

    const state = useChatStore.getState();
    expect(state.messages).toEqual(mockMessages);
    expect(state.isMessagesLoading).toBe(false);
  });

  it('should handle error while fetching messages', async () => {
    (axiosInstance.get as any).mockRejectedValue({
      response: { data: { message: 'Failed to fetch messages' } },
    });

    await useChatStore.getState().getMessages('1');

    const state = useChatStore.getState();
    expect(state.messages).toEqual([]);
    expect(state.isMessagesLoading).toBe(false);
  });

  it('should send a message and update state', async () => {
    const mockMessage = {
      _id: '1',
      senderId: '1',
      recipientId: '2',
      content: 'Hello',
      createdAt: '2025-07-04T00:00:00Z',
    };
    (axiosInstance.post as any).mockResolvedValue({ data: mockMessage });

    useChatStore.setState({ selectedUser: { _id: '2', name: 'User2' } });

    await useChatStore.getState().sendMessage({
      content: 'Hello',
      recipientId: '2',
    });

    const state = useChatStore.getState();
    expect(state.messages).toEqual([mockMessage]);
  });

  it('should handle error while sending a message', async () => {
    (axiosInstance.post as any).mockRejectedValue({
      response: { data: { message: 'Failed to send message' } },
    });

    useChatStore.setState({ selectedUser: { _id: '2', name: 'User2' } });

    await useChatStore.getState().sendMessage({
      content: 'Hello',
      recipientId: '2',
    });

    const state = useChatStore.getState();
    expect(state.messages).toEqual([]);
  });

  it('should set selected user', () => {
    const user = { _id: '1', name: 'User1' };
    useChatStore.getState().setSelectedUser(user);

    const state = useChatStore.getState();
    expect(state.selectedUser).toEqual(user);
  });
});
