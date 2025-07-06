import type { User } from "../../../shared/types/User";
import { getInitials } from "../../../utils/string_utils";

interface ChatHeaderProps {
  user: User;
}

export default function ChatHeader({ user }: ChatHeaderProps) {
  if (!user) {
    return null;
  }
  return (
    <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-white gap-4 w-full">
      <div className="cursor-pointer rounded-full size-10 flex justify-center items-center border-2 border-bg-gray-800 font-bold">
        <h2>{getInitials(user.username)}</h2>
      </div>
      <div>
        <div className="font-semibold text-gray-900">{user.username}</div>
        {/* <div className="text-xs text-gray-500">
          {user.online ? "Online" : "Offline"}
        </div> */}
      </div>
    </div>
  );
}
