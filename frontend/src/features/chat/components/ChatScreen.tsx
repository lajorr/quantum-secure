import LogoutIcon from "@mui/icons-material/Logout";
import { Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import { allMessages } from "../../../constants/chatData";
import type { User } from "../../../shared/types/User";
import { useAuth } from "../../auth/context/AuthContext";
import { useChat } from "../context/ChatContext";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";

function ChatScreen() {
  const { currentUser, getUserData, friendList, isLoading } = useChat();
  const { logout, isAuthenticated } = useAuth();
  useEffect(() => {
    const fetchData = async () => {
      await getUserData();
    };

    fetchData();
  }, []);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>();
  // const selectedUser = friendList.find((c) => c.id === selectedUserId)!;
  const messages = allMessages[1] || [];

  useEffect(() => {
    if (!isAuthenticated) {
      logout();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!friendList || friendList.length === 0) return;
    setSelectedUserId(friendList[0].id);
  }, [friendList]);

  useEffect(() => {
    if (!friendList || friendList.length === 0) return;
    const user = friendList.find(u => u.id === selectedUserId) || null;
    setSelectedUser(user);
  }, [selectedUserId, friendList]);

  const handleSend = (text: string) => {
    // ws ma send
    console.log("Send:", text);
  };

  const handleAvatarClick = () => {
    // eslint-disable-next-line no-console
    console.log("Current User:", currentUser);
  };
  if (isLoading) return <div>Loading...</div>;
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
          selectedChatId={selectedUserId}
          onSelectChat={setSelectedUserId}
        />
        <div className="flex flex-col flex-1 h-full">
          <ChatHeader user={selectedUser!!} />
          <ChatMessages messages={messages} />
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}

export default ChatScreen;
