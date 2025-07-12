import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ChatTab from '../ChatTab';

const mockUserStore = {
  currentUser: { _id: 'user1' },
  currentRecipient: { _id: 'user2', name: 'Recipient' },
};

const mockChatStore = {
  messages: [
    {
      _id: 'msg1',
      content: 'Hello',
      recipientId: 'user2',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      _id: 'msg2',
      content: 'Hi',
      recipientId: 'user1',
      updatedAt: '2023-01-01T01:00:00Z',
    },
  ],
  getMessages: vi.fn(),
  subscribeToMessages: vi.fn(),
  unsubscribeFromMessages: vi.fn(),
  sendMessage: vi.fn(),
  selectedUser: { _id: 'user1' },
};

const mockTimeUtils = {
  getTimeDifferenceInSeconds: vi.fn(() => 3600),
  formatTimestamp: vi.fn(() => 'Formatted Timestamp'),
};

vi.mock('../../../../../store/user.store.ts', () => ({
  __esModule: true,
  default: () => mockUserStore,
}));

vi.mock('../../../../../store/messages.store.ts', () => ({
  __esModule: true,
  useChatStore: () => mockChatStore,
}));

vi.mock('../../../../utils/time.ts', () => mockTimeUtils);

afterEach(() => {
  // Reset mocks after each test
  mockChatStore.getMessages.mockReset();
  mockChatStore.subscribeToMessages.mockReset();
  mockChatStore.unsubscribeFromMessages.mockReset();
  mockChatStore.sendMessage.mockReset();
  mockTimeUtils.getTimeDifferenceInSeconds.mockReset();
  mockTimeUtils.formatTimestamp.mockReset();
});

describe('ChatTab Component', () => {
  it('renders correctly', () => {
    render(<ChatTab />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi')).toBeInTheDocument();
  });

  it('prevents sending empty messages', () => {
    render(<ChatTab />);
    const form = screen.getByTestId('chat-tab-form');
    fireEvent.submit(form);
    expect(mockChatStore.sendMessage).not.toHaveBeenCalled();
  });

  it('calls sendMessage with correct parameters', () => {
    render(<ChatTab />);
    const input = screen.getByTestId('message-input');
    fireEvent.change(input, { target: { value: 'Test Message' } });
    const form = screen.getByTestId('chat-tab-form');
    fireEvent.submit(form);

    expect(mockChatStore.sendMessage).toHaveBeenCalled();
  });

  it('calls getMessages when selectedUser._id changes', () => {
    render(<ChatTab />);
    expect(mockChatStore.getMessages).toHaveBeenCalledWith('user1');
  });

  it('calls subscribeToMessages and unsubscribeFromMessages correctly', () => {
    const { unmount } = render(<ChatTab />);
    expect(mockChatStore.subscribeToMessages).toHaveBeenCalled();
    unmount();
    expect(mockChatStore.unsubscribeFromMessages).toHaveBeenCalled();
  });

  it('renders messages correctly', () => {
    render(<ChatTab />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi')).toBeInTheDocument();
    expect(screen.getByTestId('message-timestamp')).toBeInTheDocument();
  });
});
