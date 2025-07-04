import type { User } from "../../../shared/types/User";

export type Message = {
  id?: string;
  chat_id: string;
  sender_id: string;
  receiver_id: string;
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
