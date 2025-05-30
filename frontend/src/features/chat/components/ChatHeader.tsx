import type { User } from '../types/chat';

interface ChatHeaderProps {
  user: User;
}

export default function ChatHeader({ user }: ChatHeaderProps) {
  return (
    <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-white">
      <img
        src={user.avatarUrl}
        alt={user.name}
        className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300"
      />
      <div>
        <div className="font-semibold text-gray-900">{user.name}</div>
        <div className="text-xs text-gray-500">
          {user.online ? 'Online' : 'Offline'}
        </div>
      </div>
    </div>
  );
} 