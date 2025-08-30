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

  // Generate varied avatar colors for visual interest
  const getAvatarColors = (username: string) => {
    const colors = [
      "bg-gradient-to-br from-teal-400/50 to-blue-500/50 text-teal-100",
      "bg-gradient-to-br from-purple-400/50 to-pink-500/50 text-purple-100",
      "bg-gradient-to-br from-amber-400/50 to-orange-500/50 text-amber-100",
      "bg-gradient-to-br from-emerald-400/50 to-teal-500/50 text-emerald-100",
      "bg-gradient-to-br from-indigo-400/50 to-purple-500/50 text-indigo-100",
    ];

    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div
      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-6 gap-3`}
    >
      {/* Avatar for incoming messages */}
      {!isOwn && (
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white/20 shadow-sm ${getAvatarColors(
            selectedUser?.username || "U"
          )}`}
        >
          <span className="text-xs font-semibold">
            {getInitials(selectedUser?.username || "U")}
          </span>
        </div>
      )}

      {/* Message Content */}
      <div className="flex flex-col max-w-xs md:max-w-md lg:max-w-lg">
        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isOwn
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-br-md"
              : "bg-white/20 backdrop-blur-sm text-teal-100 rounded-bl-md border border-white/10"
          }`}
        >
          <div className="text-sm leading-relaxed whitespace-pre-line">
            {message.content}
          </div>
        </div>

        {/* Message Meta */}
        <div
          className={`flex items-center gap-2 mt-2 ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
          {/* Read receipts for own messages */}
          {message.read && isOwn && (
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-purple-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <svg
                className="w-4 h-4 text-purple-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}

          {/* Timestamp */}
          <span
            className={`text-xs ${
              isOwn ? "text-purple-300" : "text-teal-200/70"
            }`}
          >
            {formatted}
          </span>

          {/* Encryption method */}
          <span
            className={`text-xs ${
              isOwn ? "text-purple-300" : "text-teal-200/70"
            }`}
          >
            {message.enc || "AES-CBC"}
          </span>
        </div>
      </div>

      {/* Avatar for own messages */}
      {isOwn && (
        <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center border-2 border-white/20 shadow-sm">
          <span className="text-xs font-semibold text-white">
            {getInitials("Me")}
          </span>
        </div>
      )}
    </div>
  );
}
