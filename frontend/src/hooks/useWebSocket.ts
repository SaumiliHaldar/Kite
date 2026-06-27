import { useEffect, useRef, useCallback, useState } from 'react';

const WS_BASE = import.meta.env.VITE_WS_BASE_URL || 'ws://127.0.0.1:8000';

export interface WSEvent {
  event: string;
  user_id?: string;
  [key: string]: unknown;
}

interface UseWebSocketOptions {
  targetId: string | null;
  userId: string | null;
  onMessage?: (event: WSEvent) => void;
}

export function useWebSocket({ targetId, userId, onMessage }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const sendEvent = useCallback((payload: WSEvent) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  useEffect(() => {
    if (!targetId || !userId) return;

    const url = `${WS_BASE}/ws/${targetId}?token=${userId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);

    ws.onmessage = (e) => {
      try {
        const payload: WSEvent = JSON.parse(e.data);

        // Presence tracking
        if (payload.event === 'presence.online' && payload.user_id && payload.user_id !== userId) {
          setOnlineUsers((prev) =>
            prev.includes(payload.user_id!) ? prev : [...prev, payload.user_id!]
          );
        }
        if (payload.event === 'presence.offline' && payload.user_id) {
          setOnlineUsers((prev) => prev.filter((id) => id !== payload.user_id));
        }

        // Typing indicators
        if (payload.event === 'typing.start' && payload.user_id && payload.user_id !== userId) {
          setTypingUsers((prev) =>
            prev.includes(payload.user_id!) ? prev : [...prev, payload.user_id!]
          );
        }
        if (payload.event === 'typing.stop' && payload.user_id) {
          setTypingUsers((prev) => prev.filter((id) => id !== payload.user_id));
        }

        onMessageRef.current?.(payload);
      } catch {
        // malformed frame, ignore
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setTypingUsers([]);
    };

    // Heartbeat: ping every 30s to keep Redis TTL alive
    const ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ event: 'presence.ping' }));
      }
    }, 30_000);

    return () => {
      clearInterval(ping);
      ws.close();
    };
  }, [targetId, userId]);

  return { isConnected, typingUsers, onlineUsers, sendEvent };
}
