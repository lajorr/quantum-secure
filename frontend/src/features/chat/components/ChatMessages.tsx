import { Buffer } from "buffer";
import { AES } from "../aes_implement/aes";
import { decryptCBC } from "../aes_implement/cbc";
import type { Message } from "../types/chat";
import ChatMessage from "./ChatMessage";

const key = BigInt("0x2b7e151628aed2a6abf7158809cf4f3c");
const aes = new AES(key);

interface ChatMessagesProps {
  messages: Message[];
}

function decryptMessage(encryptedBase64: string): string {
  try {
    const combined = Buffer.from(encryptedBase64, "base64");
    const decryptedBuffer = decryptCBC(aes, combined);

    if (decryptedBuffer.length === 0) {
      return "[Empty decrypted message]";
    }

    const decoder = new TextDecoder("utf-8");
    const decryptedText = decoder.decode(decryptedBuffer);
    return decryptedText;
  } catch (e) {
    console.error("Decryption failed", e);
    return "[Decryption error]";
  }
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
      {messages.map((msg) => {
        const decryptedContent = decryptMessage(msg.content);
        // Pass decrypted content replacing original content
        const decryptedMsg = { ...msg, content: decryptedContent };
        return <ChatMessage key={msg.id} message={decryptedMsg} />;
      })}
    </div>
  );
}
