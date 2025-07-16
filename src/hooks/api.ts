import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import type { User } from '../types/auth';

// Query keys
export const queryKeys = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  messages: (chatId: string) => ['messages', chatId] as const,
  auth: ['auth'] as const,
} as const;

// Users API hooks
export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => {
      const response = await axiosInstance.get<User[]>('/users');
      return response.data;
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: async () => {
      const response = await axiosInstance.get<User>(`/users/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Auth mutation hooks
export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await axiosInstance.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth });
    },
  });
};

export const useSignupMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: { name: string; email: string; password: string }) => {
      const response = await axiosInstance.post('/auth/signup', userData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth });
    },
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData: Partial<User>) => {
      const response = await axiosInstance.put('/auth/profile', profileData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};
