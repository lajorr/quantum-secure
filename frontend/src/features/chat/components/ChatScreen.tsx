import SideNav from "../../../components/SideNav";
import { Buffer } from "buffer";
import { useEffect, useMemo, useState } from "react";
import { useWebSocket } from "../../../shared/hooks/useWebSocket";
import { WebSocketService } from "../../../shared/services/websocket.service";
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
  const [messageMode, setMessageMode] = useState<'Encrypted' | 'Normal'>('Encrypted');
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

  const toggleEncryptionMethod = () => {
    setEncryptionMethod(prev => prev === 'RSA' ? 'ML-KEM' : 'RSA');
  };

  const toggleMessageMode = () => {
    setMessageMode(prev => prev === 'Encrypted' ? 'Normal' : 'Encrypted');
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

  //for esc button in chat screen (ensure hooks order consistent by declaring before any conditional returns)
  useEffect( () => {
    const handleEsc = (e: KeyboardEvent) =>{
      if(e.key === 'Escape'){
        console.log('Escape key pressed')
        setSelectedUser(null)
        setSelectedChatId("")
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [])  

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-teal-900 via-blue-900 to-slate-900 flex">
      {/* Left Sidebar - Navigation Panel */}
      <SideNav />

      {/* Middle Panel - Chat List */}
      <div className="w-96 bg-black/10 backdrop-blur-md border-r border-white/10">
        <ChatList
          friendList={friendList}
          selectedChatId={selectedChatId}
          onSelectChat={(recieverId) => {
            const chatId = generateChatId(currentUser?.id || '', recieverId)
            setSelectedChatId(chatId)
            const user = friendList.find((u) => u.id === recieverId) || null
            setSelectedUser(user)
          }}
        />
      </div>

      {/* Right Panel - Chat Conversation */}
      <div className="flex-1 bg-black/5 backdrop-blur-md flex flex-col">
        {!currentUser ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center">
              <img className="h-32 w-32 mx-auto mb-4 opacity-30" src={qs} alt="LOGO" />
              <h2 className="text-2xl font-semibold text-teal-100 mb-2">Loading user data...</h2>
            </div>
          </div>
        ) : !selectedUser ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center">
              <img className="h-32 w-32 mx-auto mb-4 opacity-30" src={qs} alt="LOGO" />
              <h2 className="text-2xl font-semibold text-teal-100 mb-2">Welcome to Quantum Secure</h2>
              <p className="text-teal-200/70">Select a chat to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            <ChatHeader
              user={selectedUser}
              encryptionMethod={encryptionMethod}
              onToggleEncryption={toggleEncryptionMethod}
              messageMode={messageMode}
              onToggleMessageMode={toggleMessageMode}
            />
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
