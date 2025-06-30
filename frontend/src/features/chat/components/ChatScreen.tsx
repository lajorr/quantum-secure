import { useState, useEffect } from 'react'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'
import ChatList from './ChatList'
import { useWebSocket } from '../../../shared/hooks/useWebSocket'
import { useChat } from '../context/ChatContext' // adjust path if needed
import type { Message } from '../types/chat'
import { WebSocketService } from '../../../shared/services/websocket.service'
import ChatHeader from './ChatHeader'
import type { User } from '../../../shared/types/User'
import { useAuth } from '../../auth/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import LogoutIcon from '@mui/icons-material/Logout'
import { Avatar } from '@mui/material'

export default function ChatScreen() {
  const [selectedChatId, setSelectedChatId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>()

  const { currentUser, friendList, isLoading } = useChat()
  const { sendMessage, addMessageHandler, getClientId } = useWebSocket()
  const { logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const wsService = WebSocketService.getInstance()

  if (isLoading || !currentUser) {
    return <div className="p-4">Loading chat...</div>
  }

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('not auth')
      // navigate('/login')
      logout()
    }
  }, [])

  useEffect(() => {
    if (!friendList || friendList.length === 0) return
    const user = friendList.find((u) => u.id === selectedChatId) || null
    setSelectedUser(user)
  }, [selectedChatId, friendList])

  useEffect(() => {
    const removeHandler = addMessageHandler((msg) => {
      const incoming = msg.message

      // Check if message ID already exists in state
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === incoming.id)
        if (exists) return prev

        const isRelevant =
          (incoming.sender.id === selectedChatId &&
            incoming.receiverId === currentUser.id) ||
          (incoming.sender.id === currentUser.id &&
            incoming.receiverId === selectedChatId)

        if (!isRelevant) return prev

        return [
          ...prev,
          {
            ...incoming,
            isOwn: incoming.sender.id === currentUser.id,
          },
        ]
      })
    })

    return () => removeHandler()
  }, [selectedChatId, currentUser.id, addMessageHandler])

  useEffect(() => {
    setMessages([])
  }, [selectedChatId])
  const handleAvatarClick = () => {
    // eslint-disable-next-line no-console
    console.log('Current User:', currentUser)
  }

  const handleSend = (text: string) => {
    const messageData: Message = {
      id: crypto.randomUUID(),
      sender: currentUser,
      receiverId: selectedChatId,
      content: text,
      timestamp: new Date().toISOString(),
      isOwn: true,
    }
    if (!wsService.isReady()) {
      console.warn('WebSocket not connected yet. Message queued.')
      return
    }

    console.log(selectedChatId)
    console.log(currentUser)
    sendMessage(messageData)
    setMessages((prev) => [...prev, messageData])
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
          onSelectChat={setSelectedChatId}
        />

        <div className="flex flex-col flex-1">
          <ChatHeader user={selectedUser!!} />
          <ChatMessages messages={messages} />
          {selectedChatId && <ChatInput onSend={handleSend} />}
        </div>
      </div>
    </div>
  )
}
