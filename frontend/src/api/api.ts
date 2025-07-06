import axios, { type AxiosError, type AxiosResponse } from "axios";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "../shared/utils/tokenManager";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
// const baseURL = "http://192.168.49.97:8000";

// Token management - will be set by AuthContext
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

const api = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  withCredentials: true, // Important: enables sending/receiving cookies for refresh tokens
});

// Request interceptor to add access token from state
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Import here to avoid circular dependency
        const { refreshToken: refreshTokenService } = await import(
          "../features/auth/services/authService"
        );
        const response = await refreshTokenService();

        const newAccessToken = response.access_token;

        // Update token using token manager (will notify AuthContext)
        setAccessToken(newAccessToken);

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        processQueue(refreshError, null);
        clearAccessToken();
        // Don't redirect automatically - let the component handle it
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
