import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EnrichedDM } from '../../hooks/useDMs';

interface DMListProps {
  dms: EnrichedDM[];
  activeId: string | null;
  myClerkId: string | null;
  onSelect: (dmId: string) => void;
  onNewDM: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export const DMList: React.FC<DMListProps> = ({
  dms,
  activeId,
  onSelect,
  onNewDM,
}) => {
  const [query, setQuery] = useState('');

  const filtered = dms.filter((dm) =>
    dm.otherUser?.username?.toLowerCase().includes(query.toLowerCase()) ?? true
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[#E8DFF5] dark:border-white/10 flex items-center justify-between shrink-0">
        <h2 className="text-base font-bold tracking-tight">Direct Messages</h2>
        <button
          onClick={onNewDM}
          title="New DM"
          className="p-1.5 rounded-lg text-gray-400 hover:bg-[#D6EFC1]/60 hover:text-[#1E2022] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 shrink-0">
        <div className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 flex items-center gap-2 text-sm text-gray-400">
          <Search className="w-3.5 h-3.5 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages..."
            className="bg-transparent border-none outline-none w-full text-xs placeholder-gray-400 text-[#1E2022] dark:text-white"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 mt-2 kite-scrollbar">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-6 px-4">
              {query ? 'No conversations found.' : 'No DMs yet. Start one!'}
            </p>
          ) : (
            filtered.map((dm) => {
              const isActive = activeId === dm.id;
              const other = dm.otherUser;
              return (
                <motion.button
                  key={dm.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => onSelect(dm.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#E8DFF5]/70 dark:bg-white/10'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {other?.avatar_url ? (
                      <img
                        src={other.avatar_url}
                        alt={other.username}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#E8DFF5] dark:bg-white/10 flex items-center justify-center text-xs font-bold text-[#2d233c] dark:text-white">
                        {getInitials(other?.username)}
                      </div>
                    )}
                    {/* Online dot */}
                    {other?.status === 'online' && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1E2022]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-semibold truncate">
                        {other?.username ?? 'Unknown'}
                      </span>
                      <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                        {timeAgo(dm.last_message_at)}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 truncate capitalize">
                      {other?.status ?? 'offline'}
                    </p>
                  </div>
                </motion.button>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
