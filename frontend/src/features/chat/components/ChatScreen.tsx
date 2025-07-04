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
    if (!isAuthenticated) {
      console.log("not auth");
      logout();
    }
  }, []);

  useEffect(() => {
    const removeHandler = addMessageHandler((msg) => {
      const incoming = msg;
      // Check if message ID already exists in state
      setMessages((prev) => {
        if (!incoming || !incoming.sender_id) return prev;
        const exists = prev.some((m) => m.id === incoming.id);
        if (exists) return prev;
        console.log("USERRR", selectedUser);

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
  }, [selectedChatId, currentUser?.id, addMessageHandler]);

  useEffect(() => {
    async function fetchMessages() {
      if (selectedChatId) {
        const chatMessages = await getChatMessages(selectedChatId);
        setMessages(chatMessages);
        setMessages((_) => {
          return chatMessages.map((msg) => ({
            ...msg,
            isOwn: msg.sender_id === currentUser?.id,
          }));
        });
      }
    }
    fetchMessages();
  }, [selectedChatId]);

  const handleAvatarClick = () => {
    console.log("Current User:", currentUser);
  };

  const handleSend = (text: string) => {
    const messageData: Message = {
      chat_id: generateChatId(currentUser!.id, selectedUser!.id),
      sender_id: currentUser!.id,
      receiver_id: selectedUser!.id,
      content: text,
      timestamp: new Date().toISOString(),
      isOwn: true,
    };
    if (!wsService.isReady()) {
      console.warn("WebSocket not connected yet. Message queued.");
      return;
    }

    console.log(selectedChatId);
    console.log(currentUser);
    sendMessage(messageData);
  };

  // if (isLoading || !currentUser) {
  //   return <div className="p-4">Loading chat...</div>;
  // }

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
          onSelectChat={(recieverId) => {
            const chatId = generateChatId(currentUser!.id, recieverId);
            setSelectedChatId(chatId);
            const user = friendList.find((u) => u.id === recieverId) || null;
            setSelectedUser(user);
          }}
        />

        <div className="flex flex-col flex-1">
          <ChatHeader user={selectedUser!!} />
          <ChatMessages messages={messages} />
          {selectedChatId && <ChatInput onSend={handleSend} />}
        </div>
      </div>
    </div>
  );
}
