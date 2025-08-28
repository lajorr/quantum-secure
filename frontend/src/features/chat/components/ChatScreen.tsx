import LogoutIcon from "@mui/icons-material/Logout";
import { Buffer } from "buffer";
import { useEffect, useMemo, useState } from "react";
import { useWebSocket } from "../../../shared/hooks/useWebSocket";
import { WebSocketService } from "../../../shared/services/websocket.service";
import { getInitials } from "../../../utils/string_utils";
import { useAuth } from "../../auth/context/AuthContext";
import { AES } from "../aes_implement/aes";
import { encryptCBC } from "../aes_implement/cbc";
import { useChat } from "../context/ChatContext";
import { useRSA } from "../rsa_implement/RsaContext";

import type { Message } from '../types/chat'
import ChatHeader from './ChatHeader'
import ChatInput from './ChatInput'
import ChatList from './ChatList'
import ChatMessages from './ChatMessages'

import qs from '../../../assets/qs.jpg'

export default function ChatScreen() {
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [encryptionMethod, setEncryptionMethod] = useState<'RSA' | 'ML-KEM'>('RSA');
  const { encrypt, publicKey } = useRSA();

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
            ...msg,
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
    console.log("Current User:", currentUser);
  };

  const toggleEncryptionMethod = () => {
    setEncryptionMethod(prev => prev === 'RSA' ? 'ML-KEM' : 'RSA');
  };

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
      <div className="h-screen w-screen bg-gradient-to-br from-teal-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-xl text-teal-100">Loading user data...</div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-teal-900 via-blue-900 to-slate-900 flex">
      {/* Left Sidebar - Navigation Panel */}
      <div className="w-20 bg-black/20 backdrop-blur-md border-r border-white/10 flex flex-col items-center py-6">
        {/* Profile Picture */}
        <div className="relative mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center font-bold text-white text-lg">
            {getInitials(currentUser.username)}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black/20"></div>
        </div>

        {/* Navigation Icons */}
        <div className="flex flex-col items-center space-y-6">
          <div className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center cursor-pointer transition-all">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400/40 to-purple-500/40 border border-teal-400/50 rounded-full flex items-center justify-center cursor-pointer transition-all">
            <svg className="w-5 h-5 text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          
          <div className="w-10 h-10 bg-white/10 hover:bg-amber-500/20 rounded-full flex items-center justify-center cursor-pointer transition-all group">
            <svg className="w-5 h-5 text-white group-hover:text-amber-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-15z" />
            </svg>
          </div>
          
          <div className="w-10 h-10 bg-white/10 hover:bg-purple-500/20 rounded-full flex items-center justify-center cursor-pointer transition-all group">
            <svg className="w-5 h-5 text-white group-hover:text-purple-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-auto">
          <div 
            className="w-10 h-10 bg-white/10 hover:bg-red-500/30 rounded-full flex items-center justify-center cursor-pointer transition-all"
            onClick={handleLogout}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
        </div>
      </div>

      {/* Middle Panel - Chat List */}
      <div className="w-96 bg-black/10 backdrop-blur-md border-r border-white/10">
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
      </div>

      {/* Right Panel - Chat Conversation */}
      <div className="flex-1 bg-black/5 backdrop-blur-md flex flex-col">
        {!selectedUser ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center">
              <img className="h-32 w-32 mx-auto mb-4 opacity-30" src={qs} alt="LOGO" />
              <h2 className="text-2xl font-semibold text-teal-100 mb-2">Welcome to Quantum Secure</h2>
              <p className="text-teal-200/70">Select a chat to start messaging</p>
              <div className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20">
                <p className="text-sm text-teal-200/70">Current Encryption: <span className={`font-semibold ${encryptionMethod === 'ML-KEM' ? 'text-purple-300' : 'text-teal-300'}`}>{encryptionMethod}</span></p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <ChatHeader user={selectedUser} encryptionMethod={encryptionMethod} onToggleEncryption={toggleEncryptionMethod} />
            <ChatMessages
              messages={messages}
              encryptedAESKeyBase64={encryptedAESKeyBase64}
            />
            <ChatInput onSend={handleSend} />
          </>
        )}
      </div>
    </div>
  )
}
