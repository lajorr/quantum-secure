import LogoutIcon from '@mui/icons-material/Logout'
import { Buffer } from 'buffer'
import { useEffect, useMemo, useState } from 'react'
import { useWebSocket } from '../../../shared/hooks/useWebSocket'
import { WebSocketService } from '../../../shared/services/websocket.service'
import { getInitials } from '../../../utils/string_utils'
import { useAuth } from '../../auth/context/AuthContext'
import { AES } from '../aes_implement/aes'
import { encryptCBC } from '../aes_implement/cbc'
import { useChat } from '../context/ChatContext' // adjust path if needed
import { useRSA } from '../rsa_implement/RsaContext'

import type { Message } from '../types/chat'
import ChatHeader from './ChatHeader'
import ChatInput from './ChatInput'
import ChatList from './ChatList'
import ChatMessages from './ChatMessages'

import qs from '../../../assets/qs.jpg'

export default function ChatScreen() {
  const [selectedChatId, setSelectedChatId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const { encrypt, publicKey } = useRSA()

  const {
    currentUser,
    friendList,
    generateChatId,
    getChatMessages,
    selectedUser,
    setSelectedUser,
  } = useChat()
  const { sendMessage, addMessageHandler } = useWebSocket()
  const { logout } = useAuth()

  const wsService = WebSocketService.getInstance()

  useEffect(() => {
    const removeHandler = addMessageHandler((msg) => {
      const incoming = msg
      // Check if message ID already exists in state
      setMessages((prev) => {
        if (!incoming || !incoming.sender_id) return prev
        const exists = prev.some((m) => m.id === incoming.id)
        if (exists) return prev

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

    return () => removeHandler()
  }, [selectedChatId, currentUser?.id, selectedUser?.id, addMessageHandler])

  useEffect(() => {
    async function fetchMessages() {
      if (selectedChatId && selectedUser) {
        try {
          const chatMessages = await getChatMessages(selectedChatId)
          setMessages(
            chatMessages.map((msg) => ({
              ...msg,
              isOwn: msg.sender_id === currentUser?.id,
            }))
          )
        } catch (error) {
          console.error('Failed to fetch messages:', error)
          setMessages([])
        }
      }
    }
    fetchMessages()
  }, [selectedChatId, selectedUser, currentUser?.id, getChatMessages])

  const handleAvatarClick = () => {
    console.log('Current User:', currentUser)
  }

  //RSA encryption
  // 1. Define AES key as hex string
  const aesKeyHex = '2a7c041526bcd2a4abe6158809ce4d3'
  const { encryptedAESKeyBase64, aesKeyBigInt } = useMemo(() => {
    //return array of encrypted chunks of hex aes key
    const encryptedChunks = encrypt!(aesKeyHex)
    //Base64 encode encrypted RSA output for sending
    const base64 = Buffer.from(
      encryptedChunks.map((chunk) => chunk.toString()).join(',')
    ).toString('base64')
    return {
      encryptedAESKeyBase64: base64,
      aesKeyBigInt: BigInt('0x' + aesKeyHex), //Convert hex to BigInt for AES class
    }
  }, [encrypt, aesKeyHex])
  
  const aes = new AES(aesKeyBigInt)
  const handleSend = (text: string) => {
    if (!currentUser || !selectedUser) {
      console.error('No current user or selected user')
      return
    }

    // Convert user input to Buffer
    const messageBuffer = Buffer.from(text, 'utf8')

    // Generate new random IV per message
    const iv = new Uint8Array(16)
    crypto.getRandomValues(iv)

    // Encrypt user input with AES CBC mode and Encode combined buffer as Base64 string
    const ciphertext = encryptCBC(aes, messageBuffer, iv)
    const encryptedBase64 = Buffer.from(ciphertext).toString('base64')
    
    console.log('encryptedBase64', encryptedBase64)
    // Construct message object with encrypted content
    const messageData: Message = {
      chat_id: generateChatId(currentUser!.id, selectedUser!.id),
      sender_id: currentUser!.id,
      receiver_id: selectedUser!.id,
      content: encryptedBase64, // send encrypted Base64 string here
      timestamp: new Date().toISOString(),
      isOwn: true,
      enc: 'aes-cbc',
      enc_key: encryptedAESKeyBase64,
      rsa_mod: publicKey.n.toString(),
      rsa_pub_key: publicKey.e.toString(),
    }

    if (!wsService.isReady()) {
      console.warn('WebSocket not connected yet. Message queued.')
      return
    }

    sendMessage(messageData)
  }

  const handleLogout = async () => {
    logout()
    window.location.href = '/'
  }

  if (!currentUser) {
    return (
      <div className="h-screen w-screen bg-gray-200 flex items-center justify-center">
        <div className="text-xl">Loading user data...</div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-gray-200 flex justify-center">
      <div className="flex h-full w-full max-w-[1440px]">
        <div className="w-min bg-gray-800 border-r text-gray-500 p-2 flex flex-col gap-4 items-center justify-end">
          <LogoutIcon
            sx={{ cursor: 'pointer', color: 'white' }}
            onClick={handleLogout}
          />
          <div
            className="cursor-pointer rounded-full size-10 flex justify-center items-center border-2 border-white font-bold"
            onClick={handleAvatarClick}
          >
            <h2 className="text-white">{getInitials(currentUser.username)}</h2>
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
        {!selectedUser && (
          <div className="h-full w-full flex items-center justify-center bg-white">
            <div className="relative">
              <img className="h-120" src={qs} alt="LOGO" />
              <div className="absolute bottom-[180px] flex justify-center w-full">
                <h2 className=" w-max text-lg">A Secure Chat Application</h2>
              </div>
            </div>
          </div>
        )}
        {selectedUser && (
          <div className="flex flex-col w-full">
            <ChatHeader user={selectedUser} />
            <ChatMessages
              messages={messages}
              encryptedAESKeyBase64={encryptedAESKeyBase64}
            />
            <ChatInput onSend={handleSend} />
          </div>
        )}
      </div>
    </div>
  )
}
