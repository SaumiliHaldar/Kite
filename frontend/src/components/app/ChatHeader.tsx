import React from 'react';
import { Phone, Video, Info, Hash, Search } from 'lucide-react';
import type { KiteRoom } from '../../api';
import type { EnrichedDM } from '../../hooks/useDMs';

interface ChatHeaderProps {
  room?: KiteRoom | null;
  dm?: EnrichedDM | null;
  isConnected: boolean;
  onToggleDrawer: () => void;
  onToggleSearch: () => void;
  onVoiceCall?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  room,
  dm,
  isConnected,
  onToggleDrawer,
  onToggleSearch,
  onVoiceCall,
}) => {
  const otherUser = dm?.otherUser;
  const name = room ? `# ${room.name}` : otherUser?.username ?? 'Unknown';
  const subtitle = room
    ? `${room.members.length} member${room.members.length !== 1 ? 's' : ''}${room.description ? ` · ${room.description}` : ''}`
    : otherUser?.bio || otherUser?.email || '';

  return (
    <header className="h-14 sm:h-16 px-4 sm:px-6 bg-white/80 dark:bg-[#1E2022]/80 backdrop-blur-md border-b border-[#E8DFF5] dark:border-white/10 flex items-center justify-between z-10 shrink-0">
      <div className="flex items-center gap-3">
        {/* Presence / icon */}
        {room ? (
          <div className="w-8 h-8 rounded-xl bg-[#E8DFF5] dark:bg-white/10 flex items-center justify-center text-[#2d233c] dark:text-gray-300">
            <Hash className="w-4 h-4" />
          </div>
        ) : otherUser?.avatar_url ? (
          <div className="relative">
            <img
              src={otherUser.avatar_url}
              alt={otherUser.username}
              className="w-8 h-8 rounded-full object-cover"
            />
            {otherUser.status === 'online' && (
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1E2022]" />
            )}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#E8DFF5] dark:bg-white/10 flex items-center justify-center text-xs font-bold text-[#2d233c] dark:text-white">
            {otherUser?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}

        <div>
          <h3 className="font-bold text-sm leading-none">{name}</h3>
          {subtitle && (
            <p className="text-[10px] text-gray-400 mt-0.5 max-w-xs truncate">{subtitle}</p>
          )}
        </div>

        {/* WS status dot */}
        <div
          title={isConnected ? 'Live' : 'Connecting...'}
          className={`w-1.5 h-1.5 rounded-full ml-1 ${
            isConnected ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'
          }`}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
        {room?.is_voice_enabled && onVoiceCall && (
          <button
            onClick={onVoiceCall}
            title="Join voice"
            className="p-2 rounded-lg hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer"
          >
            <Phone className="w-4 h-4" />
          </button>
        )}
        {dm && (
          <button
            title="Video call"
            className="p-2 rounded-lg hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer"
          >
            <Video className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onToggleSearch}
          title="Search messages"
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleDrawer}
          title="Room / user info"
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
