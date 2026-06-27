import React, { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import type { KiteMessage } from '../../api';
import { MessageSquareDashed } from 'lucide-react';

interface MessageFeedProps {
  messages: KiteMessage[];
  isLoading: boolean;
  myClerkId: string;
  typingUsers: string[];
  onEdit: (msgId: string, content: string) => void;
  onDelete: (msgId: string) => void;
  onReactionUpdate: (msgId: string, reactions: Record<string, string[]>) => void;
  userMap: Record<string, { username: string; avatar_url?: string }>;
}

export const MessageFeed: React.FC<MessageFeedProps> = ({
  messages,
  isLoading,
  myClerkId,
  typingUsers,
  onEdit,
  onDelete,
  onReactionUpdate,
  userMap,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#D6EFC1] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Group consecutive messages from same sender
  const grouped = messages.map((msg, i) => {
    const prev = messages[i - 1];
    const showSenderInfo =
      !prev ||
      prev.sender_id !== msg.sender_id ||
      new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() > 5 * 60_000;
    return { msg, showSenderInfo };
  });

  return (
    <div className="flex-1 overflow-y-auto kite-scrollbar px-4 sm:px-6 py-4 flex flex-col gap-1">
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-[#E8DFF5] dark:bg-white/10 flex items-center justify-center text-[#2d233c] dark:text-gray-400">
            <MessageSquareDashed className="w-6 h-6 stroke-[1.5]" />
          </div>
          <p className="text-sm font-semibold text-[#1E2022] dark:text-white">No messages yet</p>
          <p className="text-xs text-gray-400">Be the first to say something!</p>
        </div>
      )}

      <AnimatePresence initial={false}>
        {grouped.map(({ msg, showSenderInfo }) => {
          const sender = userMap[msg.sender_id] ?? {
            username: msg.sender_id.slice(0, 8),
            avatar_url: undefined,
          };
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === myClerkId}
              senderName={sender.username}
              senderAvatar={sender.avatar_url}
              showSenderInfo={showSenderInfo}
              onEdit={onEdit}
              onDelete={onDelete}
              myClerkId={myClerkId}
              onReactionUpdate={onReactionUpdate}
            />
          );
        })}
      </AnimatePresence>

      {/* Typing indicator */}
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-1 py-1">
            <div className="flex gap-1 px-3 py-2 bg-white dark:bg-[#2a2d33] rounded-2xl rounded-bl-sm border border-black/5 dark:border-white/5 shadow-sm">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">
              {typingUsers.length === 1
                ? 'Someone is typing...'
                : `${typingUsers.length} people are typing...`}
            </span>
          </div>
        )}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  );
};
