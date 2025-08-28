import { Buffer } from "buffer";
import { useEffect, useMemo, useRef } from "react";
import { AES } from "../aes_implement/aes";
import { decryptCBC } from "../aes_implement/cbc";
import { useRSA } from "../rsa_implement/RsaContext";
import type { Message } from "../types/chat";
import ChatMessage from "./ChatMessage";

const key = BigInt("0x2b7e151628aed2a6abf7158809cf4f3c");
// const aes = new AES(key);

interface ChatMessagesProps {
  messages: Message[]
  encryptedAESKeyBase64: string
}

function decryptMessage(encryptedBase64: string, BigIntAesKey: bigint): string {
  const aes = new AES(BigIntAesKey)
  try {
    const combined = Buffer.from(encryptedBase64, 'base64')
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

export default function ChatMessages({
  messages,
  encryptedAESKeyBase64,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  //RSA Decryption
  const { decrypt } = useRSA()
  const BigIntAesKey = useMemo(() => {
    //Decode base64 to string
    const encryptedStr = Buffer.from(encryptedAESKeyBase64, 'base64').toString()
    //Convert to array of BigInts
    const encryptedChunks = encryptedStr.split(',').map((s) => BigInt(s))
    //Decrypt to get original hex string
    const decryptedHex = decrypt!(encryptedChunks)
    //Use hex string to recreate AES key
    return BigInt("0x" + decryptedHex);
  }, [decrypt, encryptedAESKeyBase64]);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: "smooth",
      block: "end"
    });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom on initial load
  useEffect(() => {
    scrollToBottom();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 bg-transparent">
      {/* {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M18 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">No messages yet</p>
            <p className="text-gray-400 text-sm">Start the conversation!</p>
          </div>
        </div>
      ) : ( */}
        <div className="space-y-2">
          {messages.map((msg) => {
            const decryptedContent = decryptMessage(msg.content, BigIntAesKey);
            // Pass decrypted content replacing original content
            const decryptedMsg = { ...msg, content: decryptedContent };
            return <ChatMessage key={msg.id} message={decryptedMsg} />;
          })}
          
          {/* Invisible div to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      {/* )} */}
    </div>
  )
}
