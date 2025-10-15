import { NFTActivity } from '@/types/activity';

type ConnectionState = 'disconnected' | 'connecting' | 'connected';
type MessageHandler = (data: any) => void;

export class RealTimeService {
  private socket: WebSocket | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseReconnectDelay = 1000; // Start with 1 second
  
  // Singleton instance
  private static instance: RealTimeService;
  
  private constructor() {
    // Private constructor to enforce singleton pattern
  }
  
  public static getInstance(): RealTimeService {
    if (!RealTimeService.instance) {
      RealTimeService.instance = new RealTimeService();
    }
    return RealTimeService.instance;
  }
  
  /**
   * Connect to the WebSocket server
   */
  public connect(userId: string, authToken: string): void {
    if (this.socket && (this.connectionState === 'connected' || this.connectionState === 'connecting')) {
      console.log('WebSocket already connected or connecting');
      return;
    }
    
    this.connectionState = 'connecting';
    
    // Get the environment-specific WebSocket URL
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.NEXT_PUBLIC_WS_HOST || window.location.host;
    const wsUrl = `${wsProtocol}//${wsHost}/ws?userId=${userId}&token=${authToken}`;
    
    try {
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.connectionState = 'disconnected';
    this.reconnectAttempts = 0;
  }
  
  /**
   * Subscribe to a specific event type
   */
  public subscribe(eventType: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, new Set());
    }
    
    this.messageHandlers.get(eventType)?.add(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.messageHandlers.delete(eventType);
        }
      }
    };
  }
  
  /**
   * Subscribe to all NFT activity events
   */
  public subscribeToActivityUpdates(handler: (activity: NFTActivity) => void): () => void {
    return this.subscribe('activity', handler);
  }
  
  /**
   * Subscribe to price alerts
   */
  public subscribeToPriceAlerts(handler: (alert: any) => void): () => void {
    return this.subscribe('price_alert', handler);
  }
  
  /**
   * Send a message to the server
   */
  public send(eventType: string, data: any): void {
    if (this.connectionState !== 'connected' || !this.socket) {
      console.warn('Cannot send message, WebSocket not connected');
      return;
    }
    
    try {
      const message = JSON.stringify({
        type: eventType,
        data: data,
        timestamp: new Date().toISOString()
      });
      
      this.socket.send(message);
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }
  
  /**
   * Get current connection state
   */
  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }
  
  // WebSocket event handlers
  private handleOpen(event: Event): void {
    console.log('WebSocket connection established');
    this.connectionState = 'connected';
    this.reconnectAttempts = 0;
    
    // Notify subscribers that connection is established
    this.notifyHandlers('connection', { status: 'connected' });
  }
  
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      
      if (message && message.type) {
        this.notifyHandlers(message.type, message.data);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }
  
  private handleClose(event: CloseEvent): void {
    console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    this.connectionState = 'disconnected';
    this.socket = null;
    
    // Notify subscribers that connection is closed
    this.notifyHandlers('connection', { 
      status: 'disconnected',
      code: event.code,
      reason: event.reason
    });
    
    // Attempt to reconnect unless this was a clean close (1000) or the service was manually disconnected
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }
  
  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    
    // Notify subscribers about the error
    this.notifyHandlers('error', { event });
  }
  
  private notifyHandlers(eventType: string, data: any): void {
    const handlers = this.messageHandlers.get(eventType);
    
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in WebSocket ${eventType} handler:`, error);
        }
      });
    }
  }
  
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Maximum reconnect attempts reached, giving up');
      return;
    }
    
    // Use exponential backoff for reconnect attempts
    const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts);
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts + 1} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      
      // Attempt to reconnect with the same user ID and token (these would need to be stored)
      const userId = localStorage.getItem('userId') || '';
      const authToken = localStorage.getItem('authToken') || '';
      
      if (userId && authToken) {
        this.connect(userId, authToken);
      } else {
        console.warn('Cannot reconnect, missing userId or authToken');
      }
    }, delay);
  }
}

// Export a default instance
const realTimeService = RealTimeService.getInstance();
export default realTimeService; 