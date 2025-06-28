import { createContext, type ReactNode, useContext, useState } from "react";
import type { User } from "../../../shared/types/User";
import { getUserDetails } from "../../chat/services/userServices";
import { login as apiLogin, signup as register } from "../services/authService";

type AuthContextType = {
  user: User | null;
  hasError: boolean;
  signup: (username: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  isAuthenticated: boolean;
  checkToken: () => Promise<void>;
  authLoading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const signup = async (username: string, email: string, password: string) => {
    try {
      await register(email, username, password);
      setHasError(false);
    } catch (error) {
      setHasError(true);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      localStorage.setItem("token", response.access_token);
      setIsAuthenticated(true);
      setHasError(false);
      // Fetch user data after successful login
      await getUserData();
    } catch (error) {
      setHasError(true);
      setIsAuthenticated(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    setHasError(false);
  };

  const getUserData = async () => {
    try {
      const userData: User = await getUserDetails();
      console.log("User Data:", userData);
      setUser(userData);
    } catch (error) {
      console.error("Failed to get user data:", error);
      throw error;
    }
  };

  const checkToken = async () => {
    try {
      setAuthLoading(true);
      const token = localStorage.getItem("token");
      console.log("Checking token:", token ? "Token exists" : "No token");

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setAuthLoading(false);
        return;
      }

      console.log("Attempting to validate token with backend...");
      // Validate token by fetching user details
      await getUserData();
      console.log("Token validation successful");
      setIsAuthenticated(true);
      setHasError(false);
    } catch (error: any) {
      console.error("Token validation failed:", error);
      console.error("Error details:", {
        status: error?.response?.status,
        message: error?.message,
        response: error?.response?.data
      });
      
      // Only logout if it's an authentication error (401)
      if (error?.response?.status === 401) {
        console.log("Authentication error (401), logging out user");
        logout();
        setHasError(true);
      } else {
        // For other errors (network, server down, etc.), 
        // keep the user logged in if they have a token
        console.error("Non-auth error during token check, keeping user logged in");
        const token = localStorage.getItem("token");
        if (token) {
          console.log("Token exists in localStorage, keeping user authenticated");
          setIsAuthenticated(true);
          setHasError(false);
        } else {
          console.log("No token in localStorage, logging out");
          logout();
        }
      }
    } finally {
      setAuthLoading(false);
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
