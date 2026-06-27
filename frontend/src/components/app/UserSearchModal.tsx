import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, MessageSquare, Loader2 } from 'lucide-react';
import { searchUsers, type KiteUser } from '../../api';

interface UserSearchModalProps {
  open: boolean;
  onClose: () => void;
  onStartDM: (userId: string) => Promise<void>;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

const statusColors: Record<string, string> = {
  online: 'bg-emerald-500',
  idle: 'bg-amber-400',
  dnd: 'bg-red-500',
  offline: 'bg-gray-400',
};

export const UserSearchModal: React.FC<UserSearchModalProps> = ({
  open,
  onClose,
  onStartDM,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KiteUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [startingDM, setStartingDM] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
    }
  }, [open]);

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchUsers(val.trim());
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  const handleStartDM = async (user: KiteUser) => {
    setStartingDM(user.id);
    try {
      await onStartDM(user.clerk_id);
      onClose();
    } catch {
      // keep modal open on error
    } finally {
      setStartingDM(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: -16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: -16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1E2022] rounded-3xl shadow-2xl w-full max-w-md border border-[#E8DFF5] dark:border-white/10 overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E8DFF5] dark:border-white/10">
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-gray-400 shrink-0 animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
              )}
              <input
                ref={inputRef}
                value={query}
                onChange={handleQueryChange}
                placeholder="Search by username..."
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-400 text-[#1E2022] dark:text-white"
              />
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto kite-scrollbar">
              <AnimatePresence mode="wait">
                {!query.trim() ? (
                  <motion.p
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-gray-400 text-center py-10 px-4"
                  >
                    Start typing a username to find people
                  </motion.p>
                ) : results.length === 0 && !isSearching ? (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-gray-400 text-center py-10 px-4"
                  >
                    No users found for <span className="font-semibold text-[#1E2022] dark:text-white">"{query}"</span>
                  </motion.p>
                ) : (
                  <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {results.map((user) => (
                      <motion.button
                        key={user.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => handleStartDM(user)}
                        disabled={!!startingDM}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-left disabled:opacity-60"
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#E8DFF5] dark:bg-white/10 flex items-center justify-center text-sm font-bold text-[#2d233c] dark:text-white">
                              {getInitials(user.username)}
                            </div>
                          )}
                          {/* Status dot */}
                          <span
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#1E2022] ${
                              statusColors[user.status] ?? statusColors.offline
                            }`}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{user.username}</p>
                          {user.bio && (
                            <p className="text-[11px] text-gray-400 truncate">{user.bio}</p>
                          )}
                        </div>

                        {/* Action */}
                        <div className="shrink-0">
                          {startingDM === user.id ? (
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                          ) : (
                            <div className="p-2 rounded-xl bg-[#E8DFF5]/60 dark:bg-white/10 text-[#2d233c] dark:text-gray-300 group-hover:bg-[#D6EFC1]">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
