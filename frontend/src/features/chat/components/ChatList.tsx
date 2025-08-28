import type { User } from "../../../shared/types/User";
import { getInitials } from "../../../utils/string_utils";

interface ChatListProps {
  friendList: User[];
  selectedChatId: string;
  onSelectChat: (chatId: string) => void;
}

export default function ChatList({
  friendList,
  selectedChatId,
  onSelectChat,
}: ChatListProps) {
  const checkReciever = (friendId: string) => {
    return selectedChatId.split("-").includes(friendId);
  };

  const getTimeAgo = (timestamp?: string) => {
    if (!timestamp) return " ";
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return `${hours}:${minutes.toString().padStart(2, '0')}pm`;
    }
    return "Yesterday";
  };

  // Generate varied avatar colors for visual interest
  const getAvatarColors = (username: string, isSelected: boolean) => {
    if (isSelected) {
      return "bg-gradient-to-br from-purple-400 to-pink-500 text-white";
    }
    
    // Create varied but consistent colors based on username
    const colors = [
      "bg-gradient-to-br from-teal-400/50 to-blue-500/50 text-teal-100",
      "bg-gradient-to-br from-purple-400/50 to-pink-500/50 text-purple-100",
      "bg-gradient-to-br from-amber-400/50 to-orange-500/50 text-amber-100",
      "bg-gradient-to-br from-emerald-400/50 to-teal-500/50 text-emerald-100",
      "bg-gradient-to-br from-indigo-400/50 to-purple-500/50 text-indigo-100"
    ];
    
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-teal-100 mb-2">Chats</h2>
        <p className="text-teal-200/70 text-sm">Your conversations</p>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-4 py-3 bg-white/10 text-white placeholder-teal-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:bg-white/20 transition-all border border-white/10"
          />
          <svg className="absolute right-3 top-3.5 w-5 h-5 text-teal-200/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {!friendList || friendList.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-400/30">
                <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-teal-200/70 text-lg font-medium">No conversations yet</p>
              <p className="text-teal-200/50 text-sm">Start chatting with your friends</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {friendList.map((friend) => {
              const isSelected = checkReciever(friend.id);
              
              return (
                <div
                  key={friend.id}
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/40 shadow-lg" 
                      : "hover:bg-white/10 border border-transparent hover:border-white/5"
                  }`}
                  onClick={() => onSelectChat(friend.id)}
                >
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-4 ${getAvatarColors(friend.username, isSelected)}`}>
                    {getInitials(friend.username)}
                  </div>
                  
                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-semibold truncate ${
                        isSelected ? "text-purple-200" : "text-teal-100"
                      }`}>
                        {friend.username}
                      </h3>
                      <span className={`text-xs ml-2 whitespace-nowrap ${
                        isSelected ? "text-purple-300" : "text-teal-200/70"
                      }`}>
                        {getTimeAgo()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className={`text-sm truncate max-w-[200px] ${
                        isSelected ? "text-purple-300" : "text-teal-200/60"
                      }`}>
                        Available for chat
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
