export interface FriendRequest {
  _id: string;
  sender: {
    _id: string;
    name: string;
    profile?: string;
  };
  receiver: {
    _id: string;
    name: string;
    profile?: string;
  };
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FriendshipStatus {
  status: 'friends' | 'pending' | 'none';
  requestType?: 'sent' | 'received';
  requestId?: string;
}
