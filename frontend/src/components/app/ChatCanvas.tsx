import React, { useState, useCallback } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageFeed } from './MessageFeed';
import { Composer } from './Composer';
import { useMessages } from '../../hooks/useMessages';
import { getUserById, type KiteRoom } from '../../api';
import type { EnrichedDM } from '../../hooks/useDMs';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface ChatCanvasProps {
  targetId: string | null;
  myClerkId: string | null;
  room?: KiteRoom | null;
  dm?: EnrichedDM | null;
  onToggleDrawer: () => void;
  onToggleSearch: () => void;
  onVoiceCall?: () => void;
}

export const ChatCanvas: React.FC<ChatCanvasProps> = ({
  targetId,
  myClerkId,
  room,
  dm,
  onToggleDrawer,
  onToggleSearch,
  onVoiceCall,
}) => {
  const [userMap, setUserMap] = useState<
    Record<string, { username: string; avatar_url?: string }>
  >({});

  const enrichUser = useCallback(
    async (senderId: string) => {
      if (userMap[senderId]) return;
      try {
        const u = await getUserById(senderId);
        setUserMap((prev) => ({
          ...prev,
          [senderId]: { username: u.username, avatar_url: u.avatar_url },
        }));
      } catch {
        setUserMap((prev) => ({
          ...prev,
          [senderId]: { username: senderId.slice(0, 8) },
        }));
      }
    },
    [userMap]
  );

  const {
    messages,
    isLoading,
    isConnected,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    sendEvent,
  } = useMessages({ targetId, userId: myClerkId });

  // Enrich senders we haven't seen yet
  React.useEffect(() => {
    messages.forEach((m) => {
      if (!userMap[m.sender_id]) enrichUser(m.sender_id);
    });
  }, [messages, userMap, enrichUser]);

  // Reaction update handler
  const handleReactionUpdate = useCallback(
    (msgId: string, reactions: Record<string, string[]>) => {
      // The message will get re-fetched or we can update locally
      // For now this is handled inside MessageBubble via optimistic toggle
      void msgId;
      void reactions;
    },
    []
  );

  // Edit modal — simple inline prompt for now
  const handleEdit = useCallback((msgId: string, currentContent: string) => {
    const newContent = window.prompt('Edit message:', currentContent);
    if (newContent && newContent !== currentContent) {
      editMessage(msgId, newContent);
    }
  }, [editMessage]);

  if (!targetId) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-[#FCF8F3]/50 dark:bg-[#121316] gap-4">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl bg-[#D6EFC1] flex items-center justify-center text-[#1E2022] font-black text-3xl shadow-md"
        >
          <MessageCircle className="w-8 h-8 stroke-[1.5]" />
        </motion.div>
        <div className="text-center">
          <p className="text-base font-bold text-[#1E2022] dark:text-white">Select a conversation</p>
          <p className="text-sm text-gray-400 mt-1">Pick a DM, room, or community to start chatting</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-[#FCF8F3]/50 dark:bg-[#121316] overflow-hidden">
      <ChatHeader
        room={room}
        dm={dm}
        isConnected={isConnected}
        onToggleDrawer={onToggleDrawer}
        onToggleSearch={onToggleSearch}
        onVoiceCall={onVoiceCall}
      />

      <MessageFeed
        messages={messages}
        isLoading={isLoading}
        myClerkId={myClerkId ?? ''}
        typingUsers={typingUsers}
        onEdit={handleEdit}
        onDelete={deleteMessage}
        onReactionUpdate={handleReactionUpdate}
        userMap={userMap}
      />

      <Composer
        onSend={(content, attachments) => sendMessage(content, attachments)}
        onTypingStart={() => sendEvent({ event: 'typing.start', user_id: myClerkId ?? '' })}
        onTypingStop={() => sendEvent({ event: 'typing.stop', user_id: myClerkId ?? '' })}
        disabled={!targetId}
      />
    </main>
  );
};
