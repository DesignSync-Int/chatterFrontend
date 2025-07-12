import type { User } from "../types/auth";

export interface Message {
  _id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}
export type MessageType = "received" | "sent";
export type MessageProps = {
  message: { content: string; senderId: string; recipientId: string };
  type?: MessageType;
  isNotRecent?: boolean;
};

export interface ChatStore {
  messages: Record<string, Message[]>;
  users: User[];
  selectedUser: User | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
}
