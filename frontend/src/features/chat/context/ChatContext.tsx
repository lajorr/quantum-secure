import { createContext, useContext, useEffect, useState } from "react";
import type { Friend, User } from "../../../shared/types/User";
import { useAuth } from "../../auth/context/AuthContext";
import {
  fetchMessages,
  getUserDetails,
  getUserFiendList,
} from "../services/chatServices";
import type { Message } from "../types/chat";

type ChatContextType = {
  isLoading: boolean;
  friendList: Friend[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  getUserData: () => Promise<void>;
  selectedUser: Friend | null;
  setSelectedUser: (user: Friend | null) => void;
  generateChatId: (senderId: string, receiverId: string) => string;
  getChatMessages: (chatId: string) => Promise<Message[]>;
  encMode: "RSA" | "ML-KEM";
  toggleEncryptionMethod: (mode?: "RSA" | "ML-KEM") => void;
  msgViewMode: "Encrypted" | "Normal";
  toggleMessageMode: () => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [friendList, setFriendsList] = useState<Friend[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<Friend | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();

  const [encMode, setEncMode] = useState<"RSA" | "ML-KEM">("RSA");
  const [msgViewMode, setMsgViewMode] = useState<"Encrypted" | "Normal">(
    "Normal"
  );

  const toggleEncryptionMethod = (mode?: "RSA" | "ML-KEM") => {
    if (mode != null) {
      setEncMode(mode);
      return;
    }
    setEncMode((prev) => (prev === "RSA" ? "ML-KEM" : "RSA"));
  };

  const toggleMessageMode = () => {
    setMsgViewMode((prev) => (prev === "Encrypted" ? "Normal" : "Encrypted"));
  };

  const getUserData = async () => {
    try {
      setIsLoading(true);
      const userData: User = await getUserDetails();
      setCurrentUser(userData);
      await getUserFriends();
    } catch (error) {
      console.error("Failed to get user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserFriends = async () => {
    try {
      const friendsList: Friend[] = await getUserFiendList();
      console.log("friendsList context: ", friendsList);
      setFriendsList(friendsList || []);
    } catch (error) {
      console.error("Failed to get friends list:", error);
      setFriendsList([]);
    }
  };

  const generateChatId = (senderId: string, receiverId: string) => {
    const sortedIds = [senderId, receiverId].sort();
    return sortedIds.join("-");
  };

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (isAuthenticated) {
      getUserData();
    }
  }, [isAuthenticated]);

  const getChatMessages = async (chatId: string): Promise<Message[]> => {
    try {
      const messages: Message[] = await fetchMessages(chatId);
      return messages;
    } catch (error) {
      console.log("Error fetching messages:", error);
      throw error;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        getUserData,
        friendList,
        currentUser,
        setCurrentUser,
        isLoading,
        generateChatId,
        getChatMessages,
        selectedUser,
        setSelectedUser,
        toggleEncryptionMethod,
        encMode,
        toggleMessageMode,
        msgViewMode,
      }}
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
