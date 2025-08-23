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

  return (
    <aside className="w-1/3 bg-gray-800 h-full flex flex-col">
      <div className="p-4 border-gray-200">
        <div className="font-bold text-xl mb-2 text-white">
          <span className="text-[#0063cf]">Quantum</span> Secure
        </div>
        <input
          type="text"
          placeholder="Search"
          className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none text-white"
        />
      </div>
      {!friendList || friendList.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white">No friends available</p>
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto">
          {friendList.map((friend) => (
            <li
              key={friend.id}
              className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-600 transition ${
                checkReciever(friend.id) ? "bg-gray-700" : ""
              }`}
              onClick={() => onSelectChat(friend.id)}
            >
              <div className="cursor-pointer rounded-full size-10 flex justify-center items-center border-2 border-gray-500 font-bold mr-4 text-white">
                <h2>{getInitials(friend.username)}</h2>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white truncate">
                    {friend.username}
                  </span>
                  {/* <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                  {friend.lastMessageTime}
                </span> */}
                </div>
                {/* <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 truncate max-w-[120px]">
                  {friend.lastMessage}
                </span>
                {friend.unreadCount && friend.unreadCount > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                    {friend.unreadCount}
                  </span>
                )}
              </div> */}
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
