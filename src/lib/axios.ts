import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { BasePath } from '../config';
import { TokenStorage } from '../utils/tokenStorage';

const baseURL: string = `${BasePath}/api`;

export const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

// Add request interceptor to include Authorization header
axiosInstance.interceptors.request.use(
  config => {
    const token = TokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token from responses
axiosInstance.interceptors.response.use(
  response => {
    // Check if response contains a token (for login/signup)
    const token = response.data?.token;
    if (token) {
      TokenStorage.setToken(token);
    }
    return response;
  },
  error => {
    // If we get 401, clear the token
    if (error.response?.status === 401) {
      TokenStorage.removeToken();
    }
    return Promise.reject(error);
  }
);
