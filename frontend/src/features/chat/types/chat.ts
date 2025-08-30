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
  enc: string;
  enc_key: string;
  rsa_pub_key: string;
  rsa_mod: string;
  ct: string;
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

export type MessageResonse = {
  pub_key: string;
  messages: Message[];
};
