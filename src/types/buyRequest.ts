export interface BuyRequest {
  _id: string;
  name: string;
  contactNumber: string;
  email: string;
  bestTimeToCall: 'morning' | 'afternoon' | 'evening' | 'anytime';
  description: string;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBuyRequestData {
  name: string;
  contactNumber: string;
  email: string;
  bestTimeToCall: 'morning' | 'afternoon' | 'evening' | 'anytime';
  description: string;
}

export interface BuyRequestResponse {
  message: string;
  requestId: string;
  status: string;
}

export interface BuyRequestsListResponse {
  buyRequests: BuyRequest[];
  totalPages: number;
  currentPage: number;
  total: number;
}
