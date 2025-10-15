import { useCallback, useEffect, useRef } from 'react';
import { RaffleAccount } from '@/idl/types';

interface RaffleUpdate {
  raffle: RaffleAccount;
  jackpotAmount: number;
}

type RaffleUpdateCallback = (update: RaffleUpdate) => void;

export const useRealTimeService = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const subscriptionsRef = useRef<Map<string, Set<RaffleUpdateCallback>>>(new Map());

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'raffle_update') {
          const callbacks = subscriptionsRef.current.get(data.rafflePublicKey);
          if (callbacks) {
            callbacks.forEach(callback => callback(data.update));
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(connect, 5000);
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  const subscribeToRaffleUpdates = useCallback((rafflePublicKey: string, callback: RaffleUpdateCallback) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return () => {};
    }

    // Add callback to subscriptions
    if (!subscriptionsRef.current.has(rafflePublicKey)) {
      subscriptionsRef.current.set(rafflePublicKey, new Set());
    }
    subscriptionsRef.current.get(rafflePublicKey)?.add(callback);

    // Subscribe to raffle updates
    wsRef.current.send(JSON.stringify({
      type: 'subscribe_raffle',
      rafflePublicKey,
    }));

    // Return unsubscribe function
    return () => {
      const callbacks = subscriptionsRef.current.get(rafflePublicKey);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          subscriptionsRef.current.delete(rafflePublicKey);
          wsRef.current?.send(JSON.stringify({
            type: 'unsubscribe_raffle',
            rafflePublicKey,
          }));
        }
      }
    };
  }, []);

  return {
    subscribeToRaffleUpdates,
  };
}; 