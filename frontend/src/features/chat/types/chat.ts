import type { User } from "../../../shared/types/User";

export type Message = {
  id: string;
  sender: User;
  content: string;
  timestamp: string;
  imageUrl?: string;
  isOwn?: boolean;
  read?: boolean;
};

export type ChatListItem = {
  id: string;
  user: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  isGroup?: boolean;
  participants?: User[];
};
