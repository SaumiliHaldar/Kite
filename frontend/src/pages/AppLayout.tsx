import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import { useKiteAuth } from '../context/AuthContext';
import { MessageSquare, Users, Radio, Settings, Search, Phone, Video, MoreVertical, Send, Smile, Paperclip } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user } = useKiteAuth();

  return (
    <div className="flex h-screen bg-[#FCF8F3] dark:bg-[#121316] text-[#1E2022] dark:text-[#F4F6F8] overflow-hidden font-sans">
      
      {/* Icon Navigation Rail */}
      <aside className="w-16 bg-white dark:bg-[#1E2022] border-r border-[#E8DFF5] dark:border-white/10 flex flex-col items-center py-4 justify-between z-20 shadow-xs">
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 rounded-xl bg-[#D6EFC1] flex items-center justify-center text-[#1E2022] font-black shadow-sm">
            K
          </div>
          <button className="p-2.5 rounded-xl bg-[#E8DFF5] dark:bg-white/10 text-[#2d233c] dark:text-white transition-colors cursor-pointer">
            <MessageSquare className="w-5 h-5 stroke-[2.2]" />
          </button>
          <button className="p-2.5 rounded-xl text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <Users className="w-5 h-5" />
          </button>
          <button className="p-2.5 rounded-xl text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <Radio className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button className="p-2.5 rounded-xl text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <Settings className="w-5 h-5" />
          </button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>

      {/* Sidebar List (Chats) */}
      <section className="w-80 bg-white/70 dark:bg-[#18191d] border-r border-[#E8DFF5] dark:border-white/10 flex flex-col z-10">
        <div className="p-4 border-b border-[#E8DFF5] dark:border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Kite Chats</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">Online</span>
        </div>

        <div className="p-3">
          <div className="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 flex items-center gap-2 text-sm text-gray-400">
            <Search className="w-4 h-4" />
            <span>Search DMs or rooms...</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="p-3 rounded-2xl bg-[#E8DFF5]/60 dark:bg-white/10 flex items-center gap-3 cursor-pointer border border-[#E8DFF5] dark:border-white/10">
            <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-lg">
              #
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="font-bold text-sm truncate">general-hub</span>
                <span className="text-[10px] text-gray-400">Now</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Welcome to Kite Collaboration Platform!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Chat Window Placeholder */}
      <main className="flex-1 flex flex-col bg-[#FCF8F3]/50 dark:bg-[#121316] relative">
        {/* Chat Header */}
        <header className="h-16 px-6 bg-white/80 dark:bg-[#1E2022]/80 backdrop-blur-md border-b border-[#E8DFF5] dark:border-white/10 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <div className="text-left">
              <h3 className="font-bold text-base leading-none mb-1"># general-hub</h3>
              <p className="text-xs text-gray-400">High-concurrency WhatsApp workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
            <Phone className="w-5 h-5 cursor-pointer hover:text-emerald-500 transition-colors" />
            <Video className="w-5 h-5 cursor-pointer hover:text-emerald-500 transition-colors" />
            <MoreVertical className="w-5 h-5 cursor-pointer" />
          </div>
        </header>

        {/* Chat Feed */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-end space-y-4">
          <div className="text-center my-6">
            <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-xs text-gray-400 font-medium">
              You logged in as {user?.username || user?.firstName || 'Operator'}
            </span>
          </div>

          <div className="max-w-md self-start p-4 rounded-3xl rounded-tl-sm bg-white dark:bg-[#1E2022] shadow-sm border border-black/5 dark:border-white/5 text-left text-sm">
            <p className="font-bold text-xs text-purple-600 mb-1">Antigravity AI</p>
            Welcome to the live Kite dashboard scaffold! Next, we can wire up live WebSocket rooms and chat history.
          </div>
        </div>

        {/* Composer Bar */}
        <div className="p-4 bg-white/80 dark:bg-[#1E2022]/80 backdrop-blur-md border-t border-[#E8DFF5] dark:border-white/10 flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 px-4 py-2.5 rounded-full bg-black/5 dark:bg-white/5 flex items-center gap-2">
            <input type="text" placeholder="Type a message..." className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-400" />
            <Smile className="w-5 h-5 text-gray-400 cursor-pointer hover:text-amber-500" />
          </div>
          <button className="p-3 rounded-full bg-[#D6EFC1] hover:bg-[#bde4a1] text-[#1E2022] font-bold shadow-sm transition-transform active:scale-95 cursor-pointer">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </main>

    </div>
  );
};
