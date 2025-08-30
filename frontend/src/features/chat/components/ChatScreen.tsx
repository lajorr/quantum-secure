import { Buffer } from "buffer";
import { useEffect, useState } from "react";
import SideNav from "../../../components/SideNav";
import { useWebSocket } from "../../../shared/hooks/useWebSocket";
import { WebSocketService } from "../../../shared/services/websocket.service";
import { AES } from "../aes_implement/aes";
import { encryptCBC } from "../aes_implement/cbc";
import { useChat } from "../context/ChatContext";
import { useRSA } from "../rsa_implement/RsaContext";

import type { Message } from "../types/chat";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatList from "./ChatList";

import qs from "../../../assets/qs.jpg";
import { bytesToBigInt, bytesToString } from "../../../mlkem";
import { useMLKEM } from "../context/MLKemContext";
import ChatMessages from "./ChatMessages";

export default function ChatScreen() {
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [rsaMessages, setRsaMessages] = useState<Message[]>([]);
  const [mlkemMessages, setMlkemMessages] = useState<Message[]>([]);

  const [aes, setAes] = useState<AES>();
  const { publicKey, getEncryptedAesKey, getAesBigIntKey } = useRSA();
  const mlkemCtx = useMLKEM();

  const {
    currentUser,
    friendList,
    generateChatId,
    getChatMessages,
    selectedUser,
    setSelectedUser,
    encMode,
    toggleEncryptionMethod,
  } = useChat();
  const { sendMessage, addMessageHandler } = useWebSocket();

  const wsService = WebSocketService.getInstance();

  useEffect(() => {
    const removeHandler = addMessageHandler((msg) => {
      const incoming = msg;

      // Check if message ID already exists in state
      if (incoming.enc === "rsa")
        setRsaMessages((prev) => {
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
              ...msg,
              id: incoming.id,
              isOwn: incoming.sender_id === currentUser?.id,
            },
          ];
        });
      else
        setMlkemMessages((prev) => {
          console.log("setting mlkem messages");
          if (!incoming || !incoming.sender_id) return prev;
          // const exists = prev.some((m) => m.id === incoming.id);
          // if (exists) return prev;

          const isRelevant =
            (incoming.sender_id === selectedUser?.id &&
              incoming.receiver_id === currentUser?.id) ||
            (incoming.sender_id === currentUser?.id &&
              incoming.receiver_id === selectedUser?.id);
          console.log("relevamt", isRelevant);
          if (!isRelevant) return prev;
          console.log("msg", incoming.content);

          return [
            ...prev,
            {
              ...msg,
              id: incoming.id,
              isOwn: incoming.sender_id === currentUser?.id,
            },
          ];
        });
    });

    return () => removeHandler();
  }, [selectedChatId, currentUser?.id, selectedUser?.id]);

  useEffect(() => {
    async function fetchMessages() {
      if (selectedChatId && selectedUser) {
        try {
          const chatMessages = await getChatMessages(selectedChatId);
          setRsaMessages(
            chatMessages.map((msg) => ({
              ...msg,
              isOwn: msg.sender_id === currentUser?.id,
            }))
          );
        } catch (error) {
          console.error("Failed to fetch messages:", error);
          setRsaMessages([]);
        }
      }
    }
    fetchMessages();
  }, [selectedChatId, selectedUser, currentUser?.id]);

  const handleSend = (text: string) => {
    if (!currentUser || !selectedUser) {
      console.error("No current user or selected user");
      return;
    }

    // Convert user input to Buffer
    const messageBuffer = Buffer.from(text, "utf8");

    // Generate new random IV per message
    const iv = new Uint8Array(16);
    crypto.getRandomValues(iv);
    const aess = encMode === "RSA" ? new AES(getAesBigIntKey()) : aes;
    // Encrypt user input with AES CBC mode and Encode combined buffer as Base64 string
    const ciphertext = encryptCBC(aess!, messageBuffer, iv);
    const encryptedBase64 = Buffer.from(ciphertext).toString("base64");

    // Construct message object with encrypted content
    const messageData: Message = {
      chat_id: generateChatId(currentUser!.id, selectedUser!.id),
      sender_id: currentUser!.id,
      receiver_id: selectedUser!.id,
      content: encryptedBase64,
      timestamp: new Date().toISOString(),
      isOwn: true,
      enc: encMode === "RSA" ? "rsa" : "ml-kem",
      enc_key: encMode === "RSA" ? getEncryptedAesKey() : "", //encrypted AES key
      ct: encMode === "RSA" ? "" : bytesToString(mlkemCtx.getCipherText()),
      rsa_mod: publicKey.n.toString(),
      rsa_pub_key: publicKey.e.toString(),
    };

    if (!wsService.isReady()) {
      console.warn("WebSocket not connected yet. Message queued.");
      return;
    }
    if (encMode === "RSA") {
      setRsaMessages((prev) => [...prev, messageData]);
    } else {
      setMlkemMessages((prev) => [...prev, messageData]);
    }
    sendMessage(messageData);
  };

  //for esc button in chat screen (ensure hooks order consistent by declaring before any conditional returns)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        console.log("Escape key pressed");
        setSelectedUser(null);
        setSelectedChatId("");
        setRsaMessages([]);
        setMlkemMessages([]);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  useEffect(() => {
    setMlkemMessages([]);
  }, [encMode]);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-teal-900 via-blue-900 to-slate-900 flex">
      {/* Left Sidebar - Navigation Panel */}
      <SideNav />

      {/* Middle Panel - Chat List */}
      <div className="w-96 bg-black/10 backdrop-blur-md border-r border-white/10">
        <ChatList
          friendList={friendList}
          selectedChatId={selectedChatId}
          onSelectChat={(friend) => {
            const chatId = generateChatId(currentUser!.id, friend.id);
            setSelectedChatId(chatId);
            const fr = friendList.find((u) => u.id === friend.id) || null;
            setSelectedUser(fr);
            const aesKeyHex = mlkemCtx.getAesKey(fr?.pub_key!);
            const aesKeyBigInt = bytesToBigInt(aesKeyHex);
            const aes = new AES(aesKeyBigInt);
            setAes(aes);
            toggleEncryptionMethod("RSA");
            // setRsaMessages([]);
          }}
        />
      </div>

      {/* Right Panel - Chat Conversation */}
      <div className="flex-1 bg-black/5 backdrop-blur-md flex flex-col">
        {!currentUser ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center">
              <img
                className="h-32 w-32 mx-auto mb-4 opacity-30"
                src={qs}
                alt="LOGO"
              />
              <h2 className="text-2xl font-semibold text-teal-100 mb-2">
                Loading user data...
              </h2>
            </div>
          </div>
        ) : !selectedUser ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center">
              <img
                className="h-32 w-32 mx-auto mb-4 opacity-30"
                src={qs}
                alt="LOGO"
              />
              <h2 className="text-2xl font-semibold text-teal-100 mb-2">
                Welcome to Quantum Secure
              </h2>
              <p className="text-teal-200/70">
                Select a chat to start messaging
              </p>
            </div>
          </div>
        ) : (
          <>
            <ChatHeader user={selectedUser} />
            <ChatMessages
              messages={encMode === "RSA" ? rsaMessages : mlkemMessages}
            />
            <ChatInput onSend={handleSend} />
          </>
        )}
      </div>
    </div>
  );
}
