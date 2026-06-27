import React, { useState } from 'react';
import { Search, Plus, Hash, LogIn, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { KiteRoom } from '../../api';

interface RoomListProps {
  rooms: KiteRoom[];
  activeId: string | null;
  onSelect: (roomId: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

export const RoomList: React.FC<RoomListProps> = ({
  rooms,
  activeId,
  onSelect,
  onCreateRoom,
  onJoinRoom,
}) => {
  const [query, setQuery] = useState('');

  const filtered = rooms.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[#E8DFF5] dark:border-white/10 flex items-center justify-between shrink-0">
        <h2 className="text-base font-bold tracking-tight">Rooms</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={onJoinRoom}
            title="Join via invite code"
            className="p-1.5 rounded-lg text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
          </button>
          <button
            onClick={onCreateRoom}
            title="Create room"
            className="p-1.5 rounded-lg text-gray-400 hover:bg-[#D6EFC1]/60 hover:text-[#1E2022] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 shrink-0">
        <div className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 flex items-center gap-2 text-sm text-gray-400">
          <Search className="w-3.5 h-3.5 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rooms..."
            className="bg-transparent border-none outline-none w-full text-xs placeholder-gray-400 text-[#1E2022] dark:text-white"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 mt-2 kite-scrollbar">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-6 px-4">
              {query ? 'No rooms match your search.' : 'No rooms yet. Create one!'}
            </p>
          ) : (
            filtered.map((room) => {
              const isActive = activeId === room.id;
              return (
                <motion.button
                  key={room.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => onSelect(room.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#E8DFF5]/70 dark:bg-white/10'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                      isActive
                        ? 'bg-[#D6EFC1] text-[#1E2022]'
                        : 'bg-[#E8DFF5]/60 dark:bg-white/10 text-[#2d233c] dark:text-gray-300'
                    }`}
                  >
                    <Hash className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{room.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {room.is_voice_enabled ? (
                        <span className="inline-flex items-center gap-0.5">
                          <Mic className="w-2.5 h-2.5 inline" /> Voice enabled ·{' '}
                        </span>
                      ) : null}
                      {room.members.length} member{room.members.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D6EFC1] shrink-0" />
                  )}
                </motion.button>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
