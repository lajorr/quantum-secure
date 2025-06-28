import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../../../shared/types/User";
import { useAuth } from "../../auth/context/AuthContext";
import { getUserDetails, getUserFiendList } from "../services/userServices";

type ChatContextType = {
  isLoading: boolean;
  friendList: User[];
  currentUser: User | null;
  getUserData: () => Promise<void>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [friendList, setFriendsList] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();

  const getUserData = async () => {
    try {
      setIsLoading(true);
      const userData: User = await getUserDetails();
      console.log("User Data:", userData);
      setCurrentUser(userData);
      await getUserFriends();
    } catch (error) {
      console.error("Failed to get user data:", error);
      // Don't throw error, just log it
    } finally {
      setIsLoading(false);
    }
  };

  const getUserFriends = async () => {
    try {
      const friendsList: User[] = await getUserFiendList();
      console.log("Friends List:", friendsList);
      setFriendsList(friendsList || []);
    } catch (error) {
      console.error("Failed to get friends list:", error);
      setFriendsList([]);
    }
  };

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (isAuthenticated) {
      getUserData();
    }
  }, [isAuthenticated]);

  return (
    <ChatContext.Provider
      value={{ getUserData, friendList, currentUser, isLoading }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
};
