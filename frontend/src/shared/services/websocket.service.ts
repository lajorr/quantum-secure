import type { Message } from "../../features/chat";

export interface WebSocketMessage {
  id: string;
  receiver_id: string;
  sender_id: string;
  timestamp: string;
  content: string;
  chat_id: string;
  enc: string;
  enc_key: string;
  rsa_pub_key: string;
  rsa_mod: string;
  ct: string;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private clientId: string;
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 3000; // 3 seconds
  // private isConnected: boolean = false
  // private messageQueue: any[] = []

  private constructor() {
    // this.clientId = uuidv4()
    // console.log('WebSocketService initialized with client ID:', this.clientId)
    console.log("WebSocketService initialized");
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public setClientId(id: string): void {
    this.clientId = id;
  }

  public isReady(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public connect(): void {
    console.log("Ws connected");
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("WebSocket is already connected");
      return;
    }
    const baseURL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
    // const wsUrl = `ws://localhost:8000/ws/${this.clientId}`;
    const wsUrl = `${baseURL}/ws/${this.clientId}`;
    console.log("Attempting to connect to WebSocket at:", wsUrl);
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("WebSocket connected successfully");
      this.reconnectAttempts = 0;
      // this.isConnected = true

      // Flush message queue
      // this.messageQueue.forEach((msg) => this.sendMessage(msg))
      // this.messageQueue = []
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log("Received message:", message);
        this.messageHandlers.forEach((handler) => handler(message));
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
      this.attemptReconnect();
      // this.isConnected = false
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
      setTimeout(() => this.connect(), this.reconnectTimeout);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  public disconnect(): void {
    console.log("Ws disconnected");
    if (this.ws) {
      console.log("Disconnecting WebSocket");
      this.ws.close();
      this.ws = null;
      // this.isConnected = false
    }
  }

  public sendMessage(message: Message): void {
    console.log("serviece");
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("Sending message:", message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
      // this.messageQueue.push(message)
    }
  }

  public addMessageHandler(handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  public removeMessageHandler(
    handler: (message: WebSocketMessage) => void
  ): void {
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
  }

  public getClientId(): string {
    return this.clientId;
  }
}
