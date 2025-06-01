// hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: string;
  data?: any;
  clientId?: string;
  timestamp?: string;
  serverTime?: number;
}

interface UseWebSocketOptions {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  enabled?: boolean;
}

export const useWebSocket = ({
  url,
  onMessage,
  onError,
  onOpen,
  onClose,
  reconnectInterval = 5000,
  maxReconnectAttempts = 5,
  enabled = true
}: UseWebSocketOptions) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const cleanup = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      
      if (wsRef.current.readyState === WebSocket.OPEN || 
          wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
  };

  const connect = () => {
    if (!enabled) return;
    
    // Don't create multiple connections
    if (wsRef.current?.readyState === WebSocket.CONNECTING || 
        wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setIsConnecting(true);
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log(`[WS] Connected to ${url}`);
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;
        onOpen?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (error) {
          console.error('[WS] Error parsing message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error(`[WS] Connection error:`, error);
        setIsConnecting(false);
        onError?.(error);
      };

      wsRef.current.onclose = (event) => {
        console.log(`[WS] Connection closed. Code: ${event.code}, Reason: ${event.reason || 'No reason'}`);
        setIsConnected(false);
        setIsConnecting(false);
        onClose?.(event);

        // Attempt to reconnect if not manually closed and under attempt limit
        if (enabled && 
            event.code !== 1000 && // Normal closure
            reconnectAttemptsRef.current < maxReconnectAttempts) {
          
          reconnectAttemptsRef.current++;
          console.log(`[WS] Attempting to reconnect... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.warn(`[WS] Max reconnection attempts reached (${maxReconnectAttempts})`);
        }
      };

    } catch (error) {
      console.error('[WS] Failed to create WebSocket connection:', error);
      setIsConnecting(false);
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    cleanup();
  };

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('[WS] Cannot send message: WebSocket not connected');
    return false;
  };

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return cleanup;
  }, [url, enabled]);

  return {
    isConnected,
    isConnecting,
    sendMessage,
    disconnect,
    reconnect: connect
  };
};