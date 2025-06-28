import React, { useEffect, useState } from "react";
import { useWebSocket } from "../../shared/hooks/useWebSocket";
import type { WebSocketMessage } from "../../shared/services/websocket.service";

export const WebSocketDemo: React.FC = () => {
  const { sendMessage, addMessageHandler, getClientId } = useWebSocket();
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    // Add message handler when component mounts
    const cleanup = addMessageHandler((message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Cleanup when component unmounts
    return cleanup;
  }, [addMessageHandler]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage({ text: inputMessage });
      setInputMessage("");
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">WebSocket Demo</h2>
        <p className="text-sm text-gray-600">Client ID: {getClientId()}</p>
      </div>

      <div className="mb-4 h-64 overflow-y-auto border rounded p-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <span className="font-semibold">{msg.client_id}: </span>
            <span>{JSON.stringify(msg.message)}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 px-4 py-2 border rounded"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};
