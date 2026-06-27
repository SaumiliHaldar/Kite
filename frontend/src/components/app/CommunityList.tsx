import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { KiteCommunity } from '../../api';

interface CommunityListProps {
  communities: KiteCommunity[];
  activeId: string | null;
  onSelect: (communityId: string) => void;
  onCreateCommunity: () => void;
}

const categoryColors: Record<string, string> = {
  study: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  gaming: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  projects: 'bg-[#D6EFC1]/60 text-[#1E2022] dark:bg-[#D6EFC1]/20 dark:text-[#D6EFC1]',
  social: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
};

export const CommunityList: React.FC<CommunityListProps> = ({
  communities,
  activeId,
  onSelect,
  onCreateCommunity,
}) => {
  const [query, setQuery] = useState('');

  const filtered = communities.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[#E8DFF5] dark:border-white/10 flex items-center justify-between shrink-0">
        <h2 className="text-base font-bold tracking-tight">Communities</h2>
        <button
          onClick={onCreateCommunity}
          title="Create community"
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
            placeholder="Search communities..."
            className="bg-transparent border-none outline-none w-full text-xs placeholder-gray-400 text-[#1E2022] dark:text-white"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 mt-2 kite-scrollbar">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-6 px-4">
              {query ? 'No communities found.' : 'No communities yet. Create one!'}
            </p>
          ) : (
            filtered.map((community) => {
              const isActive = activeId === community.id;
              return (
                <motion.button
                  key={community.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => onSelect(community.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#E8DFF5]/70 dark:bg-white/10'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {/* Banner thumbnail or fallback */}
                  <div className="w-10 h-10 rounded-xl bg-[#E8DFF5] dark:bg-white/10 flex items-center justify-center text-base shrink-0 overflow-hidden">
                    {community.banner_url ? (
                      <img
                        src={community.banner_url}
                        alt={community.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{community.name[0].toUpperCase()}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{community.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                          categoryColors[community.category] ?? ''
                        }`}
                      >
                        {community.category}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {community.members.length} members
                      </span>
                    </div>
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
