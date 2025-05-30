import type { Message } from '../types/chat';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isOwn = message.isOwn;
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isOwn && (
        <img
          src={message.sender.avatarUrl}
          alt={message.sender.name}
          className="w-8 h-8 rounded-full object-cover mr-3 border border-gray-300 self-end"
        />
      )}
      <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isOwn ? 'bg-blue-100 text-right' : 'bg-gray-100'} rounded-lg px-4 py-2 shadow-sm relative`}>
        <div className="text-sm text-gray-900 whitespace-pre-line">{message.content}</div>
        {message.imageUrl && (
          <img src={message.imageUrl} alt="attachment" className="mt-2 rounded-lg max-h-48 object-cover" />
        )}
        <div className="text-xs text-gray-400 mt-1 flex items-center justify-end gap-1">
          {message.read && isOwn && <span>✔✔</span>}
          <span>{message.timestamp}</span>
        </div>
      </div>
    </div>
  );
} 