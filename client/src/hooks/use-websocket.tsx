import { useEffect, useRef } from 'react';
import { useAuth } from './use-auth';
import { queryClient } from '@/lib/queryClient';
import { Order } from '@shared/schema';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'ORDER_UPDATED') {
        // Update the order in the cache
        const order = data.order as Order;
        queryClient.setQueryData<Order[]>(['/api/orders/customer'], (old) => {
          if (!old) return [order];
          return old.map((o) => (o.id === order.id ? order : o));
        });
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user]);
}
