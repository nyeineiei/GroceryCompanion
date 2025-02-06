import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './use-auth';
import { queryClient } from '@/lib/queryClient';
import { Order } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!user) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'ORDER_UPDATED') {
            // Update the order in the cache
            const order = data.order as Order;
            queryClient.setQueryData<Order[]>(['/api/orders/customer'], (old) => {
              if (!old) return [order];
              return old.map((o) => (o.id === order.id ? order : o));
            });
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed, attempting to reconnect...');
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "There was an error with the real-time updates. Attempting to reconnect...",
          variant: "destructive",
        });
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, [user, toast]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);
}