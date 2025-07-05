import LogoutIcon from "@mui/icons-material/Logout";
import { Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import { useWebSocket } from "../../../shared/hooks/useWebSocket";
import { WebSocketService } from "../../../shared/services/websocket.service";
import type { User } from "../../../shared/types/User";
import { useAuth } from "../../auth/context/AuthContext";
import { useChat } from "../context/ChatContext"; // adjust path if needed
import type { Message } from "../types/chat";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";

export default function ChatScreen() {
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>();

  const { currentUser, friendList, generateChatId, getChatMessages } =
    useChat();
  const { sendMessage, addMessageHandler } = useWebSocket();
  const { logout, isAuthenticated } = useAuth();

  const wsService = WebSocketService.getInstance();

  useEffect(() => {
    const removeHandler = addMessageHandler((msg) => {
      const incoming = msg;
      // Check if message ID already exists in state
      setMessages((prev) => {
        if (!incoming || !incoming.sender_id) return prev;
        const exists = prev.some((m) => m.id === incoming.id);
        if (exists) return prev;

        const isRelevant =
          (incoming.sender_id === selectedUser?.id &&
            incoming.receiver_id === currentUser?.id) ||
          (incoming.sender_id === currentUser?.id &&
            incoming.receiver_id === selectedUser?.id);

        if (!isRelevant) return prev;

        return [
          ...prev,
          {
            ...incoming,
            id: incoming.id,
            isOwn: incoming.sender_id === currentUser?.id,
          },
        ];
      });
    });

    return () => removeHandler();
  }, [selectedChatId, currentUser?.id, selectedUser?.id, addMessageHandler]);

  useEffect(() => {
    async function fetchMessages() {
      if (selectedChatId && selectedUser) {
        try {
          const chatMessages = await getChatMessages(selectedChatId);
          setMessages(
            chatMessages.map((msg) => ({
              ...msg,
              isOwn: msg.sender_id === currentUser?.id,
            }))
          );
        } catch (error) {
          console.error("Failed to fetch messages:", error);
          setMessages([]);
        }
      }
    }
    fetchMessages();
  }, [selectedChatId, selectedUser, currentUser?.id, getChatMessages]);

  const handleAvatarClick = () => {
    console.log("Current User:", currentUser);
  };

  const handleSend = (text: string) => {
    if (!currentUser || !selectedUser) {
      console.error("No current user or selected user");
      return;
    }

    const messageData: Message = {
      chat_id: generateChatId(currentUser.id, selectedUser.id),
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      content: text,
      timestamp: new Date().toISOString(),
      isOwn: true,
    };

    if (!wsService.isReady()) {
      console.warn("WebSocket not connected yet. Message queued.");
      return;
    }

    console.log("Sending message:", messageData);
    sendMessage(messageData);
    
    // // Add message to local state immediately for better UX
    // setMessages((prev) => [...prev, messageData]);
  };

  if (!currentUser) {
    return (
      <div className="h-screen w-screen bg-gray-200 flex items-center justify-center">
        <div className="text-xl">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-200 flex justify-center">
      <div className="flex h-full w-full max-w-[1440px]">
        <div className="w-min bg-gray-800 text-white p-2 flex flex-col gap-4 items-center justify-end">
          <LogoutIcon
            sx={{ cursor: "pointer" }}
            onClick={() => {
              logout();
            }}
          />
          <div className=" cursor-pointer" onClick={handleAvatarClick}>
            <Avatar
              sx={{ width: 40, height: 40 }}
              src="https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
              alt={currentUser?.username}
            />
          </div>
        </div>
        <ChatList
          friendList={friendList}
          selectedChatId={selectedChatId}
          onSelectChat={(receiverId) => {
            const chatId = generateChatId(currentUser.id, receiverId);
            setSelectedChatId(chatId);
            const user = friendList.find((u) => u.id === receiverId) || null;
            setSelectedUser(user);
          }}
        />

        <div className="flex flex-col flex-1">
          {selectedUser && <ChatHeader user={selectedUser} />}
          <ChatMessages messages={messages} />
          {selectedUser && <ChatInput onSend={handleSend} />}
        </div>
      </div>
    </div>
  );
}
