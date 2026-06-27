import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Paperclip, Smile, X, Image, FileText, Film } from 'lucide-react';

import { AnimatePresence, motion } from 'framer-motion';
import { getUploadUrl } from '../../api';
import 'emoji-picker-element';


interface EmojiPickerProps {
  onPick: (emoji: string) => void;
  onClose: () => void;
}

// Wraps the <emoji-picker> web component.
// It uses the full Unicode emoji dataset and renders via the device's native
// emoji font — no hardcoded lists, no images.
const EmojiPicker: React.FC<EmojiPickerProps> = ({ onPick, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    // Mount the web component imperatively to avoid JSX type issues
    const picker = document.createElement('emoji-picker');
    container.appendChild(picker);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
      const emoji = e.detail?.unicode;
      if (emoji) onPick(emoji);
    };
    picker.addEventListener('emoji-click', handler);
    return () => {
      picker.removeEventListener('emoji-click', handler);
      container.removeChild(picker);
    };
  }, [onPick]);

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener('mousedown', handleOutside), 0);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-full mb-2 right-0 z-50 rounded-2xl overflow-hidden shadow-2xl"
    >
      <div ref={ref as React.RefObject<HTMLDivElement>} />

    </motion.div>
  );
};

// ── File preview chip ─────────────────────────────────────────────────────────
interface FileChipProps {
  file: File;
  url: string;
  onRemove: () => void;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <Image className="w-3.5 h-3.5" />;
  if (type.startsWith('video/')) return <Film className="w-3.5 h-3.5" />;
  return <FileText className="w-3.5 h-3.5" />;
}

const FileChip: React.FC<FileChipProps> = ({ file, url, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#E8DFF5]/60 dark:bg-white/10 border border-[#E8DFF5] dark:border-white/10 text-xs font-medium max-w-[160px]"
  >
    {file.type.startsWith('image/') && url ? (
      <img src={url} alt={file.name} className="w-5 h-5 rounded object-cover shrink-0" />
    ) : (
      <span className="text-[#2d233c] dark:text-gray-300 shrink-0">{getFileIcon(file.type)}</span>
    )}
    <span className="truncate text-[#1E2022] dark:text-white">{file.name}</span>
    <button
      onClick={onRemove}
      className="shrink-0 text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
    >
      <X className="w-3 h-3" />
    </button>
  </motion.div>
);

// ── Composer ──────────────────────────────────────────────────────────────────

interface ComposerProps {
  onSend: (content: string, attachments?: string[]) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const Composer: React.FC<ComposerProps> = ({
  onSend,
  onTypingStart,
  onTypingStop,
  disabled = false,
  placeholder = 'Type a message...',
}) => {
  const [value, setValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachments, setAttachments] = useState<{ file: File; publicUrl: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const typingRef = useRef(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Typing events ───────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (!typingRef.current) { typingRef.current = true; onTypingStart(); }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => { typingRef.current = false; onTypingStop(); }, 2000);
  };

  // ── Send ────────────────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    const hasAttachments = attachments.length > 0;
    if ((!trimmed && !hasAttachments) || disabled || uploading) return;

    onSend(
      trimmed || (hasAttachments ? '📎 Attachment' : ''),
      attachments.map((a) => a.publicUrl)
    );
    setValue('');
    setAttachments([]);
    setShowEmoji(false);

    if (typingRef.current) {
      typingRef.current = false;
      onTypingStop();
      if (typingTimer.current) clearTimeout(typingTimer.current);
    }
  }, [value, attachments, disabled, uploading, onSend, onTypingStop]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Emoji pick ──────────────────────────────────────────────────────────────
  const handleEmojiPick = (emoji: string) => {
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart ?? value.length;
      const end = ta.selectionEnd ?? value.length;
      const next = value.slice(0, start) + emoji + value.slice(end);
      setValue(next);
      // Restore cursor after emoji
      setTimeout(() => {
        ta.setSelectionRange(start + emoji.length, start + emoji.length);
        ta.focus();
      }, 0);
    } else {
      setValue((v) => v + emoji);
    }
  };

  // ── File upload ─────────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);

    for (const file of files) {
      try {
        const meta = await getUploadUrl(file.name);

        let publicUrl = '';

        if (meta.provider === 'cloudinary' && meta.upload_url) {
          // Real Cloudinary upload
          const form = new FormData();
          form.append('file', file);
          form.append('api_key', meta.api_key ?? '');
          form.append('timestamp', String(meta.timestamp ?? ''));
          form.append('signature', meta.signature ?? '');
          form.append('folder', meta.folder ?? '');

          const res = await fetch(meta.upload_url, { method: 'POST', body: form });
          const json = await res.json();
          publicUrl = json.secure_url ?? json.url ?? '';
        } else {
          // Mock mode: use object URL for preview only
          publicUrl = meta.public_url ?? URL.createObjectURL(file);
        }

        setAttachments((prev) => [...prev, { file, publicUrl }]);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    setUploading(false);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canSend = (value.trim().length > 0 || attachments.length > 0) && !disabled && !uploading;

  return (
    <div className="relative px-3 sm:px-4 py-3 bg-white/80 dark:bg-[#1E2022]/80 backdrop-blur-md border-t border-[#E8DFF5] dark:border-white/10 shrink-0">

      {/* Attachment previews */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-wrap gap-2 mb-2 overflow-hidden"
          >
            {attachments.map((a, i) => (
              <FileChip
                key={i}
                file={a.file}
                url={a.publicUrl}
                onRemove={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Paperclip */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className={`p-2 transition-colors cursor-pointer shrink-0 self-center ${
            uploading
              ? 'text-[#D6EFC1] animate-pulse'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
          title={uploading ? 'Uploading...' : 'Attach file'}
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Textarea + emoji toggle */}
        <div className="relative flex-1 flex items-end gap-2 px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus-within:border-[#D6EFC1]/60 transition-colors">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? 'Select a chat to start messaging' : placeholder}
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm placeholder-gray-400 text-[#1E2022] dark:text-white leading-relaxed max-h-32 kite-scrollbar"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
          <button
            onClick={() => setShowEmoji((p) => !p)}
            className={`transition-colors cursor-pointer shrink-0 self-end pb-0.5 ${
              showEmoji ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'
            }`}
            title="Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="p-3 rounded-full bg-[#D6EFC1] hover:bg-[#bde4a1] text-[#1E2022] shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 self-center"
          title="Send (Enter)"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Emoji picker — anchored above the composer */}
      <AnimatePresence>
        {showEmoji && (
          <EmojiPicker
            onPick={handleEmojiPick}
            onClose={() => setShowEmoji(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
