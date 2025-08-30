import { Buffer } from 'buffer'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../auth/context/AuthContext'
import { AES } from '../aes_implement/aes'
import { decryptCBC } from '../aes_implement/cbc'
import { useChat } from '../context/ChatContext'
import { useMLKEM } from '../context/MLKemContext'
import { useRSA } from '../rsa_implement/RsaContext'
import type { Message } from '../types/chat'
import ChatMessage from './ChatMessage'

interface ChatMessagesProps {
  messages: Message[]
}

function decryptMessage(encMsg: string, aesKey: bigint): string {
  const aes = new AES(aesKey)
  try {
    const combined = Buffer.from(encMsg, 'base64')
    const decryptedBuffer = decryptCBC(aes, combined)

    if (decryptedBuffer.length === 0) {
      return '[Empty decrypted message]'
    }

    const decoder = new TextDecoder('utf-8')
    const decryptedText = decoder.decode(decryptedBuffer)
    return decryptedText
  } catch (e) {
    console.error('Decryption failed', e)
    return '[Decryption error]'
  }
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const { decryptAesKey } = useRSA()
  const { msgViewMode, encMode } = useChat()
  const { generateAesKey } = useMLKEM()
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const showPopup = encMode === 'ML-KEM' && !dismissed

  const messagesEndRef = useRef<HTMLDivElement>(null)

  console.log('messages: ', messages)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setDismissed(false)
  }, [encMode])

  // useEffect(() => {
  //   if (encMode === 'ML-KEM') {
  //     setShowPopup(true)
  //   } else {
  //     setShowPopup(false)
  //   }
  // }, [encMode])

  return (
    <div className="flex-1 overflow-y-auto px-6 py-2 ">
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="relative z-10 w-[90%] max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-teal-50 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Notice!!!!</h3>
              {/* <button
                className="p-2 rounded-lg hover:bg-white/10"
                onClick={() => setShowPopup(false)}
                aria-label="Close"
              >
                <CloseIcon />
              </button> */}
            </div>
            <div className="space-y-4 text-teal-100/90">
              <p>
                You are now in Quantum-Secure Mode (ML-KEM). Messages can only
                be viewed live while both participants are online. Once the
                session ends, the content will no longer be accessible.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setDismissed(true)}
                className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {messages.map((msg) => {
        // get keys
        console.log('msg: ', msg.ct)
        console.log('msg: ', msg.ct)

        var key: bigint
        if (encMode === 'RSA') {
          const rsaAESKey = decryptAesKey(msg.enc_key)
          key = rsaAESKey
        } else {
          const mlkemAESKey = generateAesKey(
            msg.ct!,
            user!.priv_key,
            msg.isOwn!
          )
          key = mlkemAESKey
        }

        // key = encMode === "RSA" ? rsaAESKey : mlkemAESKey;

        const decryptedContent = decryptMessage(msg.content, key)
        const decryptedMsg = { ...msg, content: decryptedContent }

        const allMessages = msgViewMode === 'Normal' ? decryptedMsg : msg
        return <ChatMessage key={msg.id} message={allMessages} />
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
