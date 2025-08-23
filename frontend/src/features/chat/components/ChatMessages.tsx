import { Buffer } from 'buffer'
import { useMemo } from 'react'
import { AES } from '../aes_implement/aes'
import { decryptCBC } from '../aes_implement/cbc'
import { useRSA } from '../rsa_implement/RsaContext'
import type { Message } from '../types/chat'
import ChatMessage from './ChatMessage'

//const key = BigInt('0x2a7c041526bcd2a4abe6158809ce4d3')
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
    return BigInt('0x' + decryptedHex)
  }, [decrypt, encryptedAESKeyBase64])

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
      {messages.map((msg) => {
        const decryptedContent = decryptMessage(msg.content, BigIntAesKey)
        // Pass decrypted content replacing original content
        const decryptedMsg = { ...msg, content: decryptedContent }
        return <ChatMessage key={msg.id} message={decryptedMsg} />
      })}
    </div>
  )
}
