export interface Notification {
  id: string;
  type: 'message' | 'user_online' | 'user_offline';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  fromUser?: {
    _id: string;
    name: string;
    profile?: string;
  };
}
