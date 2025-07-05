import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import type { User } from "../../../shared/types/User";
import { clearAccessToken, getAccessToken, removeTokenUpdateCallback, setAccessToken, setTokenUpdateCallback } from "../../../shared/utils/tokenManager";
import { getUserDetails } from "../../chat/services/chatServices";
import { login as apiLogin, logout as apiLogout, signup as register } from "../services/authService";
import type { LoginResponse } from "../types/login_response";

type AuthContextType = {
  user: User | null;
  hasError: boolean;
  signup: (username: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  isAuthenticated: boolean;
  checkToken: () => Promise<void>;
  authLoading: boolean;
  logout: () => void;
  accessToken: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);

  // Set up token update callback to keep state in sync
  useEffect(() => {
    const handleTokenUpdate = (token: string | null) => {
      setAccessTokenState(token);
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    setTokenUpdateCallback(handleTokenUpdate);

    // Initialize with current token
    const currentToken = getAccessToken();
    if (currentToken) {
      setAccessTokenState(currentToken);
      setIsAuthenticated(true);
      setAuthLoading(false);
    } else {
      setAccessTokenState(null);
      setIsAuthenticated(false);
      setUser(null);
      setAuthLoading(false);
    }

    return () => {
      removeTokenUpdateCallback();
    };
  }, []);

  const signup = async (username: string, email: string, password: string) => {
    try {
      await register(email, username, password);
      setHasError(false);
    } catch (error) {
      setHasError(true);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      const response: LoginResponse = await apiLogin(email, password);
      
      // Store access token using token manager (will update state via callback)
      setAccessToken(response.access_token);
      
      setIsAuthenticated(true);
      setHasError(false);
      
      // Fetch user data after successful login
      await getUserData();
    } catch (error) {
      console.error("Login failed:", error);
      setHasError(true);
      setIsAuthenticated(false);
      setAuthLoading(false);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear local state immediately to prevent loading issues
      clearAccessToken();
      setIsAuthenticated(false);
      setUser(null);
      setHasError(false);
      
      // Make the logout API call (but don't wait for it to complete)
      apiLogout().catch((error) => {
        console.error("Logout API call failed:", error);
        // Don't throw the error - logout should succeed even if API fails
      });
    } catch (error) {
      console.error("Logout process failed:", error);
      // Ensure state is cleared even if there's an error
      clearAccessToken();
      setIsAuthenticated(false);
      setUser(null);
      setHasError(false);
    }
  };

  const getUserData = async () => {
    try {
      const userData: User = await getUserDetails();
      setUser(userData);
    } catch (error) {
      console.error("Failed to get user data:", error);
      throw error;
    }
  };

  const checkToken = async () => {
    try {
      const token = getAccessToken();

      if (!token) {
        // Don't set authentication state yet, let the API call determine it
      }

      // Always try to fetch user details, even with no token
      // The axios interceptor will handle token refresh if needed
      await getUserData();
      setIsAuthenticated(true);
      setHasError(false);
      setAccessTokenState(token || getAccessToken()); // Use current token (may have been refreshed)
    } catch (error: any) {
      console.error("Token validation failed:", error);

      // If it's a 401, the axios interceptor should have handled the refresh
      // If we still get here, it means refresh failed
      if (error?.response?.status === 401) {
        // Don't call logout() here as it makes another API call
        // Just clear the local state
        clearAccessToken();
        setIsAuthenticated(false);
        setUser(null);
        setHasError(true);
      } else {
        // For other errors (network, server down, etc.),
        // keep the user logged in if they have a token
        const token = getAccessToken();
        if (token) {
          setIsAuthenticated(true);
          setHasError(false);
          setAccessTokenState(token);
        } else {
          clearAccessToken();
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signup,
        hasError,
        login,
        logout,
        isAuthenticated,
        user,
        checkToken,
        authLoading,
        accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
