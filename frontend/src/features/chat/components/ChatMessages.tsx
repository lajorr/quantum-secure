import type { Message } from "../types/chat";
import ChatMessage from "./ChatMessage";

interface ChatMessagesProps {
  messages: Message[];
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
    </div>
  );
}
