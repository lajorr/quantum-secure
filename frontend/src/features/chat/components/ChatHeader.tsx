import type { User } from '../../../shared/types/User'

interface ChatHeaderProps {
  user: User
}

export default function ChatHeader({ user }: ChatHeaderProps) {
  if (!user) {
    return null
  }
  return (
    <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-white">
      <img
        src="https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
        alt={user.username}
        className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300"
      />
      <div>
        <div className="font-semibold text-gray-900">{user.username}</div>
        {/* <div className="text-xs text-gray-500">
          {user.online ? "Online" : "Offline"}
        </div> */}
      </div>
    </div>
  )
}
