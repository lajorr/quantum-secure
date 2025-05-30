import { Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { allMessages, chatList } from "../../../constants/chatData";
import { useAuth } from "../../auth/context/AuthContext";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";

function ChatScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState("1");
  const selectedChat = chatList.find((c) => c.id === selectedChatId)!;
  const messages = allMessages[selectedChatId] || [];

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);
  const handleSend = (text: string) => {
    // ws ma send
    console.log("Send:", text);
  };

  const handleAvatarClick = () => {
    // eslint-disable-next-line no-console
    console.log("Current User:", user);
  };

  return (
    <div className="h-screen w-screen bg-gray-200 flex justify-center">
      <div className="flex h-full w-full max-w-[1440px]">
        <div className="w-min bg-gray-800 text-white p-4 flex flex-col justify-end">
          {/* <div>
            <h2 className="text-xl font-bold mb-4">Chat</h2>
            Add any sidebar content here
          </div> */}
          <div
            className="flex items-center cursor-pointer"
            onClick={handleAvatarClick}
          >
            <Avatar className="mr-2" src={user?.avatarUrl} alt={user?.name} />
          </div>
        </div>
        <ChatList
          chats={chatList}
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
        />
        <div className="flex flex-col flex-1 h-full">
          <ChatHeader user={selectedChat.user} />
          <ChatMessages messages={messages} />
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}

export default ChatScreen;
