import { useState } from 'react';
import ChatHeader from './components/ChatHeader';
import ChatInput from './components/ChatInput';
import ChatList from './components/ChatList';
import ChatMessages from './components/ChatMessages';
import { allMessages, chatList } from './constants/chatData';

function App() {
  const [selectedChatId, setSelectedChatId] = useState('1');
  const selectedChat = chatList.find((c) => c.id === selectedChatId)!;
  const messages = allMessages[selectedChatId] || [];

  const handleSend = (text: string) => {
    // For demo, just log. In real app, would update state.
    // eslint-disable-next-line no-console
    console.log('Send:', text);
  };

  return (
    <div className="h-screen w-screen bg-gray-200 flex justify-center">
      <div className="flex h-full w-full max-w-[1440px]">
        <ChatList
          chats={chatList}
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
        />
        <div className="flex flex-col flex-1 h-full">
          <ChatHeader user={selectedChat.user} />
          <ChatMessages messages={messages} />
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}

export default App;
