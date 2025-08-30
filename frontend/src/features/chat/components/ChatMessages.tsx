import { Buffer } from "buffer";
import { useEffect, useRef } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { AES } from "../aes_implement/aes";
import { decryptCBC } from "../aes_implement/cbc";
import { useChat } from "../context/ChatContext";
import { useMLKEM } from "../context/MLKemContext";
import { useRSA } from "../rsa_implement/RsaContext";
import type { Message } from "../types/chat";
import ChatMessage from "./ChatMessage";

interface ChatMessagesProps {
  messages: Message[];
}

function decryptMessage(encMsg: string, aesKey: bigint): string {
  const aes = new AES(aesKey);
  try {
    const combined = Buffer.from(encMsg, "base64");
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
  const { decryptAesKey } = useRSA();
  const { msgViewMode, encMode } = useChat();
  const { generateAesKey } = useMLKEM();
  const { user } = useAuth();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log("messages: ", messages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-2 ">
      {messages.map((msg) => {
        // get keys
        console.log("msg: ", msg.ct);
        console.log("msg: ", msg.ct);

        var key: bigint;
        if (encMode === "RSA") {
          const rsaAESKey = decryptAesKey(msg.enc_key);
          key = rsaAESKey;
        } else {
          const mlkemAESKey = generateAesKey(
            msg.ct!,
            user!.priv_key,
            msg.isOwn!
          );
          key = mlkemAESKey;
        }

        // key = encMode === "RSA" ? rsaAESKey : mlkemAESKey;

        const decryptedContent = decryptMessage(msg.content, key);
        const decryptedMsg = { ...msg, content: decryptedContent };

        const allMessages = msgViewMode === "Normal" ? decryptedMsg : msg;
        return <ChatMessage key={msg.id} message={allMessages} />;
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
