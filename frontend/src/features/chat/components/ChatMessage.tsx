import { getInitials } from "../../../utils/string_utils";
import { useChat } from "../context/ChatContext";
import type { Message } from "../types/chat";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isOwn = message.isOwn;
  const date = new Date(message.timestamp);
  const selectedUser = useChat().selectedUser;

  const formatted = new Intl.DateTimeFormat("en-us", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return (
    <div
      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4 gap-4`}
    >
      {!isOwn && (
        <div className="cursor-pointer rounded-full size-8 flex justify-center items-center border-2 border-gray-800 font-bold">
          <h2>{getInitials(selectedUser!.username)}</h2>
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg ${
          isOwn ? "bg-blue-100 text-right" : "bg-gray-100"
        } rounded-lg px-4 py-2 shadow-sm relative`}
      >
        <div className="text-sm text-gray-900 whitespace-pre-line">
          {message.content}
        </div>
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="attachment"
            className="mt-2 rounded-lg max-h-48 object-cover"
          />
        )}
        <div className="text-xs text-gray-400 mt-1 flex items-center justify-end gap-1">
          {message.read && isOwn && <span>✔✔</span>}
          <span>{formatted}</span>
        </div>
      </div>
    </div>
  );
}
