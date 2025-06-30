import { useCallback, useEffect } from "react";
import type { WebSocketMessage } from "../services/websocket.service";
import { WebSocketService } from "../services/websocket.service";
import { useAuth } from "../../features/auth/context/AuthContext";

export const useWebSocket = () => {
  const { user } = useAuth();
  const wsService = WebSocketService.getInstance();

  useEffect(() => {

    if(!user?.id) return;
    wsService.setClientId(user.id);
    // Connect to WebSocket when the component mounts
    wsService.connect();

    // Disconnect when the component unmounts
    return () => {
      wsService.disconnect();
    };
  }, []);

  const sendMessage = useCallback((message: any) => {
    console.log("sendMessage", message);
    wsService.sendMessage(message);
  }, []);

  const addMessageHandler = useCallback(
    (handler: (message: WebSocketMessage) => void) => {
      wsService.addMessageHandler(handler);
      return () => wsService.removeMessageHandler(handler);
    },
    []
  );

  const getClientId = useCallback(() => {
    return wsService.getClientId();
  }, []);

  return {
    sendMessage,
    addMessageHandler,
    getClientId,
  };
};
