import { v4 as uuidv4 } from 'uuid';

export interface WebSocketMessage {
    client_id: string;
    message: any;
}

export class WebSocketService {
    private static instance: WebSocketService;
    private ws: WebSocket | null = null;
    private clientId: string;
    private messageHandlers: ((message: WebSocketMessage) => void)[] = [];
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout = 3000; // 3 seconds

    private constructor() {
        this.clientId = uuidv4();
        console.log('WebSocketService initialized with client ID:', this.clientId);
    }

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    public connect(): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            console.log('WebSocket is already connected');
            return;
        }

        const wsUrl = `/ws/${this.clientId}`;
        console.log('Attempting to connect to WebSocket at:', wsUrl);
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket connected successfully');
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
            console.log('Received message:', event.data);
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                this.messageHandlers.forEach(handler => handler(message));
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.ws.onclose = (event) => {
            console.log('WebSocket disconnected:', event.code, event.reason);
            this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => this.connect(), this.reconnectTimeout);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    public disconnect(): void {
        if (this.ws) {
            console.log('Disconnecting WebSocket');
            this.ws.close();
            this.ws = null;
        }
    }

    public sendMessage(message: any): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            console.log('Sending message:', message);
            this.ws.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected');
        }
    }

    public addMessageHandler(handler: (message: WebSocketMessage) => void): void {
        this.messageHandlers.push(handler);
    }

    public removeMessageHandler(handler: (message: WebSocketMessage) => void): void {
        this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    }

    public getClientId(): string {
        return this.clientId;
    }
} 