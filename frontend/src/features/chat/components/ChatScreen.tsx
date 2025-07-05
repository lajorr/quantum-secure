import LogoutIcon from '@mui/icons-material/Logout'
import { Avatar } from '@mui/material'
import { useEffect, useState } from 'react'
import { useWebSocket } from '../../../shared/hooks/useWebSocket'
import { WebSocketService } from '../../../shared/services/websocket.service'
import type { User } from '../../../shared/types/User'
import { useAuth } from '../../auth/context/AuthContext'
import { useChat } from '../context/ChatContext' // adjust path if needed
import type { Message } from '../types/chat'
import ChatHeader from './ChatHeader'
import ChatInput from './ChatInput'
import ChatList from './ChatList'
import ChatMessages from './ChatMessages'
import { AES } from '../aes_implement/aes'
import { encryptCBC } from '../aes_implement/cbc'
import { Buffer } from 'buffer'

export default function ChatScreen() {
  const [selectedChatId, setSelectedChatId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const { currentUser, friendList, generateChatId, getChatMessages } =
    useChat();
  const { sendMessage, addMessageHandler } = useWebSocket();
  const { logout } = useAuth();

  const wsService = WebSocketService.getInstance();

  useEffect(() => {
    const removeHandler = addMessageHandler((msg) => {
      const incoming = msg
      // Check if message ID already exists in state
      setMessages((prev) => {
        if (!incoming || !incoming.sender_id) return prev;
        const exists = prev.some((m) => m.id === incoming.id);
        if (exists) return prev;

        const isRelevant =
          (incoming.sender_id === selectedUser?.id &&
            incoming.receiver_id === currentUser?.id) ||
          (incoming.sender_id === currentUser?.id &&
            incoming.receiver_id === selectedUser?.id)

        if (!isRelevant) return prev

        return [
          ...prev,
          {
            ...incoming,
            id: incoming.id,
            isOwn: incoming.sender_id === currentUser?.id,
          },
        ]
      })
    })

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
    console.log('Current User:', currentUser)
  }

  const key = BigInt('0x2b7e151628aed2a6abf7158809cf4f3c')
  const aes = new AES(key)

  const handleSend = (text: string) => {
    if (!currentUser || !selectedUser) {
      console.error("No current user or selected user");
      return;
    }

    // Convert user input to Buffer
    const messageBuffer = Buffer.from(text, 'utf8')

    // Generate new random IV per message
    const iv = new Uint8Array(16)
    crypto.getRandomValues(iv)

    // Encrypt user input with AES CBC mode and Encode combined buffer as Base64 string
    const ciphertext = encryptCBC(aes, messageBuffer, iv)

    const encryptedBase64 = Buffer.from(ciphertext).toString('base64')

    // Construct message object with encrypted content
    const messageData: Message = {
      chat_id: generateChatId(currentUser!.id, selectedUser!.id),
      sender_id: currentUser!.id,
      receiver_id: selectedUser!.id,
      content: encryptedBase64, // send encrypted Base64 string here
      timestamp: new Date().toISOString(),
      isOwn: true,
    };

    if (!wsService.isReady()) {
      console.warn('WebSocket not connected yet. Message queued.')
      return
    }
  
    sendMessage(messageData)
  }

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
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              logout()
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
            const chatId = generateChatId(currentUser!.id, recieverId)
            setSelectedChatId(chatId)
            const user = friendList.find((u) => u.id === recieverId) || null
            setSelectedUser(user)
          }}
        />

        <div className="flex flex-col flex-1">
          {selectedUser && <ChatHeader user={selectedUser} />}
          <ChatMessages messages={messages} />
          {selectedUser && <ChatInput onSend={handleSend} />}
        </div>
      </div>
    </div>
  )
}
