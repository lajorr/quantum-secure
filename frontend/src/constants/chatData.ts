import type { ChatListItem, Message, User } from "../types/chat";

export const users: User[] = [
  {
    id: "1",
    name: "Bill Kuphal",
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    online: true,
  },
  {
    id: "2",
    name: "Photographers",
    avatarUrl: "https://randomuser.me/api/portraits/men/33.jpg",
  },
  {
    id: "3",
    name: "Daryl Bogisich",
    avatarUrl: "https://randomuser.me/api/portraits/men/34.jpg",
  },
  {
    id: "4",
    name: "SpaceX Crew-16 Launch",
    avatarUrl: "https://randomuser.me/api/portraits/men/35.jpg",
  },
  {
    id: "5",
    name: "Lela Walsh",
    avatarUrl: "https://randomuser.me/api/portraits/women/36.jpg",
  },
  {
    id: "6",
    name: "Roland Marks",
    avatarUrl: "https://randomuser.me/api/portraits/men/37.jpg",
  },
  {
    id: "7",
    name: "Helen Flatley",
    avatarUrl: "https://randomuser.me/api/portraits/women/38.jpg",
  },
];

export const chatList: ChatListItem[] = [
  {
    id: "1",
    user: users[0],
    lastMessage: "The weather will be perfect for th...",
    lastMessageTime: "9:41 AM",
    unreadCount: 0,
  },
  {
    id: "2",
    user: users[1],
    lastMessage: `Here're my latest drone shots`,
    lastMessageTime: "9:16 AM",
    unreadCount: 80,
  },
  {
    id: "3",
    user: users[2],
    lastMessage: "You: Store is out of stock",
    lastMessageTime: "Yesterday",
  },
  {
    id: "4",
    user: users[3],
    lastMessage: `I've been there!`,
    lastMessageTime: "Thursday",
  },
  {
    id: "5",
    user: users[4],
    lastMessage: `Next time it's my turn!`,
    lastMessageTime: "12/22/21",
  },
  {
    id: "6",
    user: users[5],
    lastMessage: `@waldo Glad to hear that 😁`,
    lastMessageTime: "12/16/21",
  },
  {
    id: "7",
    user: users[6],
    lastMessage: `You: Ok`,
    lastMessageTime: "12/13/21",
  },
];

export const allMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      sender: users[0],
      content: "Who was that philosopher you shared with me recently?",
      timestamp: "2:14 PM",
    },
    {
      id: "m2",
      sender: users[6],
      content: "Roland Barthes",
      timestamp: "2:16 PM",
      isOwn: true,
      read: true,
    },
    {
      id: "m3",
      sender: users[0],
      content: `That\'s him!\nWhat was his vision statement?`,
      timestamp: "2:18 PM",
    },
    {
      id: "m4",
      sender: users[6],
      content:
        '"Ultimately in order to see a photograph well, it is best to look away or close your eyes."',
      timestamp: "2:20 PM",
      isOwn: true,
      read: true,
      imageUrl:
        "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "m5",
      sender: users[0],
      content: "Aerial photograph from the Helsinki urban environment division",
      timestamp: "2:22 PM",
    },
    {
      id: "m6",
      sender: users[0],
      content: "Check this https://dribbble.com",
      timestamp: "2:22 PM",
    },
  ],
  // Add more chat messages for other chats if needed
};
