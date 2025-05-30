import type { ChatListItem } from '../types/chat';

interface ChatListProps {
  chats: ChatListItem[];
  selectedChatId: string;
  onSelectChat: (chatId: string) => void;
}

export default function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  return (
    <aside className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search"
          className="w-full px-3 py-2 rounded bg-gray-100 focus:outline-none"
        />
      </div>
      <ul className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <li
            key={chat.id}
            className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100 transition ${selectedChatId === chat.id ? 'bg-gray-100' : ''}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <img
              src={chat.user.avatarUrl}
              alt={chat.user.name}
              className="w-12 h-12 rounded-full object-cover mr-3 border border-gray-300"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 truncate">{chat.user.name}</span>
                <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{chat.lastMessageTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 truncate max-w-[120px]">{chat.lastMessage}</span>
                {chat.unreadCount && chat.unreadCount > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">{chat.unreadCount}</span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
} 