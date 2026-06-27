import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Flame, ThumbsUp, Paperclip } from 'lucide-react';
import type { KiteMessage } from '../../api';
import { toggleReaction } from '../../api';

interface MessageBubbleProps {
  message: KiteMessage;
  isOwn: boolean;
  senderName: string;
  senderAvatar?: string;
  showSenderInfo: boolean;
  onEdit: (msgId: string, currentContent: string) => void;
  onDelete: (msgId: string) => void;
  myClerkId: string;
  onReactionUpdate: (msgId: string, reactions: Record<string, string[]>) => void;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const quickEmojis = ['❤️', '🔥', '👍', '😂', '🚀', '💯'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  senderName,
  senderAvatar,
  showSenderInfo,
  onEdit,
  onDelete,
  myClerkId,
  onReactionUpdate,
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);

  const handleReaction = async (emoji: string) => {
    try {
      const res = await toggleReaction(message.id, emoji);
      onReactionUpdate(message.id, res.reactions);
    } catch {
      // silent fail
    }
    setShowEmojiPicker(false);
  };

  if (message.deleted) {
    return (
      <div className={`flex gap-2.5 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="w-8 shrink-0 mt-1">
          {showSenderInfo && !isOwn && (
            senderAvatar ? (
              <img src={senderAvatar} alt={senderName} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#E8DFF5] dark:bg-white/10 flex items-center justify-center text-xs font-bold text-[#2d233c] dark:text-white">
                {senderName[0]?.toUpperCase()}
              </div>
            )
          )}
        </div>
        <div className={`max-w-[72%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {showSenderInfo && !isOwn && (
            <div className="flex items-baseline gap-2 mb-1 pl-1">
              <span className="text-xs font-bold text-[#1E2022] dark:text-white">{senderName}</span>
              <span className="text-[10px] text-gray-400">{formatTime(message.created_at)}</span>
            </div>
          )}
          <p className="text-xs text-gray-400 italic px-4 py-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            This message was deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex gap-2.5 px-1 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojiPicker(false); }}
    >
      {/* Avatar — only shown for first msg in a group */}
      <div className="w-8 shrink-0 mt-1">
        {showSenderInfo && !isOwn && (
          senderAvatar ? (
            <img src={senderAvatar} alt={senderName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#E8DFF5] dark:bg-white/10 flex items-center justify-center text-xs font-bold text-[#2d233c] dark:text-white">
              {senderName[0]?.toUpperCase()}
            </div>
          )
        )}
      </div>

      <div className={`max-w-[72%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender name + time */}
        {showSenderInfo && !isOwn && (
          <div className="flex items-baseline gap-2 mb-1 pl-1">
            <span className="text-xs font-bold text-[#1E2022] dark:text-white">{senderName}</span>
            <span className="text-[10px] text-gray-400">{formatTime(message.created_at)}</span>
          </div>
        )}

        <div
          className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
            isOwn
              ? 'bg-[#D6EFC1] text-[#1E2022] rounded-br-sm'
              : 'bg-white dark:bg-[#2a2d33] text-[#1E2022] dark:text-gray-100 border border-black/5 dark:border-white/5 rounded-bl-sm'
          }`}
        >
          {/* Text content — hide the fallback "📎 Attachment" label if there's a real attachment */}
          {message.content !== '📎 Attachment' && (
            <span>
              {message.content}
              {message.edited_at && (
                <span className="text-[9px] text-gray-400 ml-1.5 italic">(edited)</span>
              )}
            </span>
          )}

          {/* Inline attachments */}
          {message.attachments.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1.5">
              {message.attachments.map((url, i) => {
                const isImage = /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url) || url.startsWith('blob:');
                return isImage ? (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img
                      src={url}
                      alt="attachment"
                      className="max-w-xs max-h-60 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </a>
                ) : (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-medium hover:underline truncate"
                  >
                    <Paperclip className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{url.split('/').pop() ?? 'File'}</span>
                  </a>
                );
              })}
            </div>
          )}

          {isOwn && (
            <span className="text-[10px] text-gray-500 dark:text-[#1E2022]/50 ml-2 float-right mt-0.5">
              {formatTime(message.created_at)}
            </span>
          )}
        </div>

        {/* Reactions */}
        {Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {Object.entries(message.reactions).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  users.includes(myClerkId)
                    ? 'bg-[#D6EFC1] border-[#D6EFC1] text-[#1E2022]'
                    : 'bg-white dark:bg-[#2a2d33] border-black/10 dark:border-white/10 hover:border-[#D6EFC1]'
                }`}
              >
                <span>{emoji}</span>
                <span>{users.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hover action bar */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`self-center flex items-center gap-0.5 bg-white dark:bg-[#2a2d33] border border-black/10 dark:border-white/10 rounded-xl shadow-md px-1 py-1 ${
              isOwn ? 'mr-1' : 'ml-1'
            }`}
          >
            <button
              onClick={() => setShowEmojiPicker((p) => !p)}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-amber-500 transition-colors cursor-pointer text-xs"
            >
              😊
            </button>
            {isOwn && (
              <>
                <button
                  onClick={() => onEdit(message.id, message.content)}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button
                  onClick={() => onDelete(message.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                </button>
              </>
            )}
            {!isOwn && (
              <button
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick emoji picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute z-50 mt-8 bg-white dark:bg-[#2a2d33] border border-black/10 dark:border-white/10 rounded-2xl shadow-xl px-3 py-2 flex gap-2"
          >
            {quickEmojis.map((e) => (
              <button
                key={e}
                onClick={() => handleReaction(e)}
                className="text-lg hover:scale-125 transition-transform cursor-pointer"
              >
                {e}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
