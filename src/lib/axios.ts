import axios from "axios";
import { BasePath } from "../config";
import { TokenStorage } from "../utils/tokenStorage";

const baseURL: string = `${BasePath}/api`;

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

// Add request interceptor to include Authorization header
axiosInstance.interceptors.request.use(
  (config: any) => {
    const token = TokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token from responses
axiosInstance.interceptors.response.use(
  (response: any) => {
    // Check if response contains a token (for login/signup)
    const token = response.data?.token;
    if (token) {
      TokenStorage.setToken(token);
    }
    return response;
  },
  (error: any) => {
    // If we get 401, clear the token and redirect to login
    if (error.response?.status === 401) {
      TokenStorage.removeToken();

      // Clear any user data from stores
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;

        // Don't redirect if we're on public/auth pages that should be accessible without login
        const publicPages = [
          "/",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
        ];

        const isPublicPage = publicPages.some((page) =>
          currentPath.startsWith(page)
        );

        if (!isPublicPage) {
          // Only redirect if not already on a public page
          sessionStorage?.setItem("justLoggedOut", "true");
          window.location.href = "/";
        }
      }
    }
    return Promise.reject(error);
  }
);
