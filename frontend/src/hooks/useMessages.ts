import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getMessages,
  sendMessage as apiSend,
  editMessage as apiEdit,
  deleteMessage as apiDelete,
  type KiteMessage,
} from '../api';
import { useWebSocket, type WSEvent } from './useWebSocket';

interface UseMessagesOptions {
  targetId: string | null;
  userId: string | null;
}

export function useMessages({ targetId, userId }: UseMessagesOptions) {
  const [messages, setMessages] = useState<KiteMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Fetch history when target changes
  useEffect(() => {
    if (!targetId) {
      setMessages([]);
      return;
    }
    setIsLoading(true);
    getMessages(targetId)
      .then(setMessages)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [targetId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle incoming WS events
  const handleWSEvent = useCallback((event: WSEvent) => {
    if (event.event === 'msg.new') {
      const incoming = event as unknown as { event: string; message: KiteMessage };
      if (incoming.message) {
        setMessages((prev) => {
          // Avoid duplicates (optimistic update already added it)
          const exists = prev.some((m) => m.id === incoming.message.id);
          return exists ? prev : [...prev, incoming.message];
        });
      }
    }
  }, []);

  const { isConnected, typingUsers, onlineUsers, sendEvent } = useWebSocket({
    targetId,
    userId,
    onMessage: handleWSEvent,
  });

  // Send a message: optimistic update + REST persist + WS broadcast
  const sendMessage = useCallback(
    async (content: string, attachments: string[] = []) => {
      if (!targetId || !content.trim()) return;
      try {
        const msg = await apiSend(targetId, { content, type: 'text', attachments });
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === msg.id);
          return exists ? prev : [...prev, msg];
        });
        // Broadcast over WS so other clients see it immediately
        sendEvent({ event: 'msg.new', message: msg as unknown as WSEvent['message'] } as WSEvent);
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    },
    [targetId, sendEvent]
  );

  const editMessage = useCallback(async (msgId: string, content: string) => {
    try {
      const updated = await apiEdit(msgId, content);
      setMessages((prev) => prev.map((m) => (m.id === msgId ? updated : m)));
    } catch (err) {
      console.error('Failed to edit message:', err);
    }
  }, []);

  const deleteMessage = useCallback(async (msgId: string) => {
    try {
      await apiDelete(msgId);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, deleted: true, content: 'This message was deleted.' }
            : m
        )
      );
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  }, []);

  return {
    messages,
    isLoading,
    isConnected,
    typingUsers,
    onlineUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    sendEvent,
    bottomRef,
  };
}
